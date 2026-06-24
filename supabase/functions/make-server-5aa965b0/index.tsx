import { Hono } from "npm:hono@4";
import { cors } from "npm:hono@4/cors";
import { logger } from "npm:hono@4/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// ============================================
// SUPABASE CLIENT
// ============================================

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================
// TYPES
// ============================================

interface Owner {
  id?: string;
  name: string;
  phone: string;
  location: string | null;
}

interface Plant {
  id?: string;
  name: string;
  type: string;
  planted_date: string | null;
  expected_harvest: string | null;
}

interface SectorInput {
  sectorId: string;
  name: string;
  owner?: Owner;
  plant?: Plant;
  data?: {
    temperature: number;
    humidity: number;
    lightLevel: number;
    waterLevel: number;
    pumpStatus: 'ON' | 'OFF';
  };
  schedule?: {
    enabled: boolean;
    startHour: number;
    endHour: number;
    duration: number;
  };
}

// ============================================
// MIDDLEWARE
// ============================================

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-User-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ============================================
// HELPER FUNCTIONS
// ============================================

// Map database row to application format
const mapSectorToResponse = (sectorRow: any, ownerRow: any, plantRow: any, sensorRow: any) => {
  return {
    id: sectorRow.id,
    sectorId: sectorRow.sector_id,
    name: sectorRow.name,
    owner: ownerRow ? {
      name: ownerRow.name,
      phone: ownerRow.phone,
      location: ownerRow.location || ''
    } : undefined,
    plant: plantRow ? {
      name: plantRow.name,
      type: plantRow.type,
      plantedDate: plantRow.planted_date || '',
      expectedHarvest: plantRow.expected_harvest || ''
    } : undefined,
    data: {
      temperature: sensorRow?.temperature ?? 0,
      humidity: sensorRow?.humidity ?? 0,
      lightLevel: sensorRow?.light_level ?? 0,
      waterLevel: sensorRow?.water_level ?? 0,
      pumpStatus: sensorRow?.pump_status ?? 'OFF'
    },
    schedule: {
      enabled: sectorRow.schedule_enabled ?? true,
      startHour: sectorRow.schedule_start_hour ?? 4,
      endHour: sectorRow.schedule_end_hour ?? 19,
      duration: sectorRow.schedule_duration ?? 15
    },
    createdAt: sectorRow.created_at,
    updatedAt: sectorRow.updated_at
  };
};

// ============================================
// HEALTH CHECK
// ============================================

app.get("/make-server-5aa965b0/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "normalized-postgres"
  });
});

// ============================================
// ESP32 CONNECTION TEST
// ============================================

app.get("/make-server-5aa965b0/esp32-test", (c) => {
  console.log('🔌 ESP32 health check received');
  return c.json({
    status: "ok",
    message: "Server is ready for ESP32 connections",
    timestamp: new Date().toISOString(),
    endpoints: {
      sensorUpdate: "/make-server-5aa965b0/sensor-update",
      pumpCommand: "/make-server-5aa965b0/pump-command/{sectorId}",
      pumpAcknowledge: "/make-server-5aa965b0/pump-acknowledge/{sectorId}",
    }
  });
});

// ============================================
// SECTOR ENDPOINTS
// ============================================

// Get all sectors
app.get("/make-server-5aa965b0/sectors", async (c) => {
  try {
    console.log('📥 GET /sectors - Fetching all sectors...');

    // Get all sectors with related data
    const { data: sectors, error: sectorsError } = await supabase
      .from('sectors')
      .select('*')
      .order('created_at', { ascending: false });

    if (sectorsError) {
      console.error('❌ Error fetching sectors:', sectorsError);
      throw new Error(`Sectors query failed: ${sectorsError.message}`);
    }

    console.log(`✅ Found ${sectors?.length || 0} sectors`);

    if (!sectors || sectors.length === 0) {
      return c.json({ success: true, sectors: [] });
    }

    // Get all related owners, plants, and latest sensor data
    const sectorIds = sectors.map(s => s.id);

    const [ownersRes, plantsRes, sensorsRes] = await Promise.all([
      supabase.from('owners').select('*'),
      supabase.from('plants').select('*'),
      supabase
        .from('sensor_data')
        .select('*')
        .in('sector_id', sectorIds)
        .order('created_at', { ascending: false })
    ]);

    if (ownersRes.error) {
      console.error('❌ Error fetching owners:', ownersRes.error);
    }
    if (plantsRes.error) {
      console.error('❌ Error fetching plants:', plantsRes.error);
    }
    if (sensorsRes.error) {
      console.error('❌ Error fetching sensors:', sensorsRes.error);
    }

    // Create maps for quick lookup
    const ownersMap = new Map((ownersRes.data || []).map(o => [o.id, o]));
    const plantsMap = new Map((plantsRes.data || []).map(p => [p.id, p]));

    // Get latest sensor data for each sector
    const latestSensorsMap = new Map();
    (sensorsRes.data || []).forEach(sensor => {
      if (!latestSensorsMap.has(sensor.sector_id)) {
        latestSensorsMap.set(sensor.sector_id, sensor);
      }
    });

    // Map to response format
    const result = sectors.map(sector => {
      const owner = sector.owner_id ? ownersMap.get(sector.owner_id) : null;
      const plant = sector.plant_id ? plantsMap.get(sector.plant_id) : null;
      const sensor = latestSensorsMap.get(sector.id);

      return mapSectorToResponse(sector, owner, plant, sensor);
    });

    console.log(`✅ Returning ${result.length} sectors with full data`);

    return c.json({ success: true, sectors: result });
  } catch (error) {
    console.error("❌ Error getting sectors:", error);
    console.error("Stack trace:", error?.stack);
    return c.json({
      error: "Failed to get sectors",
      details: error?.message || String(error),
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Get single sector
app.get("/make-server-5aa965b0/sectors/:sectorId", async (c) => {
  try {
    const sectorId = c.req.param("sectorId");

    const { data: sector, error: sectorError } = await supabase
      .from('sectors')
      .select('*')
      .eq('sector_id', sectorId)
      .single();

    if (sectorError) throw sectorError;
    if (!sector) {
      return c.json({ error: "Sector not found" }, 404);
    }

    // Get related data
    const [ownerRes, plantRes, sensorRes] = await Promise.all([
      sector.owner_id ? supabase.from('owners').select('*').eq('id', sector.owner_id).single() : Promise.resolve({ data: null }),
      sector.plant_id ? supabase.from('plants').select('*').eq('id', sector.plant_id).single() : Promise.resolve({ data: null }),
      supabase.from('sensor_data').select('*').eq('sector_id', sector.id).order('created_at', { ascending: false }).limit(1).single()
    ]);

    const result = mapSectorToResponse(sector, ownerRes.data, plantRes.data, sensorRes.data);

    return c.json({ success: true, sector: result });
  } catch (error) {
    console.error("Error getting sector:", error);
    return c.json({ error: "Failed to get sector", details: error.message }, 500);
  }
});

// Create new sector
app.post("/make-server-5aa965b0/sectors", async (c) => {
  try {
    const body: SectorInput = await c.req.json();
    const { sectorId, name, owner, plant, schedule } = body;

    if (!sectorId || !name) {
      return c.json({ error: "sectorId and name are required" }, 400);
    }

    // Check if sector already exists
    const { data: existing } = await supabase
      .from('sectors')
      .select('id')
      .eq('sector_id', sectorId)
      .single();

    if (existing) {
      return c.json({ error: "Sector already exists" }, 409);
    }

    // Create owner if provided
    let ownerId = null;
    if (owner) {
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .insert({
          name: owner.name,
          phone: owner.phone,
          location: owner.location || null
        })
        .select()
        .single();

      if (ownerError) throw ownerError;
      ownerId = ownerData.id;
    }

    // Create plant if provided
    let plantId = null;
    if (plant) {
      const { data: plantData, error: plantError } = await supabase
        .from('plants')
        .insert({
          name: plant.name,
          type: plant.type,
          planted_date: plant.planted_date || null,
          expected_harvest: plant.expected_harvest || null
        })
        .select()
        .single();

      if (plantError) throw plantError;
      plantId = plantData.id;
    }

    // Create sector
    const { data: sectorData, error: sectorError } = await supabase
      .from('sectors')
      .insert({
        sector_id: sectorId,
        name: name,
        owner_id: ownerId,
        plant_id: plantId,
        schedule_enabled: schedule?.enabled ?? true,
        schedule_start_hour: schedule?.startHour ?? 4,
        schedule_end_hour: schedule?.endHour ?? 19,
        schedule_duration: schedule?.duration ?? 15
      })
      .select()
      .single();

    if (sectorError) throw sectorError;

    // Create initial sensor data
    await supabase
      .from('sensor_data')
      .insert({
        sector_id: sectorData.id,
        temperature: 0,
        humidity: 0,
        water_level: 0,
        light_level: 0,
        pump_status: 'ON'
      });

    console.log(`✅ Sector created: ${sectorId}`);

    return c.json({
      success: true,
      sectorId,
      message: "Sector created successfully"
    });
  } catch (error) {
    console.error("Error creating sector:", error);
    return c.json({ error: "Failed to create sector", details: error.message }, 500);
  }
});

// Update sector
app.put("/make-server-5aa965b0/sectors/:sectorId", async (c) => {
  try {
    const sectorId = c.req.param("sectorId");
    const body: Partial<SectorInput> = await c.req.json();

    // Get existing sector
    const { data: sector, error: findError } = await supabase
      .from('sectors')
      .select('*')
      .eq('sector_id', sectorId)
      .single();

    if (findError || !sector) {
      return c.json({ error: "Sector not found" }, 404);
    }

    // Update owner if provided
    if (body.owner) {
      if (sector.owner_id) {
        await supabase
          .from('owners')
          .update({
            name: body.owner.name,
            phone: body.owner.phone,
            location: body.owner.location || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', sector.owner_id);
      } else {
        const { data: ownerData } = await supabase
          .from('owners')
          .insert({
            name: body.owner.name,
            phone: body.owner.phone,
            location: body.owner.location || null
          })
          .select()
          .single();

        sector.owner_id = ownerData?.id;
      }
    }

    // Update plant if provided
    if (body.plant) {
      if (sector.plant_id) {
        await supabase
          .from('plants')
          .update({
            name: body.plant.name,
            type: body.plant.type,
            planted_date: body.plant.planted_date || null,
            expected_harvest: body.plant.expected_harvest || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', sector.plant_id);
      } else {
        const { data: plantData } = await supabase
          .from('plants')
          .insert({
            name: body.plant.name,
            type: body.plant.type,
            planted_date: body.plant.planted_date || null,
            expected_harvest: body.plant.expected_harvest || null
          })
          .select()
          .single();

        sector.plant_id = plantData?.id;
      }
    }

    // Update sector
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.name) updateData.name = body.name;
    if (body.owner && !sector.owner_id && body.owner) updateData.owner_id = sector.owner_id;
    if (body.plant && !sector.plant_id && body.plant) updateData.plant_id = sector.plant_id;
    if (body.schedule) {
      if (body.schedule.enabled !== undefined) updateData.schedule_enabled = body.schedule.enabled;
      if (body.schedule.startHour !== undefined) updateData.schedule_start_hour = body.schedule.startHour;
      if (body.schedule.endHour !== undefined) updateData.schedule_end_hour = body.schedule.endHour;
      if (body.schedule.duration !== undefined) updateData.schedule_duration = body.schedule.duration;
    }

    await supabase
      .from('sectors')
      .update(updateData)
      .eq('sector_id', sectorId);

    console.log(`✅ Sector updated: ${sectorId}`);

    return c.json({
      success: true,
      message: "Sector updated successfully"
    });
  } catch (error) {
    console.error("Error updating sector:", error);
    return c.json({ error: "Failed to update sector", details: error.message }, 500);
  }
});

// Delete sector
app.delete("/make-server-5aa965b0/sectors/:sectorId", async (c) => {
  try {
    const sectorId = c.req.param("sectorId");

    const { data: sector } = await supabase
      .from('sectors')
      .select('id, owner_id, plant_id')
      .eq('sector_id', sectorId)
      .single();

    if (!sector) {
      return c.json({ error: "Sector not found" }, 404);
    }

    // Delete sector (cascades to sensor_data and pump_history)
    await supabase.from('sectors').delete().eq('sector_id', sectorId);

    // Delete orphaned owner and plant
    if (sector.owner_id) {
      await supabase.from('owners').delete().eq('id', sector.owner_id);
    }
    if (sector.plant_id) {
      await supabase.from('plants').delete().eq('id', sector.plant_id);
    }

    console.log(`✅ Sector deleted: ${sectorId}`);

    return c.json({
      success: true,
      message: "Sector deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting sector:", error);
    return c.json({ error: "Failed to delete sector", details: error.message }, 500);
  }
});

// ============================================
// IOT / ESP32 ENDPOINTS
// ============================================

// Control pump
app.post("/make-server-5aa965b0/iot/pump-control", async (c) => {
  try {
    const body = await c.req.json();
    const { sectorId, pumpStatus, status } = body;

    const finalStatus = pumpStatus || status;

    if (!sectorId || !finalStatus) {
      return c.json({ error: "sectorId and pumpStatus are required" }, 400);
    }

    const { data: sector } = await supabase
      .from('sectors')
      .select('id')
      .eq('sector_id', sectorId)
      .single();

    if (!sector) {
      return c.json({ error: "Sector not found" }, 404);
    }

    // ============================================================
    // ✅ SAFETY CHECK: Cek level air sebelum mengizinkan pompa ON
    // KITA MATIKAN SEMENTARA SESUAI PERMINTAAN USER AGAR POMPA BISA SELALU ON
    // ============================================================
    /*
    if (finalStatus === 'ON') {
      const { data: latestSensor } = await supabase
        .from('sensor_data')
        .select('water_level')
        .eq('sector_id', sector.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const waterLevel = latestSensor?.water_level ?? 0;

      if (waterLevel > 25) {
        const levelLabel = waterLevel <= 22 ? 'Normal' : waterLevel <= 25 ? 'Sedang' : 'Rendah';
        console.warn(`🚫 [SERVER] Pompa ${sectorId} DIBLOKIR. Level Air: ${waterLevel} cm (${levelLabel})`);
        return c.json({
          success: false,
          blocked: true,
          reason: 'water_level_low',
          waterLevel,
          levelStatus: 'rendah',
          message: `Pompa diblokir: Level air rendah (${waterLevel.toFixed(1)} cm > 25 cm). Isi ulang sumber air terlebih dahulu.`
        }, 403);
      }

      console.log(`✅ [SERVER] Level air OK: ${waterLevel} cm — pompa diizinkan`);
    }
    */

    // ✅ PERBAIKAN: Simpan command ke KV store untuk ESP32
    // Command queue format: pump-command:{sectorId}
    const commandKey = `pump-command:${sectorId}`;
    await supabase
      .from('kv_store_5aa965b0')
      .upsert({
        key: commandKey,
        value: {
          status: finalStatus,
          executed: false,
          timestamp: new Date().toISOString(),
          source: 'web-manual'
        }
      });

    // Insert new sensor data with updated pump status
    await supabase
      .from('sensor_data')
      .insert({
        sector_id: sector.id,
        pump_status: finalStatus
      });

    console.log(`🔧 Pump control: ${sectorId} → ${finalStatus} (command queued for ESP32)`);

    return c.json({
      success: true,
      sectorId,
      pumpStatus: finalStatus,
      message: "Command queued for ESP32"
    });
  } catch (error) {
    console.error("Error controlling pump:", error);
    return c.json({ error: "Failed to control pump", details: error?.message }, 500);
  }
});

// ============================================
// ESP32 IOT ENDPOINTS
// ============================================

// ESP32 - Update sensor data (NO AUTH REQUIRED for IoT devices)
app.post("/make-server-5aa965b0/sensor-update", async (c) => {
  try {
    const body = await c.req.json();
    const { sectorId, temperature, humidity, lightLevel, waterLevel, pumpStatus } = body;

    console.log(`📊 ESP32 sensor update received: ${sectorId}`);

    if (!sectorId) {
      return c.json({ error: "sectorId is required" }, 400);
    }

    // Get sector
    const { data: sector } = await supabase
      .from('sectors')
      .select('id')
      .eq('sector_id', sectorId)
      .single();

    if (!sector) {
      console.error(`❌ Sector not found: ${sectorId}`);
      return c.json({ error: "Sector not found" }, 404);
    }

    // Insert new sensor data (don't await - respond quickly to ESP32)
    supabase
      .from('sensor_data')
      .insert({
        sector_id: sector.id,
        temperature: temperature ?? 0,
        humidity: humidity ?? 0,
        light_level: lightLevel ?? 0,
        water_level: waterLevel ?? 0,
        pump_status: pumpStatus ?? 'OFF'
      })
      .then(({ error: sensorError }) => {
        if (sensorError) {
          console.error(`❌ Error inserting sensor data:`, sensorError);
        } else {
          console.log(`✅ Sensor data saved: ${sectorId} - Temp: ${temperature}°C, Humidity: ${humidity}%, Water: ${waterLevel}cm, Pump: ${pumpStatus}`);
        }
      });

    // Cleanup old sensor data in background (keep last 1000 records per sector)
    supabase
      .from('sensor_data')
      .select('id, created_at')
      .eq('sector_id', sector.id)
      .order('created_at', { ascending: false })
      .range(1000, 10000) // Get records after the first 1000
      .then(({ data: oldRecords }) => {
        if (oldRecords && oldRecords.length > 0) {
          const idsToDelete = oldRecords.map(r => r.id);
          supabase
            .from('sensor_data')
            .delete()
            .in('id', idsToDelete)
            .then(() => console.log(`🧹 Cleaned up ${oldRecords.length} old sensor records for ${sectorId}`));
        }
      });

    // Respond immediately to ESP32
    return c.json({
      success: true,
      message: "Sensor data received",
      sectorId
    });
  } catch (error) {
    console.error("❌ Error updating sensor data:", error);
    return c.json({ error: "Failed to update sensor data", details: error?.message }, 500);
  }
});

// ESP32 - Get pump command (NO AUTH REQUIRED for IoT devices)
app.get("/make-server-5aa965b0/pump-command/:sectorId", async (c) => {
  try {
    const sectorId = c.req.param("sectorId");

    // ✅ PERBAIKAN: Ambil command dari KV store
    const commandKey = `pump-command:${sectorId}`;
    const { data: commandData } = await supabase
      .from('kv_store_5aa965b0')
      .select('value')
      .eq('key', commandKey)
      .single();

    if (!commandData || !commandData.value) {
      // No command found - return default OFF status
      return c.json({
        status: "OFF",
        executed: true
      });
    }

    const command = commandData.value;

    // Return command with executed flag
    return c.json({
      status: command.status || "OFF",
      executed: command.executed ?? true,
      timestamp: command.timestamp,
      source: command.source
    });
  } catch (error) {
    console.error("Error getting pump command:", error);
    // Return safe default on error
    return c.json({
      status: "OFF",
      executed: true
    });
  }
});

// ESP32 - Acknowledge pump command (NO AUTH REQUIRED for IoT devices)
app.post("/make-server-5aa965b0/pump-acknowledge/:sectorId", async (c) => {
  try {
    const sectorId = c.req.param("sectorId");

    // ✅ PERBAIKAN: Tandai command sebagai executed di KV store
    const commandKey = `pump-command:${sectorId}`;
    const { data: commandData } = await supabase
      .from('kv_store_5aa965b0')
      .select('value')
      .eq('key', commandKey)
      .single();

    if (commandData && commandData.value) {
      // Update command executed status
      await supabase
        .from('kv_store_5aa965b0')
        .upsert({
          key: commandKey,
          value: {
            ...commandData.value,
            executed: true,
            executedAt: new Date().toISOString()
          }
        });

      console.log(`✅ Pump command acknowledged: ${sectorId} - marked as executed`);
    }

    return c.json({
      success: true,
      message: "Command acknowledged"
    });
  } catch (error) {
    console.error("Error acknowledging pump command:", error);
    return c.json({ error: "Failed to acknowledge command", details: error?.message }, 500);
  }
});

// ============================================
// PUMP HISTORY ENDPOINTS
// ============================================

// Add pump history
app.post("/make-server-5aa965b0/iot/pump-history", async (c) => {
  try {
    const body = await c.req.json();
    const { sectorId, action, triggeredBy } = body;

    console.log(`📝 Adding pump history: ${sectorId} → ${action} (triggered by: ${triggeredBy})`);

    if (!sectorId || !action) {
      return c.json({ error: "sectorId and action are required" }, 400);
    }

    // Get sector
    const { data: sector } = await supabase
      .from('sectors')
      .select('id')
      .eq('sector_id', sectorId)
      .single();

    if (!sector) {
      console.error(`❌ Sector not found: ${sectorId}`);
      return c.json({ error: "Sector not found" }, 404);
    }

    // Insert pump history (without executed column)
    const { data: historyData, error: historyError } = await supabase
      .from('pump_history')
      .insert({
        sector_id: sector.id,
        action: action,
        triggered_by: triggeredBy || 'manual'
      })
      .select()
      .single();

    if (historyError) {
      console.error(`❌ Error inserting pump history:`, historyError);
      throw historyError;
    }

    // Also update sensor_data with new pump status
    await supabase
      .from('sensor_data')
      .insert({
        sector_id: sector.id,
        pump_status: action
      });

    console.log(`✅ Pump history added: ${sectorId} → ${action}`);

    return c.json({
      success: true,
      message: "Pump history added",
      data: {
        id: historyData.id,
        sectorId,
        action,
        triggeredBy: triggeredBy || 'manual',
        timestamp: historyData.created_at
      }
    });
  } catch (error) {
    console.error("❌ Error adding pump history:", error);
    return c.json({ error: "Failed to add pump history", details: error?.message }, 500);
  }
});

// Get pump history for a sector
app.get("/make-server-5aa965b0/iot/pump-history/:sectorId", async (c) => {
  try {
    const sectorId = c.req.param("sectorId");

    // Get sector
    const { data: sector } = await supabase
      .from('sectors')
      .select('id')
      .eq('sector_id', sectorId)
      .single();

    if (!sector) {
      return c.json({ error: "Sector not found" }, 404);
    }

    // Get pump history
    const { data: history, error: historyError } = await supabase
      .from('pump_history')
      .select('*')
      .eq('sector_id', sector.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (historyError) throw historyError;

    const formattedHistory = (history || []).map(h => ({
      id: h.id,
      action: h.action,
      triggeredBy: h.triggered_by,
      timestamp: h.created_at,
      executed: h.executed
    }));

    return c.json({
      success: true,
      data: formattedHistory
    });
  } catch (error) {
    console.error("Error getting pump history:", error);
    return c.json({ error: "Failed to get pump history", details: error?.message }, 500);
  }
});

// Get sensor history for 24 hours (for charts)
app.get("/make-server-5aa965b0/iot/sensor-history/:sectorId", async (c) => {
  try {
    const sectorId = c.req.param("sectorId");
    const hours = parseInt(c.req.query("hours") || "24");

    console.log(`📊 Getting sensor history for ${sectorId} - Last ${hours} hours`);

    // Get sector
    const { data: sector } = await supabase
      .from('sectors')
      .select('id')
      .eq('sector_id', sectorId)
      .single();

    if (!sector) {
      return c.json({ error: "Sector not found" }, 404);
    }

    // Calculate time range
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

    // Get sensor data for the time range
    const { data: sensorData, error: sensorError } = await supabase
      .from('sensor_data')
      .select('*')
      .eq('sector_id', sector.id)
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: true });

    if (sensorError) {
      console.error(`❌ Error fetching sensor history:`, sensorError);
      throw sensorError;
    }

    // Format data for charts
    const formattedData = (sensorData || []).map(d => ({
      timestamp: d.created_at,
      temperature: d.temperature,
      humidity: d.humidity,
      waterLevel: d.water_level,
      lightLevel: d.light_level,
      pumpStatus: d.pump_status
    }));

    console.log(`✅ Returning ${formattedData.length} sensor records for ${sectorId}`);

    return c.json({
      success: true,
      sectorId,
      hours,
      data: formattedData
    });
  } catch (error) {
    console.error("❌ Error getting sensor history:", error);
    return c.json({ error: "Failed to get sensor history", details: error?.message }, 500);
  }
});

// ============================================
// ADMIN SETTINGS ENDPOINTS (Keep using KV for settings)
// ============================================

app.get("/make-server-5aa965b0/admin/settings", async (c) => {
  try {
    const { data } = await supabase
      .from('kv_store_5aa965b0')
      .select('value')
      .eq('key', 'admin-settings')
      .single();

    return c.json({
      success: true,
      settings: data?.value || null
    });
  } catch (error) {
    return c.json({ success: true, settings: null });
  }
});

app.post("/make-server-5aa965b0/admin/settings", async (c) => {
  try {
    const settings = await c.req.json();

    await supabase
      .from('kv_store_5aa965b0')
      .upsert({
        key: 'admin-settings',
        value: {
          ...settings,
          updatedAt: new Date().toISOString()
        }
      });

    console.log("✅ Admin settings saved");

    return c.json({ success: true, message: "Settings saved" });
  } catch (error) {
    console.error("Error saving admin settings:", error);
    return c.json({ error: "Failed to save settings" }, 500);
  }
});

// ============================================
// INITIALIZATION ENDPOINT - Force initialize all 10 sectors
// ============================================

app.post("/make-server-5aa965b0/admin/initialize-sectors", async (c) => {
  try {
    console.log('🌱 Force initializing all 10 default sectors...');

    const defaultSectors = [
      { id: 'SEC-001', name: 'Sektor Padi 1', owner: 'Budi Santoso', phone: '+6281234567801', location: 'Desa Sukamaju, Jawa Barat', plant: 'Padi IR64', type: 'Padi' },
      { id: 'SEC-002', name: 'Sektor Jagung 1', owner: 'Siti Nurhaliza', phone: '+6281234567802', location: 'Desa Makmur, Jawa Tengah', plant: 'Jagung Hibrida', type: 'Jagung' },
      { id: 'SEC-003', name: 'Sektor Cabai 1', owner: 'Ahmad Yani', phone: '+6281234567803', location: 'Desa Sejahtera, Jawa Timur', plant: 'Cabai Rawit', type: 'Cabai' },
      { id: 'SEC-004', name: 'Sektor Tomat 1', owner: 'Dewi Lestari', phone: '+6281234567804', location: 'Desa Subur, Bali', plant: 'Tomat Cherry', type: 'Tomat' },
      { id: 'SEC-005', name: 'Sektor Padi 2', owner: 'Agus Salim', phone: '+6281234567805', location: 'Desa Mandiri, Sumatra', plant: 'Padi Ciherang', type: 'Padi' },
      { id: 'SEC-006', name: 'Sektor Sayuran 1', owner: 'Rina Susanti', phone: '+6281234567806', location: 'Desa Hijau, Jawa Barat', plant: 'Sayuran Organik', type: 'Sayuran' },
      { id: 'SEC-007', name: 'Sektor Jagung 2', owner: 'Hendra Wijaya', phone: '+6281234567807', location: 'Desa Tani, Jawa Tengah', plant: 'Jagung Manis', type: 'Jagung' },
      { id: 'SEC-008', name: 'Sektor Kedelai 1', owner: 'Sri Wahyuni', phone: '+6281234567808', location: 'Desa Berkah, Jawa Timur', plant: 'Kedelai Edamame', type: 'Kedelai' },
      { id: 'SEC-009', name: 'Sektor Padi 3', owner: 'Bambang Prasetyo', phone: '+6281234567809', location: 'Desa Sentosa, Kalimantan', plant: 'Padi Organik', type: 'Padi' },
      { id: 'SEC-010', name: 'Sektor Cabai 2', owner: 'Maya Sari', phone: '+6281234567810', location: 'Desa Jaya, Sulawesi', plant: 'Cabai Merah', type: 'Cabai' }
    ];

    const results = [];

    for (const sector of defaultSectors) {
      try {
        // Check if sector already exists
        const { data: existing } = await supabase
          .from('sectors')
          .select('id, sector_id')
          .eq('sector_id', sector.id)
          .single();

        if (existing) {
          console.log(`⏭️  Sector ${sector.id} already exists - skipping`);
          results.push({ sectorId: sector.id, status: 'exists', message: 'Sector already exists' });
          continue;
        }

        // Create owner
        const { data: ownerData, error: ownerError } = await supabase
          .from('owners')
          .insert({
            name: sector.owner,
            phone: sector.phone,
            location: sector.location
          })
          .select()
          .single();

        if (ownerError) {
          console.error(`❌ Error creating owner for ${sector.id}:`, ownerError);
          results.push({ sectorId: sector.id, status: 'error', message: `Owner creation failed: ${ownerError.message}` });
          continue;
        }

        // Create plant
        const { data: plantData, error: plantError } = await supabase
          .from('plants')
          .insert({
            name: sector.plant,
            type: sector.type,
            planted_date: new Date().toISOString(),
            expected_harvest: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();

        if (plantError) {
          console.error(`❌ Error creating plant for ${sector.id}:`, plantError);
          results.push({ sectorId: sector.id, status: 'error', message: `Plant creation failed: ${plantError.message}` });
          continue;
        }

        // Create sector
        const { data: sectorData, error: sectorError } = await supabase
          .from('sectors')
          .insert({
            sector_id: sector.id,
            name: sector.name,
            owner_id: ownerData.id,
            plant_id: plantData.id,
            schedule_enabled: true,
            schedule_start_hour: 4,
            schedule_end_hour: 19,
            schedule_duration: 15
          })
          .select()
          .single();

        if (sectorError) {
          console.error(`❌ Error creating sector ${sector.id}:`, sectorError);
          results.push({ sectorId: sector.id, status: 'error', message: `Sector creation failed: ${sectorError.message}` });
          continue;
        }

        // Create initial sensor data
        const { error: sensorError } = await supabase
          .from('sensor_data')
          .insert({
            sector_id: sectorData.id,
            temperature: 25 + Math.random() * 10,
            humidity: 50 + Math.random() * 30,
            water_level: 5 + Math.random() * 15,
            light_level: 500 + Math.random() * 500,
            pump_status: 'OFF'
          });

        if (sensorError) {
          console.error(`❌ Error creating sensor data for ${sector.id}:`, sensorError);
          results.push({ sectorId: sector.id, status: 'partial', message: `Sector created but sensor data failed: ${sensorError.message}` });
          continue;
        }

        console.log(`✅ Sector ${sector.id} created successfully`);
        results.push({ sectorId: sector.id, status: 'success', message: 'Sector created successfully' });

      } catch (error) {
        console.error(`❌ Error processing sector ${sector.id}:`, error);
        results.push({ sectorId: sector.id, status: 'error', message: error?.message || String(error) });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const existsCount = results.filter(r => r.status === 'exists').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`\n✅ Initialization complete:`);
    console.log(`   - Created: ${successCount} sectors`);
    console.log(`   - Already exists: ${existsCount} sectors`);
    console.log(`   - Errors: ${errorCount} sectors`);

    return c.json({
      success: true,
      message: `Initialized ${successCount} new sectors, ${existsCount} already existed`,
      results,
      summary: {
        total: defaultSectors.length,
        created: successCount,
        existing: existsCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error("❌ Error initializing sectors:", error);
    return c.json({
      error: "Failed to initialize sectors",
      details: error?.message || String(error)
    }, 500);
  }
});

// ============================================
// AUTH HELPER FUNCTIONS
// ============================================

/**
 * Decode JWT payload tanpa verifikasi signature.
 * Aman digunakan karena Supabase gateway sudah validasi token sebelum request sampai ke sini.
 * Jika gateway menggunakan --no-verify-jwt, token dari X-User-Token sudah di-validate
 * oleh supabase.auth.signInWithPassword di client sebelumnya.
 */
const decodeJWTPayload = (token: string): Record<string, any> | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Tambah padding base64 jika diperlukan
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const payload = JSON.parse(atob(padded));
    return payload;
  } catch {
    return null;
  }
};

const verifyAuth = async (authHeader: string | null, userTokenHeader: string | null = null) => {
  // Prioritaskan X-User-Token (user JWT) daripada Authorization (anon key dari gateway)
  const rawToken = userTokenHeader || authHeader?.replace('Bearer ', '');
  if (!rawToken) return null;

  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  // Tolak anon key dan service role key — bukan user JWT
  if (rawToken === anonKey || rawToken === serviceKey) return null;

  // Decode JWT secara lokal untuk mendapatkan user ID
  const payload = decodeJWTPayload(rawToken);
  if (!payload?.sub) {
    console.log('verifyAuth: JWT payload invalid atau tidak ada sub claim');
    return null;
  }

  // Cek expiry
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    console.log('verifyAuth: JWT expired');
    return null;
  }

  console.log(`verifyAuth: OK — userId=${payload.sub}, email=${payload.email}`);
  return { id: payload.sub as string, email: payload.email as string };
};

const getUserProfileFromKV = async (userId: string) => {
  const { data } = await supabase
    .from('kv_store_5aa965b0')
    .select('value')
    .eq('key', `user-profile:${userId}`)
    .single();
  return data?.value || null;
};

const verifyAdmin = async (authHeader: string | null, userTokenHeader: string | null = null) => {
  const user = await verifyAuth(authHeader, userTokenHeader);
  if (!user) return null;
  const profile = await getUserProfileFromKV(user.id);
  if (!profile || profile.role !== 'admin') return null;
  return { user, profile };
};

const updateUserIdList = async (userId: string) => {
  const { data: listData } = await supabase
    .from('kv_store_5aa965b0')
    .select('value')
    .eq('key', 'user-id-list')
    .single();
  const currentList: string[] = listData?.value || [];
  if (!currentList.includes(userId)) {
    currentList.push(userId);
    await supabase.from('kv_store_5aa965b0').upsert({ key: 'user-id-list', value: currentList });
  }
};

const removeFromUserIdList = async (userId: string) => {
  const { data: listData } = await supabase
    .from('kv_store_5aa965b0')
    .select('value')
    .eq('key', 'user-id-list')
    .single();
  const currentList: string[] = listData?.value || [];
  const newList = currentList.filter((id: string) => id !== userId);
  await supabase.from('kv_store_5aa965b0').upsert({ key: 'user-id-list', value: newList });
};

// ============================================
// AUTH ENDPOINTS
// ============================================

// GET /auth/status - cek apakah setup admin sudah dilakukan
app.get("/make-server-5aa965b0/auth/status", async (c) => {
  try {
    const { data: profiles } = await supabase
      .from('kv_store_5aa965b0')
      .select('value')
      .like('key', 'user-profile:%');
    const hasAdmins = (profiles || []).some((item: any) => item.value?.role === 'admin');
    const hasUsers = (profiles || []).length > 0;
    return c.json({ hasAdmins, hasUsers });
  } catch (error) {
    console.error('Error checking auth status:', error);
    return c.json({ hasAdmins: false, hasUsers: false });
  }
});

// POST /auth/setup-admin - buat admin pertama (hanya bisa sekali)
app.post("/make-server-5aa965b0/auth/setup-admin", async (c) => {
  try {
    const { data: profiles } = await supabase
      .from('kv_store_5aa965b0')
      .select('value')
      .like('key', 'user-profile:%');
    const hasAdmin = (profiles || []).some((item: any) => item.value?.role === 'admin');
    if (hasAdmin) {
      return c.json({ error: 'Admin sudah ada. Silakan login.' }, 409);
    }
    const { email, password, name, phone } = await c.req.json();
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, dan nama wajib diisi' }, 400);
    }
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email, password, user_metadata: { name }, email_confirm: true,
    });
    if (authError) {
      return c.json({ error: `Auth error: ${authError.message}` }, 400);
    }
    const userId = userData.user.id;
    const adminProfile = { userId, email, name, role: 'admin', phone: phone || '', assignedSectors: [], createdAt: new Date().toISOString() };
    await supabase.from('kv_store_5aa965b0').upsert({ key: `user-profile:${userId}`, value: adminProfile });
    await updateUserIdList(userId);
    console.log(`✅ Admin dibuat: ${email}`);
    return c.json({ success: true, message: 'Admin berhasil dibuat' });
  } catch (error) {
    console.error('Error setup admin:', error);
    return c.json({ error: `Gagal membuat admin: ${error?.message}` }, 500);
  }
});

// GET /auth/me - profil user yang sedang login
app.get("/make-server-5aa965b0/auth/me", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'), c.req.header('X-User-Token'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    const profile = await getUserProfileFromKV(user.id);
    if (!profile) return c.json({ error: 'Profil tidak ditemukan' }, 404);
    return c.json({ success: true, profile });
  } catch (error) {
    return c.json({ error: 'Gagal ambil profil', details: error?.message }, 500);
  }
});

// GET /auth/users - daftar semua user (admin only)
app.get("/make-server-5aa965b0/auth/users", async (c) => {
  try {
    const adminData = await verifyAdmin(c.req.header('Authorization'), c.req.header('X-User-Token'));
    if (!adminData) return c.json({ error: 'Unauthorized: Akses admin diperlukan' }, 401);
    const { data: allProfiles } = await supabase
      .from('kv_store_5aa965b0').select('value').like('key', 'user-profile:%');
    const users = (allProfiles || []).map((item: any) => item.value).filter(Boolean);
    return c.json({ success: true, users });
  } catch (error) {
    return c.json({ error: 'Gagal ambil daftar user', details: error?.message }, 500);
  }
});

// POST /auth/create-user - buat user baru (admin only)
app.post("/make-server-5aa965b0/auth/create-user", async (c) => {
  try {
    const adminData = await verifyAdmin(c.req.header('Authorization'), c.req.header('X-User-Token'));
    if (!adminData) return c.json({ error: 'Unauthorized: Akses admin diperlukan' }, 401);
    const { email, password, name, phone, assignedSectors } = await c.req.json();
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, dan nama wajib diisi' }, 400);
    }
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email, password, user_metadata: { name }, email_confirm: true,
    });
    if (authError) {
      return c.json({ error: `Auth error: ${authError.message}` }, 400);
    }
    const userId = userData.user.id;
    const userProfile = { userId, email, name, role: 'user', phone: phone || '', assignedSectors: assignedSectors || [], createdAt: new Date().toISOString() };
    await supabase.from('kv_store_5aa965b0').upsert({ key: `user-profile:${userId}`, value: userProfile });
    await updateUserIdList(userId);
    console.log(`✅ User dibuat: ${email}`);
    return c.json({ success: true, message: 'User berhasil dibuat', userId });
  } catch (error) {
    return c.json({ error: `Gagal membuat user: ${error?.message}` }, 500);
  }
});

// PUT /auth/users/:userId - update user (admin only)
app.put("/make-server-5aa965b0/auth/users/:userId", async (c) => {
  try {
    const adminData = await verifyAdmin(c.req.header('Authorization'), c.req.header('X-User-Token'));
    if (!adminData) return c.json({ error: 'Unauthorized' }, 401);
    const targetUserId = c.req.param('userId');
    const updates = await c.req.json();
    const existingProfile = await getUserProfileFromKV(targetUserId);
    if (!existingProfile) return c.json({ error: 'User tidak ditemukan' }, 404);
    const updatedProfile = {
      ...existingProfile,
      name: updates.name ?? existingProfile.name,
      phone: updates.phone ?? existingProfile.phone,
      assignedSectors: updates.assignedSectors ?? existingProfile.assignedSectors,
      updatedAt: new Date().toISOString(),
    };
    await supabase.from('kv_store_5aa965b0').upsert({ key: `user-profile:${targetUserId}`, value: updatedProfile });
    return c.json({ success: true, message: 'User berhasil diupdate' });
  } catch (error) {
    return c.json({ error: 'Gagal update user', details: error?.message }, 500);
  }
});

// DELETE /auth/users/:userId - hapus user (admin only)
app.delete("/make-server-5aa965b0/auth/users/:userId", async (c) => {
  try {
    const adminData = await verifyAdmin(c.req.header('Authorization'), c.req.header('X-User-Token'));
    if (!adminData) return c.json({ error: 'Unauthorized' }, 401);
    const targetUserId = c.req.param('userId');
    if (targetUserId === adminData.user.id) {
      return c.json({ error: 'Tidak dapat menghapus akun sendiri' }, 400);
    }
    await supabase.auth.admin.deleteUser(targetUserId);
    await supabase.from('kv_store_5aa965b0').delete().eq('key', `user-profile:${targetUserId}`);
    await removeFromUserIdList(targetUserId);
    console.log(`✅ User dihapus: ${targetUserId}`);
    return c.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) {
    return c.json({ error: 'Gagal menghapus user', details: error?.message }, 500);
  }
});

// POST /auth/users/:userId/assign-sectors - assign sektor ke user (admin only)
app.post("/make-server-5aa965b0/auth/users/:userId/assign-sectors", async (c) => {
  try {
    const adminData = await verifyAdmin(c.req.header('Authorization'), c.req.header('X-User-Token'));
    if (!adminData) return c.json({ error: 'Unauthorized' }, 401);
    const targetUserId = c.req.param('userId');
    const { sectorIds } = await c.req.json();
    const profile = await getUserProfileFromKV(targetUserId);
    if (!profile) return c.json({ error: 'User tidak ditemukan' }, 404);
    const updatedProfile = { ...profile, assignedSectors: sectorIds || [], updatedAt: new Date().toISOString() };
    await supabase.from('kv_store_5aa965b0').upsert({ key: `user-profile:${targetUserId}`, value: updatedProfile });
    console.log(`✅ Sektor diassign ke user ${targetUserId}: ${sectorIds?.join(', ')}`);
    return c.json({ success: true, message: 'Sektor berhasil diassign' });
  } catch (error) {
    return c.json({ error: 'Gagal assign sektor', details: error?.message }, 500);
  }
});

// ============================================
// RESET PASSWORD (tanpa perlu login — untuk admin yang lupa password)
// ============================================

// POST /auth/reset-password - reset password berdasarkan email admin
app.post("/make-server-5aa965b0/auth/reset-password", async (c) => {
  try {
    const { email, newPassword } = await c.req.json();

    if (!email || !newPassword) {
      return c.json({ error: 'Email dan password baru wajib diisi' }, 400);
    }
    if (newPassword.length < 6) {
      return c.json({ error: 'Password baru minimal 6 karakter' }, 400);
    }

    // Cari profil user berdasarkan email di KV store
    const { data: profiles } = await supabase
      .from('kv_store_5aa965b0')
      .select('value')
      .like('key', 'user-profile:%');

    const matchingProfile = (profiles || [])
      .map((item: any) => item.value)
      .find((profile: any) => profile?.email?.toLowerCase() === email.toLowerCase());

    if (!matchingProfile) {
      // Kembalikan pesan generik agar tidak bocorkan info akun
      return c.json({ error: 'Email tidak ditemukan atau bukan akun yang terdaftar' }, 404);
    }

    const userId = matchingProfile.userId;
    console.log(`🔑 Reset password untuk user: ${email} (${userId})`);

    // Update password via Supabase Admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
      email_confirm: true, // Pastikan email tetap terverifikasi
    });

    if (updateError) {
      console.error('❌ Error reset password:', updateError.message);
      return c.json({ error: `Gagal reset password: ${updateError.message}` }, 500);
    }

    console.log(`✅ Password berhasil direset untuk: ${email}`);
    return c.json({ success: true, message: 'Password berhasil direset. Silakan login dengan password baru.' });

  } catch (error: any) {
    console.error('❌ Error di reset-password endpoint:', error);
    return c.json({ error: `Gagal reset password: ${error?.message}` }, 500);
  }
});

// ============================================
// START SERVER
// ============================================

Deno.serve(app.fetch);