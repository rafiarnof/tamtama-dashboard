/**
 * ============================================================
 * WATER LEVEL CLASSIFICATION SYSTEM
 * ============================================================
 * Sensor: HC-SR04 Ultrasonic — mengukur JARAK dari sensor ke
 * permukaan air (dalam cm). Jarak kecil = air BANYAK.
 *
 * Klasifikasi:
 *  No Data : = 0 cm   → Belum ada data IoT, pompa DIIZINKAN (fail-safe)
 *  Normal  : < 22 cm  → Air penuh, pompa BOLEH menyala
 *  Sedang  : 22–25 cm → Air cukup, pompa BOLEH menyala
 *  Rendah  : > 25 cm  → Air sedikit, pompa DIBLOKIR
 * ============================================================
 */

export type WaterLevelStatus = 'nodata' | 'normal' | 'sedang' | 'rendah';

export interface WaterLevelInfo {
  status: WaterLevelStatus;
  label: string;
  labelShort: string;
  description: string;
  descriptionDetail: string;
  canPump: boolean;
  // Tailwind classes
  textColor: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}

// ── Ambang batas ──────────────────────────────────────────────
export const WATER_LEVEL_THRESHOLDS = {
  /** Di bawah nilai ini → Normal */
  NORMAL_MAX: 22,
  /** Di bawah/sama dengan nilai ini (dan ≥ NORMAL_MAX) → Sedang */
  SEDANG_MAX: 25,
  // Lebih dari SEDANG_MAX → Rendah
} as const;

// ── Fungsi utama ───────────────────────────────────────────────
export const getWaterLevelInfo = (waterLevel: number): WaterLevelInfo => {
  // ── Kasus khusus: 0 cm = belum ada data dari IoT ─────────────
  // Nilai 0 adalah default sebelum ESP32 mengirim pembacaan pertama.
  // Jarak sensor 0 cm tidak mungkin secara fisik, jadi ini pasti "no data".
  // Fail-safe: izinkan pompa agar jadwal tetap berjalan.
  if (waterLevel === 0) {
    return {
      status: 'nodata',
      label: 'Menunggu Data',
      labelShort: 'No Data',
      description: 'Belum ada data sensor — pompa diizinkan',
      descriptionDetail: 'IoT belum mengirim pembacaan level air. Pompa tetap berjalan sesuai jadwal.',
      canPump: true,
      textColor: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-300',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-600',
      dotColor: 'bg-slate-400',
    };
  }

  if (waterLevel < WATER_LEVEL_THRESHOLDS.NORMAL_MAX) {
    return {
      status: 'normal',
      label: 'Normal',
      labelShort: 'Normal',
      description: 'Level air mencukupi untuk operasi pompa',
      descriptionDetail: `Jarak sensor ${waterLevel.toFixed(1)} cm (< 22 cm) — air penuh`,
      canPump: true,
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
    };
  }

  if (waterLevel <= WATER_LEVEL_THRESHOLDS.SEDANG_MAX) {
    return {
      status: 'sedang',
      label: 'Sedang',
      labelShort: 'Sedang',
      description: 'Level air cukup untuk operasi pompa',
      descriptionDetail: `Jarak sensor ${waterLevel.toFixed(1)} cm (22–25 cm) — air cukup`,
      canPump: true,
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-700',
      dotColor: 'bg-amber-500',
    };
  }

  // > 25 cm
  return {
    status: 'rendah',
    label: 'Rendah',
    labelShort: 'Rendah',
    description: 'Level air rendah (Pompa diizinkan menyala)',
    descriptionDetail: `Jarak sensor ${waterLevel.toFixed(1)} cm (> 25 cm) — air hampir habis`,
    canPump: true,
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    dotColor: 'bg-red-500',
  };
};

/**
 * Cek apakah pompa boleh dinyalakan berdasarkan level air.
 * Kembalikan `true` jika level Normal, Sedang, atau No Data (belum ada IoT).
 * Kembalikan `false` hanya jika level Rendah (> 25 cm).
 */
export const canActivatePump = (waterLevel: number): boolean =>
  getWaterLevelInfo(waterLevel).canPump;

/**
 * Pesan blokir yang ditampilkan ke user saat pompa diblokir.
 */
export const getPumpBlockedMessage = (waterLevel: number): string =>
  `⚠️ Pompa tidak dapat dinyalakan!\n\nLevel air: ${waterLevel.toFixed(1)} cm (Rendah — lebih dari 25 cm)\n\nPompa hanya boleh beroperasi saat level air Normal (< 22 cm) atau Sedang (22–25 cm).\nSilakan isi ulang sumber air terlebih dahulu.`;