# 🔌 ESP32 SETUP GUIDE - PRODUCTION VERSION

> **Panduan lengkap wiring dan setup ESP32 dengan sensor waterproof JSN-SR04T dan SSR untuk sistem monitoring pertanian.**

---

## 📋 **KOMPONEN YANG DIBUTUHKAN**

### **Per 1 Sektor:**

| No | Komponen | Spesifikasi | Qty | Harga (est.) | Link Tokopedia |
|----|----------|-------------|-----|--------------|----------------|
| 1 | ESP32 DevKit V1 | 30 pin, WiFi+BT | 1 | Rp 60.000 | [Link](https://tokopedia.link/esp32) |
| 2 | DHT22 (AM2302) | Suhu & Kelembapan | 1 | Rp 50.000 | Sensor suhu/humidity |
| 3 | JSN-SR04T | Waterproof Ultrasonic | 1 | Rp 45.000 | Sensor level air waterproof |
| 4 | LDR Module | 3.3V-5V, AO output | 1 | Rp 5.000 | Sensor cahaya dengan komparator |
| 5 | SSR 25A | Solid State Relay | 1 | Rp 35.000 | Kontrol pompa AC/DC |
| 6 | Pompa Air 12V DC | Submersible pump | 1 | Rp 50.000 | Pompa irigasi |
| 7 | Power Supply 12V 2A | Adapter AC-DC | 1 | Rp 30.000 | Power utama |
| 8 | DC Barrel Jack | Female connector | 1 | Rp 5.000 | Socket input 12V |
| 9 | Buck Converter | 12V → 5V, 3A | 1 | Rp 15.000 | Step-down untuk ESP32 |
| 10 | Breadboard 830 | Atau PCB custom | 1 | Rp 20.000 | Prototyping |
| 11 | Kabel Jumper | M-M, M-F mix | 1 set | Rp 15.000 | Wiring |
| 12 | Project Box | IP65 waterproof | 1 | Rp 35.000 | Casing outdoor |

**Total per sektor:** ~Rp 365.000  
**Total untuk 10 sektor:** ~Rp 3.650.000

---

## 🔧 **PIN MAPPING LENGKAP**

### **Tabel Koneksi:**

| ESP32 Pin | Komponen | Wire Color | Fungsi |
|-----------|----------|------------|--------|
| **Vin** | DC Socket (+) | Red | Power input 5V |
| **GND** | DC Socket (-) | Black | Common ground |
| **3V3** | DHT22 VCC, LDR VCC | Red | Sensor power 3.3V |
| **GPIO 4** | DHT22 DATA | Blue | Temperature/humidity data |
| **GPIO 18** | JSN-SR04T Trig | Yellow | Water level trigger |
| **GPIO 19** | JSN-SR04T Echo | Green | Water level echo |
| **GPIO 26** | SSR Input (-) | White | Pump control signal |
| **GPIO 34** | LDR AO | Yellow | Light sensor analog |

---

## 🔌 **WIRING DIAGRAM**

### **Power Distribution:**

```
Power Supply 12V 2A
  ├─→ (+12V) Buck Converter IN(+)
  ├─→ (-GND)  Buck Converter IN(-)
  │
  └─→ (+12V) SSR Load (+) ──→ Pompa (+)
              SSR Load (-) ──→ Pompa (-)

Buck Converter (12V → 5V)
  ├─→ OUT(+) ──→ ESP32 Vin (5V)
  └─→ OUT(-) ──→ ESP32 GND
```

### **Sensor Connections:**

```
┌────────────────────────────────────────────────────────────────┐
│                         ESP32 DevKit V1                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [Vin]  [GND]  [3V3]  [GPIO4] [GPIO18] [GPIO19] [GPIO26] [GPIO34]
│   │      │      │       │        │        │        │        │
│   │      │      │       │        │        │        │        │
└───┼──────┼──────┼───────┼────────┼────────┼────────┼────────┼───┘
    │      │      │       │        │        │        │        │
    │      │      │       │        │        │        │        │
    5V    GND    3.3V   DHT22   JSN-SR04T   SSR    LDR
    │      │      │     DATA     Trig Echo  IN     AO
    │      │      │       │        │   │     │      │
    │      │      └───────┼────────┼───┼─────┼──────┤
    │      │              │        │   │     │      │
    │      └──────────────┼────────┼───┼─────┼──────┤
    │                     │        │   │     │      │
    │                     │        │   │     │      │
    │                   ┌─▼────┐ ┌─▼───▼──┐ ┌▼────┐ ┌▼──────┐
    │                   │ DHT22│ │JSN-SR04T│ │ SSR │ │  LDR  │
    │                   └──────┘ └─────────┘ └─────┘ └───────┘
    │                                           │
    │                                      Load (+/-)
    │                                           │
    └───────────────────────────────────────────┼──→ Pompa 12V
```

---

## 📝 **DETAIL WIRING PER KOMPONEN**

### **1. DHT22 (Suhu & Kelembapan)**

```
DHT22 Pin Layout (4 pin):
  Pin 1 (VCC)  ──→ ESP32 3V3 (Red wire)
  Pin 2 (DATA) ──→ ESP32 GPIO 4 (Blue wire)
  Pin 3 (NULL) ──→ Not connected
  Pin 4 (GND)  ──→ ESP32 GND (Black wire)
```

**Catatan:**
- DHT22 bisa pakai 3.3V atau 5V (gunakan 3.3V untuk hemat power)
- Pull-up resistor 10kΩ (opsional, DHT22 biasanya sudah ada internal)

---

### **2. JSN-SR04T (Waterproof Ultrasonic)**

```
JSN-SR04T Pin Layout:
  VCC  ──→ ESP32 3V3 atau 5V (Red wire)
  Trig ──→ ESP32 GPIO 18 (Yellow wire)
  Echo ──→ ESP32 GPIO 19 (Green wire)
  GND  ──→ ESP32 GND (Black wire)
```

**⚠️ PENTING:**
- JSN-SR04T support **3.3V dan 5V** (lebih fleksibel dari HC-SR04)
- Echo output **sudah 3.3V compatible**, tidak perlu voltage divider!
- Waterproof (IP67), cocok untuk outdoor
- Range: 25cm - 450cm (lebih baik dari HC-SR04)

**Instalasi di Tangki Air:**
```
     ┌──────────────────────────┐
     │   JSN-SR04T Sensor       │  ← Mount di atas tangki
     │   (Tranducer waterproof) │
     └────────┬─────────────────┘
              │
              │ 2-20cm (jarak ke permukaan air max)
              ▼
     ════════════════════════════  ← Permukaan air
              │
              │ Water level (diukur)
              │
     ═════════▼══════════════════  ← Dasar tangki
```

---

### **3. LDR Module (Cahaya)**

```
LDR Module Pin Layout:
  VCC ──→ ESP32 3V3 (Red wire)
  GND ──→ ESP32 GND (Black wire)
  DO  ──→ Not used (digital output)
  AO  ──→ ESP32 GPIO 34 (Yellow wire) ← Analog output
```

**Catatan:**
- Gunakan **AO (Analog Output)** untuk reading presisi
- GPIO 34 adalah ADC1 (safe, tidak konflik dengan WiFi)
- Module LDR sudah include resistor dan komparator

---

### **4. SSR (Solid State Relay)**

```
SSR Pin Layout:

Control Side (Low voltage):
  (+) ──→ ESP32 GPIO 26 (White wire)
  (-) ──→ ESP32 GND (Black wire)

Load Side (High voltage/current):
  (+) ──→ Power Supply 12V (+)
  (-) ──→ Pompa (+)
  
  Pompa (-) ──→ Power Supply 12V (-)
```

**Keunggulan SSR vs Relay Mekanik:**
- ✅ No noise (silent operation)
- ✅ Faster switching (microseconds)
- ✅ Longer lifespan (no moving parts)
- ✅ No spark (safer untuk outdoor)
- ✅ Lower power consumption (~10mA vs 70mA)

**⚠️ CATATAN SSR:**
- SSR biasanya **active HIGH** (kebalikan relay mekanik)
- `digitalWrite(SSR_PIN, HIGH)` = Pompa **ON**
- `digitalWrite(SSR_PIN, LOW)` = Pompa **OFF**

---

### **5. Power Supply & Buck Converter**

```
AC 220V ──→ Power Supply 12V 2A
              │
              ├─→ Buck Converter IN (+12V)
              │     │
              │     └─→ OUT (+5V) ──→ ESP32 Vin
              │         └─→ OUT (GND) ──→ ESP32 GND
              │
              └─→ SSR Load (+12V) ──→ Pompa
                  SSR Load (GND)  ──→ Pompa GND
```

**Spesifikasi Buck Converter:**
- Input: 12V
- Output: 5V (adjust dengan potensiometer)
- Current: min 1A (recommended 2-3A)

**Cara Setting Buck Converter:**
1. Disconnect output (jangan sambung ke ESP32 dulu)
2. Sambung input 12V
3. Ukur output dengan multimeter
4. Putar potensiometer sampai output **tepat 5.0V**
5. Disconnect, sambung ke ESP32

---

## 🔧 **ASSEMBLY STEP-BY-STEP**

### **Step 1: Prepare Breadboard**

```
1. Pasang ESP32 di tengah breadboard
2. Setup power rails:
   • Red rail (+) → hubungkan ke ESP32 3V3
   • Blue rail (-) → hubungkan ke ESP32 GND
```

---

### **Step 2: Install Sensors**

**DHT22:**
```
1. Pasang DHT22 di breadboard
2. Connect VCC → Red rail (3V3)
3. Connect DATA → GPIO 4 (direct wire)
4. Connect GND → Blue rail
```

**JSN-SR04T:**
```
1. JSN-SR04T tidak perlu di breadboard (external mount)
2. Connect dengan kabel jumper:
   • VCC → ESP32 3V3 (atau 5V jika butuh range lebih jauh)
   • Trig → GPIO 18
   • Echo → GPIO 19 (SAFE, no voltage divider needed!)
   • GND → Blue rail
```

**LDR Module:**
```
1. Pasang LDR module di breadboard
2. Connect VCC → Red rail (3V3)
3. Connect AO → GPIO 34
4. Connect GND → Blue rail
```

---

### **Step 3: Install SSR**

```
1. SSR mount di luar breadboard (dekat power supply)
2. Control side:
   • (+) → GPIO 26 (direct wire)
   • (-) → ESP32 GND
3. Load side:
   • (+) → Power 12V (+)
   • (-) → Pompa (+)
4. Pompa (-) → Power 12V (-)
```

---

### **Step 4: Power Wiring**

```
1. Buck Converter setup:
   • IN (+) → Power 12V (+)
   • IN (-) → Power 12V (-)
   • OUT (+) → ESP32 Vin
   • OUT (-) → ESP32 GND (+ breadboard blue rail)

2. Verify voltage:
   • Use multimeter, output harus 5.0V ± 0.1V
   • Jika >5.2V, adjust potensiometer (turunkan)
   • Jika <4.8V, adjust potensiometer (naikkan)
```

---

### **Step 5: Final Checks**

```
☑️ All GND connected (common ground)
☑️ No short circuit (use multimeter continuity test)
☑️ Polarity correct (+/- tidak terbalik)
☑️ Buck converter output = 5.0V
☑️ SSR wiring benar (control vs load side)
☑️ Sensor VCC = 3.3V (dari ESP32 3V3 pin)
```

---

## 💻 **SOFTWARE SETUP**

### **Step 1: Install Arduino IDE**

1. Download Arduino IDE: https://www.arduino.cc/en/software
2. Install untuk Windows/Mac/Linux

---

### **Step 2: Install ESP32 Board**

1. Open Arduino IDE
2. File → Preferences
3. Additional Board Manager URLs:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Tools → Board → Boards Manager
5. Search "ESP32"
6. Install **esp32 by Espressif Systems**

---

### **Step 3: Install Libraries**

Tools → Manage Libraries, install:

1. **DHT sensor library** by Adafruit (v1.4.4+)
2. **Adafruit Unified Sensor** (v1.1.9+)
3. **ArduinoJson** by Benoit Blanchon (v6.21.0+)

---

### **Step 4: Configure Code**

Open `ESP32_PRODUCTION_CODE.ino` dan edit:

```cpp
// ====== WIFI CONFIG ======
#define WIFI_SSID "NamaWiFiAnda"        // ← GANTI
#define WIFI_PASSWORD "PasswordWiFi"    // ← GANTI

// ====== FIREBASE CONFIG ======
#define FIREBASE_PROJECT_ID "monitoring-pertanian-abc123"  // ← GANTI
#define FIREBASE_API_KEY "AIzaSyXXXXXXXXXXXXXXXXXXXX"     // ← GANTI

// ====== SECTOR ID ======
#define SECTOR_ID "SEC-001"  // ← GANTI per ESP32
                             // SEC-001, SEC-002, ..., SEC-010
```

**Cara mendapat Firebase credentials:**

1. Buka dashboard web Anda
2. Buka file `env.config.js`
3. Copy value:
   - `FIREBASE_PROJECT_ID` → ke `FIREBASE_PROJECT_ID`
   - `FIREBASE_API_KEY` → ke `FIREBASE_API_KEY`

---

### **Step 5: Upload Code**

1. Connect ESP32 ke PC via USB
2. Tools → Board → ESP32 Dev Module
3. Tools → Port → (pilih COM port ESP32)
4. Click **Upload** (→ button)
5. Wait sampai "Done uploading"

---

### **Step 6: Test & Monitor**

1. Tools → Serial Monitor (Ctrl+Shift+M)
2. Set baud rate: **115200**
3. Lihat output:

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
  Connecting.... ✅
  
  📶 WiFi Connected!
  📍 IP Address: 192.168.1.100
  📡 Signal Strength: -45 dBm

⏰ NTP Time configured (GMT+7)

====================================================================
✅ SETUP COMPLETE - Starting main loop...
====================================================================
```

---

## 🧪 **TESTING PROCEDURE**

### **Test 1: Sensor Reading**

```
Expected every 20 seconds:

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

### **Test 2: Pump Control**

**Manual test dari Serial Monitor:**

1. Buka Serial Monitor
2. Buka dashboard web
3. Klik tombol "Pompa ON" di sektor yang sesuai
4. Tunggu max 5 detik

**Expected output:**
```
🎮 New pump command received: ON
  ✅ Pompa DINYALAKAN (SSR ON)
  ✅ Command acknowledged (executed = true)
```

**Physical check:**
- ✅ SSR LED indicator menyala
- ✅ Pompa air beroperasi (dengar suara motor)
- ✅ Dashboard update status "ON"

---

### **Test 3: Web Dashboard Sync**

1. Serial Monitor show sensor readings
2. Buka dashboard web
3. Card sektor harus update real-time (max 1 detik delay)

**Verify:**
- ✅ Suhu di web = suhu di Serial Monitor
- ✅ Humidity match
- ✅ Water level match
- ✅ Light level match
- ✅ Pump status match

---

## 🐛 **TROUBLESHOOTING**

### **❌ WiFi tidak connect**

```
Symptom: "WiFi Connection Failed!"

Check:
  ☑️ SSID & password benar (case-sensitive)
  ☑️ WiFi 2.4 GHz (ESP32 tidak support 5 GHz)
  ☑️ Signal kuat (min -70 dBm)
  ☑️ Router tidak block MAC address ESP32
  ☑️ DHCP enabled di router

Fix:
  • Pindahkan ESP32 lebih dekat ke router
  • Restart router
  • Hardcode static IP (advanced)
```

---

### **❌ DHT22 return NaN**

```
Symptom: "DHT22 read error - using last valid reading"

Check:
  ☑️ Wiring VCC, DATA, GND benar
  ☑️ VCC = 3.3V (ukur dengan multimeter)
  ☑️ DHT22 tidak rusak

Fix:
  • Tambah delay 2 detik setelah dht.begin()
  • Tambah pull-up resistor 10kΩ (DATA ke VCC)
  • Test dengan example sketch: File → Examples → DHT sensor library → DHTtester
```

---

### **❌ JSN-SR04T return 0 atau max**

```
Symptom: Water level always 0 cm atau 20 cm

Check:
  ☑️ VCC = 3.3V atau 5V (stable)
  ☑️ Wiring Trig & Echo benar
  ☑️ Sensor menghadap permukaan air (vertikal)
  ☑️ Jarak sensor 2-20 cm dari permukaan air
  ☑️ Tidak ada obstacle di depan sensor

Fix:
  • Test dengan air di ember (controlled environment)
  • Adjust TANK_HEIGHT_CM di code
  • Periksa kabel tidak putus (JSN-SR04T pakai kabel panjang)
```

---

### **❌ Firebase error HTTP 400/401**

```
Symptom: "HTTP Error: 400" atau "HTTP Error: 401"

Check:
  ☑️ FIREBASE_PROJECT_ID benar
  ☑️ FIREBASE_API_KEY benar (dari env.config.js)
  ☑️ Firestore database sudah dibuat
  ☑️ Firestore rules allow write

Fix:
  • Copy paste credentials lagi (hati-hati spasi)
  • Cek Firebase Console → Firestore → Rules
  • Test manual: buka URL di browser
```

---

### **❌ Pompa tidak nyala**

```
Symptom: Command received tapi pompa diam

Check:
  ☑️ SSR wiring benar (control vs load side)
  ☑️ Power 12V tersambung
  ☑️ SSR LED indicator menyala (saat ON command)
  ☑️ Pompa tidak rusak (test langsung ke 12V)
  ☑️ Current cukup (min 2A power supply)

Fix:
  • Test SSR dengan LED dulu (sebelum pompa)
  • Ukur voltage di load side SSR (harus 12V saat ON)
  • Ganti SSR jika rusak
```

---

## 📊 **CALIBRATION**

### **Water Level Sensor:**

```cpp
// Di ESP32_PRODUCTION_CODE.ino, line ~51
#define TANK_HEIGHT_CM 20.0      // ← Ukur tinggi tangki Anda!
#define SENSOR_OFFSET_CM 2.0     // ← Jarak sensor dari permukaan max
```

**Cara Kalibrasi:**

1. **Kosongkan tangki**
   - Serial Monitor harus show: `Water Level: 0.0 cm` atau close to 0
   - Jika tidak, adjust `SENSOR_OFFSET_CM`

2. **Isi tangki penuh**
   - Serial Monitor harus show: `Water Level: 20.0 cm` (atau tinggi tangki Anda)
   - Jika tidak, adjust `TANK_HEIGHT_CM`

3. **Test tengah-tengah**
   - Isi setengah tangki
   - Serial Monitor harus show: ~10.0 cm

---

### **Light Sensor:**

```cpp
// Di ESP32_PRODUCTION_CODE.ino, line ~54-57
#define LDR_MIN_ADC 0            // ← ADC saat gelap
#define LDR_MAX_ADC 4095         // ← ADC saat terang
#define LUX_MIN 0                
#define LUX_MAX 50000            // ← Adjust jika perlu
```

**Cara Kalibrasi:**

1. **Gelap total** (tutup LDR dengan kain hitam)
   - Serial Monitor show ADC value
   - Update `LDR_MIN_ADC` dengan nilai tersebut

2. **Terang matahari** (arahkan LDR ke matahari)
   - Serial Monitor show ADC value
   - Update `LDR_MAX_ADC` dengan nilai tersebut

3. **Re-upload code**

---

## 📦 **ENCLOSURE & INSTALLATION**

### **Recommended Enclosure:**

```
Project Box IP65 (waterproof)
  Size: 200mm x 150mm x 75mm
  Material: ABS plastic
  Features:
    • IP65 rated (dust & water resistant)
    • Cable glands untuk sensor wires
    • Mounting holes untuk wall/pole
```

### **Component Layout dalam Box:**

```
┌──────────────────────────────────────────┐
│  [Power Supply 12V]  [Buck Converter]    │
│                                          │
│  [ESP32 + Breadboard]                    │
│                                          │
│  [SSR]                                   │
│                                          │
│  Cable Glands:                           │
│  • DHT22 wire (waterproof junction)      │
│  • JSN-SR04T wire (waterproof cable)     │
│  • LDR wire (waterproof junction)        │
│  • Pompa wire (heavy duty)               │
│  • Power inlet (AC 220V)                 │
└──────────────────────────────────────────┘
```

---

## ✅ **FINAL CHECKLIST**

### **Hardware:**
- [ ] Semua komponen terpasang sesuai wiring diagram
- [ ] Power supply 12V 2A working
- [ ] Buck converter output = 5.0V ± 0.1V
- [ ] DHT22 reading OK (suhu & humidity)
- [ ] JSN-SR04T reading OK (water level)
- [ ] LDR reading OK (light level)
- [ ] SSR test OK (LED indicator menyala)
- [ ] Pompa test OK (beroperasi saat command ON)
- [ ] No short circuit
- [ ] Enclosure IP65 installed

### **Software:**
- [ ] WiFi connected (IP address assigned)
- [ ] Firebase sync OK (data muncul di Firestore)
- [ ] Dashboard update real-time
- [ ] Pump control dari web working
- [ ] Serial Monitor no error
- [ ] NTP time synced
- [ ] Sensor calibration done

### **Production:**
- [ ] Label sector ID di enclosure
- [ ] Cable management rapi
- [ ] Waterproofing semua junction
- [ ] Mounting secure (tidak goyah)
- [ ] WiFi signal strong (min -70 dBm)
- [ ] 24 jam burn-in test
- [ ] Documentation & user manual

---

## 🎉 **CONGRATULATIONS!**

ESP32 Anda sudah **production-ready**! 🚀

**Next Steps:**
1. ✅ Replicate untuk 9 sektor lainnya (ganti `SECTOR_ID`)
2. ✅ Deploy di lokasi (pastikan WiFi reach)
3. ✅ Monitor 24 jam pertama
4. ✅ Training user untuk operasional

**Support:**
- Baca: `KONSEP_KERJA_SISTEM_LENGKAP.md`
- Troubleshooting: `WIRING_DIAGRAM_ESP32.md`
- Testing: `TESTING_GUIDE.md`

**Butuh bantuan? Tanya saja!** 😊
