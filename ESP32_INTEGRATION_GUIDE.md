# 📡 ESP32 Integration Guide - Smart Agriculture Monitoring System

## 🎯 Tujuan
ESP32 akan mengirim data sensor (suhu, kelembapan, level air, cahaya) setiap 20 detik dan mengontrol pompa air berdasarkan perintah dari server.

---

## 🔧 Hardware Requirements

### Komponen Utama:
- **ESP32 Dev Board** (1 unit)
- **DHT22** - Sensor Suhu & Kelembapan (1 unit)
- **HC-SR04** - Sensor Ultrasonik untuk Level Air (1 unit)
- **LDR (Light Dependent Resistor)** - Sensor Cahaya (1 unit)
- **Relay Module 5V** - Kontrol Pompa Air (1 channel)
- **Pompa Air DC 12V** (1 unit)
- **Power Supply 12V** untuk pompa

### Koneksi Pin:

```
ESP32          Component
-----          ---------
GPIO 4    →    DHT22 Data Pin
GPIO 5    →    HC-SR04 Trigger
GPIO 18   →    HC-SR04 Echo
GPIO 34   →    LDR Analog Input
GPIO 2    →    Relay IN (Kontrol Pompa)

VCC (3.3V) →   DHT22 VCC, HC-SR04 VCC
GND        →   Semua GND komponen
```

---

## 📝 API Endpoints untuk ESP32

### Base URL:
```
https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0
```

### 1. **Kirim Data Sensor** (POST)
**Endpoint:** `/sensor-update`

**Frekuensi:** Setiap 20 detik

**Request:**
```json
POST /sensor-update
Content-Type: application/json

{
  "sectorId": "SEC-001",
  "temperature": 28.5,
  "humidity": 65.2,
  "lightLevel": 450,
  "waterLevel": 12.5,
  "pumpStatus": "OFF"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sensor data received",
  "sectorId": "SEC-001"
}
```

---

### 2. **Ambil Perintah Pompa** (GET)
**Endpoint:** `/pump-command/:sectorId`

**Frekuensi:** Setiap 5 detik (polling)

**Request:**
```
GET /pump-command/SEC-001
```

**Response:**
```json
{
  "status": "ON",
  "executed": true,
  "timestamp": "2026-02-03T10:30:00Z"
}
```

**Status Values:**
- `"ON"` - Nyalakan pompa
- `"OFF"` - Matikan pompa

---

### 3. **Acknowledge Command** (POST)
**Endpoint:** `/pump-acknowledge/:sectorId`

**Kapan:** Setelah ESP32 berhasil eksekusi perintah pompa

**Request:**
```
POST /pump-acknowledge/SEC-001
Content-Type: application/json

{}
```

**Response:**
```json
{
  "success": true,
  "message": "Command acknowledged"
}
```

---

## 💻 ESP32 Code (Arduino IDE)

### Install Libraries:
1. DHT sensor library (by Adafruit)
2. ArduinoJson (by Benoit Blanchon)
3. WiFi (Built-in ESP32)
4. HTTPClient (Built-in ESP32)

### Complete Arduino Code:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ============================================
// CONFIGURATION - EDIT INI!
// ============================================

// WiFi Credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";        // ← GANTI dengan nama WiFi Anda
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // ← GANTI dengan password WiFi

// Sector ID (pilih salah satu: SEC-001 sampai SEC-010)
const char* SECTOR_ID = "SEC-002";  // ← GANTI sesuai sektor Anda

// Server URL (JANGAN DIUBAH kecuali Edge Function sudah deployed)
const char* SERVER_URL = "https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0";

// ============================================
// PIN DEFINITIONS
// ============================================

#define DHT_PIN 4           // DHT22 sensor
#define TRIG_PIN 5          // HC-SR04 Trigger
#define ECHO_PIN 18         // HC-SR04 Echo
#define LDR_PIN 34          // LDR sensor (analog)
#define RELAY_PIN 2         // Relay untuk pompa

#define DHT_TYPE DHT22      // Tipe sensor DHT

// ============================================
// TIMING CONSTANTS
// ============================================

const unsigned long SENSOR_INTERVAL = 20000;  // 20 detik
const unsigned long PUMP_CHECK_INTERVAL = 5000; // 5 detik

// ============================================
// GLOBAL VARIABLES
// ============================================

DHT dht(DHT_PIN, DHT_TYPE);

unsigned long lastSensorTime = 0;
unsigned long lastPumpCheckTime = 0;

String currentPumpStatus = "OFF";
bool pumpRelayState = false;

// ============================================
// SETUP
// ============================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("╔═══════════════════════════════════════════════════════════╗");
  Serial.println("║                                                           ║");
  Serial.println("║     🌾 SMART AGRICULTURE MONITORING SYSTEM 🌾            ║");
  Serial.println("║                                                           ║");
  Serial.println("║              ESP32 IoT Device Starting...                ║");
  Serial.println("║                                                           ║");
  Serial.println("╚═══════════════════════════════════════════════════════════╝");
  Serial.println();

  // Initialize pins
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(RELAY_PIN, LOW); // Pompa OFF saat start
  
  // Initialize DHT sensor
  dht.begin();
  Serial.println("✅ DHT22 sensor initialized");
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println();
  Serial.println("╔═══════════════════════════════════════════════════════════╗");
  Serial.println("║              SYSTEM READY - STARTING LOOP                ║");
  Serial.println("╚═══════════════════════════════════════════════════════════╝");
  Serial.println();
}

// ============================================
// MAIN LOOP
// ============================================

void loop() {
  unsigned long currentTime = millis();
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi disconnected! Reconnecting...");
    connectWiFi();
  }
  
  // 1. Kirim data sensor setiap 20 detik
  if (currentTime - lastSensorTime >= SENSOR_INTERVAL) {
    lastSensorTime = currentTime;
    sendSensorData();
  }
  
  // 2. Check pump command setiap 5 detik
  if (currentTime - lastPumpCheckTime >= PUMP_CHECK_INTERVAL) {
    lastPumpCheckTime = currentTime;
    checkPumpCommand();
  }
  
  delay(100); // Small delay to prevent watchdog reset
}

// ============================================
// WIFI CONNECTION
// ============================================

void connectWiFi() {
  Serial.print("🌐 Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("   IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("   Sector ID: ");
    Serial.println(SECTOR_ID);
  } else {
    Serial.println("\n❌ WiFi Connection FAILED!");
  }
}

// ============================================
// SENSOR READING FUNCTIONS
// ============================================

float readTemperature() {
  float temp = dht.readTemperature();
  if (isnan(temp)) {
    Serial.println("⚠️  DHT22 read error - using default temp");
    return 25.0; // Default value
  }
  return temp;
}

float readHumidity() {
  float hum = dht.readHumidity();
  if (isnan(hum)) {
    Serial.println("⚠️  DHT22 read error - using default humidity");
    return 60.0; // Default value
  }
  return hum;
}

float readWaterLevel() {
  // HC-SR04 ultrasonic sensor
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  
  if (duration == 0) {
    Serial.println("⚠️  HC-SR04 timeout - using default water level");
    return 10.0; // Default value
  }
  
  // Hitung jarak dalam cm
  float distance = duration * 0.034 / 2;
  
  // Jika sensor dipasang di atas tangki (misal 50cm tinggi tangki)
  // Water level = 50 - distance
  float tankHeight = 50.0; // cm
  float waterLevel = tankHeight - distance;
  
  if (waterLevel < 0) waterLevel = 0;
  if (waterLevel > tankHeight) waterLevel = tankHeight;
  
  return waterLevel;
}

int readLightLevel() {
  // LDR sensor (0-4095 untuk ESP32 12-bit ADC)
  int rawValue = analogRead(LDR_PIN);
  
  // Convert to lux (simplified conversion)
  // Anda bisa kalibrasi sendiri untuk hasil lebih akurat
  int lux = map(rawValue, 0, 4095, 0, 1000);
  
  return lux;
}

// ============================================
// SEND SENSOR DATA
// ============================================

void sendSensorData() {
  Serial.println("\n┌─────────────────────────────────────────────────────────┐");
  Serial.println("│           📊 SENDING SENSOR DATA TO SERVER             │");
  Serial.println("└─────────────────────────────────────────────────────────┘");
  
  // Read all sensors
  float temperature = readTemperature();
  float humidity = readHumidity();
  float waterLevel = readWaterLevel();
  int lightLevel = readLightLevel();
  
  // Print sensor readings
  Serial.println("📈 Sensor Readings:");
  Serial.printf("   🌡️  Temperature: %.1f°C\n", temperature);
  Serial.printf("   💧 Humidity: %.1f%%\n", humidity);
  Serial.printf("   💦 Water Level: %.1f cm\n", waterLevel);
  Serial.printf("   ☀️  Light Level: %d lux\n", lightLevel);
  Serial.printf("   ⚙️  Pump Status: %s\n", currentPumpStatus.c_str());
  Serial.println();
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["sectorId"] = SECTOR_ID;
  doc["temperature"] = round(temperature * 10) / 10.0;
  doc["humidity"] = round(humidity * 10) / 10.0;
  doc["waterLevel"] = round(waterLevel * 10) / 10.0;
  doc["lightLevel"] = lightLevel;
  doc["pumpStatus"] = currentPumpStatus;
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  // Send HTTP POST request
  HTTPClient http;
  String url = String(SERVER_URL) + "/sensor-update";
  
  Serial.println("📤 Sending to Supabase Edge Function...");
  Serial.printf("   URL: %s\n", url.c_str());
  Serial.printf("   Payload: %s\n", jsonPayload.c_str());
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(15000); // 15 second timeout
  
  int httpCode = http.POST(jsonPayload);
  
  if (httpCode > 0) {
    Serial.printf("   ✅ HTTP Response Code: %d\n", httpCode);
    
    if (httpCode == 200) {
      String response = http.getString();
      Serial.printf("   Response: %s\n", response.c_str());
    }
  } else {
    Serial.printf("   ❌ HTTP Error: %d\n", httpCode);
    Serial.printf("   Error: %s\n", http.errorToString(httpCode).c_str());
  }
  
  http.end();
  Serial.println("✅ Data transmission complete!");
  Serial.println();
}

// ============================================
// CHECK PUMP COMMAND
// ============================================

void checkPumpCommand() {
  HTTPClient http;
  String url = String(SERVER_URL) + "/pump-command/" + String(SECTOR_ID);
  
  http.begin(url);
  http.setTimeout(10000); // 10 second timeout
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String response = http.getString();
    
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error) {
      String newStatus = doc["status"].as<String>();
      
      // Only act if status changed
      if (newStatus != currentPumpStatus) {
        Serial.println("\n┌─────────────────────────────────────────────────────────┐");
        Serial.println("│           ⚙️  PUMP COMMAND RECEIVED                    │");
        Serial.println("└─────────────────────────────────────────────────────────┘");
        Serial.printf("   Previous: %s\n", currentPumpStatus.c_str());
        Serial.printf("   New: %s\n", newStatus.c_str());
        
        currentPumpStatus = newStatus;
        
        // Control relay
        if (currentPumpStatus == "ON") {
          digitalWrite(RELAY_PIN, HIGH);
          pumpRelayState = true;
          Serial.println("   ✅ Relay ON - Pump ACTIVATED");
        } else {
          digitalWrite(RELAY_PIN, LOW);
          pumpRelayState = false;
          Serial.println("   ✅ Relay OFF - Pump DEACTIVATED");
        }
        
        // Acknowledge command
        acknowledgePumpCommand();
        
        Serial.println();
      }
    }
  } else if (httpCode != -1) {
    Serial.printf("⚠️  Pump check error: HTTP %d\n", httpCode);
  }
  
  http.end();
}

// ============================================
// ACKNOWLEDGE PUMP COMMAND
// ============================================

void acknowledgePumpCommand() {
  HTTPClient http;
  String url = String(SERVER_URL) + "/pump-acknowledge/" + String(SECTOR_ID);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST("{}");
  
  if (httpCode == 200) {
    Serial.println("   ✅ Command acknowledged to server");
  } else {
    Serial.printf("   ⚠️  Acknowledgement failed: HTTP %d\n", httpCode);
  }
  
  http.end();
}
```

---

## 🚀 Cara Deploy ke ESP32

### 1. Install Arduino IDE
Download dari: https://www.arduino.cc/en/software

### 2. Install ESP32 Board
- Arduino IDE → File → Preferences
- Additional Board Manager URLs: 
  ```
  https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
  ```
- Tools → Board → Boards Manager
- Search "ESP32" → Install

### 3. Install Required Libraries
- Tools → Manage Libraries
- Install:
  - `DHT sensor library` by Adafruit
  - `ArduinoJson` by Benoit Blanchon

### 4. Configure Code
Edit bagian ini di code:
```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";        // ← GANTI
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // ← GANTI
const char* SECTOR_ID = "SEC-002";                // ← GANTI (SEC-001 s/d SEC-010)
```

### 5. Upload ke ESP32
- Tools → Board → ESP32 Dev Module
- Tools → Port → (pilih COM port ESP32)
- Klik tombol **Upload** (→)

### 6. Monitor Serial
- Tools → Serial Monitor
- Set baud rate: 115200
- Lihat log ESP32 real-time

---

## 📊 Serial Monitor Output

```
╔═══════════════════════════════════════════════════════════╗
║     🌾 SMART AGRICULTURE MONITORING SYSTEM 🌾            ║
║              ESP32 IoT Device Starting...                ║
╚═════════════════════════════════════════════════════════��═╝

✅ DHT22 sensor initialized
🌐 Connecting to WiFi: MyWiFi
.....
✅ WiFi Connected!
   IP Address: 192.168.1.100
   Sector ID: SEC-002

╔═══════════════════════════════════════════════════════════╗
║              SYSTEM READY - STARTING LOOP                ║
╚═══════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────┐
│           📊 SENDING SENSOR DATA TO SERVER             │
└─────────────────────────────────────────────────────────┘
📈 Sensor Readings:
   🌡️  Temperature: 28.5°C
   💧 Humidity: 65.2%
   💦 Water Level: 12.5 cm
   ☀️  Light Level: 450 lux
   ⚙️  Pump Status: OFF

📤 Sending to Supabase Edge Function...
   ✅ HTTP Response Code: 200
✅ Data transmission complete!

┌─────────────────────────────────────────────────────────┐
│           ⚙️  PUMP COMMAND RECEIVED                    │
└─────────────────────────────────────────────────────────┘
   Previous: OFF
   New: ON
   ✅ Relay ON - Pump ACTIVATED
   ✅ Command acknowledged to server
```

---

## 🎯 Cara Kontrol Pompa dari Dashboard

### Manual Control (dari Web Dashboard):
1. Login ke dashboard web
2. Klik card sektor yang diinginkan
3. Klik toggle button **"Pompa Manual"**
4. ESP32 akan otomatis ON/OFF dalam **5 detik** (polling interval)

### Auto Scheduling:
- Pompa otomatis ON setiap jam pada menit 0-14 (15 menit)
- Contoh: 00:00-00:14, 01:00-01:14, dst. (24 jam non-stop)
- ESP32 akan mengikuti perintah dari server secara otomatis

---

## 🔧 Troubleshooting

### ESP32 tidak connect ke WiFi:
- ✅ Cek SSID dan password sudah benar
- ✅ Pastikan WiFi 2.4GHz (bukan 5GHz)
- ✅ ESP32 dalam jangkauan WiFi

### HTTP Error -11 (Timeout):
- ✅ Edge Function belum di-deploy → Deploy dulu atau ubah `DEV_MODE: true` di `/env.config.js`
- ✅ Timeout terlalu pendek → Sudah diubah jadi 15 detik
- ✅ Koneksi internet lambat

### Pompa tidak respond perintah:
- ✅ Cek relay terhubung dengan benar ke GPIO 2
- ✅ Lihat serial monitor, apakah ada "PUMP COMMAND RECEIVED"?
- ✅ Pastikan SECTOR_ID di ESP32 sama dengan di dashboard

### Sensor data tidak muncul di dashboard:
- ✅ Cek Edge Function sudah deployed
- ✅ Lihat serial monitor, apakah HTTP 200 OK?
- ✅ Refresh dashboard web

---

## ✅ Checklist Deployment

- [ ] Hardware terpasang dengan benar
- [ ] Library Arduino terinstall
- [ ] WiFi SSID & Password sudah diisi
- [ ] SECTOR_ID sudah diisi (SEC-001 s/d SEC-010)
- [ ] Code uploaded ke ESP32
- [ ] Serial monitor menampilkan "WiFi Connected"
- [ ] Serial monitor menampilkan "HTTP Response Code: 200"
- [ ] Dashboard web menampilkan data sensor update
- [ ] Test manual toggle pompa dari dashboard
- [ ] Pompa fisik merespon perintah ON/OFF

---

## 📞 Support

Jika ada masalah:
1. Cek Serial Monitor untuk error message
2. Pastikan Edge Function deployed
3. Cek logs di Supabase Dashboard → Functions → Logs

**Status:** ✅ **ESP32 SIAP DIGUNAKAN TANPA DOKUMENTASI TAMBAHAN!**

Semua endpoint sudah tersedia, ESP32 tinggal upload code di atas!
