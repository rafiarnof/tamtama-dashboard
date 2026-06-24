# 🐛 ESP32 TROUBLESHOOTING GUIDE

> **Panduan lengkap untuk mengatasi error umum pada ESP32 sistem monitoring pertanian.**

---

## 🚨 **COMMON ERRORS & SOLUTIONS**

### **❌ ERROR: HTTP 400 - Invalid JSON payload**

**Symptom:**
```
13:02:39.995 -> URL: https://firestore.googleapis.com/v1/projects/tamtamaproject/databases/(default)/documents/sectors/SEC-745113
13:02:40.040 ->   ⚠️  Response (HTTP 400): {
13:02:40.040 ->   "error": {
13:02:40.040 ->     "code": 400,
13:02:40.040 ->     "message": "Invalid JSON payload received. Parsing terminated be...
```

**Cause:**
JSON payload yang dikirim ke Firestore memiliki format yang tidak valid.

**Solutions:**

#### **✅ Fix 1: Update Code (JSON Brace Bug)**

Error ini disebabkan oleh **extra closing brace** di fungsi `buildFirestoreSectorPayload()`.

**Lokasi:** Line 502 di `ESP32_PRODUCTION_CODE.ino`

**WRONG (Old Code):**
```cpp
json += "}}}},"  // ❌ 4 closing braces (WRONG!)
```

**CORRECT (Fixed Code):**
```cpp
json += "}}},"  // ✅ 3 closing braces (CORRECT!)
```

**Action:**
1. Open `ESP32_PRODUCTION_CODE.ino`
2. Find line 502 (search for `buildFirestoreSectorPayload`)
3. Change `}}}}` to `}}}`
4. Upload code to ESP32
5. Monitor Serial Monitor for success

---

#### **✅ Fix 2: Verify JSON Payload Structure**

The correct Firestore JSON structure should be:

```json
{
  "fields": {
    "data": {
      "mapValue": {
        "fields": {
          "temperature": {"doubleValue": 28.5},
          "humidity": {"doubleValue": 65.0},
          "lightLevel": {"integerValue": 12000},
          "waterLevel": {"doubleValue": 8.0},
          "pumpStatus": {"stringValue": "OFF"}
        }
      }
    },
    "lastUpdate": {"timestampValue": "2026-02-03T14:30:00Z"}
  }
}
```

**Closing brace count:**
```
{                        // 1. Root open
  "fields": {           // 2. Fields open
    "data": {           // 3. Data open
      "mapValue": {     // 4. MapValue open
        "fields": {     // 5. Inner fields open
          ...
        }               // 5. Close inner fields
      }                 // 4. Close mapValue
    },                  // 3. Close data (WITH COMMA!)
    "lastUpdate": {...} // Same level as data
  }                     // 2. Close fields
}                       // 1. Close root
```

**Key points:**
- `data` closes with `}}}` → closes inner fields, mapValue, data
- Add **comma** after `}}}` because `lastUpdate` follows
- Final `}}` closes fields and root

---

#### **✅ Fix 3: Check Sensor Values**

Sometimes `NaN` (Not a Number) or `inf` (infinity) from sensors can break JSON.

**Add validation to code:**

```cpp
String buildFirestoreSectorPayload() {
  // Validate sensor values BEFORE building JSON
  if (isnan(temperature)) temperature = 0.0;
  if (isnan(humidity)) humidity = 0.0;
  if (isnan(waterLevel)) waterLevel = 0.0;
  if (isinf(temperature)) temperature = 0.0;
  if (isinf(humidity)) humidity = 0.0;
  if (isinf(waterLevel)) waterLevel = 0.0;
  
  // Now build JSON safely...
  String timestamp = getCurrentTimestamp();
  String json = "{";
  // ... rest of code
}
```

---

#### **✅ Fix 4: Debug Payload Before Sending**

Add debug print to see exact JSON being sent:

**Code added at line 435:**
```cpp
Serial.println("  Payload (first 200 chars): " + payload.substring(0, min((int)payload.length(), 200)));
```

**Expected output:**
```
📤 Sending to Firebase Firestore...
  URL: https://firestore.googleapis.com/v1/projects/tamtamaproject/databases/(default)/documents/sectors/SEC-001
  Payload (first 200 chars): {"fields":{"data":{"mapValue":{"fields":{"temperature":{"doubleValue":28.5},"humidity":{"doubleValue":65.0},"lightLevel":{"integerValue":12000},"waterLevel":{"doubleValue":8.0},...
```

If you see malformed JSON (missing quotes, extra commas, etc), that's the issue!

---

### **✅ Verification Steps:**

After fix, you should see:

```
📤 Sending to Firebase Firestore...
  URL: https://firestore.googleapis.com/v1/projects/.../sectors/SEC-001
  Payload (first 200 chars): {"fields":{"data":{"mapValue":{"fields":{...
  ✅ Sector data updated (HTTP 200)
  ✅ Sensor history added (HTTP 200)
✅ Data transmission complete!
```

**HTTP 200 = SUCCESS!** 🎉

---

## 🔍 **OTHER COMMON ERRORS**

### **❌ ERROR: WiFi Connection Failed**

**Symptom:**
```
📡 Connecting to WiFi......... ❌
  ❌ WiFi Connection Failed!
  ⚠️  System will retry in 30 seconds...
```

**Solutions:**

1. **Check WiFi Credentials**
   ```cpp
   #define WIFI_SSID "YOUR_WIFI_SSID"       // ← Must match exactly!
   #define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
   ```
   - SSID is **case-sensitive**
   - Password is **case-sensitive**
   - No extra spaces

2. **Check WiFi Frequency**
   - ESP32 only supports **2.4 GHz WiFi**
   - **5 GHz WiFi will NOT work!**
   - Change router to 2.4 GHz or use separate 2.4 GHz network

3. **Check Signal Strength**
   - Move ESP32 closer to router
   - Avoid metal obstacles
   - Check antenna orientation

4. **Check Router Settings**
   - MAC filtering disabled (or add ESP32 MAC)
   - DHCP enabled
   - No WPA3-only mode (use WPA2 or WPA2/WPA3 mixed)

---

### **❌ ERROR: HTTP 404 - Document Not Found**

**Symptom:**
```
⚠️  Response (HTTP 404): Document not found
```

**Cause:**
Firebase document doesn't exist yet.

**Solution:**
This is **normal for first run**. ESP32 will automatically create the document:

```
ℹ️  No pump command found (first run)
  ✅ Default pump command created
```

If you continue getting 404:
1. Check `FIREBASE_PROJECT_ID` in code
2. Check `SECTOR_ID` matches what's in web dashboard
3. Verify Firebase Rules allow writes

---

### **❌ ERROR: HTTP 403 - Permission Denied**

**Symptom:**
```
⚠️  Response (HTTP 403): Missing or insufficient permissions
```

**Cause:**
Firebase security rules block ESP32 from writing.

**Solution:**

1. **Open Firebase Console** → Firestore Database → Rules

2. **Check rules allow writes:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;  // ← DEVELOPMENT ONLY!
       }
     }
   }
   ```

3. **For production**, use API key authentication:
   - ESP32 uses `?key=API_KEY` in URL
   - Make sure `FIREBASE_API_KEY` is correct

---

### **❌ ERROR: DHT22 Returns NaN**

**Symptom:**
```
⚠️  DHT22: Failed to read (check wiring)
⚠️  DHT22 read error - using last valid reading
```

**Solutions:**

1. **Check Wiring:**
   ```
   DHT22 Pin 1 (VCC)  → ESP32 3V3
   DHT22 Pin 2 (DATA) → ESP32 GPIO 4
   DHT22 Pin 4 (GND)  → ESP32 GND
   ```

2. **Add Pull-up Resistor (Optional but recommended):**
   - 10kΩ resistor between DATA pin and VCC

3. **Check Sensor:**
   - Try different DHT22 sensor (might be defective)
   - Check for fake/clone sensors (common issue)

4. **Increase Delay:**
   ```cpp
   void setup() {
     // ...
     dht.begin();
     delay(2000);  // ← Increase to 3000 if needed
   }
   ```

---

### **❌ ERROR: JSN-SR04T No Echo Received**

**Symptom:**
```
⚠️  JSN-SR04T: No echo received
💦 Water Level: 0.0 cm
```

**Solutions:**

1. **Check Power:**
   - JSN-SR04T needs **5V** (not 3.3V!)
   - Use Buck Converter output or VIN pin

2. **Check Wiring:**
   ```
   JSN-SR04T VCC  → 5V
   JSN-SR04T Trig → GPIO 18
   JSN-SR04T Echo → GPIO 19
   JSN-SR04T GND  → GND
   ```

3. **Check Distance:**
   - Min distance: **25 cm** (JSN-SR04T blind zone)
   - Max distance: **600 cm**
   - Move sensor further from surface if too close

4. **Check Obstacle:**
   - Sensor must face flat surface
   - Water surface works best
   - Avoid angled surfaces (echo bounces away)

---

### **❌ ERROR: Sensor History HTTP 200 but No Data in Firestore**

**Symptom:**
```
✅ Sensor history added (HTTP 200)
```
But no data appears in Firestore `sensor_data` collection.

**Cause:**
Using **PATCH** instead of **POST** for creating new documents.

**Solution:**
Check line 465 in code - should be **POST**, not PATCH:

```cpp
httpResponseCode = http.POST(historyPayload);  // ✅ Correct (POST)
// httpResponseCode = http.PATCH(historyPayload);  // ❌ Wrong!
```

---

### **❌ ERROR: Brownout Detector / Boot Loop**

**Symptom:**
ESP32 keeps restarting:
```
Brownout detector was triggered
ets Jun  8 2016 00:22:57
rst:0x10 (RTCWDT_RTC_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)
```

**Cause:**
Insufficient power supply.

**Solutions:**

1. **Use Adequate Power Supply:**
   - ESP32 + sensors need **at least 1A**
   - Use 5V 2A power adapter
   - USB power from PC may not be enough

2. **Add Capacitor:**
   - 100µF capacitor between VIN and GND
   - Helps stabilize power during WiFi transmission

3. **Check USB Cable:**
   - Use quality USB cable (not cheap thin ones)
   - Direct connection to power adapter, not USB hub

---

### **❌ ERROR: SSL Connection Failed**

**Symptom:**
```
❌ HTTP Error: -1
Error: connection refused
```

**Cause:**
HTTPClient can't establish HTTPS connection to Firestore.

**Solutions:**

1. **Check NTP Time:**
   - SSL requires accurate system time
   - ESP32 syncs time via NTP in setup
   
   ```cpp
   configTime(7 * 3600, 0, "pool.ntp.org", "time.nist.gov");
   delay(5000);  // ← Increase delay to ensure time sync
   ```

2. **Verify Firestore URL:**
   ```cpp
   String FIRESTORE_BASE_URL = "https://firestore.googleapis.com/v1/projects/" + 
                                String(FIREBASE_PROJECT_ID) + 
                                "/databases/(default)/documents";
   ```

3. **Check Internet Connection:**
   - Ping google.com from browser on same network
   - Check if router blocks HTTPS (some corporate networks do)

---

## 🧪 **TESTING & DEBUGGING**

### **Serial Monitor Debug Levels:**

**Normal Operation:**
```
✅ SETUP COMPLETE - Starting main loop...

╔═══════════════════════════════════════════════════════════════╗
║           📊 READING & SENDING SENSOR DATA                    ║
╚════════════════════════════════════════════════════════════════╝
┌────────────────────────────────────────────────────────────────┐
│                    SENSOR READINGS                             │
├────────────────────────────────────────────────────────────────┤
│ 🌡️  Temperature:   28.5 °C  ✅ Normal          │
│ 💧 Humidity:       65.0 %   ✅ Normal          │
│ 💦 Water Level:    8.0 cm  ✅ Normal          │
│ ☀️  Light Level:    12000 lux  ✅ Normal       │
│ ⚙️  Pump Status:    OFF                                        │
└────────────────────────────────────────────────────────────────┘

📤 Sending to Firebase Firestore...
  URL: https://firestore.googleapis.com/v1/projects/.../sectors/SEC-001
  Payload (first 200 chars): {"fields":{"data":{"mapValue":{"fields":{...
  ✅ Sector data updated (HTTP 200)
  ✅ Sensor history added (HTTP 200)
✅ Data transmission complete!
```

---

### **Error Indicators:**

| Symbol | Meaning | Action |
|--------|---------|--------|
| ✅ | Success | All good! |
| ⚠️ | Warning | Check but not critical |
| ❌ | Error | Fix required |
| ℹ️ | Info | Normal informational message |
| 🎮 | Command | Pump command received |

---

### **Quick Diagnostic Commands:**

**Test WiFi:**
```cpp
if (WiFi.status() == WL_CONNECTED) {
  Serial.println("WiFi OK: " + WiFi.localIP().toString());
} else {
  Serial.println("WiFi FAIL");
}
```

**Test Firebase Connection:**
```
Look for HTTP 200 responses
HTTP 400 = Bad request (JSON error)
HTTP 403 = Permission denied (rules error)
HTTP 404 = Not found (wrong path/document)
```

**Test Sensors:**
```
Run testAllSensors() in setup()
Check for "Failed to read" messages
Verify values are reasonable (not 0, NaN, or inf)
```

---

## 📋 **CHECKLIST BEFORE ASKING FOR HELP**

Before posting in forum/chat, verify:

- [ ] ✅ WiFi credentials correct (SSID & password)
- [ ] ✅ WiFi is 2.4 GHz (not 5 GHz)
- [ ] ✅ Firebase Project ID correct
- [ ] ✅ Firebase API Key correct
- [ ] ✅ Sector ID unique (SEC-001, SEC-002, etc)
- [ ] ✅ Power supply adequate (5V 2A minimum)
- [ ] ✅ All sensors wired correctly
- [ ] ✅ Serial Monitor at 115200 baud
- [ ] ✅ Latest code uploaded (with JSON fix)
- [ ] ✅ Firebase rules allow writes

**Include this info when asking for help:**
1. Full Serial Monitor output (copy entire log)
2. Firebase Project ID (can be fake for privacy)
3. ESP32 board version (DevKit V1, NodeMCU, etc)
4. Sensor types used (DHT22, JSN-SR04T, etc)
5. Error messages (exact text, not screenshot)

---

## 🎉 **SUCCESS INDICATORS**

You know everything works when you see:

```
✅ SETUP COMPLETE - Starting main loop...

(Every 20 seconds:)
✅ Sector data updated (HTTP 200)
✅ Sensor history added (HTTP 200)
✅ Data transmission complete!

(Every 5 seconds, when pump command exists:)
(No output = no new command, which is normal)

(When pump command received:)
🎮 New pump command received: ON
  ✅ Pompa DINYALAKAN (SSR ON)
  ✅ Command acknowledged (executed = true)
```

**AND**

On web dashboard:
- ✅ Data updates every 20 seconds
- ✅ Timestamp shows current time
- ✅ Sensor values match Serial Monitor
- ✅ Pump control works (click button → ESP32 responds in 5 seconds)

---

## 🆘 **EMERGENCY RESET**

If everything is broken and you want to start fresh:

1. **Upload Blank Sketch:**
   ```cpp
   void setup() {
     Serial.begin(115200);
     Serial.println("ESP32 Reset");
   }
   void loop() {
     delay(1000);
   }
   ```

2. **Power cycle ESP32** (unplug + replug)

3. **Upload production code again**

4. **Open Serial Monitor** (115200 baud)

5. **Verify setup sequence** completes

---

## 📚 **RELATED DOCUMENTATION**

- **ESP32_PRODUCTION_CODE.ino** - Latest working code
- **ESP32_SETUP_GUIDE_PRODUCTION.md** - Hardware setup
- **WIRING_VISUAL_DIAGRAM.md** - Pin connections
- **ESP32_QUICK_REFERENCE.md** - Quick commands
- **KONSEP_KERJA_SISTEM_LENGKAP.md** - System architecture

---

## 💡 **TIPS FOR STABLE OPERATION**

1. **Use quality components** (fake sensors often fail)
2. **Stable power supply** (not USB from PC)
3. **Strong WiFi signal** (use WiFi extender if needed)
4. **Keep code updated** (check for bug fixes)
5. **Monitor Serial logs** regularly (catch issues early)

---

**MOST IMPORTANT FIX FOR HTTP 400 ERROR:**

**Change line 502 from `}}}}` to `}}}`** ← THIS IS THE FIX! ✅

---

**Need more help? Check Serial Monitor output and compare with examples in this guide!** 🚀

Updated: 2026-02-03
