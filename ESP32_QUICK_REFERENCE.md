# ⚡ ESP32 QUICK REFERENCE - CHEAT SHEET

> **Reference cepat untuk setup, troubleshooting, dan maintenance ESP32 monitoring pertanian.**

---

## 🔑 **QUICK CONFIG (Copy-Paste Ready)**

### **WiFi & Firebase Config:**

```cpp
// ====== WIFI ======
#define WIFI_SSID "NamaWiFiAnda"
#define WIFI_PASSWORD "PasswordWiFi123"

// ====== FIREBASE ======
#define FIREBASE_PROJECT_ID "monitoring-pertanian-abc123"
#define FIREBASE_API_KEY "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

// ====== SECTOR ======
#define SECTOR_ID "SEC-001"  // Ganti: SEC-002, SEC-003, ... SEC-010
```

**Cara mendapat credentials:**
1. Buka `env.config.js` di dashboard
2. Copy `FIREBASE_PROJECT_ID` dan `FIREBASE_API_KEY`
3. Paste ke code ESP32

---

## 📌 **PIN REFERENCE (Quick Lookup)**

| Pin | Komponen | Fungsi |
|-----|----------|--------|
| **Vin** | Buck 5V | Power |
| **GND** | Common | Ground |
| **3V3** | Sensors | Power 3.3V |
| **GPIO 4** | DHT22 | Data |
| **GPIO 18** | JSN-SR04T | Trig |
| **GPIO 19** | JSN-SR04T | Echo |
| **GPIO 26** | SSR | Control |
| **GPIO 34** | LDR | Analog |

---

## 🛠️ **TROUBLESHOOTING FLOWCHART**

```
Masalah?
  │
  ├─ WiFi tidak connect?
  │    ├─ SSID/password salah? → Fix config
  │    ├─ WiFi 5GHz? → Gunakan 2.4GHz
  │    └─ Signal lemah? → Pindah dekat router
  │
  ├─ Firebase error HTTP 400/401?
  │    ├─ API Key salah? → Copy ulang dari env.config.js
  │    ├─ Project ID salah? → Cek Firebase Console
  │    └─ Firestore tidak dibuat? → Buat database di Firebase
  │
  ├─ Sensor DHT22 NaN?
  │    ├─ Wiring salah? → Cek VCC, DATA, GND
  │    ├─ Sensor rusak? → Test dengan example sketch
  │    └─ Power <3.3V? → Ukur dengan multimeter
  │
  ├─ JSN-SR04T return 0?
  │    ├─ Wiring salah? → Cek Trig & Echo
  │    ├─ Terlalu dekat (<2cm)? → Jauhkan sensor
  │    ├─ Terlalu jauh (>450cm)? → Sensor out of range
  │    └─ Power <3V? → Cek voltage
  │
  ├─ LDR always 0 atau max?
  │    ├─ Wiring AO salah? → Cek GPIO 34
  │    ├─ Module rusak? → Test manual ADC read
  │    └─ Calibration salah? → Adjust LDR_MAX/MIN
  │
  └─ Pompa tidak nyala?
       ├─ SSR LED tidak menyala? → Cek GPIO 26 wiring
       ├─ SSR LED nyala tapi pompa mati? → Cek load side wiring
       ├─ Pompa rusak? → Test langsung ke 12V
       └─ Power <12V? → Cek PSU output
```

---

## 🔧 **COMMON FIXES (Quick Actions)**

### **Problem: WiFi Connection Timeout**

```cpp
// Solution 1: Increase timeout
int attempts = 0;
while (WiFi.status() != WL_CONNECTED && attempts < 30) {  // ← Ganti 30 → 60
  delay(500);
  Serial.print(".");
  attempts++;
}

// Solution 2: Add retry logic
if (WiFi.status() != WL_CONNECTED) {
  WiFi.disconnect();
  delay(1000);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);  // Retry
}
```

---

### **Problem: DHT22 Read Error**

```cpp
// Tambah delay sebelum read
dht.begin();
delay(2000);  // ← PENTING! DHT22 butuh waktu init

// Add retry logic
float t = dht.readTemperature();
if (isnan(t)) {
  delay(500);
  t = dht.readTemperature();  // Retry once
}
```

---

### **Problem: Firebase "document not found"**

```cpp
// Check response code
if (httpResponseCode == 404) {
  Serial.println("Document not found - creating default...");
  createDefaultPumpCommand();  // Auto-create
}
```

---

### **Problem: Voltage Drop di Sensor**

```
Symptom: Sensor intermittent / error kadang-kadang

Fix:
  1. Ukur voltage di sensor VCC (harus 3.3V ± 0.1V)
  2. Jika <3.2V, gunakan kabel lebih pendek atau tebal
  3. Tambah bulk capacitor 100µF di sensor VCC-GND
```

---

## 📊 **SERIAL MONITOR EXPECTED OUTPUT**

### **Startup (First 10 seconds):**

```
====================================================================
🌾 ESP32 - SISTEM MONITORING PERTANIAN
====================================================================
Version: 2.0 (Production)
Sector ID: SEC-001
====================================================================

⚙️  Initializing GPIO pins...
  ✅ SSR Pin (GPIO 26) - OFF
  ✅ JSN-SR04T Pins (GPIO 18, 19) - Ready
  ✅ LDR Pin (GPIO 34) - Ready

🌡️  Initializing DHT22 sensor...
  ✅ DHT22 - Ready

📊 Testing sensors...
  ✅ DHT22: 28.5°C, 65.2%
  ✅ JSN-SR04T: 8.3 cm
  ✅ LDR: 12000 lux (ADC: 1234)
  ✅ SSR: OFF (default)

📡 Connecting to WiFi...
  Connecting............ ✅
  
  📶 WiFi Connected!
  📍 IP Address: 192.168.1.100
  📡 Signal Strength: -45 dBm

⏰ NTP Time configured (GMT+7)

====================================================================
✅ SETUP COMPLETE - Starting main loop...
====================================================================
```

---

### **Normal Operation (Every 20 seconds):**

```
╔════════════════════════════════════════════════════════════════╗
║           📊 READING & SENDING SENSOR DATA                    ║
╚════════════════════════════════════════════════════════════════╝
┌────────────────────────────────────────────────────────────────┐
│                    SENSOR READINGS                             │
├────────────────────────────────────────────────────────────────┤
│ 🌡️  Temperature:   28.5 °C  ✅ Normal          │
│ 💧 Humidity:       65.2 %   ✅ Normal          │
│ 💦 Water Level:    8.3 cm  ✅ Normal          │
│ ☀️  Light Level:    12000 lux  ✅ Normal       │
│ ⚙️  Pump Status:    OFF                                        │
└────────────────────────────────────────────────────────────────┘

📤 Sending to Firebase Firestore...
  URL: https://firestore.googleapis.com/v1/projects/...
  ✅ Sector data updated (HTTP 200)
  ✅ Sensor history added (HTTP 200)
✅ Data transmission complete!
```

---

### **Pump Command (Every 5 seconds polling):**

```
🎮 New pump command received: ON
  ✅ Pompa DINYALAKAN (SSR ON)
  ✅ Command acknowledged (executed = true)
```

---

## 🚨 **ERROR MESSAGES & FIXES**

| Error Message | Meaning | Fix |
|---------------|---------|-----|
| `❌ WiFi Connection Failed!` | WiFi tidak connect setelah 30 detik | Cek SSID/password, signal strength |
| `❌ Failed to read from DHT sensor!` | DHT22 tidak respond | Cek wiring, tambah delay 2s |
| `⚠️ JSN-SR04T: No echo received` | Sensor out of range atau rusak | Cek jarak, obstacle, wiring |
| `❌ HTTP Error: 400` | Firebase request invalid | Cek API key, project ID |
| `❌ HTTP Error: 401` | Firebase authentication fail | Cek API key benar |
| `❌ HTTP Error: 404` | Document not found | Normal (first run), auto-create |
| `❌ Cannot send data: WiFi not connected` | WiFi putus | Auto-reconnect dalam 30s |

---

## 📈 **MONITORING CHECKLIST (Daily)**

### **Morning Check (5 minutes):**

- [ ] Cek Serial Monitor (no error merah)
- [ ] Cek dashboard web (data update real-time)
- [ ] Cek WiFi signal strength (min -70 dBm)
- [ ] Verify sensor readings reasonable:
  - Suhu: 25-35°C (outdoor normal)
  - Humidity: 50-90%
  - Water: 0-20 cm (sesuai tank)
  - Light: 0-50000 lux

### **Weekly Check (15 minutes):**

- [ ] Clean sensor (debu/kotoran)
- [ ] Cek enclosure waterproofing (no water inside)
- [ ] Test manual pump control
- [ ] Verify Firebase history data (ada record baru)
- [ ] Check power supply temperature (tidak overheat)

### **Monthly Check (1 hour):**

- [ ] Calibration sensor (terutama water level)
- [ ] Tighten loose wiring
- [ ] Backup Firebase data
- [ ] Test failover (disconnect WiFi → auto-reconnect?)
- [ ] Update firmware (jika ada bug fix)

---

## 🔋 **POWER CONSUMPTION REFERENCE**

| Mode | Current (5V) | Current (12V) | Power Total |
|------|--------------|---------------|-------------|
| **Idle** (WiFi connected) | 250mA | 0mA | 1.25W |
| **Sending data** (WiFi TX) | 500mA | 0mA | 2.5W |
| **Pump ON** | 500mA | 1.5A | 20.5W |
| **Peak** (all active) | 500mA | 1.5A | 20.5W |

**Daily energy consumption (estimate):**
```
Idle 23 jam: 1.25W × 23h = 28.75 Wh
Pump 1 jam: 20.5W × 1h = 20.5 Wh
Total: ~50 Wh/hari = 1.5 kWh/bulan

Biaya listrik (Rp 1.500/kWh): Rp 2.250/bulan per sektor
10 sektor: Rp 22.500/bulan
```

---

## 🎯 **CALIBRATION QUICK GUIDE**

### **Water Level Sensor:**

```cpp
// Step 1: Kosongkan tangki → ukur output
Serial.println(waterLevel);  // Harus ~0 cm

// Step 2: Isi penuh → ukur output
Serial.println(waterLevel);  // Harus ~20 cm (atau tinggi tangki)

// Step 3: Adjust konstanta
#define TANK_HEIGHT_CM 20.0  // ← Tinggi actual tangki
#define SENSOR_OFFSET_CM 2.0  // ← Adjust jika reading tidak tepat
```

---

### **Light Sensor:**

```cpp
// Step 1: Gelap total → Serial Monitor
int adc = analogRead(LDR_PIN);
Serial.println(adc);  // Catat nilai (contoh: 50)

// Step 2: Terang matahari → Serial Monitor
Serial.println(adc);  // Catat nilai (contoh: 3800)

// Step 3: Update konstanta
#define LDR_MIN_ADC 50    // ← Dari step 1
#define LDR_MAX_ADC 3800  // ← Dari step 2
```

---

## 📦 **BACKUP & RESTORE**

### **Backup Configuration:**

```bash
# Save current config
1. Copy ESP32_PRODUCTION_CODE.ino
2. Rename to ESP32_BACKUP_SECTOR-001_2026-02-03.ino
3. Store di Google Drive / USB

# Backup Firebase data
1. Firebase Console → Firestore → Export
2. Download JSON file
3. Save dengan timestamp
```

---

### **Restore After Failure:**

```bash
# ESP32 rusak / hilang
1. Beli ESP32 baru
2. Upload backup code
3. Test sensor readings
4. Deploy

# Firebase data corrupt
1. Firebase Console → Import
2. Select backup JSON
3. Verify data integrity
```

---

## 🎓 **ADVANCED TIPS**

### **Optimize WiFi Stability:**

```cpp
// Add dalam setup()
WiFi.setAutoReconnect(true);
WiFi.persistent(true);  // Save WiFi config to flash

// Set static IP (optional, faster connect)
IPAddress local_IP(192, 168, 1, 100);
IPAddress gateway(192, 168, 1, 1);
IPAddress subnet(255, 255, 255, 0);
WiFi.config(local_IP, gateway, subnet);
```

---

### **Reduce Firebase Writes (Save cost):**

```cpp
// Kirim data hanya jika ada perubahan signifikan
float tempChange = abs(temperature - lastTemperature);
if (tempChange > 0.5) {  // Threshold 0.5°C
  sendSensorDataToFirebase();
  lastTemperature = temperature;
}
```

---

### **Add Watchdog Timer (Auto-recovery):**

```cpp
// Restart ESP32 jika hang
#include <esp_task_wdt.h>

void setup() {
  esp_task_wdt_init(30, true);  // 30 seconds timeout
  esp_task_wdt_add(NULL);
}

void loop() {
  esp_task_wdt_reset();  // Reset watchdog (feed dog)
  // ... your code ...
}
```

---

## 📞 **SUPPORT CONTACTS**

| Issue | Contact | Response Time |
|-------|---------|---------------|
| Hardware problem | Teknisi lokal | 24 jam |
| Software bug | Developer | 2-4 jam |
| Firebase issue | Admin | 1 jam |
| Urgent (system down) | Hotline | Immediate |

---

## ✅ **FINAL CHECKLIST BEFORE DEPLOYMENT**

- [ ] WiFi connected (signal > -70 dBm)
- [ ] All sensors reading OK
- [ ] Firebase sync confirmed
- [ ] Pump test OK (ON/OFF working)
- [ ] Enclosure waterproof sealed
- [ ] Power supply stable (no voltage drop)
- [ ] Cable management rapi
- [ ] Label sector ID jelas
- [ ] Backup code tersimpan
- [ ] Contact list ready (jika butuh support)

---

## 🎉 **QUICK START (30 Seconds)**

```bash
1. Power ON ESP32
2. Tunggu WiFi connect (LED blink)
3. Buka Serial Monitor (115200 baud)
4. Verify "✅ SETUP COMPLETE"
5. Buka dashboard web
6. Verify data muncul real-time
7. Test pompa ON/OFF
8. ✅ DONE!
```

---

**Print dan tempelkan cheat sheet ini di dekat ESP32 untuk quick reference!** 📋

**Butuh bantuan? Cek dokumentasi lengkap:**
- 📖 `ESP32_PRODUCTION_CODE.ino` - Source code
- 🔌 `ESP32_SETUP_GUIDE_PRODUCTION.md` - Setup lengkap
- 📐 `WIRING_VISUAL_DIAGRAM.md` - Wiring detail
- 🎯 `KONSEP_KERJA_SISTEM_LENGKAP.md` - Arsitektur sistem

**Happy monitoring!** 🌾✨
