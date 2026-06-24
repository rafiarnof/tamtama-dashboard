// WhatsApp Gateway Service - Multi-Sensor Alert System
// Mendukung alert untuk: Level Air, Suhu, Kelembapan, Cahaya
// Cooldown: Admin real-time, Warga max 1x per 6 jam
// SUPPORTS DUAL CONFIG: .env file OR env.config.js file

import { getEnvVar } from '@/app/utils/checkEnvironment';
import type { Sector, AlertCondition } from '@/app/types';

const FONNTE_API_URL = 'https://api.fonnte.com/send';
const FONNTE_TOKEN = getEnvVar('FONNTE_TOKEN') || '';
const ENABLE_WHATSAPP = getEnvVar('ENABLE_WHATSAPP') === 'true';

// Helper: cek apakah nomor HP valid (bukan kosong, bukan placeholder "-" / "N/A", minimal 10 digit)
const isValidPhone = (phone: string | undefined | null): boolean => {
  if (!phone) return false;
  const trimmed = phone.trim();
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'n/a' || trimmed === '0') return false;
  // Harus mengandung minimal 10 digit angka
  const digitsOnly = trimmed.replace(/\D/g, '');
  return digitsOnly.length >= 10;
};

// Cooldown settings
const OWNER_ALERT_COOLDOWN = 6 * 60 * 60 * 1000; // 6 jam dalam milliseconds
const ADMIN_ALERT_COOLDOWN = 0; // Admin tidak ada cooldown (real-time)

// Storage untuk tracking last alert (in-memory, bisa dipindah ke Firebase jika perlu persist)
const alertTracker = new Map<string, number>(); // key: `${sectorId}-${recipientType}`, value: timestamp

/**
 * Kirim alert pompa ON/OFF ke WARGA
 */
export const sendPumpNotificationToOwner = async (
  sector: { name?: string; owner?: { name?: string; phone?: string } },
  pumpStatus: 'ON' | 'OFF',
  source: 'manual' | 'auto'
): Promise<boolean> => {
  try {
    // Check if owner and phone exist
    if (!sector.owner || !isValidPhone(sector.owner.phone)) {
      const sectorName = sector.name || 'Sektor Unknown';
      console.log(`⚠️ Skip pump notification to owner: Nomor HP tidak tersedia atau tidak valid (Sektor: ${sectorName}, Phone: ${sector.owner?.phone || 'kosong'})`);
      return false;
    }
    
    const phone = sector.owner.phone;
    
    if (!phone || phone.length < 10) {
      console.log('⚠️ Skip: Nomor HP warga terlalu pendek:', phone);
      return false;
    }

    const formattedPhone = normalizePhoneNumber(phone);

    // PESAN SINGKAT untuk pompa
    const statusEmoji = pumpStatus === 'ON' ? '✅' : '⏸️';
    const sourceText = source === 'manual' ? 'Manual' : 'Otomatis';
    
    const message = `${statusEmoji} *Pompa ${pumpStatus}* - ${sector.name || 'Sektor'}

Pompa telah ${pumpStatus === 'ON' ? 'dinyalakan' : 'dimatikan'} (${sourceText})

_${new Date().toLocaleString('id-ID', { 
  dateStyle: 'short', 
  timeStyle: 'short' 
})}_`;

    return await sendWhatsAppMessage(formattedPhone, message, 'WARGA');
  } catch (error) {
    console.error('❌ Error mengirim notifikasi pompa ke warga:', error);
    return false;
  }
};

/**
 * Kirim alert pompa ON/OFF ke ADMIN
 */
export const sendPumpNotificationToAdmin = async (
  adminPhone: string,
  adminName: string,
  sector: { name?: string; owner?: { name?: string; phone?: string } },
  pumpStatus: 'ON' | 'OFF',
  source: 'manual' | 'auto'
): Promise<boolean> => {
  try {
    if (!adminPhone || adminPhone.length < 10) {
      console.error('❌ Nomor HP admin tidak valid:', adminPhone);
      return false;
    }

    const formattedPhone = normalizePhoneNumber(adminPhone);

    const statusEmoji = pumpStatus === 'ON' ? '✅' : '⏸️';
    const sourceText = source === 'manual' ? 'Manual' : 'Otomatis';
    
    // Build owner info dengan null checks
    const ownerName = sector.owner?.name || 'N/A';
    
    const message = `${statusEmoji} *[ADMIN] Pompa ${pumpStatus}*

📍 *${sector.name || 'Sektor'}*
⚙️ Status: ${pumpStatus}
🎮 Trigger: ${sourceText}

👤 *Pemilik:* ${ownerName}

_${new Date().toLocaleString('id-ID', { 
  dateStyle: 'short', 
  timeStyle: 'short' 
})}_`;

    return await sendWhatsAppMessage(formattedPhone, message, 'ADMIN');
  } catch (error) {
    console.error('❌ Error mengirim notifikasi pompa ke admin:', error);
    return false;
  }
};

/**
 * Cek kondisi sensor dan kirim alert jika ada anomali
 * Dipanggil dari App.tsx setiap kali ada update sensor
 */
export const checkSensorConditionsAndAlert = async (
  sector: Sector,
  adminPhone: string,
  adminName: string
): Promise<void> => {
  const conditions = detectSensorAnomalies(sector);
  
  if (conditions.length === 0) {
    // Semua sensor normal, tidak perlu alert
    return;
  }

  console.log(`🔔 Anomali terdeteksi di ${sector.name}:`, conditions.map(c => c.type).join(', '));

  // Kirim alert ke ADMIN (real-time, no cooldown)
  const adminKey = `${sector.sectorId}-admin`;
  if (canSendAlert(adminKey, ADMIN_ALERT_COOLDOWN)) {
    await sendAlertToAdmin(sector, conditions, adminPhone, adminName);
    updateAlertTracker(adminKey);
  }

  // Kirim alert ke WARGA (max 1x per 6 jam)
  const ownerKey = `${sector.sectorId}-owner`;
  if (canSendAlert(ownerKey, OWNER_ALERT_COOLDOWN)) {
    await sendAlertToWarga(sector, conditions);
    updateAlertTracker(ownerKey);
  } else {
    const ownerName = sector.owner?.name || 'warga';
    console.log(`⏳ Alert ke warga ${ownerName} di-skip (cooldown 6 jam)`);
  }
};

/**
 * Deteksi anomali dari semua sensor
 */
const detectSensorAnomalies = (sector: Sector): AlertCondition[] => {
  const conditions: AlertCondition[] = [];

  // 1. CEK LEVEL AIR (CRITICAL)
  const waterThreshold = sector.waterThreshold || 5; // Default 5 cm
  if (sector.data.waterLevel < waterThreshold) {
    conditions.push({
      type: 'water',
      severity: 'critical',
      message: `Level air kritis (${sector.data.waterLevel} cm)`
    });
  }

  // 2. CEK SUHU
  if (sector.plant?.optimalTemp) {
    const { min, max } = sector.plant.optimalTemp;
    const temp = sector.data.temperature;
    
    if (temp < min) {
      conditions.push({
        type: 'temperature',
        severity: 'warning',
        message: `Suhu terlalu rendah (${temp}°C, min: ${min}°C)`
      });
    } else if (temp > max) {
      conditions.push({
        type: 'temperature',
        severity: 'warning',
        message: `Suhu terlalu tinggi (${temp}°C, max: ${max}C)`
      });
    }
  }

  // 3. CEK KELEMBAPAN
  if (sector.plant?.optimalHumidity) {
    const { min, max } = sector.plant.optimalHumidity;
    const humidity = sector.data.humidity;
    
    if (humidity < min) {
      conditions.push({
        type: 'humidity',
        severity: 'warning',
        message: `Kelembapan terlalu rendah (${humidity}%, min: ${min}%)`
      });
    } else if (humidity > max) {
      conditions.push({
        type: 'humidity',
        severity: 'warning',
        message: `Kelembapan terlalu tinggi (${humidity}%, max: ${max}%)`
      });
    }
  }

  // 4. CEK CAHAYA
  if (sector.plant?.optimalLight) {
    const { min } = sector.plant.optimalLight;
    const light = sector.data.lightLevel;
    
    if (light < min) {
      conditions.push({
        type: 'light',
        severity: 'warning',
        message: `Cahaya kurang (${light} lux, min: ${min} lux)`
      });
    }
  }

  return conditions;
};

/**
 * Kirim alert ke WARGA (owner sektor)
 */
const sendAlertToWarga = async (
  sector: Sector,
  conditions: AlertCondition[]
): Promise<boolean> => {
  try {
    // Check if owner and phone exist
    if (!sector.owner || !isValidPhone(sector.owner.phone)) {
      console.log(`⚠️ Skip alert warga: Nomor HP tidak tersedia atau tidak valid (Sektor: ${sector.name}, Phone: ${sector.owner?.phone || 'kosong'})`);
      return false;
    }
    
    const phone = sector.owner.phone;
    
    if (!phone || phone.length < 10) {
      console.log('⚠️ Skip: Nomor HP warga terlalu pendek:', phone);
      return false;
    }

    const formattedPhone = normalizePhoneNumber(phone);

    // PESAN SINGKAT (max 3-4 baris)
    const alerts = conditions.map(c => getShortAlertEmoji(c.type) + ' ' + c.message).join('\n');
    
    const message = `🚨 *PERINGATAN ${sector.name || 'Sektor'}*

${alerts}

_Segera cek dan lakukan tindakan._`;

    return await sendWhatsAppMessage(formattedPhone, message, 'WARGA');
  } catch (error) {
    console.error('❌ Error mengirim alert ke warga:', error);
    return false;
  }
};

/**
 * Kirim alert ke ADMIN (pesan lebih detail)
 */
const sendAlertToAdmin = async (
  sector: Sector,
  conditions: AlertCondition[],
  adminPhone: string,
  adminName: string
): Promise<boolean> => {
  try {
    if (!adminPhone || adminPhone.length < 10) {
      console.error('❌ Nomor HP admin tidak valid:', adminPhone);
      return false;
    }

    const formattedPhone = normalizePhoneNumber(adminPhone);

    // PESAN ADMIN (lebih detail)
    const alerts = conditions.map(c => `• ${getShortAlertEmoji(c.type)} ${c.message}`).join('\n');
    
    // Build owner info dengan null checks
    const ownerName = sector.owner?.name || 'N/A';
    const ownerPhone = sector.owner?.phone || 'N/A';
    
    const message = `⚠️ *[ADMIN] Anomali Sensor*

📍 *${sector.name || 'Sektor'}*
${alerts}

👤 *Pemilik:* ${ownerName}
📱 ${ownerPhone}

_Alert dikirim ke warga._`;

    return await sendWhatsAppMessage(formattedPhone, message, 'ADMIN');
  } catch (error) {
    console.error('❌ Error mengirim alert ke admin:', error);
    return false;
  }
};

/**
 * Get emoji untuk setiap tipe sensor
 */
const getShortAlertEmoji = (type: AlertCondition['type']): string => {
  const emojis = {
    water: '💧',
    temperature: '🌡️',
    humidity: '💨',
    light: '☀️'
  };
  return emojis[type] || '⚠️';
};

/**
 * Cek apakah bisa kirim alert (cooldown check)
 */
const canSendAlert = (key: string, cooldownMs: number): boolean => {
  const lastAlertTime = alertTracker.get(key) || 0;
  const now = Date.now();
  const timeSinceLastAlert = now - lastAlertTime;
  
  return timeSinceLastAlert >= cooldownMs;
};

/**
 * Update tracker setelah kirim alert
 */
const updateAlertTracker = (key: string): void => {
  alertTracker.set(key, Date.now());
};

/**
 * Helper: Normalize nomor HP ke format internasional
 */
const normalizePhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.startsWith('62')) {
    return cleanPhone;
  } else if (cleanPhone.startsWith('0')) {
    return '62' + cleanPhone.slice(1);
  } else {
    return '62' + cleanPhone;
  }
};

/**
 * Core function: Kirim WhatsApp message via Fonnte API
 */
const sendWhatsAppMessage = async (
  phone: string,
  message: string,
  recipient: 'ADMIN' | 'WARGA'
): Promise<boolean> => {
  if (!ENABLE_WHATSAPP) {
    console.log(`⚠️ WhatsApp disabled. Pesan WhatsApp tidak terkirim.`);
    console.log(`📱 Target (${recipient}):`, phone);
    console.log(`💬 Pesan:`, message);
    console.log('\n📖 Setup: Set ENABLE_WHATSAPP=true di env.config.js');
    return false;
  }

  if (!FONNTE_TOKEN || FONNTE_TOKEN === '') {
    console.log(`⚠️ Fonnte Token belum diset. Pesan WhatsApp tidak terkirim.`);
    console.log(`📱 Target (${recipient}):`, phone);
    console.log(`💬 Pesan:`, message);
    console.log('\n📖 Setup: Set FONNTE_TOKEN di env.config.js');
    return false;
  }

  try {
    const response = await fetch(FONNTE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: phone,
        message: message,
        countryCode: '62'
      })
    });

    const result = await response.json();

    if (response.ok && result.status) {
      console.log(`✅ WhatsApp alert berhasil dikirim ke ${recipient}:`, phone);
      return true;
    } else {
      // Handle specific error messages
      const errorReason = result.reason || result.message || JSON.stringify(result);
      
      if (errorReason.includes('disconnected device')) {
        console.error(`\n╔═══════════════════════════════════════════════════════════╗`);
        console.error(`║  ❌ FONNTE DEVICE TIDAK TERKONEKSI                       ║`);
        console.error(`╠═══════════════════════════════════════════════════════════╣`);
        console.error(`║                                                           ║`);
        console.error(`║  WhatsApp di Fonnte telah logout atau terputus!          ║`);
        console.error(`║                                                           ║`);
        console.error(`║  🔧 SOLUSI:                                              ║`);
        console.error(`║  1. Buka: https://fonnte.com/login                       ║`);
        console.error(`║  2. Login dengan akun Anda                               ║`);
        console.error(`║  3. Menu "Device" → Re-connect WhatsApp                  ║`);
        console.error(`║  4. Scan QR code dengan WhatsApp Anda                    ║`);
        console.error(`║  5. Test lagi setelah terkoneksi                         ║`);
        console.error(`║                                                           ║`);
        console.error(`╚═══════════════════════════════════════════════════════════╝\n`);
        return false;
      }
      
      if (errorReason.includes('invalid token') || errorReason.includes('Invalid token')) {
        console.error(`\n╔═══════════════════════════════════════════════════════════╗`);
        console.error(`║  ❌ FONNTE TOKEN TIDAK VALID                             ║`);
        console.error(`╠═══════════════════════════════════════════════════════════╣`);
        console.error(`║                                                           ║`);
        console.error(`║  Token Fonnte salah atau sudah expired!                  ║`);
        console.error(`║                                                           ║`);
        console.error(`║  🔧 SOLUSI:                                              ║`);
        console.error(`║  1. Buka: https://fonnte.com/login                       ║`);
        console.error(`║  2. Login dengan akun Anda                               ║`);
        console.error(`║  3. Menu "API" → Copy token yang benar                   ║`);
        console.error(`║  4. Paste token di /env.config.js                        ║`);
        console.error(`║     FONNTE_TOKEN: "token-baru-anda"                      ║`);
        console.error(`║  5. Refresh browser (Ctrl+R)                             ║`);
        console.error(`║                                                           ║`);
        console.error(`╚═══════════════════════════════════════════════════════════╝\n`);
        return false;
      }
      
      // Log generic error dengan detail
      console.error(`❌ Gagal kirim WhatsApp ke ${recipient}:`, errorReason);
      console.error(`📱 Target: ${phone}`);
      console.error(`💬 Response:`, result);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error mengirim WhatsApp ke ${recipient}:`, error);
    console.error(`📱 Target: ${phone}`);
    
    // Network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`\n⚠️ Kemungkinan masalah koneksi internet atau Fonnte API sedang down.`);
      console.error(`   Coba lagi dalam beberapa menit.\n`);
    }
    
    return false;
  }
};

/**
 * Alternative: Menggunakan WhatsApp Web URL (manual click)
 */
export const openWhatsAppManual = (
  phone: string,
  message: string
): void => {
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('62') 
    ? cleanPhone 
    : cleanPhone.startsWith('0') 
      ? '62' + cleanPhone.slice(1) 
      : '62' + cleanPhone;

  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

/**
 * Reset cooldown untuk testing (manual trigger dari UI)
 */
export const resetAlertCooldown = (sectorId: string): void => {
  const ownerKey = `${sectorId}-owner`;
  const adminKey = `${sectorId}-admin`;
  alertTracker.delete(ownerKey);
  alertTracker.delete(adminKey);
  console.log(`✅ Alert cooldown direset untuk sektor ${sectorId}`);
};

/**
 * Get remaining cooldown time (untuk UI display)
 */
export const getRemainingCooldown = (sectorId: string): number => {
  const ownerKey = `${sectorId}-owner`;
  const lastAlertTime = alertTracker.get(ownerKey) || 0;
  const now = Date.now();
  const timeSinceLastAlert = now - lastAlertTime;
  const remaining = OWNER_ALERT_COOLDOWN - timeSinceLastAlert;
  
  return remaining > 0 ? Math.ceil(remaining / 1000 / 60) : 0; // Return in minutes
};

/**
 * Log untuk setup instructions
 */
export const logWhatsAppSetupInstructions = () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  📱 MULTI-SENSOR ALERT SYSTEM                            ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  🔔 Alert untuk:                                         ║
║  • 💧 Level Air (kritis < 5cm)                          ║
║  • 🌡️  Suhu (di luar range optimal)                      ║
║  • 💨 Kelembapan (di luar range optimal)                ║
║  • ☀️  Cahaya (kurang dari kebutuhan tanaman)            ║
║                                                           ║
║  ⏱️  Cooldown:                                           ║
║  • Admin: Real-time (no cooldown)                        ║
║  • Warga: Max 1x per 6 jam                              ║
║                                                           ║
║  📨 Format Pesan:                                        ║
║  • Warga: Singkat & jelas (3-4 baris)                   ║
║  • Admin: Detail lengkap + info pemilik                  ║
║                                                           ║
║  Setup:                                                   ║
║  1. Daftar di Fonnte: https://fonnte.com/               ║
║  2. Copy API Token                                        ║
║  3. Set FONNTE_TOKEN di env.config.js                    ║
║  4. Set optimalTemp, optimalHumidity, optimalLight       ║
║     untuk setiap tanaman di SectorFormModal             ║
║  5. Refresh aplikasi                                      ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
  `);
};