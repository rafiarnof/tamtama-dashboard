// ============================================================
// IoT Health Check Utility
// Mendeteksi apakah perangkat ESP32 sedang tidak berfungsi
// dengan memeriksa apakah pembacaan sensor semuanya nol.
// Data terakhir yang valid disimpan di localStorage sebagai fallback.
// ============================================================

export interface CachedSensorData {
  temperature: number;
  humidity: number;
  lightLevel: number;
  waterLevel: number;
  pumpStatus: 'ON' | 'OFF';
  /** ISO timestamp saat data valid ini diterima dari IoT */
  cachedAt: string;
}

const CACHE_KEY_PREFIX = 'iot_last_valid_';

/**
 * Menentukan apakah data sensor terlihat mencurigakan (IoT mati / tidak terhubung).
 * Kondisi: 3 atau lebih sensor membaca tepat 0 secara bersamaan.
 */
export const isIoTDataSuspicious = (data: {
  temperature: number;
  humidity: number;
  lightLevel: number;
  waterLevel: number;
}): boolean => {
  const zeroCount = [
    data.temperature === 0,
    data.humidity === 0,
    data.lightLevel === 0,
    data.waterLevel === 0,
  ].filter(Boolean).length;

  // Hanya anggap offline jika SEMUA (4) sensor bernilai 0 (mati total)
  return zeroCount === 4;
};

/**
 * Menyimpan data sensor valid terakhir ke localStorage.
 * Dipanggil saat data diterima dari polling dan dinyatakan valid.
 */
export const saveLastValidData = (
  sectorId: string,
  data: {
    temperature: number;
    humidity: number;
    lightLevel: number;
    waterLevel: number;
    pumpStatus: 'ON' | 'OFF';
  },
  /** ISO string dari lastUpdate sektor (waktu asli dari IoT) */
  iotTimestamp?: string
): void => {
  try {
    const cache: CachedSensorData = {
      ...data,
      cachedAt: iotTimestamp || new Date().toISOString(),
    };
    localStorage.setItem(`${CACHE_KEY_PREFIX}${sectorId}`, JSON.stringify(cache));
  } catch (e) {
    console.warn('⚠️ Gagal menyimpan IoT cache:', e);
  }
};

/**
 * Mengambil data sensor valid terakhir dari localStorage.
 * Mengembalikan null jika belum ada cache.
 */
export const getLastValidData = (sectorId: string): CachedSensorData | null => {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${sectorId}`);
    if (!raw) return null;
    return JSON.parse(raw) as CachedSensorData;
  } catch {
    return null;
  }
};

/**
 * Menghapus cache untuk sebuah sektor (opsional, untuk reset).
 */
export const clearLastValidData = (sectorId: string): void => {
  localStorage.removeItem(`${CACHE_KEY_PREFIX}${sectorId}`);
};

/**
 * Format berapa lama sejak ISO timestamp.
 * Contoh: "5 menit lalu", "2 jam lalu", "3 hari lalu"
 */
export const formatTimeSince = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'tidak diketahui';
  }
};

/**
 * Format timestamp lengkap untuk tooltip/detail.
 */
export const formatFullTimestamp = (isoString: string): string => {
  try {
    return new Date(isoString).toLocaleString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoString;
  }
};

/**
 * Status IoT untuk sebuah sektor.
 */
export type IoTStatus = 'online' | 'offline' | 'unknown';

/**
 * Mengembalikan status IoT berdasarkan data saat ini.
 */
export const getIoTStatus = (data: {
  temperature: number;
  humidity: number;
  lightLevel: number;
  waterLevel: number;
}): IoTStatus => {
  if (isIoTDataSuspicious(data)) return 'offline';
  return 'online';
};
