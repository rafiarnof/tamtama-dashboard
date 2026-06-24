import { db } from '@/app/config/firebase';
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  query,
  where,
  orderBy,
  limit,
  setDoc
} from 'firebase/firestore';
import type { Sector, SensorData, PumpHistory, PumpCommand, AdminSettings } from '@/app/types';

const COLLECTIONS = {
  SECTORS: 'sectors',
  SENSOR_DATA: 'sensor_data',
  PUMP_HISTORY: 'pump_history',
  PUMP_COMMANDS: 'pump_commands',
  ADMIN_SETTINGS: 'admin_settings'  // ← BARU
};

// ============================================
// SECTOR OPERATIONS
// ============================================

export const getAllSectors = async (): Promise<Sector[]> => {
  try {
    const sectorsRef = collection(db, COLLECTIONS.SECTORS);
    const snapshot = await getDocs(sectorsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Sector[];
  } catch (error) {
    console.error('Error getting sectors:', error);
    throw error;
  }
};

export const getSectorById = async (sectorId: string): Promise<Sector | null> => {
  try {
    const sectorRef = doc(db, COLLECTIONS.SECTORS, sectorId);
    const snapshot = await getDoc(sectorRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as Sector;
  } catch (error) {
    console.error('Error getting sector:', error);
    throw error;
  }
};

export const createSector = async (sector: Omit<Sector, 'id'>): Promise<string> => {
  try {
    const sectorRef = doc(db, COLLECTIONS.SECTORS, sector.sectorId);
    await setDoc(sectorRef, {
      ...sector,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return sector.sectorId;
  } catch (error) {
    console.error('Error creating sector:', error);
    throw error;
  }
};

export const updateSector = async (sectorId: string, updates: Partial<Sector>): Promise<void> => {
  try {
    const sectorRef = doc(db, COLLECTIONS.SECTORS, sectorId);
    await updateDoc(sectorRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating sector:', error);
    throw error;
  }
};

export const deleteSector = async (sectorId: string): Promise<void> => {
  try {
    const sectorRef = doc(db, COLLECTIONS.SECTORS, sectorId);
    await deleteDoc(sectorRef);
  } catch (error) {
    console.error('Error deleting sector:', error);
    throw error;
  }
};

// ============================================
// SENSOR DATA OPERATIONS
// ============================================

export const saveSensorData = async (sectorId: string, data: {
  temperature: number;
  humidity: number;
  lightLevel: number;        // ← TAMBAH
  waterLevel: number;
  pumpStatus?: 'ON' | 'OFF';
}): Promise<void> => {
  try {
    // Save to sensor_data collection (for history)
    const sensorDataRef = collection(db, COLLECTIONS.SENSOR_DATA);
    await addDoc(sensorDataRef, {
      sectorId,
      temperature: data.temperature,
      humidity: data.humidity,
      lightLevel: data.lightLevel,   // ← TAMBAH
      waterLevel: data.waterLevel,
      pumpStatus: data.pumpStatus || 'OFF',
      timestamp: Timestamp.now()
    });

    // ✅ Update sector's latest data ONLY (using dot notation to avoid overwriting other fields)
    const sectorRef = doc(db, COLLECTIONS.SECTORS, sectorId);
    await updateDoc(sectorRef, {
      'data.temperature': data.temperature,
      'data.humidity': data.humidity,
      'data.lightLevel': data.lightLevel,
      'data.waterLevel': data.waterLevel,
      'data.pumpStatus': data.pumpStatus || 'OFF',
      'lastUpdate': Timestamp.now()
    });
  } catch (error) {
    console.error('Error saving sensor data:', error);
    throw error;
  }
};

export const getLatestSensorData = async (sectorId: string): Promise<SensorData | null> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.SENSOR_DATA),
      where('sectorId', '==', sectorId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      sectorId: data.sectorId,
      temperature: data.temperature,
      humidity: data.humidity,
      lightLevel: data.lightLevel,   // ← TAMBAH
      waterLevel: data.waterLevel,
      pumpStatus: data.pumpStatus,
      timestamp: data.timestamp.toDate().toISOString()
    };
  } catch (error) {
    console.error('Error getting sensor data:', error);
    throw error;
  }
};

export const getSensorHistory = async (
  sectorId: string, 
  limitCount: number = 100
): Promise<SensorData[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.SENSOR_DATA),
      where('sectorId', '==', sectorId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        sectorId: data.sectorId,
        temperature: data.temperature,
        humidity: data.humidity,
        lightLevel: data.lightLevel,   // ← TAMBAH
        waterLevel: data.waterLevel,
        pumpStatus: data.pumpStatus,
        timestamp: data.timestamp.toDate().toISOString()
      };
    });
  } catch (error) {
    console.error('Error getting sensor history:', error);
    throw error;
  }
};

// ============================================
// PUMP CONTROL OPERATIONS
// ============================================

export const sendPumpCommand = async (
  sectorId: string, 
  status: 'ON' | 'OFF',
  source: 'manual' | 'auto' = 'manual'
): Promise<void> => {
  try {
    const commandRef = doc(db, COLLECTIONS.PUMP_COMMANDS, sectorId);
    await setDoc(commandRef, {
      sectorId,
      status,
      source,
      executed: false,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error sending pump command:', error);
    throw error;
  }
};

// Alias for compatibility
export const controlPump = sendPumpCommand;

export const getPumpCommand = async (sectorId: string): Promise<{
  status: 'ON' | 'OFF';
  source: string;
  timestamp: string;
  executed: boolean;
} | null> => {
  try {
    const commandRef = doc(db, COLLECTIONS.PUMP_COMMANDS, sectorId);
    const snapshot = await getDoc(commandRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    return {
      status: data.status,
      source: data.source,
      timestamp: data.timestamp.toDate().toISOString(),
      executed: data.executed
    };
  } catch (error) {
    console.error('Error getting pump command:', error);
    throw error;
  }
};

export const acknowledgePumpCommand = async (sectorId: string): Promise<void> => {
  try {
    const commandRef = doc(db, COLLECTIONS.PUMP_COMMANDS, sectorId);
    await updateDoc(commandRef, {
      executed: true,
      executedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error acknowledging pump command:', error);
    throw error;
  }
};

// ============================================
// PUMP HISTORY OPERATIONS
// ============================================

export const addPumpHistory = async (
  sectorId: string,
  status: 'ON' | 'OFF',
  source: 'manual' | 'auto',
  triggeredBy?: string
): Promise<void> => {
  try {
    const historyRef = collection(db, COLLECTIONS.PUMP_HISTORY);
    await addDoc(historyRef, {
      sectorId,
      status,
      source,
      triggeredBy: triggeredBy || 'system',
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding pump history:', error);
    throw error;
  }
};

// Alias for compatibility
export const storePumpHistory = addPumpHistory;

export const getPumpHistory = async (
  sectorId: string,
  limitCount: number = 50
): Promise<PumpHistory[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PUMP_HISTORY),
      where('sectorId', '==', sectorId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        sectorId: data.sectorId,
        status: data.status,
        source: data.source,
        triggeredBy: data.triggeredBy,
        timestamp: data.timestamp.toDate().toISOString()
      };
    });
  } catch (error) {
    console.error('Error getting pump history:', error);
    throw error;
  }
};

// ============================================
// ADMIN SETTINGS OPERATIONS
// ============================================

export const saveAdminSettings = async (settings: AdminSettings): Promise<void> => {
  try {
    const settingsRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, 'settings');
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error saving admin settings:', error);
    throw error;
  }
};

export const getAdminSettings = async (): Promise<AdminSettings | null> => {
  try {
    const settingsRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, 'settings');
    const snapshot = await getDoc(settingsRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as AdminSettings;
  } catch (error) {
    console.error('Error getting admin settings:', error);
    throw error;
  }
};

// ============================================
// INITIALIZATION - Create default sectors
// ============================================

export const initializeDefaultSectors = async (): Promise<void> => {
  try {
    const sectors = await getAllSectors();
    
    // Default sector data
    const defaultSectors = [
      { id: 'SEC-001', name: 'Sektor Padi 1', owner: 'Budi Santoso', location: 'Desa Sukamaju, Jawa Barat', plant: 'Padi IR64' },
      { id: 'SEC-002', name: 'Sektor Jagung 1', owner: 'Siti Nurhaliza', location: 'Desa Makmur, Jawa Tengah', plant: 'Jagung Hibrida' },
      { id: 'SEC-003', name: 'Sektor Cabai 1', owner: 'Ahmad Yani', location: 'Desa Sejahtera, Jawa Timur', plant: 'Cabai Rawit' },
      { id: 'SEC-004', name: 'Sektor Tomat 1', owner: 'Dewi Lestari', location: 'Desa Subur, Bali', plant: 'Tomat Cherry' },
      { id: 'SEC-005', name: 'Sektor Padi 2', owner: 'Agus Salim', location: 'Desa Mandiri, Sumatra', plant: 'Padi Ciherang' },
      { id: 'SEC-006', name: 'Sektor Sayuran 1', owner: 'Rina Susanti', location: 'Desa Hijau, Jawa Barat', plant: 'Sayuran Organik' },
      { id: 'SEC-007', name: 'Sektor Jagung 2', owner: 'Hendra Wijaya', location: 'Desa Tani, Jawa Tengah', plant: 'Jagung Manis' },
      { id: 'SEC-008', name: 'Sektor Kedelai 1', owner: 'Sri Wahyuni', location: 'Desa Berkah, Jawa Timur', plant: 'Kedelai Edamame' },
      { id: 'SEC-009', name: 'Sektor Padi 3', owner: 'Bambang Prasetyo', location: 'Desa Sentosa, Kalimantan', plant: 'Padi Organik' },
      { id: 'SEC-010', name: 'Sektor Cabai 2', owner: 'Maya Sari', location: 'Desa Jaya, Sulawesi', plant: 'Cabai Merah' }
    ];
    
    // If no sectors exist, create default 10 sectors
    if (sectors.length === 0) {
      for (const sector of defaultSectors) {
        await createSector({
          sectorId: sector.id,
          name: sector.name,
          owner: {
            name: sector.owner,
            phone: '+62812345678' + sector.id.slice(-2),
            location: sector.location
          },
          plant: {
            name: sector.plant,
            type: sector.plant.split(' ')[0],
            plantedDate: new Date().toISOString(),
            expectedHarvest: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
          },
          data: {
            temperature: 0,
            humidity: 0,
            lightLevel: 0,
            waterLevel: 0,
            pumpStatus: 'OFF'
          },
          schedule: {
            enabled: true,
            startHour: 4,
            endHour: 19,
            duration: 15
          }
        } as any);

        // Add initial sensor data (dummy data)
        await saveSensorData(sector.id, {
          temperature: 25 + Math.random() * 10,
          humidity: 50 + Math.random() * 30,
          lightLevel: 500 + Math.random() * 500,
          waterLevel: 5 + Math.random() * 15,
          pumpStatus: 'OFF'
        });
      }

      console.log('✅ Default sectors initialized');
    } else {
      // ✅ Fix existing sectors yang tidak punya owner/plant data
      console.log(`📋 Checking ${sectors.length} existing sectors for missing owner/plant data...`);
      
      for (const sector of sectors) {
        const needsUpdate = !sector.owner || !sector.owner.name || !sector.plant || !sector.plant.name;
        
        if (needsUpdate) {
          const defaultData = defaultSectors.find(d => d.id === sector.sectorId);
          
          if (defaultData) {
            console.log(`🔧 Fixing sector ${sector.sectorId} - adding owner/plant data...`);
            
            await updateSector(sector.id, {
              owner: {
                name: defaultData.owner,
                phone: '+62812345678' + defaultData.id.slice(-2),
                location: defaultData.location
              },
              plant: {
                name: defaultData.plant,
                type: defaultData.plant.split(' ')[0],
                plantedDate: sector.plant?.plantedDate || new Date().toISOString(),
                expectedHarvest: sector.plant?.expectedHarvest || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
              }
            });
            
            console.log(`✅ Fixed sector ${sector.sectorId}`);
          }
        }
      }
      
      console.log('✅ All sectors verified and fixed');
    }
  } catch (error) {
    console.error('Error initializing default sectors:', error);
    throw error;
  }
};