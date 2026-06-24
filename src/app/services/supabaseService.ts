import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { Sector, SensorData, PumpHistory, AdminSettings } from '@/app/types';
import { getEnvVar } from '@/app/utils/env';
import * as mockDataService from './mockDataService';

// ============================================
// SUPABASE NORMALIZED DATABASE SERVICE
// ============================================
// Menggunakan Supabase Edge Function + Normalized PostgreSQL Tables
// Tables: owners, plants, sectors, sensor_data, pump_history
// ============================================

// Check if DEV_MODE is enabled
const DEV_MODE = getEnvVar('DEV_MODE') === 'true';

if (DEV_MODE) {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🎭  DEVELOPMENT MODE AKTIF                              ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Aplikasi menggunakan MOCK DATA (tidak perlu Supabase)   ║
║                                                           ║
║  Untuk menggunakan Supabase yang sebenarnya:             ║
║  1. Deploy Edge Function ke Supabase                     ║
║  2. Edit /env.config.js                                  ║
║  3. Ubah DEV_MODE: false                                 ║
║  4. Refresh browser (Ctrl+R)                             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
} else {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🗄️  NORMALIZED DATABASE MODE                           ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Database Structure:                                      ║
║  • owners (id, name, phone, location)                    ║
║  • plants (id, name, type, dates)                        ║
║  • sectors (id, sector_id, name, owner_id, plant_id)     ║
║  • sensor_data (id, sector_id, readings, pump_status)    ║
║  • pump_history (id, sector_id, action, triggered_by)    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
}

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5aa965b0`;

// Helper untuk HTTP requests ke server
const fetchServer = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${SERVER_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server error: ${response.status} - ${errorText}`);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Fetch error for ${endpoint}:`, error);
    
    // Provide more detailed error message
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.warn(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  ⚠️  EDGE FUNCTION BELUM DI-DEPLOY                      ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Aplikasi otomatis menggunakan MOCK DATA.                ║
║                                                           ║
║  Untuk menggunakan Supabase yang sebenarnya:             ║
║  1. Deploy Edge Function:                                ║
║     supabase functions deploy make-server-5aa965b0       ║
║  2. Atau ubah DEV_MODE ke true di /env.config.js         ║
║     untuk mode development                                ║
║                                                           ║
║  Server URL: ${SERVER_URL}                               
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
      throw new Error(`Edge Function not deployed. Using mock data fallback.`);
    }
    
    throw error;
  }
};

// ============================================
// SECTOR OPERATIONS
// ============================================

export const getAllSectors = async (): Promise<Sector[]> => {
  if (DEV_MODE) {
    return mockDataService.getAllSectors();
  }

  try {
    const data = await fetchServer('/sectors');
    return data.sectors || [];
  } catch (error) {
    console.error('Error getting sectors:', error);
    console.warn('⚠️  Falling back to mock data...');
    return mockDataService.getAllSectors();
  }
};

export const getSectorById = async (sectorId: string): Promise<Sector | null> => {
  if (DEV_MODE) {
    return mockDataService.getSectorById(sectorId);
  }

  try {
    const data = await fetchServer(`/sectors/${sectorId}`);
    return data.sector || null;
  } catch (error) {
    console.error('Error getting sector:', error);
    return null;
  }
};

export const createSector = async (sector: Omit<Sector, 'id'>): Promise<string> => {
  if (DEV_MODE) {
    return mockDataService.createSector(sector);
  }

  try {
    const data = await fetchServer('/sectors', {
      method: 'POST',
      body: JSON.stringify(sector),
    });
    return data.sectorId;
  } catch (error) {
    console.error('Error creating sector:', error);
    throw error;
  }
};

export const updateSector = async (sectorId: string, updates: Partial<Sector>): Promise<void> => {
  if (DEV_MODE) {
    return mockDataService.updateSector(sectorId, updates);
  }

  try {
    await fetchServer(`/sectors/${sectorId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error('Error updating sector:', error);
    throw error;
  }
};

export const deleteSector = async (sectorId: string): Promise<void> => {
  if (DEV_MODE) {
    return mockDataService.deleteSector(sectorId);
  }

  try {
    await fetchServer(`/sectors/${sectorId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting sector:', error);
    throw error;
  }
};

// ============================================
// SENSOR DATA OPERATIONS
// ============================================

export const saveSensorData = async (sectorId: string, data: SensorData): Promise<void> => {
  if (DEV_MODE) {
    return mockDataService.saveSensorData(sectorId, data);
  }

  try {
    // ✅ Kirim ke server - server akan update KV store
    await fetchServer('/iot/sensor-data', {
      method: 'POST',
      body: JSON.stringify({
        sectorId,
        temperature: data.temperature,
        humidity: data.humidity,
        lightLevel: data.lightLevel || 0,
        waterLevel: data.waterLevel,
        pumpStatus: data.pumpStatus || 'OFF',
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Error saving sensor data:', error);
    throw error;
  }
};

export const getSensorData = async (sectorId: string): Promise<SensorData | null> => {
  if (DEV_MODE) {
    return mockDataService.getSensorData(sectorId);
  }

  try {
    const data = await fetchServer(`/iot/sensor-data/${sectorId}`);
    return data.data || null;
  } catch (error) {
    console.error('Error getting sensor data:', error);
    return null;
  }
};

// ============================================
// PUMP OPERATIONS
// ============================================

export const controlPump = async (sectorId: string, status: 'ON' | 'OFF'): Promise<void> => {
  if (DEV_MODE) {
    return mockDataService.controlPump(sectorId, status);
  }

  try {
    await fetchServer('/iot/pump-control', {
      method: 'POST',
      body: JSON.stringify({
        sectorId,
        pumpStatus: status,
      }),
    });
  } catch (error) {
    console.error('Error controlling pump:', error);
    throw error;
  }
};

export const addPumpHistory = async (
  sectorId: string,
  status: 'ON' | 'OFF',
  source: 'auto' | 'manual'
): Promise<void> => {
  if (DEV_MODE) {
    return mockDataService.addPumpHistory(sectorId, status, source);
  }

  try {
    await fetchServer('/iot/pump-history', {
      method: 'POST',
      body: JSON.stringify({
        sectorId,
        action: status,
        triggeredBy: source,
      }),
    });
  } catch (error) {
    console.error('Error adding pump history:', error);
    throw error;
  }
};

export const storePumpHistory = addPumpHistory; // Alias for compatibility

export const getPumpHistory = async (
  sectorId: string,
  limitCount: number = 50
): Promise<PumpHistory[]> => {
  if (DEV_MODE) {
    return mockDataService.getPumpHistory(sectorId, limitCount);
  }

  try {
    const data = await fetchServer(`/iot/pump-history/${sectorId}`);
    return (data.data || []).slice(0, limitCount);
  } catch (error) {
    console.error('Error getting pump history:', error);
    throw error;
  }
};

// ============================================
// ADMIN SETTINGS OPERATIONS
// ============================================

export const saveAdminSettings = async (settings: AdminSettings): Promise<void> => {
  if (DEV_MODE) {
    return mockDataService.saveAdminSettings(settings);
  }

  try {
    await fetchServer('/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  } catch (error) {
    console.error('Error saving admin settings:', error);
    throw error;
  }
};

export const getAdminSettings = async (): Promise<AdminSettings | null> => {
  if (DEV_MODE) {
    return mockDataService.getAdminSettings();
  }

  try {
    const data = await fetchServer('/admin/settings');
    return data.settings || null;
  } catch (error) {
    console.error('Error getting admin settings:', error);
    return null;
  }
};

// ============================================
// INITIALIZATION - Create default sectors
// ============================================

export const initializeDefaultSectors = async (): Promise<void> => {
  // DINONAKTIFKAN: Tidak lagi membuat data dummy otomatis agar data real dari IoT bisa masuk
  console.log('✅ Sistem siap menerima data real dari IoT');
};

// ✅ NEW: Force initialize all 10 sectors via server endpoint
export const forceInitializeAllSectors = async (): Promise<any> => {
  if (DEV_MODE) {
    console.log('🎭 [MOCK] Force initialization not needed in dev mode');
    return { success: true, message: 'Using mock data' };
  }

  try {
    console.log('🌱 Calling server to force initialize all 10 sectors...');
    const data = await fetchServer('/admin/initialize-sectors', {
      method: 'POST',
    });
    
    console.log('✅ Initialization result:', data);
    return data;
  } catch (error) {
    console.error('Error force initializing sectors:', error);
    throw error;
  }
};

// ============================================
// REAL-TIME LISTENER (Polling-based)
// ============================================
// Since KV store doesn't have real-time listeners like Firestore,
// we use polling instead

export const subscribeSectors = (
  callback: (sectors: Sector[]) => void,
  intervalMs: number = 5000 // Poll every 5 seconds
): (() => void) => {
  let isCancelled = false;

  const poll = async () => {
    if (isCancelled) return;

    try {
      const sectors = await getAllSectors();
      callback(sectors);
    } catch (error) {
      console.error('Error polling sectors:', error);
    }

    if (!isCancelled) {
      setTimeout(poll, intervalMs);
    }
  };

  // Start polling
  poll();

  // Return unsubscribe function
  return () => {
    isCancelled = true;
  };
};