# 🔧 SOP PERAKITAN HARDWARE
## Sistem Monitoring Pertanian - ESP32 & Sensor

**Versi:** 1.0  
**Tanggal:** 7 Februari 2026  
**Untuk:** Teknisi Lapangan, Installer

---

# 📑 DAFTAR ISI

## 📋 **BAB 1: ALAT YANG DIPERLUKAN** ..................... Hal. 3
- 1.1 Alat Utama
- 1.2 Alat Pendukung
- 1.3 Alat Keselamatan
- 1.4 Checklist Alat

## 📦 **BAB 2: BAHAN & KOMPONEN** ..................... Hal. 7
- 2.1 Komponen Elektronik
- 2.2 Kabel & Connector
- 2.3 Casing & Mounting
- 2.4 Checklist Bahan

## 🔌 **BAB 3: LANGKAH PEMASANGAN** ..................... Hal. 13
- 3.1 Persiapan Area Kerja
- 3.2 Pemasangan Sensor DHT22 (Suhu & Kelembapan)
- 3.3 Pemasangan Sensor Ultrasonik (Level Air)
- 3.4 Pemasangan LDR (Sensor Cahaya)
- 3.5 Pemasangan Relay (Kontrol Pompa)
- 3.6 Wiring ke ESP32
- 3.7 Pemasangan Power Supply
- 3.8 Testing Komponen

## ⚙️ **BAB 4: INSTALASI FIRMWARE** ..................... Hal. 35
- 4.1 Setup Arduino IDE
- 4.2 Konfigurasi ESP32
- 4.3 Upload Firmware
- 4.4 Testing Koneksi

## 📍 **BAB 5: INSTALASI DI LAPANGAN** ..................... Hal. 43
- 5.1 Pemilihan Lokasi
- 5.2 Pemasangan Casing
- 5.3 Pemasangan Sensor di Lahan
- 5.4 Koneksi ke Pompa Air

## ✅ **BAB 6: TESTING & VERIFIKASI** ..................... Hal. 51
- 6.1 Testing Sensor
- 6.2 Testing Pump Control
- 6.3 Testing Koneksi Internet
- 6.4 Testing Dashboard

## 🔧 **BAB 7: TROUBLESHOOTING PEMASANGAN** ..................... Hal. 57
- 7.1 Sensor Tidak Terbaca
- 7.2 ESP32 Tidak Booting
- 7.3 Pompa Tidak Merespon
- 7.4 WiFi Tidak Connect

## 📝 **LAMPIRAN** ..................... Hal. 63
- A. Wiring Diagram Lengkap
- B. Pinout ESP32
- C. Datasheet Sensor
- D. Form Checklist Pemasangan

---

# 📄 HALAMAN SAMPUL

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           🔧 SOP PERAKITAN HARDWARE                      ║
║                                                           ║
║        SISTEM MONITORING PERTANIAN 10 SEKTOR            ║
║                                                           ║
║                   [LOGO PERUSAHAAN]                       ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Versi: 1.0                                              ║
║  Tanggal: 7 Februari 2026                                ║
║                                                           ║
║  Disusun oleh: Tim Teknis                                ║
║  Disetujui oleh: [Nama Manager]                         ║
║                                                           ║
║  Status: RAHASIA - INTERNAL USE ONLY                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

⚠️ PERINGATAN KESELAMATAN

Sebelum memulai perakitan:
✓ Matikan semua sumber listrik
✓ Gunakan sarung tangan anti-statis
✓ Pastikan area kerja bersih dan kering
✓ Baca seluruh SOP sebelum mulai bekerja
✓ Siapkan alat P3K untuk emergency

📞 KONTAK DARURAT:
- Supervisor: [Nomor HP]
- Safety Officer: [Nomor HP]
- Ambulance: 118 / 119
```

---

# BAB 1: ALAT YANG DIPERLUKAN

## 1.1 Alat Utama

### **A. Alat Elektronik**

| No | Nama Alat | Spesifikasi | Qty | Foto |
|----|-----------|-------------|-----|------|
| 1 | Multimeter Digital | DC 0-100V, AC 0-250V | 1 | [📷] |
| 2 | Soldering Iron | 60W, Temperature Control | 1 | [📷] |
| 3 | Kabel USB Micro/Type-C | Data Cable untuk ESP32 | 1 | [📷] |
| 4 | Laptop/PC | Windows 10+ / MacOS | 1 | [📷] |
| 5 | Power Supply 5V | 2A minimum | 1 | [📷] |

### **B. Hand Tools**

| No | Nama Alat | Spesifikasi | Qty | Foto |
|----|-----------|-------------|-----|------|
| 1 | Tang Potong | Electrician Wire Cutter | 1 | [📷] |
| 2 | Tang Kupas Kabel | Wire Stripper 0.5-2.5mm | 1 | [📷] |
| 3 | Tang Jepit | Long Nose Plier | 1 | [📷] |
| 4 | Obeng Set | (+) dan (-), berbagai ukuran | 1 set | [📷] |
| 5 | Crimping Tool | Untuk terminal kabel | 1 | [📷] |

---

## 1.2 Alat Pendukung

| No | Nama Alat | Fungsi | Qty |
|----|-----------|--------|-----|
| 1 | Heat Shrink Tube | Isolasi sambungan kabel | 1 set |
| 2 | Heat Gun | Untuk heat shrink | 1 |
| 3 | Cable Ties | Rapikan kabel | 50 pcs |
| 4 | Isolasi/Tape | Isolasi tambahan | 1 roll |
| 5 | Label Maker | Label kabel & komponen | 1 |
| 6 | Breadboard | Testing sementara | 1 |
| 7 | Jumper Wire | Testing koneksi | 1 set |

---

## 1.3 Alat Keselamatan

| No | Item | Spesifikasi | Wajib? |
|----|------|-------------|--------|
| 1 | Sarung Tangan Anti-Statis | ESD Safe | ✅ WAJIB |
| 2 | Safety Glasses | Pelindung mata | ✅ WAJIB |
| 3 | APD Masker | Debu soldering | ✅ WAJIB |
| 4 | Kotak P3K | Berisi perban, betadine | ✅ WAJIB |
| 5 | Fire Extinguisher | ABC Type, 1kg minimum | ✅ WAJIB |

---

## 1.4 Checklist Alat

```
FORM CHECKLIST ALAT
Sektor: _________    Tanggal: __/__/____    Teknisi: __________

ALAT ELEKTRONIK:
☐ Multimeter Digital
☐ Soldering Iron (sudah panas?)
☐ Kabel USB (sudah dicoba?)
☐ Laptop (sudah charge? Battery >50%?)
☐ Power Supply 5V 2A

HAND TOOLS:
☐ Tang Potong (tajam?)
☐ Tang Kupas Kabel
☐ Tang Jepit
☐ Obeng Set (lengkap?)
☐ Crimping Tool

ALAT PENDUKUNG:
☐ Heat Shrink Tube (berbagai ukuran)
☐ Heat Gun
☐ Cable Ties (min 50 pcs)
☐ Isolasi Tape (baru/masih lengket?)
☐ Label Maker (ada refill?)
☐ Breadboard
☐ Jumper Wire

KESELAMATAN:
☐ Sarung Tangan Anti-Statis
☐ Safety Glasses
☐ Masker
☐ Kotak P3K (cek expired date)
☐ Fire Extinguisher (pin terpasang?)

AREA KERJA:
☐ Meja bersih & kering
☐ Pencahayaan cukup (>300 lux)
☐ Ventilasi baik
☐ Stop kontak berfungsi
☐ Tidak ada air/cairan di area kerja

Paraf Teknisi: _______    Paraf Supervisor: _______
```

---

# BAB 2: BAHAN & KOMPONEN

## 2.1 Komponen Elektronik

### **A. Microcontroller**

| Komponen | Spesifikasi | Qty | Harga (est.) | Supplier |
|----------|-------------|-----|--------------|----------|
| **ESP32 DevKit V1** | • Dual Core 240MHz<br>• WiFi 802.11 b/g/n<br>• Bluetooth 4.2<br>• 30 GPIO Pins<br>• Flash 4MB | 1 | Rp 85.000 | Tokopedia |

**📷 FOTO ESP32:**
```
[Placeholder: Foto ESP32 dengan label pin]

        ╔═════════════════╗
        ║  [USB PORT]    ║
        ║                ║
        ║  ESP32-WROOM   ║
        ║                ║
    PIN ║ 1  GND         ║ PIN 30
        ║ 2  3V3         ║ 29
        ║ 3  EN          ║ 28
        ║ ...            ║ ...
        ╚═════════════════╝
```

---

### **B. Sensor Suhu & Kelembapan**

| Komponen | Spesifikasi | Qty | Harga (est.) |
|----------|-------------|-----|--------------|
| **DHT22** (AM2302) | • Range Suhu: -40°C ~ 80°C<br>• Akurasi Suhu: ±0.5°C<br>• Range Humidity: 0-100% RH<br>• Akurasi Humidity: ±2% RH<br>• Voltage: 3.3-5V | 1 | Rp 45.000 |

**📷 FOTO DHT22:**
```
[Placeholder: Foto DHT22 dengan label pin]

    ┌─────────────┐
    │             │
    │   DHT22     │
    │  /\/\/\/\   │ ← Sensor Grid
    │             │
    └─┬─┬─┬─┬─┬──┘
      1 2 3 4
      
Pin 1: VCC (+5V)
Pin 2: DATA
Pin 3: NULL (tidak digunakan)
Pin 4: GND
```

---

### **C. Sensor Level Air**

| Komponen | Spesifikasi | Qty | Harga (est.) |
|----------|-------------|-----|--------------|
| **HC-SR04 Ultrasonic** | • Range: 2cm - 400cm<br>• Akurasi: ±3mm<br>• Sudut: 15°<br>• Voltage: 5V DC<br>• Current: 15mA | 1 | Rp 15.000 |

**📷 FOTO HC-SR04:**
```
[Placeholder: Foto HC-SR04]

    ┌───────────────────┐
    │  (O)       (O)    │ ← Transducer
    │  Trig      Echo   │
    └─┬──┬──┬──┬────────┘
      1  2  3  4
      
Pin 1: VCC (+5V)
Pin 2: TRIG (Input)
Pin 3: ECHO (Output)
Pin 4: GND
```

---

### **D. Sensor Cahaya**

| Komponen | Spesifikasi | Qty | Harga (est.) |
|----------|-------------|-----|--------------|
| **LDR (Light Dependent Resistor)** | • Range: 1 Lux ~ 100,000 Lux<br>• Resistance (gelap): 1MΩ<br>• Resistance (terang): 1kΩ<br>• Voltage: 3.3V - 5V | 1 | Rp 2.000 |
| **Resistor 10kΩ** | Untuk voltage divider | 1 | Rp 500 |

**📷 FOTO LDR:**
```
[Placeholder: Foto LDR + Resistor]

    ╔═══════════╗
    ║  LDR      ║
    ║  ~~~~~~~~ ║ ← Photoresistor
    ╚═══════════╝
       │     │
    [Pin 1] [Pin 2]
```

---

### **E. Relay Module (Kontrol Pompa)**

| Komponen | Spesifikasi | Qty | Harga (est.) |
|----------|-------------|-----|--------------|
| **Relay 1 Channel 5V** | • Voltage: 5V DC<br>• Current: 10A (Max)<br>• Load: 250V AC / 30V DC<br>• Trigger: Low Level<br>• LED Indicator | 1 | Rp 12.000 |

**📷 FOTO RELAY:**
```
[Placeholder: Foto Relay Module]

    ┌─────────────────────┐
    │  [RELAY]    LED(R)  │
    │   ╔═══╗             │
    │   ║   ║   Optocoupler
    │   ╚═══╝             │
    └─┬─┬─┬─┬─┬─┬─────────┘
    IN V G NC C NO
    
IN  = Signal Input
VCC = +5V
GND = Ground
NC  = Normally Closed
COM = Common
NO  = Normally Open
```

---

## 2.2 Kabel & Connector

| No | Item | Spesifikasi | Qty | Harga |
|----|------|-------------|-----|-------|
| 1 | Kabel Jumper Female-Female | 20cm, berbagai warna | 20 pcs | Rp 5.000 |
| 2 | Kabel Jumper Male-Female | 20cm, berbagai warna | 20 pcs | Rp 5.000 |
| 3 | Kabel Serabut 2x0.75mm | Hitam & Merah | 5 meter | Rp 10.000 |
| 4 | Terminal Block 2-Pin | Screw type | 5 pcs | Rp 5.000 |
| 5 | JST Connector Set | 2.54mm pitch | 5 set | Rp 10.000 |
| 6 | Heat Shrink Tube | Diameter 3mm, 5mm, 10mm | 1 set | Rp 15.000 |

**Kode Warna Kabel (Standard):**
```
🔴 MERAH   = VCC (+5V / +3.3V)
⚫ HITAM   = GND (Ground)
🟡 KUNING  = DATA / SIGNAL
🔵 BIRU    = TRIG
🟢 HIJAU   = ECHO
🟠 ORANGE  = ANALOG INPUT
```

---

## 2.3 Casing & Mounting

| No | Item | Spesifikasi | Qty | Harga |
|----|------|-------------|-----|-------|
| 1 | Box Plastik Waterproof | 200x150x75mm, IP65 | 1 | Rp 45.000 |
| 2 | Cable Gland | PG9, untuk entry kabel | 4 pcs | Rp 8.000 |
| 3 | Mounting Bracket | L-shaped, stainless | 2 pcs | Rp 10.000 |
| 4 | Baut + Mur M4 | Stainless steel | 10 set | Rp 5.000 |
| 5 | Silica Gel Pack | Anti-humidity | 2 pcs | Rp 3.000 |

---

## 2.4 Checklist Bahan

```
FORM CHECKLIST BAHAN
Sektor: _________    Tanggal: __/__/____    Teknisi: __________

KOMPONEN ELEKTRONIK:
☐ ESP32 DevKit V1 (sudah di-test?)
☐ DHT22 Sensor (ada 4 pin?)
☐ HC-SR04 Ultrasonic (ada 4 pin?)
☐ LDR + Resistor 10kΩ
☐ Relay 1 Channel 5V (sudah di-test?)

KABEL & CONNECTOR:
☐ Jumper F-F (min 20 pcs)
☐ Jumper M-F (min 20 pcs)
☐ Kabel Serabut (5 meter)
☐ Terminal Block (5 pcs)
☐ JST Connector (5 set)
☐ Heat Shrink Tube (berbagai ukuran)

CASING & MOUNTING:
☐ Box Waterproof (cek tidak retak)
☐ Cable Gland (4 pcs)
☐ Mounting Bracket (2 pcs)
☐ Baut + Mur (10 set)
☐ Silica Gel (2 pcs, fresh)

POWER SUPPLY:
☐ Adaptor 5V 2A
☐ Kabel Power (min 2 meter)

TESTING TOOLS:
☐ Multimeter (battery OK?)
☐ Breadboard
☐ Jumper untuk testing

DOKUMENTASI:
☐ Kamera HP (untuk foto instalasi)
☐ Form laporan pemasangan
☐ Sticker label sektor

Paraf Teknisi: _______    Paraf Supervisor: _______
```

---

# BAB 3: LANGKAH PEMASANGAN

## 3.1 Persiapan Area Kerja

### **LANGKAH 1: Setup Meja Kerja**

**Durasi:** 10 menit

**Instruksi:**
1. ✅ Pilih meja kerja yang stabil dan bersih
2. ✅ Pastikan pencahayaan cukup (>300 lux)
3. ✅ Siapkan alas kerja anti-statis (ESD mat)
4. ✅ Atur semua alat di sisi kiri/kanan (sesuai kebiasaan)
5. ✅ Tempatkan komponen di tengah (mudah dijangkau)
6. ✅ Sediakan tempat sampah untuk potongan kabel

**📷 FOTO: Layout Meja Kerja**
```
[Placeholder: Foto meja kerja ideal]

    ┌─────────────────────────────────────────┐
    │        LAPTOP (ARDUINO IDE)             │
    │  ┌──────────────────────────────────┐   │
    │  │                                  │   │
    │  └──────────────────────────────────┘   │
    ├─────────────────────────────────────────┤
    │  TOOLS (kiri)      │   COMPONENTS       │
    │  • Multimeter     │   • ESP32           │
    │  • Soldering      │   • Sensors         │
    │  • Tang Set       │   • Cables          │
    │  • Obeng Set      │   • Relay           │
    └───────────────────┴─────────────────────┘
           ↓                     ↓
       [Trash]            [Anti-Static Mat]
```

**⚠️ PERINGATAN:**
- 🚫 JANGAN bekerja di area lembab/basah
- 🚫 JANGAN makan/minum di area kerja
- 🚫 JANGAN bekerja saat mengantuk/lelah

---

## 3.2 Pemasangan Sensor DHT22 (Suhu & Kelembapan)

### **LANGKAH 2-A: Identifikasi Pin DHT22**

**Durasi:** 5 menit

**📷 FOTO: DHT22 Pin Layout**
```
[Placeholder: Foto close-up DHT22 dengan label]

    TAMPAK DEPAN DHT22:
    ┌─────────────┐
    │             │
    │   DHT22     │
    │  /\/\/\/\   │ ← Sensor Grid (menghadap Anda)
    │             │
    └─┬─┬─┬─┬─┬──┘
      1 2 3 4
      │ │ X │
      │ │   └─ GND (Ground)
      │ └───── DATA
      └─────── VCC (+5V)
      
    Pin 3 = TIDAK DIGUNAKAN (NC)
```

**Instruksi:**
1. ✅ Ambil DHT22 dari kemasan
2. ✅ Identifikasi sisi depan (ada grid sensor)
3. ✅ Hitung pin dari kiri: 1, 2, 3, 4
4. ✅ Tandai pin dengan label sticker (opsional)

**✅ VERIFIKASI:**
- [ ] Sensor tidak retak/pecah
- [ ] Pin tidak bengkok
- [ ] Grid sensor bersih (tidak berdebu)

---

### **LANGKAH 2-B: Wiring DHT22 ke ESP32**

**Durasi:** 10 menit

**📷 FOTO: Wiring Diagram DHT22**
```
[Placeholder: Foto wiring DHT22 ke ESP32]

    DHT22                    ESP32
    ┌─────┐                 ┌──────┐
    │ VCC ├─────[MERAH]─────┤ 3V3  │
    │     │                 │      │
    │DATA ├─────[KUNING]────┤ D4   │
    │     │                 │      │
    │ NC  │ (tidak dipakai) │      │
    │     │                 │      │
    │ GND ├─────[HITAM]─────┤ GND  │
    └─────┘                 └──────┘
```

**Instruksi Detail:**

**Step 1: Sambungkan VCC (Pin 1)**
1. Ambil kabel jumper MERAH Female-Female
2. Sambungkan satu ujung ke Pin 1 DHT22 (VCC)
3. Sambungkan ujung lain ke Pin 3V3 ESP32
4. Pastikan koneksi kencang (tidak goyang)

**Step 2: Sambungkan DATA (Pin 2)**
1. Ambil kabel jumper KUNING Female-Female
2. Sambungkan satu ujung ke Pin 2 DHT22 (DATA)
3. Sambungkan ujung lain ke Pin D4 ESP32
4. Pastikan koneksi kencang

**Step 3: Skip Pin 3**
- Pin 3 tidak digunakan (NC = No Connection)

**Step 4: Sambungkan GND (Pin 4)**
1. Ambil kabel jumper HITAM Female-Female
2. Sambungkan satu ujung ke Pin 4 DHT22 (GND)
3. Sambungkan ujung lain ke Pin GND ESP32
4. Pastikan koneksi kencang

**📷 FOTO: Hasil Wiring DHT22**
```
[Placeholder: Foto hasil akhir wiring]

TAMPAK ATAS:
         DHT22
           │
           │ (3 kabel: Merah, Kuning, Hitam)
           │
           ↓
    ┌─────────────┐
    │   ESP32     │
    │  [USB PORT] │
    └─────────────┘
```

**✅ CHECKLIST WIRING:**
```
☐ Kabel MERAH dari DHT22 Pin 1 → ESP32 3V3
☐ Kabel KUNING dari DHT22 Pin 2 → ESP32 D4
☐ Kabel HITAM dari DHT22 Pin 4 → ESP32 GND
☐ Tidak ada pin yang short (bersentuhan)
☐ Semua koneksi kencang (tidak goyang)
☐ Kabel rapi (tidak kusut/silang)
```

**⚠️ PERINGATAN:**
- 🚫 JANGAN sambungkan VCC ke 5V (gunakan 3V3!)
- 🚫 JANGAN terbalik polaritas (VCC ke GND)
- 🚫 JANGAN biarkan pin short circuit

---

### **LANGKAH 2-C: Testing DHT22**

**Durasi:** 5 menit

**Instruksi:**
1. ✅ Sambungkan ESP32 ke laptop via USB
2. ✅ Buka Arduino IDE
3. ✅ Load sketch testing DHT22:

```cpp
#include <DHT.h>

#define DHTPIN 4     // Pin D4
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  Serial.println("Testing DHT22...");
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  
  Serial.print("Temp: ");
  Serial.print(temp);
  Serial.print("°C | Humidity: ");
  Serial.print(hum);
  Serial.println("%");
  
  delay(2000);
}
```

4. ✅ Upload sketch ke ESP32
5. ✅ Buka Serial Monitor (115200 baud)
6. ✅ Amati output

**📷 FOTO: Serial Monitor Output**
```
[Placeholder: Screenshot Serial Monitor]

Testing DHT22...
Temp: 28.5°C | Humidity: 65.2%
Temp: 28.6°C | Humidity: 65.1%
Temp: 28.5°C | Humidity: 65.3%
```

**✅ KRITERIA SUKSES:**
- [ ] Serial Monitor menampilkan suhu (25-35°C normal)
- [ ] Serial Monitor menampilkan humidity (40-80% normal)
- [ ] Nilai berubah-ubah (tidak stuck di 0 atau NaN)
- [ ] Tidak ada error message

**❌ JIKA GAGAL:**
- Cek wiring (terutama pin DATA ke D4)
- Cek power supply (3V3 harus 3.3V dengan multimeter)
- Ganti sensor DHT22 (mungkin rusak)

---

## 3.3 Pemasangan Sensor Ultrasonik (Level Air)

### **LANGKAH 3-A: Identifikasi Pin HC-SR04**

**Durasi:** 5 menit

**📷 FOTO: HC-SR04 Pin Layout**
```
[Placeholder: Foto close-up HC-SR04]

    TAMPAK DEPAN HC-SR04:
    ┌───────────────────┐
    │  (O)       (O)    │ ← Transducer (2 "mata")
    │  T          R     │
    │                   │
    └─┬──┬──┬──┬────────┘
      1  2  3  4
      │  │  │  └─ GND
      │  │  └──── ECHO (Output)
      │  └─────── TRIG (Input)
      └────────── VCC (+5V)
```

**Instruksi:**
1. ✅ Ambil HC-SR04 dari kemasan
2. ✅ Identifikasi 2 transducer (seperti mata robot)
3. ✅ Balikkan, lihat pin di bawah
4. ✅ Baca label: VCC, TRIG, ECHO, GND

**✅ VERIFIKASI:**
- [ ] Transducer tidak pecah
- [ ] Pin tidak bengkok
- [ ] PCB tidak retak

---

### **LANGKAH 3-B: Wiring HC-SR04 ke ESP32**

**Durasi:** 10 menit

**📷 FOTO: Wiring Diagram HC-SR04**
```
[Placeholder: Foto wiring HC-SR04 ke ESP32]

    HC-SR04                 ESP32
    ┌─────┐                ┌──────┐
    │ VCC ├────[MERAH]─────┤ 5V   │
    │     │                │      │
    │TRIG ├────[BIRU]──────┤ D5   │
    │     │                │      │
    │ECHO ├────[HIJAU]─────┤ D18  │
    │     │                │      │
    │ GND ├────[HITAM]─────┤ GND  │
    └─────┘                └──────┘
```

**Instruksi Detail:**

**Step 1: Sambungkan VCC**
1. Kabel MERAH F-F
2. HC-SR04 Pin VCC → ESP32 Pin 5V
3. Kencangkan koneksi

**Step 2: Sambungkan TRIG**
1. Kabel BIRU F-F
2. HC-SR04 Pin TRIG → ESP32 Pin D5
3. Kencangkan koneksi

**Step 3: Sambungkan ECHO**
1. Kabel HIJAU F-F
2. HC-SR04 Pin ECHO → ESP32 Pin D18
3. Kencangkan koneksi

**Step 4: Sambungkan GND**
1. Kabel HITAM F-F
2. HC-SR04 Pin GND → ESP32 Pin GND
3. Kencangkan koneksi

**📷 FOTO: Hasil Wiring HC-SR04**
```
[Placeholder: Foto hasil akhir]

    HC-SR04 (O) (O)
          │
          │ (4 kabel: Merah, Biru, Hijau, Hitam)
          │
          ↓
    ┌─────────────┐
    │   ESP32     │
    │    +        │
    │   DHT22     │ (sudah terpasang sebelumnya)
    └─────────────┘
```

**✅ CHECKLIST WIRING:**
```
☐ MERAH: HC-SR04 VCC → ESP32 5V
☐ BIRU: HC-SR04 TRIG → ESP32 D5
☐ HIJAU: HC-SR04 ECHO → ESP32 D18
☐ HITAM: HC-SR04 GND → ESP32 GND
☐ Tidak ada short circuit
☐ Kabel rapi dan tidak kusut
```

---

### **LANGKAH 3-C: Testing HC-SR04**

**Durasi:** 5 menit

**Instruksi:**
1. ✅ ESP32 masih tersambung ke laptop
2. ✅ Upload sketch testing:

```cpp
#define TRIG_PIN 5
#define ECHO_PIN 18

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.println("Testing HC-SR04...");
}

void loop() {
  // Kirim pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Baca echo
  long duration = pulseIn(ECHO_PIN, HIGH);
  float distance = duration * 0.034 / 2;
  
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  delay(1000);
}
```

3. ✅ Buka Serial Monitor
4. ✅ Gerakkan tangan di depan sensor (10-50 cm)
5. ✅ Amati perubahan jarak

**📷 FOTO: Serial Monitor Output**
```
Testing HC-SR04...
Distance: 15.3 cm
Distance: 12.8 cm  ← Tangan mendekat
Distance: 25.6 cm  ← Tangan menjauh
Distance: 15.1 cm
```

**✅ KRITERIA SUKSES:**
- [ ] Jarak terbaca (2-400 cm)
- [ ] Nilai berubah sesuai gerakan tangan
- [ ] Tidak ada error/timeout
- [ ] Stabil (tidak lompat-lompat ekstrem)

---

# 📄 CONTOH HALAMAN INSTRUKSI KERJA

---

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              INSTRUKSI KERJA #002                        ║
║         PEMASANGAN SENSOR DHT22 KE ESP32                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

📋 INFORMASI DOKUMEN
├─ No. Dokumen: IK-002-DHT22
├─ Revisi: 1.0
├─ Tanggal: 07/02/2026
├─ Halaman: 1 dari 1
└─ Disetujui: [Manager Teknis]

⏱️ ESTIMASI WAKTU: 20 menit
👥 JUMLAH TEKNISI: 1 orang
⚠️ TINGKAT KESULITAN: ⭐⭐☆☆☆ (Mudah)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 ALAT & BAHAN YANG DIPERLUKAN

ALAT:
☐ Tidak ada (menggunakan jumper wire langsung)

BAHAN:
☐ DHT22 Sensor (1 unit)
☐ ESP32 DevKit (1 unit)
☐ Kabel Jumper Female-Female:
   • Merah (1 pcs)
   • Kuning (1 pcs)
   • Hitam (1 pcs)
☐ Label sticker (opsional)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📷 FOTO ILUSTRASI 1: KOMPONEN YANG DIPERLUKAN

    [Foto: Letakkan semua komponen di meja]
    
    ┌────────────────────────────────────────┐
    │                                        │
    │    ┌─────┐     ┌──────┐              │
    │    │DHT22│     │ESP32 │              │
    │    └─────┘     └──────┘              │
    │                                        │
    │    ┌─────────────────┐                │
    │    │ KABEL JUMPER:   │                │
    │    │ 🔴 MERAH        │                │
    │    │ 🟡 KUNING       │                │
    │    │ ⚫ HITAM        │                │
    │    └─────────────────┘                │
    │                                        │
    └────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 LANGKAH KERJA

┌─────────────────────────────────────────────────────────┐
│ LANGKAH 1: IDENTIFIKASI PIN DHT22                      │
│ Durasi: 5 menit                                         │
└─────────────────────────────────────────────────────────┘

INSTRUKSI:
1. Ambil DHT22 dari kemasan anti-statis
2. Pegang DHT22 dengan grid sensor menghadap ke Anda
3. Lihat 4 pin di bagian bawah
4. Hitung dari KIRI ke KANAN: Pin 1, 2, 3, 4

📷 FOTO ILUSTRASI 2: PIN DHT22

    [Foto: Close-up DHT22 dengan label pin]
    
        TAMPAK DEPAN:
        ┌─────────────┐
        │             │
        │   DHT22     │
        │  /\/\/\/\   │ ← Grid sensor (menghadap Anda)
        │             │
        └─┬─┬─┬─┬─┬──┘
          1 2 3 4
          ↓ ↓ ↓ ↓
          A B C D
    
    A = Pin 1 = VCC (+3.3V)
    B = Pin 2 = DATA (Signal)
    C = Pin 3 = NC (Not Connected - SKIP!)
    D = Pin 4 = GND (Ground)

✅ CHECKPOINT:
☐ DHT22 tidak retak/pecah
☐ Pin tidak bengkok
☐ Anda sudah identifikasi Pin 1, 2, 4 (skip pin 3)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────┐
│ LANGKAH 2: SAMBUNGKAN VCC (Pin 1 → 3V3)               │
│ Durasi: 3 menit                                         │
└─────────────────────────────────────────────────────────┘

INSTRUKSI:
1. Ambil kabel jumper MERAH Female-Female
2. Tancapkan ujung 1 ke Pin 1 DHT22 (paling KIRI)
3. Tancapkan ujung 2 ke Pin 3V3 ESP32
4. Tarik kabel perlahan untuk cek sudah kencang

📷 FOTO ILUSTRASI 3: WIRING VCC

    [Foto: Sambungan VCC dengan kabel merah]
    
    DHT22                    ESP32
    ┌─────┐                 ┌──────┐
    │  1  ├─────🔴MERAH────┤ 3V3  │ ← Cari label "3V3"
    │  2  │                 │      │
    │  3  │                 │  D4  │
    │  4  │                 │      │
    └─────┘                 │ GND  │
                            └──────┘

⚠️ PERHATIAN:
• JANGAN sambungkan ke 5V (hanya 3V3!)
• PASTIKAN koneksi kencang (tidak goyang)

✅ CHECKPOINT:
☐ Kabel MERAH terpasang kencang
☐ DHT22 Pin 1 → ESP32 3V3
☐ Tidak ada pin yang lepas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────┐
│ LANGKAH 3: SAMBUNGKAN DATA (Pin 2 → D4)               │
│ Durasi: 3 menit                                         │
└──────���──────────────────────────────────────────────────┘

INSTRUKSI:
1. Ambil kabel jumper KUNING Female-Female
2. Tancapkan ujung 1 ke Pin 2 DHT22 (tengah-kiri)
3. Tancapkan ujung 2 ke Pin D4 ESP32
4. Tarik kabel perlahan untuk cek sudah kencang

📷 FOTO ILUSTRASI 4: WIRING DATA

    [Foto: Sambungan DATA dengan kabel kuning]
    
    DHT22                    ESP32
    ┌─────┐                 ┌──────┐
    │  1  ├─────🔴MERAH────┤ 3V3  │
    │  2  ├─────🟡KUNING───┤  D4  │ ← Cari label "D4" atau "GPIO4"
    │  3  │                 │      │
    │  4  │                 │ GND  │
    └─────┘                 └──────┘

💡 TIPS:
• Pin D4 biasanya di sisi kiri ESP32
• Jika ada label "GPIO4" = sama dengan D4

✅ CHECKPOINT:
☐ Kabel KUNING terpasang kencang
☐ DHT22 Pin 2 → ESP32 D4
☐ Kabel tidak bersilangan dengan kabel merah

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────┐
│ LANGKAH 4: SKIP PIN 3 (Tidak Digunakan)               │
│ Durasi: 0 menit                                         │
└─────────────────────────────────────────────────────────┘

INSTRUKSI:
⚠️ Pin 3 DHT22 TIDAK DIGUNAKAN (NC = No Connection)
❌ JANGAN sambungkan ke ESP32
✅ Lanjut ke Pin 4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────┐
│ LANGKAH 5: SAMBUNGKAN GND (Pin 4 → GND)               │
│ Durasi: 3 menit                                         │
└─────────────────────────────────────────────────────────┘

INSTRUKSI:
1. Ambil kabel jumper HITAM Female-Female
2. Tancapkan ujung 1 ke Pin 4 DHT22 (paling KANAN)
3. Tancapkan ujung 2 ke Pin GND ESP32
4. Tarik kabel perlahan untuk cek sudah kencang

📷 FOTO ILUSTRASI 5: WIRING GND

    [Foto: Sambungan GND dengan kabel hitam]
    
    DHT22                    ESP32
    ┌─────┐                 ┌──────┐
    │  1  ├─────🔴MERAH────┤ 3V3  │
    │  2  ├─────🟡KUNING───┤  D4  │
    │  3  │ (tidak dipakai) │      │
    │  4  ├─────⚫HITAM────┤ GND  │ ← Cari label "GND"
    └─────┘                 └──────┘

💡 TIPS:
• ESP32 punya banyak pin GND (pilih yang terdekat)
• GND biasanya ada label "GND" atau "G"

✅ CHECKPOINT:
☐ Kabel HITAM terpasang kencang
☐ DHT22 Pin 4 → ESP32 GND
☐ Semua 3 kabel sudah terpasang (skip pin 3)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────┐
│ LANGKAH 6: VERIFIKASI WIRING LENGKAP                  │
│ Durasi: 3 menit                                         │
└─────────────────────────────────────────────────────────┘

INSTRUKSI:
1. Lihat dari atas, cek semua koneksi
2. Goyangkan DHT22 perlahan (tidak boleh lepas)
3. Cek tidak ada kabel yang bersentuhan (short)
4. Rapikan kabel dengan cable ties (opsional)

📷 FOTO ILUSTRASI 6: HASIL AKHIR WIRING

    [Foto: Tampak atas ESP32 + DHT22 lengkap]
    
    TAMPAK ATAS:
    
         DHT22
        ┌─────┐
        │/\/\/│
        └──┬──┘
           │
           │ (3 kabel rapi: 🔴🟡⚫)
           │
           ↓
    ┌─────────────┐
    │   ESP32     │
    │  [USB PORT] │ ← USB menghadap ke Anda
    │             │
    │  3V3  D4  GND
    └─────────────┘

✅ CHECKLIST AKHIR:
┌───────────────────────────────────────────────────────┐
│ ☐ Kabel MERAH: DHT22 Pin 1 → ESP32 3V3              │
│ ☐ Kabel KUNING: DHT22 Pin 2 → ESP32 D4              │
│ ☐ Pin 3 DHT22: TIDAK TERSAMBUNG (OK)                │
│ ☐ Kabel HITAM: DHT22 Pin 4 → ESP32 GND              │
│ ☐ Tidak ada short circuit (kabel bersentuhan)       │
│ ☐ Semua koneksi kencang (tidak goyang)              │
│ ☐ Kabel rapi (tidak kusut)                          │
│ ☐ DHT22 tidak retak/rusak                           │
└───────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────┐
│ LANGKAH 7: TESTING SENSOR DHT22                       │
│ Durasi: 5 menit                                         │
└─────────────────────────────────────────────────────────┘

INSTRUKSI:
1. Sambungkan ESP32 ke laptop via kabel USB
2. Buka Arduino IDE
3. Upload sketch testing (lihat lampiran)
4. Buka Serial Monitor (115200 baud)
5. Tunggu 5 detik, amati output

📷 FOTO ILUSTRASI 7: SERIAL MONITOR OUTPUT

    [Foto: Screenshot Serial Monitor]
    
    ┌──────────────────────────────────────────────┐
    │ Serial Monitor          [x] 115200 baud     │
    ├──────────────────────────────────────────────┤
    │ Testing DHT22...                            │
    │ Temp: 28.5°C | Humidity: 65.2%             │
    │ Temp: 28.6°C | Humidity: 65.1%             │
    │ Temp: 28.5°C | Humidity: 65.3%             │
    │ Temp: 28.7°C | Humidity: 65.0%             │
    │                                              │
    │ ✅ STATUS: SENSOR BERFUNGSI NORMAL          │
    └──────────────────────────────────────────────┘

✅ KRITERIA SUKSES:
☐ Serial Monitor menampilkan suhu (range: 20-40°C)
☐ Serial Monitor menampilkan humidity (range: 30-90%)
☐ Nilai berubah-ubah sedikit (normal)
☐ Tidak ada "NaN" atau "Error" message

❌ JIKA GAGAL (Troubleshooting):
┌───────────────────────────────────────────────────────┐
│ GEJALA                  │ SOLUSI                      │
├─────────────────────────┼─────────────────────────────┤
│ Output: NaN / Error     │ Cek wiring DATA (pin 2→D4) │
│ Output: 0.0 / 0.0       │ Cek power VCC (pin 1→3V3)  │
│ Tidak ada output        │ Cek GND (pin 4→GND)        │
│ Nilai stuck (tidak      │ Ganti sensor DHT22 (rusak) │
│ berubah)                │                             │
└───────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PEKERJAAN SELESAI

Anda telah berhasil memasang sensor DHT22 ke ESP32!

LANGKAH SELANJUTNYA:
→ Lanjut ke Instruksi Kerja #003: Pemasangan Sensor HC-SR04
→ Atau simpan unit ini untuk testing lebih lanjut

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 DOKUMENTASI PEMASANGAN

FORM LAPORAN:
Tanggal Pemasangan: ___/___/______
Teknisi: _____________________
Sektor: SEC-___
Lokasi: _____________________

HASIL TESTING:
☐ PASS - Sensor berfungsi normal
☐ FAIL - Sensor tidak berfungsi (alasan: _____________)

Suhu terukur: ____°C
Humidity terukur: ____%

Foto pemasangan diambil: ☐ Ya  ☐ Tidak

Paraf Teknisi: _______    Paraf Supervisor: _______

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ CATATAN PENTING:
• Simpan DHT22 terlindung dari hujan (gunakan casing)
• Jangan sentuh grid sensor (menggunakan sarung tangan)
• Kalibrasi sensor setiap 6 bulan sekali
• Dokumentasikan foto sebelum & sesudah pemasangan

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

END OF INSTRUKSI KERJA #002

```

---

**File ini berlanjut dengan:**
- Instruksi Kerja #003: HC-SR04 (Level Air)
- Instruksi Kerja #004: LDR (Sensor Cahaya)
- Instruksi Kerja #005: Relay Module (Pompa)
- dst...

**Total SOP:** ~63 halaman (termasuk lampiran)

---

# 📋 FORM CHECKLIST AKHIR PERAKITAN

```
╔═══════════════════════════════════════════════════════════╗
║          FORM CHECKLIST PERAKITAN LENGKAP                ║
╚═══════════════════════════════════════════════════════════╝

INFORMASI PROYEK:
Sektor: SEC-____    Tanggal: ___/___/______
Teknisi 1: _________________    Teknisi 2: _________________
Lokasi Pemasangan: _________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KOMPONEN ELEKTRONIK:
☐ ESP32 DevKit V1 (tested)
☐ DHT22 (tested)
☐ HC-SR04 (tested)
☐ LDR + Resistor 10kΩ (tested)
☐ Relay 1 Channel (tested)
☐ Power Supply 5V 2A (tested)

WIRING & KONEKSI:
☐ DHT22 → ESP32 (VCC, DATA, GND)
☐ HC-SR04 → ESP32 (VCC, TRIG, ECHO, GND)
☐ LDR → ESP32 (VCC, Analog, GND)
☐ Relay → ESP32 (VCC, Signal, GND)
☐ Semua kabel rapi (cable ties)
☐ Label kabel (warna/fungsi)

FIRMWARE:
☐ Arduino IDE installed
☐ ESP32 board support installed
☐ Libraries installed (DHT, WiFi, HTTPClient)
☐ Firmware uploaded (production version)
☐ WiFi configured (SSID & Password)
☐ Supabase configured (URL & Key)
☐ Sector ID configured (SEC-XXX)

TESTING:
☐ DHT22 reading OK (temp + humidity)
☐ HC-SR04 reading OK (distance)
☐ LDR reading OK (light level)
☐ Relay control OK (ON/OFF)
☐ WiFi connected OK
☐ Data sent to dashboard OK
☐ Pump control from dashboard OK

CASING & MOUNTING:
☐ Box waterproof terpasang
☐ Cable gland installed (4 pcs)
☐ Silica gel inside box
☐ Mounting bracket installed
☐ Box waterproof (tested with water spray)

INSTALASI LAPANGAN:
☐ Lokasi dipilih (tidak terkena hujan langsung)
☐ ESP32 box mounted (tinggi 1.5m dari tanah)
☐ DHT22 sensor outdoor (protected)
☐ HC-SR04 sensor di atas air (20-30 cm)
☐ LDR sensor exposed to sun
☐ Relay connected to pump (tested)
☐ Power supply connected (stable 5V)

DOKUMENTASI:
☐ Foto wiring diagram
☐ Foto instalasi box
☐ Foto sensor positions
☐ Form checklist diisi lengkap
☐ Koordinat GPS dicatat

FINAL VERIFICATION:
☐ Dashboard menampilkan data real-time
☐ Pump control berfungsi
☐ Alert WhatsApp tested
☐ Pemilik lahan dihubungi & dibriefing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TANDA TANGAN:

Teknisi 1: _____________    Tanggal: ___/___/______

Teknisi 2: _____________    Tanggal: ___/___/______

Supervisor: _____________    Tanggal: ___/___/______

Pemilik Lahan: _____________    Tanggal: ___/___/______

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATUS AKHIR:
☐ ✅ APPROVED - Ready for Operation
☐ ⏸️ PENDING - Issue: _________________________________
☐ ❌ REJECTED - Reason: _________________________________

```

---

**END OF DOCUMENT**
