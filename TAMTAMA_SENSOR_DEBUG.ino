/*
 * ========================================
 * TAMTAMA - SENSOR DEBUG & TESTING TOOL
 * ========================================
 * 
 * Tool untuk testing dan debugging semua sensor IoT
 * Tanpa koneksi WiFi/Supabase - Pure Hardware Testing
 * 
 * Version: 1.0
 * Last Updated: 20 Februari 2026
 * 
 * FITUR:
 * - Test DHT22 (Temperature & Humidity)
 * - Test LDR (Light sensor)
 * - Test HC-SR04 (Ultrasonic water level)
 * - Test Relay (Pump control)
 * - Test LED indicator
 * - Real-time monitoring semua sensor
 * - Deteksi error hardware otomatis
 * - Statistik pembacaan sensor
 * 
 * CARA PENGGUNAAN:
 * 1. Upload code ini ke ESP32
 * 2. Buka Serial Monitor (115200 baud)
 * 3. Lihat output testing setiap sensor
 * 4. Kirim command via Serial untuk test manual
 * 
 * SERIAL COMMANDS:
 * - 'h' = Show help menu
 * - '1' = Test DHT22 only
 * - '2' = Test LDR only
 * - '3' = Test Ultrasonic only
 * - '4' = Test Relay ON
 * - '5' = Test Relay OFF
 * - '6' = Toggle LED
 * - 'a' = Test all sensors (continuous)
 * - 's' = Show statistics
 * - 'r' = Reset statistics
 * - 'p' = Pump test cycle (ON 3s, OFF 3s, repeat 5x)
 * 
 * ========================================
 */

#include <DHT.h>

// ========================================
// PIN CONFIGURATION (Same as production)
// ========================================

#define DHT_PIN 4           // GPIO4 - DHT22 Data
#define DHT_TYPE DHT22      // DHT22 sensor type

#define LDR_PIN 34          // GPIO34 - LDR Analog input

#define TRIG_PIN 5          // GPIO5 - Ultrasonic Trigger
#define ECHO_PIN 18         // GPIO18 - Ultrasonic Echo

#define RELAY_PIN 19        // GPIO19 - Relay control
#define LED_PIN 2           // GPIO2 - Status LED

// ========================================
// GLOBAL VARIABLES
// ========================================

DHT dht(DHT_PIN, DHT_TYPE);

// Test mode
bool continuousMode = false;
bool ledState = false;

// Statistics
struct SensorStats {
  int dhtReadCount = 0;
  int dhtErrorCount = 0;
  int ultrasonicReadCount = 0;
  int ultrasonicErrorCount = 0;
  int ldrReadCount = 0;
  float minTemp = 999.0;
  float maxTemp = -999.0;
  float minHumidity = 999.0;
  float maxHumidity = -999.0;
  float minWaterLevel = 999.0;
  float maxWaterLevel = -999.0;
  int minLight = 999;
  int maxLight = -999;
};

SensorStats stats;

// Timing
unsigned long lastTestTime = 0;
const unsigned long TEST_INTERVAL = 2000; // Test every 2 seconds in continuous mode

// ========================================
// SETUP
// ========================================

void setup() {
  Serial.begin(115200);
  delay(2000); // Wait for Serial Monitor to open
  
  printBanner();
  
  // Initialize pins
  initializePins();
  
  // Initialize DHT sensor
  Serial.println("🔧 Initializing DHT22 sensor...");
  dht.begin();
  delay(2000); // DHT needs time to stabilize
  Serial.println("✅ DHT22 initialized\n");
  
  // Run initial full test
  Serial.println("🚀 Running initial sensor test...\n");
  testAllSensors();
  
  printHelp();
}

// ========================================
// MAIN LOOP
// ========================================

void loop() {
  // Check for Serial commands
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    handleCommand(cmd);
  }
  
  // Continuous mode - test all sensors every 2 seconds
  if (continuousMode) {
    if (millis() - lastTestTime >= TEST_INTERVAL) {
      testAllSensors();
      lastTestTime = millis();
    }
  }
  
  delay(100);
}

// ========================================
// PIN INITIALIZATION
// ========================================

void initializePins() {
  Serial.println("🔌 Initializing pins...\n");
  
  // Relay
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  Serial.println("  ✅ Relay (GPIO" + String(RELAY_PIN) + ") - Set to LOW (OFF)");
  
  // Ultrasonic
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.println("  ✅ Ultrasonic TRIG (GPIO" + String(TRIG_PIN) + ")");
  Serial.println("  ✅ Ultrasonic ECHO (GPIO" + String(ECHO_PIN) + ")");
  
  // LDR (ADC - no pinMode needed)
  Serial.println("  ✅ LDR (GPIO" + String(LDR_PIN) + ") - ADC ready");
  
  // LED
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  Serial.println("  ✅ LED (GPIO" + String(LED_PIN) + ") - Set to LOW");
  
  Serial.println();
}

// ========================================
// COMMAND HANDLER
// ========================================

void handleCommand(char cmd) {
  Serial.println("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  switch(cmd) {
    case 'h':
    case 'H':
      printHelp();
      break;
      
    case '1':
      Serial.println("📋 TESTING DHT22 ONLY");
      Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      testDHT22();
      break;
      
    case '2':
      Serial.println("📋 TESTING LDR ONLY");
      Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      testLDR();
      break;
      
    case '3':
      Serial.println("📋 TESTING ULTRASONIC ONLY");
      Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      testUltrasonic();
      break;
      
    case '4':
      Serial.println("📋 RELAY TEST - TURNING ON");
      Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      testRelayOn();
      break;
      
    case '5':
      Serial.println("📋 RELAY TEST - TURNING OFF");
      Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      testRelayOff();
      break;
      
    case '6':
      Serial.println("📋 LED TOGGLE");
      Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      toggleLED();
      break;
      
    case 'a':
    case 'A':
      continuousMode = !continuousMode;
      if (continuousMode) {
        Serial.println("📋 CONTINUOUS MODE - ENABLED");
        Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Serial.println("✅ Testing all sensors every 2 seconds");
        Serial.println("💡 Send 'a' again to stop\n");
        lastTestTime = 0;
      } else {
        Serial.println("📋 CONTINUOUS MODE - DISABLED");
        Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      }
      break;
      
    case 's':
    case 'S':
      Serial.println("📋 SENSOR STATISTICS");
      Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      printStatistics();
      break;
      
    case 'r':
    case 'R':
      Serial.println("📋 RESET STATISTICS");
      Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      resetStatistics();
      break;
      
    case 'p':
    case 'P':
      Serial.println("📋 PUMP CYCLE TEST (5x ON/OFF)");
      Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      testPumpCycle();
      break;
      
    default:
      Serial.println("⚠️  Unknown command: '" + String(cmd) + "'");
      Serial.println("    Type 'h' for help\n");
      break;
  }
}

// ========================================
// TEST FUNCTIONS
// ========================================

void testAllSensors() {
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.println("🔍 TESTING ALL SENSORS");
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.println("Timestamp: " + String(millis() / 1000) + "s\n");
  
  testDHT22();
  Serial.println();
  testLDR();
  Serial.println();
  testUltrasonic();
  
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

void testDHT22() {
  Serial.println("🌡️  DHT22 - Temperature & Humidity Sensor");
  Serial.println("   Pin: GPIO" + String(DHT_PIN));
  Serial.println("   ------------------------------------------");
  
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  
  stats.dhtReadCount++;
  
  if (isnan(temp) || isnan(hum)) {
    Serial.println("   ❌ ERROR: Failed to read from DHT22!");
    Serial.println("   🔍 Possible issues:");
    Serial.println("      - Check wiring (VCC, GND, DATA)");
    Serial.println("      - DHT22 needs 3.3V power");
    Serial.println("      - Wait 2 seconds between reads");
    Serial.println("      - Sensor might be damaged");
    stats.dhtErrorCount++;
  } else {
    Serial.println("   ✅ Temperature: " + String(temp, 1) + " °C");
    Serial.println("   ✅ Humidity:    " + String(hum, 1) + " %");
    
    // Update statistics
    if (temp < stats.minTemp) stats.minTemp = temp;
    if (temp > stats.maxTemp) stats.maxTemp = temp;
    if (hum < stats.minHumidity) stats.minHumidity = hum;
    if (hum > stats.maxHumidity) stats.maxHumidity = hum;
    
    // Validation checks
    if (temp < 0 || temp > 60) {
      Serial.println("   ⚠️  WARNING: Temperature out of normal range (0-60°C)");
    }
    if (hum < 0 || hum > 100) {
      Serial.println("   ⚠️  WARNING: Humidity out of valid range (0-100%)");
    }
    
    // Heat index calculation
    if (temp >= 27 && hum >= 40) {
      float heatIndex = computeHeatIndex(temp, hum);
      Serial.println("   🌡️  Heat Index:  " + String(heatIndex, 1) + " °C");
      if (heatIndex >= 32) {
        Serial.println("   🔥 WARNING: High heat index! Consider cooling.");
      }
    }
  }
}

void testLDR() {
  Serial.println("☀️  LDR - Light Level Sensor");
  Serial.println("   Pin: GPIO" + String(LDR_PIN) + " (ADC)");
  Serial.println("   ------------------------------------------");
  
  int rawValue = analogRead(LDR_PIN);
  int percentage = map(rawValue, 0, 4095, 0, 100);
  
  stats.ldrReadCount++;
  
  Serial.println("   ✅ Raw ADC Value: " + String(rawValue) + " / 4095");
  Serial.println("   ✅ Light Level:   " + String(percentage) + " %");
  
  // Update statistics
  if (percentage < stats.minLight) stats.minLight = percentage;
  if (percentage > stats.maxLight) stats.maxLight = percentage;
  
  // Visual bar
  Serial.print("   📊 [");
  int bars = percentage / 5;
  for (int i = 0; i < 20; i++) {
    if (i < bars) Serial.print("█");
    else Serial.print("░");
  }
  Serial.println("]");
  
  // Light level interpretation
  if (percentage < 20) {
    Serial.println("   🌙 Condition: DARK (Night time)");
  } else if (percentage < 40) {
    Serial.println("   🌥️  Condition: DIM (Cloudy/Indoor)");
  } else if (percentage < 70) {
    Serial.println("   ⛅ Condition: MODERATE (Normal daylight)");
  } else {
    Serial.println("   ☀️  Condition: BRIGHT (Direct sunlight)");
  }
  
  // Validation
  if (rawValue == 0) {
    Serial.println("   ⚠️  WARNING: ADC reading 0 - Check LDR wiring!");
  }
  if (rawValue == 4095) {
    Serial.println("   ⚠️  WARNING: ADC maxed out - Too bright or wiring issue!");
  }
}

void testUltrasonic() {
  Serial.println("🌊 HC-SR04 - Ultrasonic Water Level Sensor");
  Serial.println("   Pins: TRIG=GPIO" + String(TRIG_PIN) + ", ECHO=GPIO" + String(ECHO_PIN));
  Serial.println("   ------------------------------------------");
  
  // Take 3 readings and average
  float reading1 = readUltrasonicRaw();
  delay(100);
  float reading2 = readUltrasonicRaw();
  delay(100);
  float reading3 = readUltrasonicRaw();
  
  stats.ultrasonicReadCount++;
  
  Serial.println("   📏 Reading 1: " + String(reading1, 1) + " cm");
  Serial.println("   📏 Reading 2: " + String(reading2, 1) + " cm");
  Serial.println("   📏 Reading 3: " + String(reading3, 1) + " cm");
  
  if (reading1 == 0 && reading2 == 0 && reading3 == 0) {
    Serial.println("   ❌ ERROR: All readings failed!");
    Serial.println("   🔍 Possible issues:");
    Serial.println("      - Check wiring (VCC=5V, GND, TRIG, ECHO)");
    Serial.println("      - Sensor needs 5V power");
    Serial.println("      - Check if sensor is facing an object");
    Serial.println("      - Valid range: 2-400 cm");
    Serial.println("      - Sensor might be damaged");
    stats.ultrasonicErrorCount++;
  } else {
    // Calculate average (ignore 0 values)
    float sum = 0;
    int validCount = 0;
    if (reading1 > 0) { sum += reading1; validCount++; }
    if (reading2 > 0) { sum += reading2; validCount++; }
    if (reading3 > 0) { sum += reading3; validCount++; }
    
    float avgDistance = (validCount > 0) ? (sum / validCount) : 0;
    
    Serial.println("   ✅ Average Distance: " + String(avgDistance, 1) + " cm");
    
    // Update statistics
    if (avgDistance > 0) {
      if (avgDistance < stats.minWaterLevel) stats.minWaterLevel = avgDistance;
      if (avgDistance > stats.maxWaterLevel) stats.maxWaterLevel = avgDistance;
    }
    
    // Interpretation (assuming sensor mounted above water)
    // Lower distance = Higher water level
    if (avgDistance < 5) {
      Serial.println("   💧 Water Level: VERY HIGH (Critical!)");
    } else if (avgDistance < 15) {
      Serial.println("   💧 Water Level: HIGH");
    } else if (avgDistance < 30) {
      Serial.println("   💧 Water Level: MEDIUM");
    } else if (avgDistance < 50) {
      Serial.println("   💧 Water Level: LOW");
    } else {
      Serial.println("   💧 Water Level: VERY LOW (Critical!)");
    }
    
    // Consistency check
    float maxDiff = max(abs(reading1 - reading2), max(abs(reading2 - reading3), abs(reading1 - reading3)));
    if (maxDiff > 5) {
      Serial.println("   ⚠️  WARNING: Readings inconsistent (±" + String(maxDiff, 1) + " cm variation)");
      Serial.println("      Possible vibration or interference");
    }
  }
}

float readUltrasonicRaw() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  
  if (duration == 0) {
    return 0.0;
  }
  
  float distance = duration * 0.0343 / 2.0;
  
  if (distance < 2.0 || distance > 400.0) {
    return 0.0;
  }
  
  return distance;
}

void testRelayOn() {
  Serial.println("⚡ Turning relay ON (GPIO" + String(RELAY_PIN) + " = HIGH)");
  digitalWrite(RELAY_PIN, HIGH);
  Serial.println("✅ Relay is now ON");
  Serial.println("🔍 Check:");
  Serial.println("   - Relay module LED should light up");
  Serial.println("   - You should hear relay 'click' sound");
  Serial.println("   - Pump should turn on (if connected)");
  Serial.println("\n💡 Send '5' to turn OFF");
}

void testRelayOff() {
  Serial.println("⚡ Turning relay OFF (GPIO" + String(RELAY_PIN) + " = LOW)");
  digitalWrite(RELAY_PIN, LOW);
  Serial.println("✅ Relay is now OFF");
  Serial.println("🔍 Check:");
  Serial.println("   - Relay module LED should turn off");
  Serial.println("   - You should hear relay 'click' sound");
  Serial.println("   - Pump should turn off (if connected)");
  Serial.println("\n💡 Send '4' to turn ON");
}

void toggleLED() {
  ledState = !ledState;
  digitalWrite(LED_PIN, ledState ? HIGH : LOW);
  Serial.println("💡 LED is now: " + String(ledState ? "ON" : "OFF"));
  if (ledState) {
    Serial.println("   ✅ Built-in LED (GPIO" + String(LED_PIN) + ") should be lit");
  } else {
    Serial.println("   ✅ Built-in LED (GPIO" + String(LED_PIN) + ") should be off");
  }
}

void testPumpCycle() {
  Serial.println("🔄 Starting pump cycle test (5 cycles)...\n");
  
  for (int i = 1; i <= 5; i++) {
    Serial.println("Cycle " + String(i) + "/5:");
    
    Serial.println("  ⚡ Pump ON");
    digitalWrite(RELAY_PIN, HIGH);
    digitalWrite(LED_PIN, HIGH);
    delay(3000);
    
    Serial.println("  ⚪ Pump OFF");
    digitalWrite(RELAY_PIN, LOW);
    digitalWrite(LED_PIN, LOW);
    delay(3000);
  }
  
  Serial.println("\n✅ Pump cycle test completed!");
  Serial.println("🔍 If pump didn't cycle, check:");
  Serial.println("   - Relay wiring and power");
  Serial.println("   - Pump power supply (12V)");
  Serial.println("   - Relay type (active HIGH/LOW)");
}

// ========================================
// STATISTICS
// ========================================

void printStatistics() {
  Serial.println("📊 SENSOR STATISTICS");
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.println("Uptime: " + String(millis() / 1000) + " seconds\n");
  
  Serial.println("DHT22:");
  Serial.println("  Total Reads:  " + String(stats.dhtReadCount));
  Serial.println("  Errors:       " + String(stats.dhtErrorCount));
  if (stats.dhtReadCount > 0) {
    float successRate = 100.0 * (stats.dhtReadCount - stats.dhtErrorCount) / stats.dhtReadCount;
    Serial.println("  Success Rate: " + String(successRate, 1) + "%");
  }
  if (stats.minTemp < 999) {
    Serial.println("  Temp Range:   " + String(stats.minTemp, 1) + "°C to " + String(stats.maxTemp, 1) + "°C");
    Serial.println("  Humidity Range: " + String(stats.minHumidity, 1) + "% to " + String(stats.maxHumidity, 1) + "%");
  }
  
  Serial.println("\nLDR:");
  Serial.println("  Total Reads:  " + String(stats.ldrReadCount));
  if (stats.minLight < 999) {
    Serial.println("  Light Range:  " + String(stats.minLight) + "% to " + String(stats.maxLight) + "%");
  }
  
  Serial.println("\nUltrasonic:");
  Serial.println("  Total Reads:  " + String(stats.ultrasonicReadCount));
  Serial.println("  Errors:       " + String(stats.ultrasonicErrorCount));
  if (stats.ultrasonicReadCount > 0) {
    float successRate = 100.0 * (stats.ultrasonicReadCount - stats.ultrasonicErrorCount) / stats.ultrasonicReadCount;
    Serial.println("  Success Rate: " + String(successRate, 1) + "%");
  }
  if (stats.minWaterLevel < 999) {
    Serial.println("  Distance Range: " + String(stats.minWaterLevel, 1) + " cm to " + String(stats.maxWaterLevel, 1) + " cm");
  }
  
  Serial.println("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

void resetStatistics() {
  stats.dhtReadCount = 0;
  stats.dhtErrorCount = 0;
  stats.ultrasonicReadCount = 0;
  stats.ultrasonicErrorCount = 0;
  stats.ldrReadCount = 0;
  stats.minTemp = 999.0;
  stats.maxTemp = -999.0;
  stats.minHumidity = 999.0;
  stats.maxHumidity = -999.0;
  stats.minWaterLevel = 999.0;
  stats.maxWaterLevel = -999.0;
  stats.minLight = 999;
  stats.maxLight = -999;
  
  Serial.println("✅ Statistics reset successfully!\n");
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

float computeHeatIndex(float temp, float hum) {
  // Heat Index formula (simplified)
  return temp + 0.5555 * ((6.11 * exp(5417.7530 * ((1/273.16) - (1/(273.15+temp))))) * (hum/100.0) - 10.0);
}

void printBanner() {
  Serial.println("\n\n");
  Serial.println("╔════════════════════════════════════════╗");
  Serial.println("║   TAMTAMA SENSOR DEBUG & TEST TOOL     ║");
  Serial.println("║   ESP32 Hardware Testing Utility       ║");
  Serial.println("╚════════════════════════════════════════╝");
  Serial.println();
  Serial.println("Version: 1.0");
  Serial.println("Purpose: Hardware sensor testing without WiFi");
  Serial.println("Serial Baud: 115200");
  Serial.println();
}

void printHelp() {
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.println("📖 HELP MENU - Available Commands");
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.println();
  Serial.println("Individual Sensor Tests:");
  Serial.println("  1 - Test DHT22 (Temperature & Humidity)");
  Serial.println("  2 - Test LDR (Light sensor)");
  Serial.println("  3 - Test HC-SR04 (Ultrasonic)");
  Serial.println();
  Serial.println("Relay/Pump Control:");
  Serial.println("  4 - Turn Relay ON");
  Serial.println("  5 - Turn Relay OFF");
  Serial.println("  p - Pump cycle test (5x ON/OFF)");
  Serial.println();
  Serial.println("LED Control:");
  Serial.println("  6 - Toggle LED on/off");
  Serial.println();
  Serial.println("Continuous Testing:");
  Serial.println("  a - Toggle continuous mode (all sensors every 2s)");
  Serial.println();
  Serial.println("Statistics:");
  Serial.println("  s - Show sensor statistics");
  Serial.println("  r - Reset statistics");
  Serial.println();
  Serial.println("Other:");
  Serial.println("  h - Show this help menu");
  Serial.println();
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.println("💡 Type any command and press Enter");
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

/*
 * ========================================
 * CARA PENGGUNAAN:
 * ========================================
 * 
 * 1. UPLOAD CODE KE ESP32:
 *    - Tools > Board > ESP32 Dev Module
 *    - Tools > Upload Speed > 115200
 *    - Upload
 * 
 * 2. BUKA SERIAL MONITOR:
 *    - Tools > Serial Monitor
 *    - Set baud rate: 115200
 *    - Set line ending: "Newline" atau "Both NL & CR"
 * 
 * 3. LIHAT OUTPUT AWAL:
 *    - Banner muncul
 *    - Pin initialization
 *    - Initial sensor test
 *    - Help menu
 * 
 * 4. KIRIM COMMAND:
 *    - Ketik '1' lalu Enter → Test DHT22
 *    - Ketik 'a' lalu Enter → Start continuous mode
 *    - Ketik '4' lalu Enter → Turn relay ON
 *    - dst...
 * 
 * 5. TROUBLESHOOTING:
 *    - Jika sensor error, cek wiring
 *    - Jika relay tidak bunyi, cek power supply
 *    - Jika DHT22 timeout, tunggu 2 detik antara baca
 *    - Jika ultrasonic timeout, cek jarak ke objek
 * 
 * ========================================
 * EXPECTED OUTPUT (Normal):
 * ========================================
 * 
 * 🌡️  DHT22:
 *    ✅ Temperature: 28.5 °C
 *    ✅ Humidity:    65.2 %
 * 
 * ☀️  LDR:
 *    ✅ Raw ADC Value: 3072 / 4095
 *    ✅ Light Level:   75 %
 *    📊 [███████████████░░░░░]
 *    ☀️  Condition: BRIGHT
 * 
 * 🌊 HC-SR04:
 *    📏 Reading 1: 12.5 cm
 *    📏 Reading 2: 12.3 cm
 *    📏 Reading 3: 12.4 cm
 *    ✅ Average Distance: 12.4 cm
 *    💧 Water Level: HIGH
 * 
 * ========================================
 */
