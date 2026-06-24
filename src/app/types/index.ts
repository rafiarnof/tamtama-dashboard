// TypeScript types for the application

// Database types (match Supabase schema)
export interface Owner {
  id: string;
  name: string;
  phone: string;
  location: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Plant {
  id: string;
  name: string;
  type: string;
  planted_date: string | null;
  expected_harvest: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SectorDB {
  id: string;
  sector_id: string;
  name: string;
  owner_id: string | null;
  plant_id: string | null;
  schedule_enabled: boolean;
  schedule_start_hour: number;
  schedule_end_hour: number;
  schedule_duration: number;
  created_at?: string;
  updated_at?: string;
}

export interface SensorDataDB {
  id: string;
  sector_id: string;
  temperature: number | null;
  humidity: number | null;
  water_level: number | null;
  light_level: number | null;
  pump_status: 'ON' | 'OFF';
  created_at?: string;
}

export interface PumpHistoryDB {
  id: string;
  sector_id: string;
  action: 'ON' | 'OFF';
  triggered_by: 'auto' | 'manual';
  created_at?: string;
}

// Application types (frontend models)
export interface Sector {
  id: string;
  sectorId: string;
  name: string;
  owner?: {
    name: string;
    phone: string;
    location: string;
  };
  plant?: {
    name: string;
    type: string;
    plantedDate: string;
    expectedHarvest: string;
    optimalTemp?: { min: number; max: number };
    optimalHumidity?: { min: number; max: number };
    optimalLight?: { min: number; max: number };
  };
  data: {
    temperature: number;
    humidity: number;
    lightLevel: number;
    waterLevel: number;
    pumpStatus: 'ON' | 'OFF';
  };
  schedule: {
    enabled: boolean;
    startHour: number;
    endHour: number;
    duration: number;
  };
  waterThreshold?: number;
  lastUpdate?: string;
  createdAt?: string;
  updatedAt?: string;
  pumpHistory?: PumpHistory[];
}

export interface SensorData {
  sectorId: string;
  temperature: number;
  humidity: number;
  lightLevel: number;        // ← Sensor cahaya
  waterLevel: number;
  pumpStatus: 'ON' | 'OFF';
  timestamp: string;
}

export interface PumpHistory {
  id: string;
  sectorId: string;
  status: 'ON' | 'OFF';
  source: 'manual' | 'auto';
  triggeredBy: string;
  timestamp: string;
}

export interface PumpCommand {
  sectorId: string;
  status: 'ON' | 'OFF';
  source: 'manual' | 'auto';
  executed: boolean;
  timestamp: string;
  executedAt?: string;
}

// Admin Settings untuk WhatsApp Alert
export interface AdminSettings {
  id: string;
  adminName: string;
  adminPhone: string;
  enableAdminAlert: boolean;  // Toggle ON/OFF alert untuk admin
  enableWargaAlert: boolean;  // Toggle ON/OFF alert untuk warga
  waterThreshold: number;      // Threshold level air kritis (default: 5 cm)
}

// Tracking last alert time untuk cooldown system
export interface AlertTracking {
  sectorId: string;
  lastAlertTime: number;       // Unix timestamp
  alertType: 'water' | 'temperature' | 'humidity' | 'light';
  recipientType: 'admin' | 'owner';
}

// Alert configuration
export interface AlertCondition {
  type: 'water' | 'temperature' | 'humidity' | 'light';
  severity: 'critical' | 'warning';
  message: string;
}