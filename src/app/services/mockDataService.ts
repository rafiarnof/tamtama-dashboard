import type { Sector, SensorData, PumpHistory, AdminSettings } from '@/app/types';

/**
 * ===============================================
 * MOCK DATA SERVICE - DEVELOPMENT MODE
 * ===============================================
 * Service ini digunakan ketika DEV_MODE = true
 * Menyediakan data dummy untuk testing tanpa Supabase
 * ===============================================
 */

// In-memory storage
let mockSectors: Sector[] = [];
let mockPumpHistories: Map<string, PumpHistory[]> = new Map();
let mockAdminSettings: AdminSettings | null = null;

// Initialize default sectors
const initializeMockSectors = () => {
  const defaultSectors: Sector[] = [];

  mockSectors = defaultSectors;
  console.log('🎭 Mock data initialized:', mockSectors.length, 'sectors');
};

// Initialize on import
initializeMockSectors();

// ============================================
// SECTOR OPERATIONS
// ============================================

export const getAllSectors = async (): Promise<Sector[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log('🎭 [MOCK] Getting all sectors:', mockSectors.length);
  
  // Add random variations to sensor data
  return mockSectors.map(sector => ({
    ...sector,
    data: {
      ...sector.data,
      temperature: sector.data.temperature + (Math.random() - 0.5) * 2,
      humidity: sector.data.humidity + (Math.random() - 0.5) * 5,
      waterLevel: Math.max(0, sector.data.waterLevel + (Math.random() - 0.5) * 1),
      lightLevel: sector.data.lightLevel + (Math.random() - 0.5) * 50,
    }
  }));
};

export const getSectorById = async (sectorId: string): Promise<Sector | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const sector = mockSectors.find(s => s.sectorId === sectorId);
  console.log('🎭 [MOCK] Getting sector by ID:', sectorId, sector ? 'found' : 'not found');
  return sector || null;
};

export const createSector = async (sector: Omit<Sector, 'id'>): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newSector: Sector = {
    ...sector,
    id: sector.sectorId,
    pumpHistory: []
  } as Sector;
  
  mockSectors.push(newSector);
  console.log('🎭 [MOCK] Created sector:', sector.sectorId);
  return sector.sectorId;
};

export const updateSector = async (sectorId: string, updates: Partial<Sector>): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = mockSectors.findIndex(s => s.sectorId === sectorId);
  if (index !== -1) {
    mockSectors[index] = { ...mockSectors[index], ...updates };
    console.log('🎭 [MOCK] Updated sector:', sectorId);
  }
};

export const deleteSector = async (sectorId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  mockSectors = mockSectors.filter(s => s.sectorId !== sectorId);
  console.log('🎭 [MOCK] Deleted sector:', sectorId);
};

// ============================================
// SENSOR DATA OPERATIONS
// ============================================

export const saveSensorData = async (sectorId: string, data: SensorData): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const index = mockSectors.findIndex(s => s.sectorId === sectorId);
  if (index !== -1) {
    mockSectors[index].data = { ...mockSectors[index].data, ...data };
    console.log('🎭 [MOCK] Saved sensor data for:', sectorId);
  }
};

export const getSensorData = async (sectorId: string): Promise<SensorData | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const sector = mockSectors.find(s => s.sectorId === sectorId);
  return sector?.data || null;
};

// ============================================
// PUMP OPERATIONS
// ============================================

export const controlPump = async (sectorId: string, status: 'ON' | 'OFF'): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const index = mockSectors.findIndex(s => s.sectorId === sectorId);
  if (index !== -1) {
    mockSectors[index].data.pumpStatus = status;
    console.log('🎭 [MOCK] Pump control:', sectorId, status);
  }
};

export const addPumpHistory = async (
  sectorId: string,
  status: 'ON' | 'OFF',
  source: 'auto' | 'manual'
): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const entry: PumpHistory = {
    timestamp: new Date().toISOString(),
    action: status,
    triggeredBy: source
  };
  
  const history = mockPumpHistories.get(sectorId) || [];
  history.unshift(entry);
  
  // Keep last 100 entries
  if (history.length > 100) {
    history.splice(100);
  }
  
  mockPumpHistories.set(sectorId, history);
  console.log('🎭 [MOCK] Added pump history:', sectorId, status, source);
};

export const storePumpHistory = addPumpHistory; // Alias

export const getPumpHistory = async (
  sectorId: string,
  limitCount: number = 50
): Promise<PumpHistory[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const history = mockPumpHistories.get(sectorId) || [];
  return history.slice(0, limitCount);
};

// ============================================
// ADMIN SETTINGS OPERATIONS
// ============================================

export const saveAdminSettings = async (settings: AdminSettings): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  mockAdminSettings = settings;
  console.log('🎭 [MOCK] Saved admin settings:', settings);
};

export const getAdminSettings = async (): Promise<AdminSettings | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockAdminSettings;
};

// ============================================
// INITIALIZATION
// ============================================

export const initializeDefaultSectors = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('🎭 [MOCK] Default sectors already initialized');
  // Already initialized on import
};

// ============================================
// POLLING (Simulated)
// ============================================

export const subscribeSectors = (
  callback: (sectors: Sector[]) => void,
  intervalMs: number = 5000
): (() => void) => {
  let isCancelled = false;

  const poll = async () => {
    if (isCancelled) return;

    try {
      const sectors = await getAllSectors();
      callback(sectors);
    } catch (error) {
      console.error('🎭 [MOCK] Error polling sectors:', error);
    }

    if (!isCancelled) {
      setTimeout(poll, intervalMs);
    }
  };

  console.log('🎭 [MOCK] Starting polling simulation...');
  poll();

  return () => {
    console.log('🎭 [MOCK] Stopping polling simulation');
    isCancelled = true;
  };
};
