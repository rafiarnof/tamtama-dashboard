# 📘 SOP (Standard Operating Procedure) LENGKAP
## Sistem Monitoring Pertanian 10 Sektor

**Versi:** 2.0  
**Tanggal:** 7 Februari 2026  
**Status:** Production Ready

---

# 📑 DAFTAR ISI

1. [SOP Deployment & Setup Awal](#1-sop-deployment--setup-awal)
2. [SOP Operasional Harian](#2-sop-operasional-harian)
3. [SOP Maintenance Rutin](#3-sop-maintenance-rutin)
4. [SOP Troubleshooting](#4-sop-troubleshooting)
5. [SOP Emergency Response](#5-sop-emergency-response)
6. [SOP Monitoring & Alerting](#6-sop-monitoring--alerting)
7. [SOP Security & Backup](#7-sop-security--backup)
8. [SOP Pengelolaan Data](#8-sop-pengelolaan-data)
9. [SOP ESP32 Device Management](#9-sop-esp32-device-management)
10. [SOP User Management](#10-sop-user-management)

---

# 1. SOP DEPLOYMENT & SETUP AWAL

## 1.1 Deployment Edge Function ke Supabase

### Tujuan
Deploy Edge Function agar sistem dapat berkomunikasi dengan database dan ESP32.

### Prasyarat
- ✅ Supabase CLI terinstall
- ✅ Sudah login ke Supabase (`supabase login`)
- ✅ Project ID sudah dikonfigurasi

### Langkah-Langkah

#### 1.1.1 Login ke Supabase
```bash
supabase login
```
**Output yang diharapkan:** Browser terbuka untuk autentikasi

#### 1.1.2 Link Project
```bash
supabase link --project-ref wgjudfgqjqorkhdlvlgc
```
**Output yang diharapkan:** `Linked to project wgjudfgqjqorkhdlvlgc`

#### 1.1.3 Deploy Edge Function
```bash
supabase functions deploy make-server-5aa965b0
```
**Output yang diharapkan:**
```
Deploying function make-server-5aa965b0...
✓ Function deployed successfully
URL: https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0
```

#### 1.1.4 Verifikasi Deployment
```bash
./verify-deployment.sh
```
**Output yang diharapkan:**
```
✅ Edge Function is deployed and running!
Status: 200 OK
Response: {"status":"ok","timestamp":"...","database":"normalized-postgres"}
```

### Checklist
- [ ] Supabase CLI terinstall
- [ ] Login berhasil
- [ ] Project linked
- [ ] Edge Function deployed
- [ ] Verification script passed
- [ ] Web app bisa akses database

### Waktu Estimasi
⏱️ 10-15 menit (first time)  
⏱️ 2-3 menit (subsequent deploys)

### Troubleshooting
**Problem:** `supabase: command not found`  
**Solution:** Install Supabase CLI: `npm install -g supabase`

**Problem:** `Failed to deploy function`  
**Solution:** Check error log, pastikan code di `/supabase/functions/server/index.tsx` valid

---

## 1.2 Konfigurasi Environment Variables

### Tujuan
Setup semua konfigurasi yang diperlukan untuk production.

### Lokasi File
`/env.config.js`

### Parameter Wajib

#### 1.2.1 DEV_MODE
```javascript
DEV_MODE: false,  // ✅ PRODUCTION: false, ❌ DEVELOPMENT: true
```
**Kapan menggunakan:**
- `false`: Production (gunakan Supabase)
- `true`: Development (gunakan mock data)

#### 1.2.2 ADMIN CREDENTIALS
```javascript
ADMIN_USERNAME: "admin",        // Ganti dengan username yang aman
ADMIN_PASSWORD: "admin123",     // ⚠️ WAJIB GANTI dengan password kuat!
```
**Best Practice:**
- Username: minimal 5 karakter
- Password: minimal 8 karakter, kombinasi huruf, angka, simbol
- **JANGAN** gunakan default `admin/admin123` di production!

#### 1.2.3 ADMIN CONTACT
```javascript
ADMIN_NAME: "Admin Desa",       // Nama lengkap admin
ADMIN_PHONE: "082195668584",    // Nomor HP admin (format: 08xxx)
```
**Format nomor HP:**
- ✅ Benar: `081234567890` (tanpa +62, tanpa spasi)
- ❌ Salah: `+62 812-3456-7890`

#### 1.2.4 WHATSAPP GATEWAY
```javascript
ENABLE_WHATSAPP: true,                    // true = aktifkan WhatsApp
FONNTE_TOKEN: "W4yZKNHbHX4GFBLjXBCS",    // Token dari Fonnte.com
```

### Cara Mendapatkan Fonnte Token

#### Step 1: Daftar Fonnte
1. Buka https://fonnte.com/
2. Klik "Daftar" (Gratis 100 pesan/hari)
3. Isi email & password
4. Verifikasi email

#### Step 2: Connect WhatsApp
1. Login ke dashboard Fonnte
2. Menu "Device" → "Connect WhatsApp"
3. Scan QR code dengan HP (WhatsApp → Settings → Linked Devices)
4. Tunggu status menjadi "Connected"

#### Step 3: Copy Token
1. Menu "API" di sidebar
2. Copy "Your Token"
3. Paste ke `FONNTE_TOKEN` di `/env.config.js`

#### Step 4: Test
```bash
curl -X POST "https://api.fonnte.com/validate" \
  -H "Authorization: YOUR_TOKEN_HERE"
```
**Output yang diharapkan:**
```json
{"status":true,"device":"Connected","expired":"2026-12-31"}
```

### Checklist Konfigurasi
- [ ] DEV_MODE = false untuk production
- [ ] ADMIN_USERNAME diganti (bukan "admin")
- [ ] ADMIN_PASSWORD diganti (minimal 8 karakter)
- [ ] ADMIN_PHONE sesuai format (08xxx)
- [ ] FONNTE_TOKEN valid dan device connected
- [ ] ENABLE_WHATSAPP = true
- [ ] File saved (Ctrl+S / Cmd+S)

### Waktu Estimasi
⏱️ 20-30 menit (termasuk setup Fonnte)

---

## 1.3 Setup Database (Pertama Kali)

### Tujuan
Inisialisasi database dengan data default 10 sektor.

### Prasyarat
- ✅ Edge Function sudah deployed
- ✅ ENV_CONFIG sudah dikonfigurasi

### Langkah-Langkah

#### 1.3.1 Akses Web App
1. Buka aplikasi di browser
2. Login dengan credentials admin

#### 1.3.2 Auto-Initialization
Sistem akan otomatis membuat 10 sektor default:
- Sektor 1: Pak Budi - Padi
- Sektor 2: Bu Ani - Jagung
- Sektor 3: Pak Andi - Cabai
- ... (dst)

#### 1.3.3 Verifikasi
```bash
# Check di Supabase Dashboard
# https://supabase.com/dashboard/project/wgjudfgqjqorkhdlvlgc/editor

# Atau via curl
curl "https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0/sectors" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Output yang diharapkan:**
```json
{
  "success": true,
  "sectors": [
    {
      "sectorId": "SEC-001",
      "name": "Sektor 1",
      "owner": {"name": "Pak Budi", "phone": "081234567890"},
      "data": {"temperature": 0, "humidity": 0, ...}
    },
    // ... 9 sektor lainnya
  ]
}
```

### Checklist
- [ ] 10 sektor default terbuat
- [ ] Data muncul di dashboard
- [ ] Tidak ada error di console

### Waktu Estimasi
⏱️ 2-3 menit (otomatis)

---

## 1.4 Setup ESP32 Devices

### Tujuan
Flash ESP32 dengan firmware dan hubungkan ke sistem.

### Prasyarat
- ✅ Arduino IDE terinstall
- ✅ ESP32 board support installed
- ✅ Library yang diperlukan installed (HTTPClient, ArduinoJson, WiFi)

### Langkah-Langkah

#### 1.4.1 Persiapkan Hardware
1. Sambungkan sensor ke ESP32 (lihat `/WIRING_VISUAL_DIAGRAM.md`)
2. Hubungkan ESP32 ke komputer via USB

#### 1.4.2 Konfigurasi Firmware
Edit file `/ESP32_SUPABASE_CODE.ino`:

```cpp
// WiFi Credentials
const char* ssid = "WiFi_Anda";          // ← Ganti dengan WiFi name
const char* password = "Password_WiFi";  // ← Ganti dengan WiFi password

// Supabase Configuration
const char* supabaseUrl = "https://wgjudfgqjqorkhdlvlgc.supabase.co";
const char* supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Anon key

// Sector ID
const char* sectorId = "SEC-001";  // ← Ganti sesuai sektor (SEC-001 s/d SEC-010)
```

#### 1.4.3 Upload Firmware
1. Tools → Board → ESP32 Dev Module
2. Tools → Port → (pilih port ESP32)
3. Click "Upload" ✅
4. Tunggu sampai selesai (100%)

#### 1.4.4 Verifikasi
1. Buka Serial Monitor (Tools → Serial Monitor)
2. Set baud rate: 115200
3. Reset ESP32 (tombol RESET)

**Output yang diharapkan:**
```
🚀 Tamtama ESP32 - Agriculture Monitoring
📡 Connecting to WiFi: WiFi_Anda
✅ WiFi Connected! IP: 192.168.1.100
📊 Reading sensors...
   🌡️  Temperature: 28.5°C
   💧 Humidity: 65.2%
   💡 Light Level: 450
   💦 Water Level: 12.5 cm
   ⚡ Pump Status: OFF
📤 Sending data to Supabase...
✅ Data sent successfully! (200 OK)
```

### Checklist per Device
- [ ] Wiring sesuai diagram
- [ ] WiFi credentials benar
- [ ] Sector ID sesuai (SEC-001 s/d SEC-010)
- [ ] Upload firmware berhasil
- [ ] Serial monitor menunjukkan data terkirim
- [ ] Dashboard web menampilkan data sensor

### Waktu Estimasi
⏱️ 10-15 menit per device  
⏱️ 2-3 jam untuk 10 devices

### Troubleshooting
**Problem:** WiFi tidak connect  
**Solution:** 
- Cek SSID & password
- Pastikan WiFi 2.4GHz (bukan 5GHz)
- Cek signal strength

**Problem:** Data tidak muncul di dashboard  
**Solution:**
- Cek Sector ID benar
- Cek serial monitor untuk error
- Cek Edge Function deployed

---

# 2. SOP OPERASIONAL HARIAN

## 2.1 Login & Monitoring Rutin

### Tujuan
Memantau kondisi 10 sektor secara rutin.

### Frekuensi
🕐 **3x sehari:**
- Pagi: 07:00 WIB
- Siang: 13:00 WIB
- Sore: 18:00 WIB

### Langkah-Langkah

#### 2.1.1 Login ke Dashboard
1. Buka browser
2. Akses URL aplikasi
3. Login dengan username & password admin

#### 2.1.2 Check Overview
Perhatikan di dashboard utama:
- ✅ **Total Sektor:** Harus 10 sektor
- ✅ **Connection Status:** Indikator WiFi hijau
- ✅ **Last Sync Time:** Tidak lebih dari 5 detik yang lalu

#### 2.1.3 Check Sensor Data
Untuk setiap sektor, perhatikan:

**Suhu (Temperature)**
- ✅ Normal: 25-35°C
- ⚠️ Warning: 35-40°C atau 20-25°C
- 🔴 Critical: >40°C atau <20°C

**Kelembapan (Humidity)**
- ✅ Normal: 60-80%
- ⚠️ Warning: 80-90% atau 40-60%
- 🔴 Critical: >90% atau <40%

**Level Air (Water Level)**
- ✅ Normal: >10 cm
- ⚠️ Warning: 5-10 cm
- 🔴 Critical: <5 cm

**Cahaya (Light Level)**
- ✅ Normal: 300-800 (siang hari)
- ✅ Normal: 0-100 (malam hari)

**Status Pompa (Pump Status)**
- ✅ Sesuai jadwal: ON (menit 0-14 setiap jam)
- ✅ Sesuai jadwal: OFF (menit 15-59)

#### 2.1.4 Catat Anomali
Jika ada sektor dengan status 🔴 Critical:
1. Klik sektor untuk detail
2. Screenshot kondisi sensor
3. Hubungi pemilik via WhatsApp (klik tombol WA)
4. Catat di log book:
   ```
   Tanggal: 07/02/2026
   Waktu: 13:45 WIB
   Sektor: Sektor 3 (Pak Andi - Cabai)
   Masalah: Water Level 3.2 cm (Critical)
   Tindakan: Hubungi Pak Andi, cek sumber air
   Status: ✅ Resolved / ⏳ Pending
   ```

### Checklist Monitoring
- [ ] Login berhasil
- [ ] Dashboard loading sempurna (tidak ada error)
- [ ] 10 sektor tampil semua
- [ ] Connection status hijau
- [ ] Sensor data update (last sync <5 detik)
- [ ] Pump status sesuai jadwal
- [ ] Tidak ada sektor critical (atau sudah ditindaklanjuti)
- [ ] Log book diupdate (jika ada anomali)

### Waktu Estimasi
⏱️ 5-10 menit per session  
⏱️ 15-30 menit per hari (3 session)

---

## 2.2 Manual Pump Control

### Tujuan
Mengontrol pompa secara manual saat diperlukan (override auto-schedule).

### Kapan Menggunakan
- 🌧️ Hujan deras → Matikan pompa
- ☀️ Cuaca sangat panas → Nyalakan pompa tambahan
- 🔧 Maintenance pompa → Matikan pompa sementara
- 🌱 Tanaman baru ditanam → Nyalakan pompa manual

### Langkah-Langkah

#### 2.2.1 Akses Sektor
1. Dashboard → Klik sektor yang akan diatur
2. Detail modal terbuka

#### 2.2.2 Toggle Pump
1. Lihat status pompa saat ini (ON/OFF)
2. Klik tombol "Override Pompa Manual"
3. Status berubah dengan 4 visual feedback:
   - 🔵 LED pulse animation
   - 🔄 Spinning icon
   - 🟡 Yellow banner "Menunggu konfirmasi ESP32..."
   - 🔒 Button disabled

#### 2.2.3 Tunggu Konfirmasi
- ⏱️ Timeout: 10 detik
- ✅ Success: Status update, banner hilang
- ❌ Timeout: Status kembali ke awal, muncul toast warning

#### 2.2.4 Notifikasi
Sistem otomatis mengirim WhatsApp alert:
- 📱 Ke pemilik sektor: "Pompa di [Sektor X] telah diubah menjadi [ON/OFF] secara manual oleh Admin."
- 📱 Ke admin: "Anda telah mengubah pompa [Sektor X] menjadi [ON/OFF]."

### Checklist Manual Control
- [ ] Alasan control tercatat di log book
- [ ] Pemilik sektor dihubungi (jika perlu)
- [ ] Status pompa berubah sesuai keinginan
- [ ] ESP32 konfirmasi (<10 detik)
- [ ] WhatsApp notifikasi terkirim
- [ ] Catat di log book

### Contoh Log Book Entry
```
Tanggal: 07/02/2026
Waktu: 14:30 WIB
Sektor: Sektor 5 (Bu Siti - Tomat)
Aksi: Manual Pump ON
Alasan: Cuaca sangat panas (38°C), tanaman layu
Durasi: 14:30 - 15:00 (30 menit)
Status: ✅ Pompa mati otomatis setelah 30 menit
```

### Waktu Estimasi
⏱️ 1-2 menit per control

---

## 2.3 Monitoring WhatsApp Alerts

### Tujuan
Memastikan sistem alert WhatsApp berfungsi dan ditindaklanjuti.

### Frekuensi
🕐 Setiap kali ada alert (real-time)

### Jenis Alert

#### 2.3.1 Sensor Critical Alert
**Format pesan:**
```
🚨 ALERT - [Sektor X]
━━━━━━━━━━━━━━━━━━━
📍 Sektor: Sektor 3
🌾 Tanaman: Cabai
👤 Pemilik: Pak Andi

⚠️ KONDISI KRITIS:
💦 Level Air: 3.2 cm (< 5 cm)

⏰ Waktu: 07/02/2026 13:45 WIB

📞 Hubungi Pak Andi: 081234567891
```

**Penerima:**
- 📱 Admin: Semua alert dari semua sektor
- 📱 Warga: Hanya alert dari sektor mereka sendiri

**Cooldown:** 6 jam (untuk cegah spam)

#### 2.3.2 Pump Notification
**Format pesan:**
```
⚡ Pompa [ON/OFF] - [Sektor X]
━━━━━━━━━━━━━━━━━━━
📍 Sektor: Sektor 5
🌾 Tanaman: Tomat
⚙️ Status: ON
📝 Trigger: Manual (Admin)

⏰ Waktu: 07/02/2026 14:30 WIB
```

### Action Required

#### Untuk Sensor Critical Alert:
1. ✅ Baca pesan segera (<5 menit)
2. ✅ Login ke dashboard untuk cek detail
3. ✅ Hubungi pemilik sektor
4. ✅ Koordinasi tindakan (isi air, matikan pompa, dll)
5. ✅ Monitor kondisi sampai normal
6. ✅ Catat di log book

#### Untuk Pump Notification:
1. ✅ Konfirmasi pompa bekerja (via dashboard)
2. ✅ Jika auto-schedule: No action needed
3. ✅ Jika manual: Catat di log book

### Checklist Alert Handling
- [ ] Alert diterima di WhatsApp
- [ ] Dashboard dicek untuk detail
- [ ] Pemilik dihubungi (untuk critical alert)
- [ ] Tindakan diambil
- [ ] Kondisi dinormalkan
- [ ] Log book diupdate

### Waktu Estimasi
⏱️ 5-15 menit per alert (tergantung severity)

---

# 3. SOP MAINTENANCE RUTIN

## 3.1 Daily Maintenance

### Tujuan
Maintenance harian untuk memastikan sistem berjalan optimal.

### Frekuensi
🕐 1x per hari (pagi hari, 07:00 WIB)

### Checklist

#### 3.1.1 System Health Check
- [ ] Dashboard loading <3 detik
- [ ] Connection status hijau
- [ ] Polling interval stabil (5 detik)
- [ ] Tidak ada error di browser console (F12)

#### 3.1.2 Data Integrity Check
- [ ] Semua 10 sektor tampil
- [ ] Last update timestamp <20 detik
- [ ] Sensor data reasonable (tidak ada nilai aneh)
- [ ] Pump status sesuai schedule

#### 3.1.3 WhatsApp Gateway Check
- [ ] Fonnte device status "Connected"
- [ ] Token belum expired
- [ ] Kuota pesan mencukupi (>20 pesan tersisa)

**Cara cek:**
```bash
curl -X POST "https://api.fonnte.com/validate" \
  -H "Authorization: YOUR_TOKEN_HERE"
```

#### 3.1.4 ESP32 Devices Check
Untuk setiap sektor:
- [ ] Data update reguler (setiap 20 detik)
- [ ] Sensor readings reasonable
- [ ] Pump control responsive

### Action Items
**Jika ada masalah:**
1. Catat masalah di log book
2. Follow troubleshooting guide (bagian 4)
3. Eskalasi jika tidak terselesaikan dalam 1 jam

### Waktu Estimasi
⏱️ 10-15 menit

---

## 3.2 Weekly Maintenance

### Tujuan
Maintenance mingguan untuk preventif maintenance.

### Frekuensi
🕐 1x per minggu (Senin pagi, 08:00 WIB)

### Checklist

#### 3.2.1 Database Maintenance
- [ ] Check jumlah sensor data entries
- [ ] Check jumlah pump history entries
- [ ] Lihat growth rate data

**Cara cek:**
```sql
-- Login ke Supabase Dashboard → SQL Editor
SELECT 
  (SELECT COUNT(*) FROM sensor_data) AS total_sensor_data,
  (SELECT COUNT(*) FROM pump_history) AS total_pump_history;
```

**Action:** Jika >100,000 entries, pertimbangkan cleanup data lama (>30 hari).

#### 3.2.2 ESP32 Firmware Check
- [ ] Check apakah ada firmware update
- [ ] Test battery voltage (jika menggunakan battery backup)
- [ ] Check koneksi fisik sensor (cable, connector)

#### 3.2.3 Backup Check
- [ ] Supabase auto-backup enabled (check dashboard)
- [ ] Point-in-time recovery (PITR) enabled
- [ ] Export data manual (optional, untuk extra safety)

**Cara manual export:**
```bash
# Via Supabase Dashboard
# Settings → Database → Backup → Export Database
```

#### 3.2.4 Security Check
- [ ] Review login attempts (check for brute force)
- [ ] Check API request patterns (check for abuse)
- [ ] Update admin password (jika >30 hari)

### Waktu Estimasi
⏱️ 30-45 menit

---

## 3.3 Monthly Maintenance

### Tujuan
Maintenance bulanan untuk long-term health check.

### Frekuensi
🕐 1x per bulan (tanggal 1, 09:00 WIB)

### Checklist

#### 3.3.1 Performance Review
- [ ] Review dashboard loading time (target: <3 detik)
- [ ] Review polling latency (target: <1 detik)
- [ ] Review Edge Function response time (target: <500ms)

**Cara cek:**
```bash
# Check Edge Function response time
time curl "https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0/health" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

#### 3.3.2 Data Cleanup
- [ ] Hapus sensor data >30 hari (untuk hemat storage)
- [ ] Hapus pump history >30 hari
- [ ] Archive data penting ke file backup

**SQL cleanup:**
```sql
-- Hapus sensor data >30 hari
DELETE FROM sensor_data 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Hapus pump history >30 hari
DELETE FROM pump_history 
WHERE created_at < NOW() - INTERVAL '30 days';
```

#### 3.3.3 Hardware Maintenance
- [ ] Bersihkan sensor (debu, kotoran)
- [ ] Check pompa air (flow rate, kebocoran)
- [ ] Check power supply (voltage, arus)
- [ ] Check enclosure ESP32 (waterproof, ventilasi)

#### 3.3.4 Software Update Check
- [ ] Check Supabase platform updates
- [ ] Check ESP32 library updates
- [ ] Check frontend dependencies updates

```bash
# Check outdated packages
npm outdated
```

### Waktu Estimasi
⏱️ 1-2 jam

---

# 4. SOP TROUBLESHOOTING

## 4.1 Dashboard Tidak Bisa Diakses

### Gejala
- Browser menampilkan "Cannot connect to server"
- Dashboard tidak loading
- White screen

### Diagnosis

#### 4.1.1 Check Browser Console
1. Tekan F12 (Developer Tools)
2. Tab "Console"
3. Lihat error messages

**Possible Errors:**
- `Failed to fetch`: Edge Function belum deployed
- `CORS error`: CORS configuration issue
- `401 Unauthorized`: Authentication issue

#### 4.1.2 Check Edge Function Status
```bash
./verify-deployment.sh
```

**Jika gagal:**
```bash
supabase functions deploy make-server-5aa965b0
```

#### 4.1.3 Check Network
```bash
ping wgjudfgqjqorkhdlvlgc.supabase.co
```

### Solusi

**Scenario 1: Edge Function Belum Deployed**
```bash
# Deploy ulang
supabase login
supabase link --project-ref wgjudfgqjqorkhdlvlgc
supabase functions deploy make-server-5aa965b0

# Verify
./verify-deployment.sh
```

**Scenario 2: CORS Issue**
1. Check `/supabase/functions/server/index.tsx`
2. Pastikan CORS middleware configured:
   ```tsx
   app.use("/*", cors({
     origin: "*",
     allowHeaders: ["Content-Type", "Authorization"],
   }));
   ```
3. Deploy ulang

**Scenario 3: Browser Cache**
1. Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
2. Clear browser cache
3. Reload

### Waktu Estimasi
⏱️ 5-15 menit

---

## 4.2 Sensor Data Tidak Update

### Gejala
- Sensor data stuck di nilai lama
- Last update timestamp >1 menit
- Dashboard menampilkan data 0

### Diagnosis

#### 4.2.1 Check ESP32 Serial Monitor
1. Sambungkan ESP32 ke komputer
2. Buka Serial Monitor (baud: 115200)
3. Lihat output

**Possible Issues:**
- WiFi disconnected
- Sensor error
- Supabase API error

#### 4.2.2 Check Specific Sector
1. Dashboard → Klik sektor bermasalah
2. Tab "Charts" → Lihat sensor history
3. Jika flat line → ESP32 tidak mengirim data

### Solusi

**Scenario 1: WiFi Disconnected**
```cpp
// Serial Monitor Output:
❌ WiFi Disconnected
📡 Reconnecting...
```

**Action:**
1. Check WiFi router online
2. Check WiFi credentials di firmware
3. Restart ESP32
4. Re-upload firmware jika perlu

**Scenario 2: Sensor Error**
```cpp
// Serial Monitor Output:
⚠️ DHT22 Error: Failed to read temperature
⚠️ Sensor reading: NaN
```

**Action:**
1. Check wiring sensor (lihat `/WIRING_VISUAL_DIAGRAM.md`)
2. Test sensor dengan multimeter
3. Ganti sensor jika rusak

**Scenario 3: Supabase API Error**
```cpp
// Serial Monitor Output:
❌ Failed to send data: HTTP 401 Unauthorized
```

**Action:**
1. Check Supabase anon key di firmware
2. Check Edge Function deployed
3. Check internet connection

**Scenario 4: Edge Function Error**
```cpp
// Serial Monitor Output:
❌ Failed to send data: HTTP 500 Internal Server Error
```

**Action:**
1. Check Edge Function logs:
   ```bash
   supabase functions logs make-server-5aa965b0
   ```
2. Fix error di `/supabase/functions/server/index.tsx`
3. Deploy ulang

### Waktu Estimasi
⏱️ 10-30 menit (tergantung root cause)

---

## 4.3 Pompa Tidak Bisa Dikontrol

### Gejala
- Klik tombol pump control tidak ada efek
- Status pompa tidak berubah
- Timeout warning muncul

### Diagnosis

#### 4.3.1 Check Dashboard
1. Klik sektor bermasalah
2. Klik "Override Pompa Manual"
3. Observe:
   - ✅ Button disabled + yellow banner → Command sent
   - ❌ Timeout (10 detik) → ESP32 tidak merespon

#### 4.3.2 Check ESP32 Serial Monitor
```cpp
// Expected Output:
📥 Polling pump command...
✅ New pump command: ON
⚡ Turning pump ON...
✅ Pump is now ON
```

**Possible Issues:**
- ESP32 tidak polling
- Relay tidak bekerja
- Database tidak update

### Solusi

**Scenario 1: ESP32 Tidak Polling**
```cpp
// Serial Monitor Output:
(tidak ada output "Polling pump command...")
```

**Action:**
1. Check firmware memiliki polling loop:
   ```cpp
   void loop() {
     // ... sensor reading
     checkPumpCommand(); // ← Harus ada
     delay(20000);
   }
   ```
2. Re-upload firmware jika perlu

**Scenario 2: Relay Tidak Bekerja**
```cpp
// Serial Monitor Output:
✅ New pump command: ON
⚡ Turning pump ON...
```
Tapi pompa fisik tidak nyala.

**Action:**
1. Check wiring relay (lihat diagram)
2. Check relay dengan multimeter
3. Check power supply relay (5V/12V)
4. Ganti relay jika rusak

**Scenario 3: Database Tidak Update**
**Action:**
1. Check di Supabase Dashboard → Table Editor → `sensor_data`
2. Find row dengan `sector_id` = sektor bermasalah
3. Check kolom `pump_status`
4. Jika tidak berubah → issue di Edge Function:
   ```bash
   supabase functions logs make-server-5aa965b0
   ```

### Waktu Estimasi
⏱️ 15-45 menit

---

## 4.4 WhatsApp Alert Tidak Terkirim

### Gejala
- Admin/warga tidak menerima alert
- Console menampilkan "WhatsApp alert failed"
- Fonnte status error

### Diagnosis

#### 4.4.1 Check Fonnte Status
```bash
curl -X POST "https://api.fonnte.com/validate" \
  -H "Authorization: YOUR_TOKEN_HERE"
```

**Expected Output:**
```json
{"status":true,"device":"Connected","expired":"2026-12-31"}
```

**Possible Issues:**
- Token expired
- Device disconnected
- Kuota habis

#### 4.4.2 Check Browser Console
```javascript
// Console Output:
❌ Failed to send WhatsApp alert: 401 Unauthorized
// atau
⚠️ Fonnte device status: Disconnected
```

### Solusi

**Scenario 1: Token Expired**
**Action:**
1. Login ke Fonnte dashboard
2. Menu "API" → Copy token baru
3. Update `/env.config.js`:
   ```javascript
   FONNTE_TOKEN: "NEW_TOKEN_HERE",
   ```
4. Refresh browser

**Scenario 2: Device Disconnected**
**Action:**
1. Login ke Fonnte dashboard
2. Menu "Device" → Status device
3. Jika "Disconnected":
   - Click "Reconnect"
   - Scan QR dengan WhatsApp
   - Tunggu status "Connected"

**Scenario 3: Kuota Habis**
**Action:**
1. Login ke Fonnte dashboard
2. Check sisa kuota pesan
3. Jika habis:
   - Upgrade paket (berbayar)
   - Atau tunggu reset kuota (gratis: 100 pesan/hari)

**Scenario 4: Nomor HP Invalid**
**Action:**
1. Check nomor HP di form edit sektor
2. Format harus: `081234567890` (tanpa +62, tanpa spasi)
3. Update nomor HP jika salah

### Waktu Estimasi
⏱️ 10-20 menit

---

## 4.5 Login Tidak Bisa

### Gejala
- Username/password ditolak
- Error "Invalid credentials"
- Redirect ke login terus

### Diagnosis

#### 4.5.1 Check Credentials
1. Check `/env.config.js`:
   ```javascript
   ADMIN_USERNAME: "admin",
   ADMIN_PASSWORD: "admin123",
   ```
2. Pastikan menggunakan credentials yang sama

#### 4.5.2 Check Browser Console
```javascript
// Console Output:
❌ Login failed: Invalid credentials
```

### Solusi

**Scenario 1: Lupa Password**
**Action:**
1. Edit `/env.config.js`
2. Update `ADMIN_PASSWORD`:
   ```javascript
   ADMIN_PASSWORD: "password_baru_123",
   ```
3. Save file (Ctrl+S)
4. Refresh browser (Ctrl+R)
5. Clear localStorage:
   ```javascript
   // Browser Console:
   localStorage.clear();
   ```
6. Reload page
7. Login dengan password baru

**Scenario 2: Session Stuck**
**Action:**
1. Open browser console (F12)
2. Run:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```
3. Hard refresh: Ctrl+Shift+R
4. Login ulang

**Scenario 3: Browser Cache**
**Action:**
1. Clear browser cache completely
2. Close all browser tabs
3. Open new tab
4. Login ulang

### Waktu Estimasi
⏱️ 5-10 menit

---

# 5. SOP EMERGENCY RESPONSE

## 5.1 System Down (Complete Outage)

### Definisi
Seluruh sistem tidak bisa diakses, baik dashboard maupun ESP32.

### Severity
🔴 **CRITICAL** - Prioritas tertinggi

### Response Time
⏱️ **Target:** <15 menit

### Emergency Checklist

#### 5.1.1 Immediate Actions (0-5 menit)
- [ ] Konfirmasi outage (buka dashboard dari 2 device berbeda)
- [ ] Check Supabase status page: https://status.supabase.com
- [ ] Notify stakeholders (admin, pemilik sektor) via SMS/call

#### 5.1.2 Diagnosis (5-10 menit)
```bash
# 1. Check Edge Function
curl "https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0/health"

# 2. Check Database
supabase db ping

# 3. Check Internet
ping 8.8.8.8
```

#### 5.1.3 Recovery Actions (10-15 menit)

**Jika Edge Function Down:**
```bash
supabase functions deploy make-server-5aa965b0 --no-verify-jwt
```

**Jika Database Down:**
1. Check Supabase Dashboard → Database → Health
2. Contact Supabase support jika issue di sisi mereka
3. Gunakan DEV_MODE sementara:
   ```javascript
   // /env.config.js
   DEV_MODE: true,  // ← Temporary fallback to mock data
   ```

**Jika Internet Down:**
1. Check router/modem
2. Restart router
3. Contact ISP jika perlu

#### 5.1.4 Post-Recovery (15-30 menit)
- [ ] Verify semua sistem online
- [ ] Check data integrity
- [ ] Send update notification ke stakeholders
- [ ] Document incident di log book

### Escalation Path
**Level 1 (0-15 min):** Admin on-duty  
**Level 2 (15-30 min):** Technical lead  
**Level 3 (30-60 min):** Supabase support / ISP support

### Waktu Estimasi
⏱️ 15-60 menit (tergantung root cause)

---

## 5.2 Critical Water Level (Mass Alert)

### Definisi
>3 sektor mengalami water level critical (<5 cm) bersamaan.

### Severity
🔴 **CRITICAL** - Tanaman terancam mati

### Response Time
⏱️ **Target:** <10 menit

### Emergency Checklist

#### 5.2.1 Immediate Actions (0-5 menit)
- [ ] Login dashboard
- [ ] Identifikasi sektor critical
- [ ] Hubungi pemilik SEMUA sektor critical (via phone/WA)
- [ ] Instruksi: "Cek sumber air SEGERA"

#### 5.2.2 Diagnosis (5-10 menit)
**Possible Root Causes:**
1. Sumber air utama bermasalah (pompa mati, pipa bocor)
2. Cuaca sangat panas (evaporasi tinggi)
3. Sensor error (false alarm)

**Action:**
```bash
# Check di dashboard → Klik sektor → Tab Charts
# Lihat trend water level 24 jam terakhir:
- Jika turun drastis → Real issue (sumber air)
- Jika flat line → Sensor error
```

#### 5.2.3 Recovery Actions (10-30 menit)

**Scenario 1: Sumber Air Bermasalah**
1. Koordinasi perbaikan sumber air
2. Temporary solution: Siram manual sementara
3. Monitor water level sampai normal (>10 cm)

**Scenario 2: Sensor Error**
1. Cek fisik sensor (kabel lepas, sensor rusak)
2. Restart ESP32
3. Ganti sensor jika perlu

#### 5.2.4 Post-Recovery
- [ ] All sectors water level >10 cm
- [ ] Send confirmation ke semua pemilik
- [ ] Document incident
- [ ] Preventive action plan

### Waktu Estimasi
⏱️ 10-60 menit

---

## 5.3 Pompa Tidak Mati (Overwatering Risk)

### Definisi
Pompa menyala terus menerus >30 menit di luar jadwal.

### Severity
🟡 **HIGH** - Risiko tanaman kebanjiran

### Response Time
⏱️ **Target:** <20 menit

### Emergency Checklist

#### 5.3.1 Immediate Actions (0-5 menit)
- [ ] Manual pump OFF via dashboard
- [ ] Verify pump mati (cek serial monitor / field visit)
- [ ] Notify pemilik sektor

#### 5.3.2 Diagnosis (5-15 menit)
**Possible Root Causes:**
1. ESP32 stuck/crash
2. Relay stuck ON
3. Software bug di auto-schedule

**Check:**
```cpp
// Serial Monitor:
// Jika tidak ada output baru → ESP32 crash
// Jika output terus "Pump ON" → Relay stuck
```

#### 5.3.3 Recovery Actions (15-30 menit)

**Scenario 1: ESP32 Crash**
1. Hard reset ESP32 (tekan tombol RESET)
2. Monitor serial output
3. Re-upload firmware jika crash terus

**Scenario 2: Relay Stuck**
1. Disconnect power relay
2. Check relay dengan multimeter
3. Ganti relay jika rusak

**Scenario 3: Software Bug**
1. Check `/src/app/App.tsx` → `shouldPumpBeOn()` logic
2. Check schedule di database
3. Fix bug dan deploy ulang

#### 5.3.4 Post-Recovery
- [ ] Pump status normal
- [ ] Auto-schedule bekerja correct
- [ ] No overwatering (cek water level)
- [ ] Document bug untuk future fix

### Waktu Estimasi
⏱️ 20-60 menit

---

# 6. SOP MONITORING & ALERTING

## 6.1 Sensor Alert Configuration

### Tujuan
Konfigurasi threshold alert untuk kondisi critical.

### Default Thresholds

| Sensor | Normal | Warning | Critical |
|--------|--------|---------|----------|
| Suhu | 25-35°C | 35-40°C / 20-25°C | >40°C / <20°C |
| Kelembapan | 60-80% | 40-60% / 80-90% | <40% / >90% |
| Air | >10 cm | 5-10 cm | <5 cm |
| Cahaya | 300-800 | 100-300 / 800-1000 | <100 / >1000 |

### Cara Mengubah Threshold

#### 6.1.1 Edit di Code
File: `/src/app/App.tsx`

```tsx
// Line 17 - Water level threshold
const CRITICAL_WATER_LEVEL = 5; // ← Ubah nilai ini (dalam cm)

// Untuk threshold lain, edit di /src/app/services/whatsappService.ts
```

File: `/src/app/services/whatsappService.ts`

```tsx
// Temperature threshold
const TEMP_MIN = 20;  // ← Min normal temperature (°C)
const TEMP_MAX = 40;  // ← Max normal temperature (°C)

// Humidity threshold
const HUMIDITY_MIN = 40;  // ← Min normal humidity (%)
const HUMIDITY_MAX = 90;  // ← Max normal humidity (%)

// Light threshold (optional, belum implemented)
const LIGHT_MIN = 100;
const LIGHT_MAX = 1000;
```

#### 6.1.2 Save & Refresh
1. Save file (Ctrl+S)
2. Sistem otomatis rebuild (jika development mode)
3. Refresh browser

### Waktu Estimasi
⏱️ 5 menit

---

## 6.2 Alert Cooldown Management

### Tujuan
Mengelola frekuensi alert untuk cegah spam.

### Default Cooldown
🕐 **6 jam** - Setelah alert pertama, tidak akan kirim alert lagi untuk sensor yang sama selama 6 jam.

### Cara Mengubah Cooldown

File: `/src/app/services/whatsappService.ts`

```tsx
// Line ~50-60
const ALERT_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 jam

// Ubah menjadi (contoh):
const ALERT_COOLDOWN_MS = 3 * 60 * 60 * 1000; // 3 jam
// atau
const ALERT_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 jam
```

### Reset Cooldown Manual

Jika ingin kirim alert lagi sebelum cooldown habis:

```javascript
// Browser Console (F12):
localStorage.removeItem('alert_history');
// Refresh page
```

### Waktu Estimasi
⏱️ 2 menit

---

## 6.3 Alert Recipients Management

### Tujuan
Mengelola siapa yang menerima alert (admin, warga, both).

### Configuration

File: `/env.config.js`

```javascript
// Kontrol global alert
ENABLE_WHATSAPP: true,  // false = semua alert mati

// Kontrol per role (via localStorage, set via UI future)
// Saat ini hardcoded di App.tsx:
const adminSettings = {
  enableAdminAlert: true,   // Admin terima alert?
  enableWargaAlert: true,   // Warga terima alert?
};
```

### Enable/Disable Alert

**Matikan semua alert:**
```javascript
// /env.config.js
ENABLE_WHATSAPP: false,
```

**Matikan alert admin saja:**
```javascript
// Browser Console:
const settings = JSON.parse(localStorage.getItem('admin_settings'));
settings.enableAdminAlert = false;
localStorage.setItem('admin_settings', JSON.stringify(settings));
// Refresh page
```

**Matikan alert warga saja:**
```javascript
// Browser Console:
const settings = JSON.parse(localStorage.getItem('admin_settings'));
settings.enableWargaAlert = false;
localStorage.setItem('admin_settings', JSON.stringify(settings));
// Refresh page
```

### Waktu Estimasi
⏱️ 1 menit

---

# 7. SOP SECURITY & BACKUP

## 7.1 Regular Security Audit

### Frekuensi
🕐 1x per bulan (tanggal 1)

### Checklist

#### 7.1.1 Access Control
- [ ] Admin password strong (min 8 char, kombinasi)
- [ ] No default credentials (admin/admin123)
- [ ] Session timeout configured (30 menit)

#### 7.1.2 API Security
- [ ] Service role key tidak leak ke frontend
- [ ] Anon key digunakan dengan proper (read-only operations)
- [ ] CORS configured correct

#### 7.1.3 Database Security
- [ ] Row Level Security (RLS) enabled (optional, untuk future)
- [ ] Database password strong
- [ ] No public table access

### Actions

**Update Admin Password (Bulanan):**
1. Edit `/env.config.js`:
   ```javascript
   ADMIN_PASSWORD: "NewSecurePass123!",
   ```
2. Save & commit (jika version control)
3. Notify admin lain (jika multi-admin)

**Check API Key Security:**
```bash
# Pastikan service role key TIDAK ada di:
grep -r "SUPABASE_SERVICE_ROLE_KEY" /src/app
# Output harus kosong
```

### Waktu Estimasi
⏱️ 15-20 menit

---

## 7.2 Database Backup

### Tujuan
Backup data secara rutin untuk disaster recovery.

### Frekuensi
🕐 **Automatic:** Daily (via Supabase auto-backup)  
🕐 **Manual:** Weekly (Minggu pagi)

### Auto Backup (Supabase)

#### 7.2.1 Verify Auto-Backup Enabled
1. Login Supabase Dashboard
2. Project Settings → Database → Backups
3. Pastikan "Daily Backups" = **Enabled**

#### 7.2.2 Check Backup History
1. Database → Backups → View backups
2. Lihat list backup (7 hari terakhir)

### Manual Backup (Export Database)

#### 7.2.3 Export via Supabase Dashboard
1. Settings → Database → Backup
2. Click "Export Database"
3. Download file `.sql.gz`
4. Save di secure location (external drive, cloud storage)

**Naming convention:**
```
tamtama_backup_2026-02-07.sql.gz
```

#### 7.2.4 Export via CLI (Alternative)
```bash
# Dump all tables
pg_dump "postgresql://postgres:[password]@db.wgjudfgqjqorkhdlvlgc.supabase.co:5432/postgres" \
  -t owners -t plants -t sectors -t sensor_data -t pump_history \
  > tamtama_backup_2026-02-07.sql
```

### Restore from Backup

#### 7.2.5 Restore via Supabase Dashboard
1. Database → Backups
2. Click backup yang mau di-restore
3. Click "Restore"
4. Confirm (⚠️ Data saat ini akan di-replace!)

#### 7.2.6 Restore via CLI
```bash
psql "postgresql://postgres:[password]@db.wgjudfgqjqorkhdlvlgc.supabase.co:5432/postgres" \
  < tamtama_backup_2026-02-07.sql
```

### Checklist
- [ ] Auto-backup enabled di Supabase
- [ ] Weekly manual export done
- [ ] Backup file stored securely
- [ ] Test restore (quarterly)

### Waktu Estimasi
⏱️ 10-15 menit per backup

---

## 7.3 Disaster Recovery Plan

### Scenario 1: Database Corruption

**Severity:** 🔴 CRITICAL

**Recovery Steps:**
1. Stop all write operations (maintenance mode)
2. Restore from latest backup (7.2.6)
3. Verify data integrity
4. Resume operations
5. Post-mortem analysis

**Estimated Downtime:** 1-2 jam

---

### Scenario 2: Supabase Account Compromised

**Severity:** 🔴 CRITICAL

**Recovery Steps:**
1. Change Supabase password immediately
2. Rotate all API keys (anon key, service role key)
3. Update keys di `/utils/supabase/info.tsx` dan ESP32 firmware
4. Re-deploy Edge Function
5. Re-upload firmware ke semua ESP32
6. Monitor for suspicious activity

**Estimated Downtime:** 2-4 jam

---

### Scenario 3: Complete Data Loss

**Severity:** 🔴 CRITICAL

**Recovery Steps:**
1. Create new Supabase project
2. Restore database from backup
3. Update project ID di code
4. Re-deploy Edge Function
5. Update firmware ESP32 (project ID, API keys)
6. Re-upload firmware ke semua ESP32

**Estimated Downtime:** 4-8 jam

---

# 8. SOP PENGELOLAAN DATA

## 8.1 Add New Sector

### Tujuan
Menambahkan sektor baru (>10 sektor).

### Langkah-Langkah

#### 8.1.1 Via Dashboard (Recommended)
1. Login dashboard
2. Klik "Tambah Sektor" (tombol Plus)
3. Isi form:
   - **Nama Sektor:** Sektor 11
   - **Pemilik:** Nama pemilik
   - **No HP:** 081234567890
   - **Lokasi:** Alamat (optional)
   - **Tanaman:** Jenis tanaman
   - **Tanggal Tanam:** (pilih dari calendar)
   - **Perkiraan Panen:** (pilih dari calendar)
4. Click "Simpan"

#### 8.1.2 Verifikasi
- [ ] Sektor muncul di dashboard
- [ ] Data tersimpan di database (check Supabase Table Editor)
- [ ] Siap terima data dari ESP32

#### 8.1.3 Setup ESP32 untuk Sektor Baru
1. Edit firmware ESP32:
   ```cpp
   const char* sectorId = "SEC-011"; // ← ID sektor baru
   ```
2. Upload firmware ke ESP32 baru
3. Verify data masuk ke dashboard

### Waktu Estimasi
⏱️ 10 menit (termasuk setup ESP32)

---

## 8.2 Edit Sector Information

### Tujuan
Update informasi sektor (pemilik, tanaman, jadwal, dll).

### Langkah-Langkah

#### 8.2.1 Via Dashboard
1. Dashboard → Klik sektor yang mau diedit
2. Detail modal → Klik icon Pencil (Edit)
3. Edit form modal terbuka
4. Update field yang perlu diubah
5. Click "Simpan"

#### 8.2.2 Field yang Bisa Diedit
- ✅ Nama Sektor
- ✅ Pemilik (nama, no HP, lokasi)
- ✅ Tanaman (nama, tanggal tanam, perkiraan panen)
- ❌ Sensor Data (read-only, dari ESP32)
- ❌ Pump Status (controlled via pump toggle)

### Waktu Estimasi
⏱️ 2-3 menit

---

## 8.3 Delete Sector

### Tujuan
Menghapus sektor yang sudah tidak digunakan.

### ⚠️ WARNING
**Data yang dihapus:**
- ✅ Informasi sektor (nama, pemilik, tanaman)
- ✅ Sensor data history
- ✅ Pump history
- ❌ ESP32 tidak otomatis stop kirim data (perlu manual stop)

### Langkah-Langkah

#### 8.3.1 Via Dashboard
1. Dashboard → Klik sektor yang mau dihapus
2. Detail modal → Klik icon Trash (Delete)
3. **[REKOMENDASI: TAMBAHKAN KONFIRMASI DIALOG]** (lihat AUDIT_HASIL_UJI.md)
4. Confirm hapus

#### 8.3.2 Stop ESP32
**IMPORTANT:** ESP32 akan terus kirim data ke sektor yang sudah dihapus, menyebabkan error.

**Action:**
1. Matikan ESP32 untuk sektor yang dihapus
2. Atau upload firmware dengan sector ID baru

### Checklist
- [ ] Backup data sektor (jika perlu)
- [ ] Delete via dashboard
- [ ] Stop ESP32 / update firmware
- [ ] Verify sektor hilang dari dashboard

### Waktu Estimasi
⏱️ 5 menit

---

## 8.4 Data Cleanup (Archive Old Data)

### Tujuan
Hapus data lama untuk hemat storage dan improve performance.

### Frekuensi
🕐 1x per bulan (tanggal 1)

### Retention Policy
- **Sensor Data:** 30 hari
- **Pump History:** 30 hari
- **Sector Info:** Permanent (sampai dihapus manual)

### Langkah-Langkah

#### 8.4.1 Backup Before Cleanup
```bash
# Export data yang mau dihapus (untuk archive)
pg_dump "postgresql://postgres:[password]@db.wgjudfgqjqorkhdlvlgc.supabase.co:5432/postgres" \
  -t sensor_data -t pump_history \
  --data-only \
  > archive_2026-02.sql
```

#### 8.4.2 Cleanup via SQL
Login ke Supabase Dashboard → SQL Editor:

```sql
-- Hapus sensor data >30 hari
DELETE FROM sensor_data 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Hapus pump history >30 hari
DELETE FROM pump_history 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Check jumlah yang dihapus
SELECT 
  (SELECT COUNT(*) FROM sensor_data) AS remaining_sensor_data,
  (SELECT COUNT(*) FROM pump_history) AS remaining_pump_history;
```

#### 8.4.3 Verify Performance
1. Check dashboard loading time (seharusnya lebih cepat)
2. Check database size (Settings → Database → Usage)

### Checklist
- [ ] Backup done
- [ ] Cleanup SQL executed
- [ ] Verify data counts
- [ ] Performance improved

### Waktu Estimasi
⏱️ 15-20 menit

---

# 9. SOP ESP32 DEVICE MANAGEMENT

## 9.1 Add New ESP32 Device

### Tujuan
Setup ESP32 baru untuk sektor baru atau replacement.

### Prasyarat
- ✅ Arduino IDE installed
- ✅ ESP32 board support installed
- ✅ Libraries installed (HTTPClient, ArduinoJson, WiFi, DHT)

### Langkah-Langkah

#### 9.1.1 Persiapan Hardware
1. Unbox ESP32 baru
2. Sambungkan sensor (DHT22, HC-SR04, LDR, relay)
3. Follow wiring diagram: `/WIRING_VISUAL_DIAGRAM.md`
4. Double-check semua koneksi (VCC, GND, data pin)

#### 9.1.2 Konfigurasi Firmware
1. Buka `/ESP32_SUPABASE_CODE.ino` di Arduino IDE
2. Edit konfigurasi:
   ```cpp
   // WiFi
   const char* ssid = "WiFi_Name";
   const char* password = "WiFi_Pass";
   
   // Supabase
   const char* supabaseUrl = "https://wgjudfgqjqorkhdlvlgc.supabase.co";
   const char* supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
   
   // Sector
   const char* sectorId = "SEC-011"; // ← ID unik untuk device ini
   ```

#### 9.1.3 Upload Firmware
1. Tools → Board → ESP32 Dev Module
2. Tools → Port → (pilih port ESP32)
3. Sketch → Upload (Ctrl+U)
4. Tunggu "Hard resetting via RTS pin..."

#### 9.1.4 Testing
1. Open Serial Monitor (Ctrl+Shift+M)
2. Set baud rate: 115200
3. Press RESET button on ESP32
4. Verify output:
   ```
   ✅ WiFi Connected! IP: 192.168.1.105
   ✅ Data sent successfully! (200 OK)
   ```

#### 9.1.5 Integration Test
1. Login dashboard
2. Cari sektor dengan ID yang baru (SEC-011)
3. Verify sensor data update setiap 20 detik

### Checklist
- [ ] Wiring correct (check diagram)
- [ ] Firmware configured (WiFi, Supabase, sector ID)
- [ ] Upload successful
- [ ] Serial monitor shows OK
- [ ] Dashboard shows data

### Waktu Estimasi
⏱️ 20-30 menit per device

---

## 9.2 Update ESP32 Firmware (OTA)

### Tujuan
Update firmware ESP32 tanpa perlu sambungkan ke komputer.

### ⚠️ Status
**NOT IMPLEMENTED YET** - Saat ini firmware update harus manual (via USB).

### Future Implementation
```cpp
// Add to firmware:
#include <ArduinoOTA.h>

void setupOTA() {
  ArduinoOTA.onStart([]() {
    Serial.println("OTA Update starting...");
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("OTA Update complete!");
  });
  ArduinoOTA.begin();
}

void loop() {
  ArduinoOTA.handle();
  // ... rest of code
}
```

### Workaround: Manual Update
1. Sambungkan ESP32 ke komputer via USB
2. Upload firmware baru (section 9.1.3)
3. Disconnect USB

### Waktu Estimasi
⏱️ 10 menit per device (manual)  
⏱️ 2 menit per device (OTA, future)

---

## 9.3 Replace Faulty ESP32

### Tujuan
Ganti ESP32 yang rusak dengan device baru.

### Diagnosis ESP32 Rusak

#### Symptoms:
- ❌ Serial monitor tidak ada output
- ❌ LED power tidak menyala
- ❌ Tidak bisa upload firmware (connection error)
- ❌ Data tidak masuk dashboard >5 menit

#### Quick Test:
1. Upload firmware blink (Arduino IDE → Examples → Basics → Blink)
2. Jika LED tidak blink → ESP32 rusak

### Langkah-Langkah

#### 9.3.1 Document Old Device
```
Device: ESP32 #5 (SEC-005)
Date Installed: 01/01/2026
Date Failed: 07/02/2026
Uptime: 37 hari
Issue: Power LED mati, tidak ada output serial
Root Cause: Suspected power surge
```

#### 9.3.2 Prepare Replacement
1. Ambil ESP32 baru (stock)
2. Lepaskan sensor dari ESP32 lama
3. Pasang sensor ke ESP32 baru (same wiring)

#### 9.3.3 Flash Firmware
1. Copy konfigurasi dari ESP32 lama:
   ```cpp
   const char* sectorId = "SEC-005"; // ← SAME sector ID!
   ```
2. Upload firmware (section 9.1.3)

#### 9.3.4 Test & Deploy
1. Test di bench (indoor test)
2. Verify data masuk dashboard
3. Install di field
4. Monitor 24 jam

#### 9.3.5 Decommission Old Device
- [ ] Label "FAULTY - [Date]"
- [ ] Store for future debugging/repair
- [ ] Update inventory log

### Checklist
- [ ] Old device documented
- [ ] New device configured (SAME sector ID)
- [ ] Firmware uploaded
- [ ] Sensor wiring correct
- [ ] Data verified in dashboard
- [ ] Field installation done
- [ ] Old device decommissioned

### Waktu Estimasi
⏱️ 30-45 menit

---

## 9.4 ESP32 Firmware Rollback

### Tujuan
Kembali ke firmware versi lama jika update bermasalah.

### Prasyarat
- ✅ Backup firmware lama (save as `ESP32_SUPABASE_CODE_v1.ino`)
- ✅ Version control (git) for firmware code

### Langkah-Langkah

#### 9.4.1 Identify Issue
**Symptoms firmware bermasalah:**
- Crash loop (reboot terus)
- Data tidak terkirim
- Sensor reading error
- Pump control tidak bekerja

#### 9.4.2 Rollback
1. Open firmware versi lama di Arduino IDE
2. Verify konfigurasi (WiFi, Supabase, sector ID)
3. Upload ke ESP32

#### 9.4.3 Verify
1. Serial monitor
2. Check data in dashboard
3. Test pump control

### Waktu Estimasi
⏱️ 10-15 menit

---

# 10. SOP USER MANAGEMENT

## 10.1 Change Admin Password

### Frekuensi
🕐 1x per 30 hari (security best practice)

### Langkah-Langkah

#### 10.1.1 Generate Strong Password
```
Requirements:
- Min 8 characters
- Uppercase + lowercase
- Numbers
- Special characters (@#$%^&*)

Example: AdminDesa@2026!
```

#### 10.1.2 Update Configuration
1. Open `/env.config.js`
2. Edit:
   ```javascript
   ADMIN_PASSWORD: "AdminDesa@2026!",
   ```
3. Save file (Ctrl+S)

#### 10.1.3 Clear Browser Cache
```javascript
// Browser Console (F12):
localStorage.clear();
sessionStorage.clear();
```

#### 10.1.4 Test Login
1. Refresh browser (Ctrl+Shift+R)
2. Login dengan password baru
3. Verify akses dashboard

#### 10.1.5 Document (Secure)
- **DO:** Save password di password manager (LastPass, 1Password)
- **DON'T:** Save di notepad/text file
- **DON'T:** Share via email/WhatsApp

### Checklist
- [ ] Strong password generated
- [ ] `/env.config.js` updated
- [ ] Browser cache cleared
- [ ] Login test successful
- [ ] Password documented securely

### Waktu Estimasi
⏱️ 5 menit

---

## 10.2 Add Secondary Admin (Future Feature)

### Status
🔴 **NOT IMPLEMENTED YET**

### Design
```typescript
// Future schema:
interface User {
  id: string;
  username: string;
  password_hash: string;
  role: 'admin' | 'viewer' | 'operator';
  created_at: string;
}

// Roles:
// - admin: Full access (CRUD sectors, pump control)
// - viewer: Read-only (view dashboard)
// - operator: Limited (pump control only, no delete)
```

### Implementation Plan
1. Create `users` table in Supabase
2. Implement Supabase Auth (instead of localStorage)
3. Add user management UI
4. Role-based access control (RBAC)

### ETA
⏱️ 8-12 jam development

---

## 10.3 Session Management

### Tujuan
Kelola session admin untuk security.

### Current Implementation
- **Storage:** localStorage
- **Timeout:** No auto-logout (manual logout required)
- **Multi-device:** Supported (independent sessions)

### Recommendations

#### 10.3.1 Enable Auto-Logout (Future)
```javascript
// /src/app/services/authService.ts
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 menit

// Auto-logout after inactivity
let lastActivity = Date.now();
setInterval(() => {
  if (Date.now() - lastActivity > SESSION_TIMEOUT) {
    logout();
  }
}, 60000); // Check every 1 minute
```

#### 10.3.2 Force Logout All Sessions
```javascript
// Browser Console (dari device manapun):
// Generate random string untuk invalidate semua session
localStorage.setItem('session_version', Math.random().toString());
// Semua session lama akan invalid
```

### Waktu Estimasi
⏱️ 3-5 jam (untuk implementasi auto-logout)

---

# 📞 CONTACT & SUPPORT

## Internal Support
- **Admin Primary:** [Nama] - [No HP]
- **Technical Lead:** [Nama] - [No HP]

## External Support
- **Supabase Support:** https://supabase.com/support
- **Fonnte Support:** https://api.fonnte.com/help

## Documentation
- **Main Docs:** `/README.md`
- **Deployment:** `/DEPLOYMENT_README.md`
- **ESP32 Setup:** `/ESP32_SETUP_GUIDE_PRODUCTION.md`
- **Troubleshooting:** `/ESP32_TROUBLESHOOTING_GUIDE.md`

---

# 📝 REVISION HISTORY

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 07/02/2026 | Initial SOP release | AI Assistant |

---

**END OF DOCUMENT**

---

**Note:** SOP ini harus di-review dan diupdate setiap 3 bulan atau setelah major changes ke sistem.
