# 🚀 ESP32 QUICK SETUP GUIDE

## 📋 CHECKLIST SEBELUM UPLOAD CODE

### ✅ Hardware yang Dibutuhkan:
- [ ] ESP32 Dev Board (30 pin)
- [ ] DHT22 (Temperature & Humidity sensor)
- [ ] LDR + 10kΩ resistor (Light sensor)
- [ ] HC-SR04 (Ultrasonic sensor untuk water level)
- [ ] Relay 5V module (1 channel)
- [ ] Pompa air DC 12V
- [ ] Power supply 5V 2A (untuk ESP32)
- [ ] Power supply 12V 2A (untuk pompa)
- [ ] Breadboard + jumper wires
- [ ] Kabel USB micro (untuk upload code)

### ✅ Software yang Dibutuhkan:
- [ ] Arduino IDE (v1.8.19 atau v2.x)
- [ ] ESP32 Board Library (via Board Manager)
- [ ] DHT sensor library by Adafruit
- [ ] ArduinoJson library by Benoit Blanchon

---

## 🔌 WIRING DIAGRAM

### 1. DHT22 (Suhu & Kelembapan)
```
DHT22          ESP32
━━━━━━━━━━━━━━━━━━━━━
VCC    ───────  3.3V
GND    ───────  GND
DATA   ───────  GPIO4
```

### 2. LDR (Sensor Cahaya)
```
LDR Circuit:
3.3V ──┬── LDR ──┬── GPIO34 (ADC)
       │         │
       │     10kΩ Resistor
       │         │
       └─────────┴── GND
```

### 3. HC-SR04 (Sensor Level Air)
```
HC-SR04        ESP32
━━━━━━━━━━━━━━━━━━━━━
VCC    ───────  5V
GND    ───────  GND
TRIG   ───────  GPIO5
ECHO   ───────  GPIO18
```

### 4. Relay Module (Kontrol Pompa)
```
Relay Module   ESP32
━━━━━━━━━━━━━━━━━━━━━
VCC    ───────  5V
GND    ───────  GND
IN     ───────  GPIO19

Relay ke Pompa:
━━━━━━━━━━━━━━━━━━━━━
COM    ───────  Power 12V (+)
NO     ───────  Pump (+)
NC     ───────  (not used)

Pump (-)  ──── Power 12V (-)
```

### 5. LED Status (Optional - Built-in)
```
ESP32 Built-in LED: GPIO2
(Akan blink otomatis untuk status)
```

---

## ⚙️ KONFIGURASI CODE

### 1. Edit File: `TAMTAMA_ESP32_PRODUCTION.ino`

### 2. Ganti WiFi Credentials:
```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";        // Nama WiFi
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // Password WiFi
```

### 3. Ganti Supabase Anon Key:
```cpp
const char* SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

**Cara dapat Anon Key:**
1. Buka: https://supabase.com/dashboard/project/wgjudfgqjqorkhdlvlgc/settings/api
2. Copy "anon public" key
3. Paste ke code

### 4. Set Sector ID (UNIK untuk setiap ESP32!):
```cpp
const char* SECTOR_ID = "SEC-001";  // SEC-001 sampai SEC-010
```

**PENTING:** Setiap ESP32 HARUS punya ID berbeda!
- ESP32 #1 → `SEC-001`
- ESP32 #2 → `SEC-002`
- ESP32 #3 → `SEC-003`
- ... dst sampai SEC-010

---

## 📤 UPLOAD CODE KE ESP32

### 1. Buka Arduino IDE

### 2. Install ESP32 Board Support:
- **Tools** → **Board** → **Boards Manager**
- Search: `esp32`
- Install: `ESP32 by Espressif Systems`

### 3. Install Libraries:
- **Sketch** → **Include Library** → **Manage Libraries**
- Install:
  - `DHT sensor library` by Adafruit
  - `Adafruit Unified Sensor` (dependency)
  - `ArduinoJson` by Benoit Blanchon

### 4. Pilih Board:
- **Tools** → **Board** → **ESP32 Arduino** → **ESP32 Dev Module**

### 5. Pilih Port:
- **Tools** → **Port** → Pilih port COM ESP32 (contoh: COM3)

### 6. Set Upload Speed:
- **Tools** → **Upload Speed** → **115200**

### 7. Upload Code:
- Klik tombol **Upload** (ikon panah kanan)
- Tunggu sampai "Hard resetting via RTS pin..."
- Status: **Done uploading**

---

## 🖥️ MONITOR SERIAL OUTPUT

### 1. Buka Serial Monitor:
- **Tools** → **Serial Monitor**
- Set baud rate: **115200**

### 2. Expected Output:
```
========================================
  TAMTAMA - ESP32 PRODUCTION MODE
========================================
Sector ID: SEC-001
Supabase Project: wgjudfgqjqorkhdlvlgc
========================================

✅ Relay pin initialized (GPIO19)
✅ Ultrasonic pins initialized (TRIG: GPIO5, ECHO: GPIO18)
✅ LDR pin initialized (GPIO34)
✅ LED pin initialized (GPIO2)
✅ DHT22 sensor initialized

📡 Connecting to WiFi: YourWiFiName
...........
✅ WiFi connected!
IP Address: 192.168.1.100
Signal Strength (RSSI): -45 dBm

📊 Reading all sensors...
  🌡️  Temperature: 28.5°C
  💧 Humidity: 65.2%
  ☀️  Light Level: 75% (Raw: 3072)
  🌊 Water Level: 12.3 cm
  ⚡ Pump Status: OFF

📤 Uploading sensor data to Supabase...
📦 Payload: {"sectorId":"SEC-001","temperature":28.5,...}
✅ Upload success! HTTP Code: 200
```

---

## ✅ VERIFIKASI SISTEM BERFUNGSI

### 1. Cek Serial Monitor:
- ✅ WiFi connected dengan IP address
- ✅ Sensor terbaca (temperature, humidity, light, water level)
- ✅ Upload success dengan HTTP 200
- ✅ No error messages

### 2. Cek Dashboard Web:
- ✅ Buka dashboard Tamtama
- ✅ Cari sector ID yang di-upload (contoh: SEC-001)
- ✅ Data sensor muncul dan update setiap 20 detik
- ✅ Timestamp terakhir update < 30 detik

### 3. Test Pump Control:
- ✅ Klik tombol "Pompa ON" di dashboard
- ✅ Cek Serial Monitor: "⚡ Pump turned ON"
- ✅ Cek relay: LED relay menyala
- ✅ Cek pompa: Pompa menyala (kalau sudah terhubung)
- ✅ Klik "Pompa OFF" → Pompa mati

---

## ❌ TROUBLESHOOTING

### Problem: WiFi tidak connect
**Symptoms:**
```
📡 Connecting to WiFi: YourWiFi
....................
❌ WiFi connection failed!
```

**Solutions:**
1. ✅ Cek SSID & password di code (case-sensitive!)
2. ✅ Pastikan WiFi 2.4GHz (ESP32 tidak support 5GHz)
3. ✅ Cek jarak ESP32 ke router (max 10-15 meter)
4. ✅ Restart router WiFi
5. ✅ Test dengan hotspot HP dulu

---

### Problem: Upload sensor data gagal
**Symptoms:**
```
❌ Upload failed! HTTP Code: -1
Error: connection refused
```

**Solutions:**
1. ✅ Cek Edge Function sudah di-deploy:
   ```bash
   supabase functions deploy make-server-5aa965b0
   ```
2. ✅ Cek SUPABASE_ANON_KEY benar (copy dari dashboard)
3. ✅ Cek firewall tidak block ESP32
4. ✅ Test endpoint manual:
   ```bash
   curl -X GET https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0/api/health
   ```

---

### Problem: Sensor tidak terbaca
**Symptoms:**
```
⚠️  DHT22 read error! Using last valid values.
⚠️  Ultrasonic timeout! No echo received.
```

**Solutions:**

**DHT22:**
1. ✅ Cek wiring: VCC → 3.3V, GND → GND, DATA → GPIO4
2. ✅ Pastikan DHT22 dapat power (lampu sensor menyala)
3. ✅ Ganti sensor DHT22 (mungkin rusak)

**Ultrasonic:**
1. ✅ Cek wiring: TRIG → GPIO5, ECHO → GPIO18
2. ✅ Pastikan sensor menghadap objek (jarak 2-400cm)
3. ✅ Cek power 5V cukup (min 5V 1A)

**LDR:**
1. ✅ Cek wiring: LDR + resistor 10kΩ ke GPIO34
2. ✅ Test dengan `Serial.println(analogRead(34));`
3. ✅ Cek resistor value (harus 10kΩ)

---

### Problem: Pompa tidak merespon
**Symptoms:**
```
🔔 New pump command received: ON
⚡ Pump turned ON
(tapi pompa fisik tidak menyala)
```

**Solutions:**
1. ✅ Cek relay wiring: IN → GPIO19, VCC → 5V, GND → GND
2. ✅ Test manual relay:
   ```cpp
   digitalWrite(19, HIGH); delay(3000); digitalWrite(19, LOW);
   ```
3. ✅ Cek relay type (active LOW atau HIGH):
   - Active LOW: `digitalWrite(19, LOW)` = ON
   - Active HIGH: `digitalWrite(19, HIGH)` = ON
4. ✅ Cek relay LED menyala saat command
5. ✅ Cek power pompa terpisah (12V 2A)
6. ✅ Cek wiring relay ke pompa

---

### Problem: ESP32 restart terus
**Symptoms:**
```
Guru Meditation Error: Core 1 panic'ed (...)
```

**Solutions:**
1. ✅ Cek power supply cukup (min 5V 2A)
2. ✅ Lepas semua sensor, test ESP32 saja
3. ✅ Upload code basic dulu (Blink LED)
4. ✅ Tambahkan `delay(100)` di akhir loop()
5. ✅ Ganti ESP32 board (mungkin rusak)

---

## 📊 MONITORING TIPS

### 1. Real-time Log:
```cpp
// Aktifkan verbose logging (tambahkan di setup())
Serial.setDebugOutput(true);
```

### 2. Print System Info:
```cpp
// Panggil via Serial Monitor command
printSystemInfo();
```

### 3. Check Memory Usage:
```cpp
Serial.println("Free Heap: " + String(ESP.getFreeHeap()) + " bytes");
```

### 4. WiFi Signal Strength:
```cpp
Serial.println("RSSI: " + String(WiFi.RSSI()) + " dBm");
// Good: -30 to -50 dBm
// Fair: -50 to -70 dBm
// Poor: -70 to -90 dBm
```

---

## 🔒 PRODUCTION DEPLOYMENT CHECKLIST

### Hardware:
- [ ] Semua sensor terpasang dengan benar
- [ ] Wiring sudah disolder (tidak pakai breadboard)
- [ ] Power supply dedicated untuk ESP32 (5V 2A)
- [ ] Power supply dedicated untuk pompa (12V 2A)
- [ ] Relay module terisolasi dari air
- [ ] Sensor waterproof (atau dalam casing)
- [ ] Ground semua komponen ke satu titik

### Software:
- [ ] WiFi credentials configured
- [ ] Supabase Anon Key configured
- [ ] Sector ID unique (SEC-001 to SEC-010)
- [ ] Upload speed 115200
- [ ] Serial Monitor shows upload success
- [ ] Dashboard shows real-time data
- [ ] Pump control tested ON/OFF

### Testing:
- [ ] Upload sensor data 100% success rate
- [ ] Pump control response < 10 detik
- [ ] WiFi reconnect otomatis saat disconnect
- [ ] ESP32 running 24 jam tanpa restart
- [ ] All sensors accurate (compare dengan alat lain)

---

## 📞 SUPPORT

**Dokumentasi Lengkap:**
- 📖 [ESP32_TROUBLESHOOTING_GUIDE.md](./ESP32_TROUBLESHOOTING_GUIDE.md)
- 📖 [SOP_PERAKITAN_HARDWARE.md](./SOP_PERAKITAN_HARDWARE.md)
- 📖 [INDEX.md](./INDEX.md)

**Contact:**
- Email: admin@tamtama.com
- Dokumentasi: `/docs`

---

**Good luck! 🚀🌾**
