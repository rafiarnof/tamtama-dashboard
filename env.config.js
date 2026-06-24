/**
 * ===============================================
 * ENVIRONMENT CONFIGURATION
 * ===============================================
 * File ini menggantikan .env untuk Figma Make
 * Edit nilai di bawah ini sesuai kebutuhan
 * ===============================================
 */

export const ENV_CONFIG = {
  // ===============================================
  // DEVELOPMENT MODE
  // ===============================================
  
  // Set ke true untuk menggunakan mock data (tanpa Supabase/Edge Function)
  // Set ke false setelah Edge Function ter-deploy
  DEV_MODE: false,  // ← UBAH ke true untuk development mode (mock data)
  
  // ===============================================
  // ADMIN SETTINGS
  // ===============================================
  
  // Nama Admin default (opsional, hanya untuk referensi)
  ADMIN_NAME: "Admin HidroTower",
  
  // Nomor HP Admin (WAJIB DIISI!)
  // Format: 081234567890 (tanpa +62, tanpa spasi)
  ADMIN_PHONE: "082195668584",
  
  // ===============================================
  // ⚠️  PENTING: LOGIN CREDENTIALS
  // ===============================================
  // 
  // Sistem menggunakan Supabase Auth (bukan hardcoded username/password)
  // 
  // CARA LOGIN:
  // 1. Pertama kali: Buka aplikasi → Setup Admin → Buat akun admin pertama
  // 2. Selanjutnya: Login dengan email & password yang sudah dibuat
  // 
  // CONTOH KREDENSIAL YANG DISARANKAN:
  // Email    : admin@hidrotower.com
  // Password : admin123
  // 
  // Anda bisa menggunakan email dan password apapun saat setup admin.
  // ===============================================
  
  // ===============================================
  // WHATSAPP GATEWAY - Fonnte API
  // ===============================================
  
  // AKTIFKAN/MATIKAN fitur WhatsApp Alert
  ENABLE_WHATSAPP: false,  // ← UBAH ke true untuk aktifkan WhatsApp
  
  // Token dari Fonnte.com (WAJIB untuk WhatsApp alert)
  FONNTE_TOKEN: "W4yZKNHbHX4GFBLjXBCS",  // ← ISI TOKEN DI SINI
};

/**
 * ===============================================
 * 🚀 QUICK START GUIDE
 * ===============================================
 * 
 * ┌─────────────────────────────────────────────┐
 * │  STEP 1: Deploy Edge Function (WAJIB)       │
 * └─────────────────────────────────────────────┘
 * 
 * 1. Install Supabase CLI:
 *    npm install -g supabase
 * 
 * 2. Login ke Supabase:
 *    supabase login
 * 
 * 3. Link project:
 *    supabase link --project-ref wgjudfgqjqorkhdlvlgc
 * 
 * 4. Deploy edge function:
 *    supabase functions deploy make-server-5aa965b0
 * 
 * 5. Verifikasi (buka di browser):
 *    https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0/health
 * 
 * ┌─────────────────────────────────────────────┐
 * │  STEP 2: Setup Database Tables (WAJIB)      │
 * └─────────────────────────────────────────────┘
 * 
 * Buka Supabase Dashboard → SQL Editor → Jalankan script dari DEPLOYMENT_GUIDE.md
 * 
 * ┌─────────────────────────────────────────────┐
 * │  STEP 3: Setup Admin (PERTAMA KALI)         │
 * └─────────────────────────────────────────────┘
 * 
 * 1. Buka aplikasi di browser
 * 2. Halaman "Setup Admin Pertama" akan muncul
 * 3. Isi form:
 *    - Nama Lengkap: Admin Hidroponik
 *    - Email: admin@hidrotower.com (atau email lain)
 *    - Nomor HP: 082195668584 (opsional)
 *    - Password: admin123 (minimal 6 karakter)
 *    - Konfirmasi Password: admin123
 * 4. Klik "Buat Akun Admin"
 * 5. Sistem akan otomatis login
 * 
 * ┌─────────────────────────────────────────────┐
 * │  STEP 4: Login (SETELAH SETUP)              │
 * └─────────────────────────────────────────────┘
 * 
 * Gunakan email & password yang Anda buat saat setup:
 * - Email: admin@hidrotower.com
 * - Password: admin123
 * 
 * ┌─────────────────────────────────────────────┐
 * │  ALTERNATIF: Development Mode (Tanpa Deploy)│
 * └─────────────────────────────────────────────┘
 * 
 * Jika ingin testing tanpa deploy Edge Function:
 * 1. Ubah DEV_MODE ke true (baris 17)
 * 2. Refresh browser (Ctrl+R)
 * 3. Aplikasi akan menggunakan mock data
 * 
 * CATATAN: Mode development hanya untuk testing UI!
 * ESP32 tidak bisa connect ke mode development.
 * 
 * ===============================================
 * 📞 WHATSAPP ALERT SETUP (OPSIONAL)
 * ===============================================
 * 
 * 1. Daftar di https://fonnte.com/ (gratis 100 pesan/hari)
 * 2. Login → Device → Connect WhatsApp (scan QR)
 * 3. Menu API → Copy "Your Token"
 * 4. Paste token ke FONNTE_TOKEN (baris 48)
 * 5. Ubah ENABLE_WHATSAPP ke true (baris 45)
 * 6. Save & refresh browser
 * 
 * ===============================================
 */