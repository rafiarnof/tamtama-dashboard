// ========================================
// TAMTAMA - ESP32 PRODUCTION v2.1
// HidroTower IoT Monitoring System
// ========================================
// CHANGELOG v2.1:
//   - Fix: endpoint URL sesuai server (/sensor-update, /pump-command)
//   - Fix: RELAY_PIN pindah dari GPIO34 (input-only!) ke GPIO25
//   - Fix: WiFiClientSecure + setInsecure() untuk HTTPS
//   - Fix: readUltrasonic() sekarang dipanggil di readAllSensors()
//   - Add: DNS test & HTTP connectivity diagnostics
//   - Add: Captive portal detection
//   - Add: Serial commands (info, health, upload, dns, diag)
// ========================================

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ========================================
// CONFIGURATION - EDIT SESUAI KEBUTUHAN
// ========================================

// WiFi Configuration
const char* WIFI_SSID = "JARKAM_TNI_AD";         // Ganti dengan SSID WiFi Anda
const char* WIFI_PASSWORD = "tniad.42";                   // Ganti dengan password WiFi Anda

// Supabase Configuration
const char* SUPABASE_PROJECT_ID = "wgjudfgqjqorkhdlvlgc";
const char* SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnanVkZmdxanFvcmtoZGx2bGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDA4MzEsImV4cCI6MjA5NDcxNjgzMX0.0VZJGMIVTn4jYoAAM5e-aZynmpoV7sboshPgREPrrog";

// Sector ID - SETIAP ESP32 HARUS PUNYA ID UNIK!
const char* SECTOR_ID = "SEC-001";  // Ganti: SEC-001 sampai SEC-010

// ========================================
// SERVER ENDPOINTS (JANGAN DIUBAH!)
// ========================================

String BASE_URL = String("https://") + SUPABASE_PROJECT_ID + ".supabase.co/functions/v1/make-server-5aa965b0";
String UPLOAD_ENDPOINT      = BASE_URL + "/sensor-update";
String COMMAND_ENDPOINT     = BASE_URL + "/pump-command/" + SECTOR_ID;
String ACKNOWLEDGE_ENDPOINT = BASE_URL + "/pump-acknowledge/" + SECTOR_ID;
String HEALTH_ENDPOINT      = BASE_URL + "/esp32-test";

// Host untuk DNS test
const char* SUPABASE_HOST = "wgjudfgqjqorkhdlvlgc.supabase.co";

// Timing Configuration (milliseconds)
const unsigned long UPLOAD_INTERVAL = 20000;      // Upload setiap 20 detik
const unsigned long POLL_INTERVAL = 5000;         // Poll command setiap 5 detik
const unsigned long WIFI_RETRY_INTERVAL = 30000;  // Retry WiFi setiap 30 detik
const unsigned long HTTP_TIMEOUT = 15000;         // HTTP timeout 15 detik
const unsigned long HEALTH_CHECK_INTERVAL = 60000;// Health check setiap 60 detik

// ========================================
// PIN ASSIGNMENTS
// ========================================
// PENTING: GPIO34-39 adalah INPUT-ONLY pada ESP32!
// Jangan gunakan GPIO34-39 untuk output (relay, LED, dll)
// ========================================

#define DHT_PIN 4           // GPIO4  - Data pin DHT22
#define DHT_TYPE DHT22      // DHT22 (AM2302)
#define LDR_PIN 34          // GPIO34 - Analog input untuk LDR (ADC1_CH6) - INPUT ONLY OK
#define TRIG_PIN 18         // GPIO18 - Trigger pin HC-SR04
#define ECHO_PIN 19         // GPIO19 - Echo pin HC-SR04
#define RELAY_PIN 25        // GPIO25 - Relay control pin (JANGAN pakai GPIO34!)
#define LED_PIN 2           // GPIO2  - Built-in LED

DHT dht(DHT_PIN, DHT_TYPE);

// WiFiClientSecure untuk HTTPS
WiFiClientSecure secureClient;

// Timing variables
unsigned long lastUploadTime = 0;
unsigned long lastPollTime = 0;
unsigned long lastWiFiRetry = 0;
unsigned long lastHealthCheck = 0;

// Sensor data
float temperature = 0.0;
float humidity = 0.0;
int lightLevel = 0;
float waterLevel = 0.0;
String pumpStatus = "ON";

// Connection status
bool wifiConnected = false;
bool serverConnected = false;
bool dnsWorks = false;
bool tlsWorks = false;
int uploadErrorCount = 0;
int pollErrorCount = 0;
int consecutiveUploadSuccess = 0;

// ========================================
// SETUP FUNCTION
// ========================================

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n\n");
  Serial.println("================================================");
  Serial.println("  TAMTAMA - ESP32 PRODUCTION v2.1");
  Serial.println("  HidroTower IoT Monitoring System");
  Serial.println("================================================");
  Serial.println("Sector ID    : " + String(SECTOR_ID));
  Serial.println("Project ID   : " + String(SUPABASE_PROJECT_ID));
  Serial.println("Upload URL   : " + UPLOAD_ENDPOINT);
  Serial.println("Command URL  : " + COMMAND_ENDPOINT);
  Serial.println("================================================\n");

  initializePins();
  dht.begin();

  // Setup WiFiClientSecure - skip certificate verification
  secureClient.setInsecure();

  connectWiFi();

  if (wifiConnected) {
    // === STEP 1: Test DNS ===
    Serial.println("\n=== CONNECTIVITY DIAGNOSTICS ===");
    testDNS();

    // === STEP 2: Detect captive portal ===
    detectCaptivePortal();

    // === STEP 3: Test TLS connection ===
    testTLSConnection();

    // === STEP 4: Health check ===
    if (dnsWorks) {
      checkServerHealth();
    }

    // === STEP 5: First upload ===
    if (serverConnected) {
      readAllSensors();
      uploadSensorData();
    } else {
      Serial.println("\n!!! SERVER TIDAK TERJANGKAU !!!");
      Serial.println("Kemungkinan penyebab:");
      if (!dnsWorks) {
        Serial.println("  -> DNS GAGAL: WiFi mungkin punya captive portal");
        Serial.println("     Buka browser di HP, konek WiFi yang sama,");
        Serial.println("     lalu buka http://192.168.1.1 atau http://neverssl.com");
        Serial.println("     untuk login ke captive portal terlebih dahulu.");
      } else if (!tlsWorks) {
        Serial.println("  -> TLS GAGAL: Jaringan memblokir HTTPS ke server eksternal");
        Serial.println("     Coba ganti ke WiFi HP (hotspot) untuk test.");
      } else {
        Serial.println("  -> Edge Function mungkin belum aktif/deploy");
      }
      Serial.println("\n>>> SOLUSI TERCEPAT: Ganti ke Hotspot HP <<<");
      Serial.println("    1. Nyalakan hotspot di HP");
      Serial.println("    2. Ubah WIFI_SSID dan WIFI_PASSWORD di kode");
      Serial.println("    3. Upload ulang ke ESP32");
    }
    Serial.println("=== END DIAGNOSTICS ===\n");
  }

  Serial.println("\n================================================");
  Serial.println("  ESP32 READY - Monitoring dimulai!");
  Serial.println("  Ketik 'help' di Serial Monitor untuk commands");
  Serial.println("================================================\n");
}

// ========================================
// MAIN LOOP
// ========================================

void loop() {
  unsigned long currentMillis = millis();

  // Check serial commands
  handleSerialCommands();

  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    serverConnected = false;
    digitalWrite(LED_PIN, LOW);

    if (currentMillis - lastWiFiRetry >= WIFI_RETRY_INTERVAL) {
      Serial.println("\n--- WiFi disconnected. Reconnecting... ---");
      connectWiFi();
      lastWiFiRetry = currentMillis;
    }
    delay(1000);
    return;
  }

  wifiConnected = true;

  // Periodic health check
  if (currentMillis - lastHealthCheck >= HEALTH_CHECK_INTERVAL) {
    checkServerHealth();
    lastHealthCheck = currentMillis;
  }

  // Upload sensor data setiap 20 detik
  if (currentMillis - lastUploadTime >= UPLOAD_INTERVAL) {
    readAllSensors();
    uploadSensorData();
    lastUploadTime = currentMillis;
  }

  // Poll pump commands setiap 5 detik
  if (currentMillis - lastPollTime >= POLL_INTERVAL) {
    pollPumpCommand();
    lastPollTime = currentMillis;
  }

  // LED indicator
  if (serverConnected) {
    // Slow blink = all good
    digitalWrite(LED_PIN, (currentMillis / 1000) % 2 == 0 ? HIGH : LOW);
  } else if (wifiConnected) {
    // Fast blink = WiFi OK but server unreachable
    digitalWrite(LED_PIN, (currentMillis / 250) % 2 == 0 ? HIGH : LOW);
  }

  delay(100);
}

// ========================================
// PIN INITIALIZATION
// ========================================

void initializePins() {
  pinMode(RELAY_PIN, OUTPUT);
  // Karena relay umumnya bertipe Active Low: LOW = Menyala, HIGH = Mati
  digitalWrite(RELAY_PIN, LOW);
  Serial.println("[PIN] Relay      : GPIO" + String(RELAY_PIN) + " (OUTPUT - DEFAULT ON/LOW)");

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.println("[PIN] Ultrasonic : TRIG=GPIO" + String(TRIG_PIN) + " ECHO=GPIO" + String(ECHO_PIN));

  Serial.println("[PIN] LDR        : GPIO" + String(LDR_PIN) + " (ADC INPUT)");
  Serial.println("[PIN] DHT22      : GPIO" + String(DHT_PIN));

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  Serial.println("[PIN] LED        : GPIO" + String(LED_PIN) + " (OUTPUT)");
}

// ========================================
// WIFI CONNECTION
// ========================================

void connectWiFi() {
  Serial.println("\n[WiFi] Connecting to: " + String(WIFI_SSID));

  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true);
  delay(100);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] CONNECTED!");
    Serial.println("[WiFi] IP      : " + WiFi.localIP().toString());
    Serial.println("[WiFi] RSSI    : " + String(WiFi.RSSI()) + " dBm");
    Serial.println("[WiFi] Gateway : " + WiFi.gatewayIP().toString());
    Serial.println("[WiFi] DNS     : " + WiFi.dnsIP().toString());
    Serial.println("[WiFi] Subnet  : " + WiFi.subnetMask().toString());
    wifiConnected = true;
  } else {
    Serial.println("\n[WiFi] FAILED after " + String(attempts) + " attempts");
    Serial.println("[WiFi] Status code: " + String(WiFi.status()));
    wifiConnected = false;
  }
}

// ========================================
// DNS RESOLUTION TEST
// ========================================

void testDNS() {
  Serial.println("\n[DNS] Resolving: " + String(SUPABASE_HOST));

  IPAddress resolvedIP;
  int result = WiFi.hostByName(SUPABASE_HOST, resolvedIP);

  if (result == 1 && resolvedIP != IPAddress(0, 0, 0, 0)) {
    Serial.println("[DNS] SUCCESS! " + String(SUPABASE_HOST) + " = " + resolvedIP.toString());
    dnsWorks = true;
  } else {
    Serial.println("[DNS] FAILED! Cannot resolve " + String(SUPABASE_HOST));
    Serial.println("[DNS] Ini berarti:");
    Serial.println("  - DNS server tidak bisa meresolve domain Supabase");
    Serial.println("  - WiFi mungkin punya captive portal (perlu login browser)");
    Serial.println("  - Atau jaringan memblokir DNS ke domain .supabase.co");
    dnsWorks = false;

    // Try Google DNS test
    Serial.println("\n[DNS] Testing with google.com...");
    IPAddress googleIP;
    if (WiFi.hostByName("google.com", googleIP) == 1) {
      Serial.println("[DNS] google.com = " + googleIP.toString() + " (DNS works for other domains)");
      Serial.println("[DNS] -> Supabase domain mungkin diblokir oleh jaringan");
    } else {
      Serial.println("[DNS] google.com juga GAGAL -> DNS server bermasalah / captive portal");
    }
  }
}

// ========================================
// CAPTIVE PORTAL DETECTION
// ========================================

void detectCaptivePortal() {
  Serial.println("\n[PORTAL] Checking for captive portal...");

  // Try HTTP (not HTTPS) request to a known endpoint
  // Captive portals redirect HTTP requests to their login page
  HTTPClient http;
  http.begin("http://connectivitycheck.gstatic.com/generate_204");
  http.setTimeout(5000);
  http.setFollowRedirects(HTTPC_DISABLE_FOLLOW_REDIRECTS);

  int httpCode = http.GET();

  if (httpCode == 204) {
    Serial.println("[PORTAL] No captive portal detected (HTTP 204 OK)");
  } else if (httpCode == 302 || httpCode == 301 || httpCode == 200) {
    String location = http.header("Location");
    Serial.println("[PORTAL] !!! CAPTIVE PORTAL TERDETEKSI !!!");
    Serial.println("[PORTAL] HTTP " + String(httpCode));
    if (location.length() > 0) {
      Serial.println("[PORTAL] Redirect ke: " + location);
    }
    Serial.println("[PORTAL] >>> Anda HARUS login ke WiFi lewat browser dulu! <<<");
    Serial.println("[PORTAL] 1. Sambungkan HP ke WiFi '" + String(WIFI_SSID) + "'");
    Serial.println("[PORTAL] 2. Buka browser, akses halaman apapun");
    Serial.println("[PORTAL] 3. Login/accept di halaman captive portal");
    Serial.println("[PORTAL] 4. Setelah itu restart ESP32");
  } else if (httpCode < 0) {
    Serial.println("[PORTAL] HTTP request gagal (code " + String(httpCode) + ")");
    Serial.println("[PORTAL] Jaringan mungkin memblokir HTTP keluar juga");
  } else {
    Serial.println("[PORTAL] Unexpected response: HTTP " + String(httpCode));
  }

  http.end();
}

// ========================================
// TLS CONNECTION TEST
// ========================================

void testTLSConnection() {
  Serial.println("\n[TLS] Testing HTTPS connection to Supabase...");

  if (!dnsWorks) {
    Serial.println("[TLS] Skipped - DNS tidak berfungsi");
    tlsWorks = false;
    return;
  }

  // Direct TLS test menggunakan WiFiClientSecure
  WiFiClientSecure testClient;
  testClient.setInsecure(); // Skip cert verification

  Serial.println("[TLS] Connecting to " + String(SUPABASE_HOST) + ":443 ...");

  unsigned long startMs = millis();
  bool connected = testClient.connect(SUPABASE_HOST, 443, 10000); // 10s timeout
  unsigned long elapsed = millis() - startMs;

  if (connected) {
    Serial.println("[TLS] SUCCESS! Connected in " + String(elapsed) + " ms");
    Serial.println("[TLS] HTTPS connection to Supabase is WORKING");
    tlsWorks = true;
    testClient.stop();
  } else {
    Serial.println("[TLS] FAILED after " + String(elapsed) + " ms");
    Serial.println("[TLS] Kemungkinan penyebab:");
    Serial.println("  1. Firewall jaringan memblokir port 443 (HTTPS)");
    Serial.println("  2. Deep packet inspection memblokir TLS ke domain tertentu");
    Serial.println("  3. Jaringan terlalu lambat / timeout");
    Serial.println("\n>>> SOLUSI: Gunakan Hotspot HP untuk bypass firewall <<<");
    tlsWorks = false;
  }
}

// ========================================
// SERVER HEALTH CHECK
// ========================================

void checkServerHealth() {
  if (!wifiConnected) return;

  Serial.println("\n[HEALTH] Checking server...");

  HTTPClient http;
  http.begin(secureClient, HEALTH_ENDPOINT);
  http.setTimeout(HTTP_TIMEOUT);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_ANON_KEY));

  int httpCode = http.GET();

  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("[HEALTH] Server OK! Response: " + response);
    serverConnected = true;
  } else if (httpCode > 0) {
    Serial.println("[HEALTH] Server returned HTTP " + String(httpCode));
    String response = http.getString();
    Serial.println("[HEALTH] Body: " + response);
    serverConnected = true;
  } else {
    Serial.println("[HEALTH] FAILED! HTTP Code: " + String(httpCode));
    Serial.println("[HEALTH] Error: " + http.errorToString(httpCode));
    serverConnected = false;
  }

  http.end();
}

// ========================================
// READ ALL SENSORS
// ========================================

void readAllSensors() {
  Serial.println("\n--- Reading Sensors ---");

  // Read DHT22 (Temperature & Humidity)
  float newTemp = dht.readTemperature();
  float newHum = dht.readHumidity();

  if (!isnan(newTemp) && !isnan(newHum)) {
    temperature = newTemp;
    humidity = newHum;
    Serial.println("[DHT22] Temp: " + String(temperature, 1) + " C | Humidity: " + String(humidity, 1) + " %");
  } else {
    Serial.println("[DHT22] Read error! Using last: " + String(temperature, 1) + " C / " + String(humidity, 1) + " %");
  }

  // Read LDR (Light Level)
  int rawLDR = analogRead(LDR_PIN);
  lightLevel = map(rawLDR, 0, 4095, 100, 0);
  lightLevel = constrain(lightLevel, 0, 100);
  Serial.println("[LDR]   Raw: " + String(rawLDR) + " | Light: " + String(lightLevel) + " %");

  // Read Ultrasonic (Water Level)
  waterLevel = readUltrasonic();
  Serial.println("[SONIC] Distance: " + String(waterLevel, 1) + " cm");

  Serial.println("[PUMP]  Status: " + pumpStatus);
  Serial.println("--- End Sensors ---");
}

float readUltrasonic() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) {
    Serial.println("  [SONIC] No echo received (timeout)");
    return 0.0;
  }

  float distance = (duration * 0.0343) / 2.0;

  if (distance < 2.0 || distance > 400.0) {
    Serial.println("  [SONIC] Out of range: " + String(distance) + " cm");
    return 0.0;
  }

  return distance;
}

// ========================================
// UPLOAD SENSOR DATA TO SUPABASE
// ========================================

void uploadSensorData() {
  if (!wifiConnected) {
    Serial.println("[UPLOAD] Skipped - WiFi not connected");
    return;
  }

  Serial.println("\n[UPLOAD] Sending sensor data...");

  HTTPClient http;
  http.begin(secureClient, UPLOAD_ENDPOINT);
  http.setTimeout(HTTP_TIMEOUT);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_ANON_KEY));

  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["sectorId"] = SECTOR_ID;
  doc["temperature"] = round(temperature * 10) / 10.0;
  doc["humidity"] = round(humidity * 10) / 10.0;
  doc["lightLevel"] = lightLevel;
  doc["waterLevel"] = round(waterLevel * 10) / 10.0;
  doc["pumpStatus"] = pumpStatus;

  String payload;
  serializeJson(doc, payload);

  Serial.println("[UPLOAD] Payload: " + payload);

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    String response = http.getString();

    if (httpCode == 200) {
      Serial.println("[UPLOAD] SUCCESS! HTTP 200");
      Serial.println("[UPLOAD] Response: " + response);
      uploadErrorCount = 0;
      consecutiveUploadSuccess++;
      serverConnected = true;

      if (consecutiveUploadSuccess == 1) {
        Serial.println("\n  >>> KONEKSI BERHASIL! Data sensor mengalir ke dashboard. <<<\n");
      }
    } else {
      Serial.println("[UPLOAD] Server error HTTP " + String(httpCode));
      Serial.println("[UPLOAD] Response: " + response);
      uploadErrorCount++;
    }
  } else {
    Serial.println("[UPLOAD] FAILED! HTTP Code: " + String(httpCode));
    Serial.println("[UPLOAD] Error: " + http.errorToString(httpCode));
    uploadErrorCount++;
    consecutiveUploadSuccess = 0;
    serverConnected = false;

    if (httpCode == -1 && uploadErrorCount <= 3) {
      Serial.println("[UPLOAD] === DIAGNOSIS ===");
      Serial.println("[UPLOAD] HTTP -1 = Connection failed");
      Serial.println("[UPLOAD] WiFi RSSI: " + String(WiFi.RSSI()) + " dBm");
      Serial.println("[UPLOAD] Free heap: " + String(ESP.getFreeHeap()));
      Serial.println("[UPLOAD] Ketik 'diag' untuk full diagnostics");
      Serial.println("[UPLOAD] ================");
    }
  }

  http.end();

  if (uploadErrorCount > 20) {
    Serial.println("[UPLOAD] Too many errors. Restarting ESP32...");
    delay(2000);
    ESP.restart();
  }
}

// ========================================
// POLL PUMP COMMAND FROM SERVER
// ========================================

void pollPumpCommand() {
  if (!wifiConnected) return;

  HTTPClient http;
  http.begin(secureClient, COMMAND_ENDPOINT);
  http.setTimeout(HTTP_TIMEOUT);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_ANON_KEY));

  int httpCode = http.GET();

  if (httpCode == 200) {
    String response = http.getString();

    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {
      String commandStatus = doc["status"] | "OFF";
      bool executed = doc["executed"] | true;

      if (!executed && commandStatus != pumpStatus) {
        Serial.println("\n[PUMP CMD] New command: " + commandStatus);
        setPumpStatus(commandStatus);
        acknowledgeCommand();
      }

      pollErrorCount = 0;
    } else {
      Serial.println("[POLL] JSON parse error: " + String(error.c_str()));
    }
  } else if (httpCode > 0 && httpCode != 404) {
    Serial.println("[POLL] HTTP " + String(httpCode));
    pollErrorCount++;
  } else if (httpCode < 0) {
    pollErrorCount++;
  }

  http.end();

  if (pollErrorCount > 30) {
    Serial.println("[POLL] Too many errors. Restarting...");
    delay(2000);
    ESP.restart();
  }
}

// ========================================
// ACKNOWLEDGE PUMP COMMAND
// ========================================

void acknowledgeCommand() {
  if (!wifiConnected) return;

  Serial.println("[ACK] Acknowledging command...");

  HTTPClient http;
  http.begin(secureClient, ACKNOWLEDGE_ENDPOINT);
  http.setTimeout(HTTP_TIMEOUT);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_ANON_KEY));

  int httpCode = http.POST("{}");

  if (httpCode == 200) {
    Serial.println("[ACK] Command acknowledged successfully");
  } else {
    Serial.println("[ACK] Failed, HTTP " + String(httpCode));
  }

  http.end();
}

// ========================================
// PUMP CONTROL
// ========================================

void setPumpStatus(String status) {
  status.toUpperCase();

  if (status == "ON") {
    digitalWrite(RELAY_PIN, LOW); // Active Low: LOW berarti Relay Menyala
    pumpStatus = "ON";
    Serial.println("[PUMP] >>> PUMP ON <<<");
  } else if (status == "OFF") {
    digitalWrite(RELAY_PIN, HIGH); // Active Low: HIGH berarti Relay Mati
    pumpStatus = "OFF";
    Serial.println("[PUMP] >>> PUMP OFF <<<");
  } else {
    Serial.println("[PUMP] Invalid status: " + status);
  }
}

// ========================================
// SERIAL COMMANDS
// ========================================

void handleSerialCommands() {
  if (!Serial.available()) return;

  String cmd = Serial.readStringUntil('\n');
  cmd.trim();
  cmd.toLowerCase();

  if (cmd == "help") {
    Serial.println("\n=== SERIAL COMMANDS ===");
    Serial.println("  help   - Tampilkan menu ini");
    Serial.println("  info   - System information");
    Serial.println("  diag   - Full connectivity diagnostics");
    Serial.println("  dns    - Test DNS resolution");
    Serial.println("  tls    - Test TLS connection");
    Serial.println("  health - Server health check");
    Serial.println("  upload - Force upload sensor data");
    Serial.println("  on     - Nyalakan pompa manual");
    Serial.println("  off    - Matikan pompa manual");
    Serial.println("  restart- Restart ESP32");
    Serial.println("========================\n");
  }
  else if (cmd == "info") {
    printSystemInfo();
  }
  else if (cmd == "diag") {
    Serial.println("\n=== FULL DIAGNOSTICS ===");
    testDNS();
    detectCaptivePortal();
    testTLSConnection();
    checkServerHealth();
    Serial.println("=== END DIAGNOSTICS ===\n");
  }
  else if (cmd == "dns") {
    testDNS();
  }
  else if (cmd == "tls") {
    testTLSConnection();
  }
  else if (cmd == "health") {
    checkServerHealth();
  }
  else if (cmd == "upload") {
    readAllSensors();
    uploadSensorData();
  }
  else if (cmd == "on") {
    setPumpStatus("ON");
  }
  else if (cmd == "off") {
    setPumpStatus("OFF");
  }
  else if (cmd == "restart") {
    Serial.println("Restarting...");
    delay(500);
    ESP.restart();
  }
  else if (cmd.length() > 0) {
    Serial.println("Unknown: '" + cmd + "'. Ketik 'help' untuk daftar command.");
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

void printSystemInfo() {
  Serial.println("\n================================================");
  Serial.println("  SYSTEM INFORMATION");
  Serial.println("================================================");
  Serial.println("Firmware      : TAMTAMA ESP32 v2.1");
  Serial.println("Sector ID     : " + String(SECTOR_ID));
  Serial.println("WiFi SSID     : " + String(WIFI_SSID));
  Serial.println("WiFi Status   : " + String(wifiConnected ? "Connected" : "Disconnected"));
  if (wifiConnected) {
    Serial.println("IP Address    : " + WiFi.localIP().toString());
    Serial.println("RSSI          : " + String(WiFi.RSSI()) + " dBm");
    Serial.println("Gateway       : " + WiFi.gatewayIP().toString());
    Serial.println("DNS Server    : " + WiFi.dnsIP().toString());
  }
  Serial.println("DNS Works     : " + String(dnsWorks ? "Yes" : "No"));
  Serial.println("TLS Works     : " + String(tlsWorks ? "Yes" : "No"));
  Serial.println("Server OK     : " + String(serverConnected ? "Yes" : "No"));
  Serial.println("Uptime        : " + String(millis() / 1000) + " sec");
  Serial.println("Free Heap     : " + String(ESP.getFreeHeap()) + " bytes");
  Serial.println("Upload Errors : " + String(uploadErrorCount));
  Serial.println("Poll Errors   : " + String(pollErrorCount));
  Serial.println("Pump Status   : " + pumpStatus);
  Serial.println("Last Sensor:");
  Serial.println("  Temp        : " + String(temperature, 1) + " C");
  Serial.println("  Humidity    : " + String(humidity, 1) + " %");
  Serial.println("  Light       : " + String(lightLevel) + " %");
  Serial.println("  Water       : " + String(waterLevel, 1) + " cm");
  Serial.println("================================================");
  Serial.println("Server URLs:");
  Serial.println("  Upload  : " + UPLOAD_ENDPOINT);
  Serial.println("  Command : " + COMMAND_ENDPOINT);
  Serial.println("  Health  : " + HEALTH_ENDPOINT);
  Serial.println("================================================\n");
}
