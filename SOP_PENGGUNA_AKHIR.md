# 📱 SOP PENGGUNAAN SISTEM MONITORING PERTANIAN
## Panduan Lengkap untuk Pengguna

**Versi:** 1.0  
**Tanggal:** 7 Februari 2026  
**Untuk:** Petani, Admin Desa, Operator Lapangan

---

## 📑 DAFTAR ISI

1. [Pengenalan Sistem](#1-pengenalan-sistem)
2. [Cara Login](#2-cara-login)
3. [Cara Melihat Kondisi Sektor](#3-cara-melihat-kondisi-sektor)
4. [Cara Mengontrol Pompa](#4-cara-mengontrol-pompa)
5. [Cara Membaca Alert WhatsApp](#5-cara-membaca-alert-whatsapp)
6. [Cara Menambah Sektor Baru](#6-cara-menambah-sektor-baru)
7. [Cara Mengedit Data Sektor](#7-cara-mengedit-data-sektor)
8. [Cara Menghapus Sektor](#8-cara-menghapus-sektor)
9. [Cara Menghubungi Pemilik Lahan](#9-cara-menghubungi-pemilik-lahan)
10. [Masalah yang Sering Terjadi](#10-masalah-yang-sering-terjadi)

---

# 1. PENGENALAN SISTEM

## 1.1 Apa itu Sistem Monitoring Pertanian?

Sistem ini adalah aplikasi untuk **memantau kondisi lahan pertanian dari jarak jauh** menggunakan HP atau komputer.

### Anda bisa:
- ✅ Melihat suhu, kelembapan, level air di semua lahan
- ✅ Menyalakan atau mematikan pompa air dari HP
- ✅ Menerima peringatan WhatsApp jika ada masalah
- ✅ Melihat riwayat kondisi lahan 24 jam terakhir
- ✅ Menghubungi pemilik lahan langsung via WhatsApp

### Yang Anda perlukan:
- 📱 HP Android/iPhone atau Komputer dengan internet
- 🌐 Browser (Chrome, Safari, Firefox)
- 📞 Nomor HP untuk WhatsApp alert
- 🔑 Username dan password (diberikan admin)

---

## 1.2 Cara Mengakses Sistem

### **Buka di Browser:**
1. Buka aplikasi browser di HP/komputer Anda
2. Ketik alamat website: `https://your-app.vercel.app`
3. Tekan Enter

**atau**

### **Simpan di Home Screen (HP):**

**Android:**
1. Buka website di Chrome
2. Tap titik 3 di pojok kanan atas
3. Pilih "Add to Home screen"
4. Beri nama: "Monitoring Lahan"
5. Icon akan muncul di home screen seperti aplikasi biasa

**iPhone:**
1. Buka website di Safari
2. Tap icon Share (kotak dengan panah ke atas)
3. Pilih "Add to Home Screen"
4. Beri nama: "Monitoring Lahan"
5. Icon akan muncul di home screen

---

# 2. CARA LOGIN

## 2.1 Login Pertama Kali

### Langkah-langkah:

**LANGKAH 1:** Buka aplikasi  
```
Website akan menampilkan halaman LOGIN
```

**LANGKAH 2:** Masukkan Username  
```
Ketik username yang diberikan admin
Contoh: "admin" atau "pakbudi"
```

**LANGKAH 3:** Masukkan Password  
```
Ketik password (huruf besar/kecil harus sama)
```

**LANGKAH 4:** Tap tombol "Login"  
```
Jika benar, Anda akan masuk ke halaman Dashboard
```

### ⚠️ Jika Login Gagal:
- **Pesan: "Username atau password salah"**
  - Cek capslock tidak aktif
  - Pastikan username dan password benar
  - Hubungi admin jika lupa password

- **Pesan: "Tidak bisa terhubung ke server"**
  - Cek koneksi internet Anda
  - Coba refresh halaman (tarik ke bawah)
  - Tutup aplikasi dan buka lagi

---

## 2.2 Cara Logout

### Langkah-langkah:

**LANGKAH 1:** Klik icon "Logout" di pojok kanan atas  
```
Icon berbentuk panah keluar
```

**LANGKAH 2:** Konfirmasi logout  
```
Sistem akan kembali ke halaman login
```

**💡 TIPS:**
- Logout setelah selesai menggunakan (untuk keamanan)
- Di HP pribadi, boleh tetap login (otomatis logout 24 jam)

---

# 3. CARA MELIHAT KONDISI SEKTOR

## 3.1 Tampilan Dashboard

Setelah login, Anda akan melihat:
- **Header** (bagian atas): Nama aplikasi, tombol tambah, tombol logout
- **Card Sektor** (10 kotak): Menampilkan semua sektor lahan
- **Search Bar** (kotak pencarian): Untuk cari sektor tertentu

---

## 3.2 Membaca Card Sektor

Setiap card sektor menampilkan:

### **Bagian Atas:**
```
📍 Sektor 1              [Status Pompa: ON/OFF]
🌾 Padi
```

### **Sensor Data (4 kotak kecil):**

| Icon | Arti | Normal | Perlu Perhatian |
|------|------|--------|-----------------|
| 🌡️ | Suhu | 25-35°C | <20°C atau >40°C |
| 💧 | Kelembapan | 60-80% | <40% atau >90% |
| 💡 | Cahaya | 300-800 | - |
| 💦 | Level Air | >10 cm | **<5 cm (MERAH)** |

### **Bagian Bawah:**
```
Pak Budi          13:45
(nama pemilik)    (update terakhir)
```

---

## 3.3 Memahami Warna Status

### ✅ **HIJAU = Normal**
- Semua sensor dalam kondisi baik
- Tidak perlu tindakan

### 🟡 **KUNING = Perlu Perhatian**
- Ada sensor yang mendekati batas
- Pantau lebih sering

### 🔴 **MERAH = Kritis**
- Level air sangat rendah (<5 cm)
- **SEGERA AMBIL TINDAKAN:**
  1. Cek sumber air
  2. Nyalakan pompa manual (jika perlu)
  3. Hubungi pemilik lahan

---

## 3.4 Melihat Detail Sektor

### Langkah-langkah:

**LANGKAH 1:** Tap/klik card sektor yang ingin dilihat  
```
Card akan membuka jendela detail (popup)
```

**LANGKAH 2:** Lihat informasi lengkap  

### **Tab "Informasi"**
- Data sensor terbaru
- Informasi pemilik (nama, HP, alamat)
- Informasi tanaman (jenis, tanggal tanam, rencana panen)
- Status pompa (ON/OFF)
- Riwayat pompa (10 aktivitas terakhir)

### **Tab "Grafik"**
- Grafik suhu 24 jam terakhir
- Grafik kelembapan 24 jam
- Grafik level air 24 jam
- Grafik status pompa

**LANGKAH 3:** Tutup detail  
```
Klik tombol X di pojok kanan atas popup
```

---

## 3.5 Mencari Sektor Tertentu

### Cara menggunakan Search:

**LANGKAH 1:** Klik kotak "Cari sektor atau pemilik..."  
```
Di bagian header atas
```

**LANGKAH 2:** Ketik nama sektor atau nama pemilik  
```
Contoh: "Sektor 3" atau "Pak Budi"
```

**LANGKAH 3:** Hasil pencarian muncul otomatis  
```
Hanya sektor yang cocok yang tampil
```

**LANGKAH 4:** Hapus pencarian  
```
Klik tombol X di kotak pencarian
Semua sektor akan muncul lagi
```

---

# 4. CARA MENGONTROL POMPA

## 4.1 Pompa Otomatis vs Manual

### 🤖 **Pompa Otomatis (Default)**
- Pompa hidup otomatis setiap jam pada menit 0-14
- Contoh: 06:00-06:14, 07:00-07:14, dst.
- Total hidup: 15 menit per jam
- Aktif 24 jam non-stop

### 🎮 **Pompa Manual (Override)**
- Anda bisa hidup/matikan pompa kapan saja
- Menggantikan jadwal otomatis sementara
- Gunakan jika:
  - 🌧️ Hujan deras (matikan pompa)
  - ☀️ Cuaca sangat panas (hidupkan lebih lama)
  - 🔧 Maintenance pompa
  - 🚨 Emergency (air kritis)

---

## 4.2 Cara Menyalakan/Mematikan Pompa Manual

### Langkah-langkah:

**LANGKAH 1:** Tap/klik card sektor  
```
Buka detail sektor
```

**LANGKAH 2:** Lihat status pompa saat ini  
```
Tertulis di bagian atas: "Status Pompa: ON" atau "OFF"
```

**LANGKAH 3:** Klik tombol "Override Pompa Manual"  
```
Tombol besar di tengah popup
```

**LANGKAH 4:** Tunggu konfirmasi (5-10 detik)  
```
Anda akan melihat:
- 🔵 Animasi loading
- 🟡 Banner kuning: "Menunggu konfirmasi ESP32..."
- 🔒 Tombol tidak bisa diklik (disabled)
```

**LANGKAH 5:** Status berubah  
```
✅ Jika berhasil:
   - Status pompa berubah (ON → OFF atau OFF → ON)
   - Banner kuning hilang
   - Muncul notifikasi sukses

⏳ Jika timeout (10 detik):
   - Status kembali ke awal
   - Muncul peringatan: "ESP32 belum konfirmasi"
   - Coba lagi atau hubungi teknisi
```

**LANGKAH 6:** Anda akan menerima WhatsApp  
```
Notifikasi otomatis terkirim:
"⚡ Pompa ON - Sektor 3
📍 Sektor: Sektor 3
🌾 Tanaman: Cabai
⚙️ Status: ON
📝 Trigger: Manual (Admin)
⏰ Waktu: 07/02/2026 14:30 WIB"
```

---

## 4.3 Melihat Riwayat Pompa

### Langkah-langkah:

**LANGKAH 1:** Buka detail sektor  
```
Tap/klik card sektor
```

**LANGKAH 2:** Scroll ke bawah  
```
Bagian "Riwayat Pompa"
```

**LANGKAH 3:** Lihat daftar aktivitas  
```
Setiap baris menampilkan:
- ⚡ ON atau OFF
- 🤖 Auto atau 🎮 Manual
- ⏰ Tanggal dan waktu
```

**Contoh:**
```
⚡ ON  | 🤖 Auto   | 14:00 - 07/02/2026
⚡ OFF | 🎮 Manual | 13:45 - 07/02/2026
⚡ ON  | 🤖 Auto   | 13:00 - 07/02/2026
```

---

## 4.4 Kapan Harus Kontrol Manual?

### ✅ **Situasi yang PERLU kontrol manual:**

**1. Hujan Deras 🌧️**
```
Aksi: Matikan pompa manual
Alasan: Tanaman sudah dapat air dari hujan
Cara: OFF semua pompa sementara
```

**2. Cuaca Sangat Panas ☀️**
```
Aksi: Hidupkan pompa tambahan
Alasan: Tanaman butuh air lebih banyak
Cara: ON pompa di luar jadwal otomatis
```

**3. Level Air Kritis 🚨**
```
Aksi: Hidupkan pompa segera
Alasan: Emergency, tanaman terancam mati
Cara: ON pompa meski belum jadwal
```

**4. Maintenance Pompa 🔧**
```
Aksi: Matikan pompa
Alasan: Sedang perbaikan/service
Cara: OFF pompa selama maintenance
```

### ❌ **TIDAK perlu kontrol manual jika:**
- Kondisi normal (pompa otomatis sudah cukup)
- Sensor masih hijau (tidak ada masalah)
- Level air >10 cm (aman)

---

# 5. CARA MEMBACA ALERT WHATSAPP

## 5.1 Jenis Alert yang Anda Terima

Sistem akan mengirim 2 jenis alert ke WhatsApp Anda:

### **1. Alert Sensor Kritis 🚨**
```
🚨 ALERT - Sektor 3
━━━━━━━━━━━━━━━━━━━
📍 Sektor: Sektor 3
🌾 Tanaman: Cabai
👤 Pemilik: Pak Andi

⚠️ KONDISI KRITIS:
💦 Level Air: 3.2 cm (< 5 cm)

⏰ Waktu: 07/02/2026 13:45 WIB

📞 Hubungi Pak Andi: 081234567891
```

### **2. Notifikasi Pompa ⚡**
```
⚡ Pompa ON - Sektor 3
━━━━━━━━━━━━━━━━━━━
📍 Sektor: Sektor 3
🌾 Tanaman: Cabai
⚙️ Status: ON
📝 Trigger: Manual (Admin)

⏰ Waktu: 07/02/2026 14:30 WIB
```

---

## 5.2 Siapa yang Menerima Alert?

### 👨‍💼 **Admin (Anda):**
- ✅ Menerima alert dari **SEMUA sektor**
- ✅ Alert lengkap dengan detail sensor
- ✅ Bisa langsung lihat dashboard

### 👨‍🌾 **Pemilik Lahan (Warga):**
- ✅ Menerima alert hanya dari **sektor mereka**
- ✅ Pesan lebih simple
- ✅ Langsung bisa ambil tindakan

---

## 5.3 Cara Merespon Alert Kritis

### **Jika Anda menerima Alert Sensor Kritis:**

**LANGKAH 1: Baca pesan (langsung dari HP)**  
```
Tidak perlu buka aplikasi
```

**LANGKAH 2: Cek dashboard untuk detail**  
```
Buka aplikasi monitoring
Lihat sektor yang alert
Cek kondisi sensor lainnya
```

**LANGKAH 3: Hubungi pemilik lahan**  
```
Tap nomor HP di pesan WhatsApp
Atau klik tombol WhatsApp di dashboard
Koordinasi tindakan yang perlu diambil
```

**LANGKAH 4: Ambil tindakan**  

**Jika Level Air Kritis (<5 cm):**
1. ✅ Cek sumber air (pompa utama, pipa)
2. ✅ Hidupkan pompa manual (jika perlu)
3. ✅ Instruksikan pemilik cek fisik di lapangan
4. ✅ Monitor level air sampai >10 cm

**Jika Suhu Terlalu Panas (>40°C):**
1. ✅ Hidupkan pompa tambahan
2. ✅ Beri naungan sementara (jika mungkin)
3. ✅ Monitor suhu 30 menit sekali

**Jika Kelembapan Terlalu Rendah (<40%):**
1. ✅ Tambah frekuensi penyiraman
2. ✅ Cek sistem irigasi
3. ✅ Koordinasi dengan pemilik

**LANGKAH 5: Catat di buku log**  
```
Tanggal: 07/02/2026
Sektor: Sektor 3
Masalah: Level air 3.2 cm
Tindakan: Hubungi Pak Andi, cek sumber air
Status: ✅ Selesai (level air naik ke 12 cm)
```

---

## 5.4 Mengapa Alert Tidak Datang Terus?

### **Sistem Cooldown 6 Jam**

Setelah alert pertama terkirim, sistem **TIDAK akan kirim alert lagi** untuk sensor yang sama selama **6 jam**.

**Tujuan:** Agar tidak spam WhatsApp Anda

**Contoh:**
```
13:00 - Alert pertama: Level air 4 cm
13:30 - Level air masih 4 cm (TIDAK ada alert)
14:00 - Level air masih 4 cm (TIDAK ada alert)
...
19:00 - Level air masih 4 cm (TIDAK ada alert)
19:01 - Alert kedua: Level air 4 cm (sudah 6 jam)
```

**💡 TIPS:**
- Jika menerima alert, **langsung cek dashboard**
- Tidak perlu tunggu alert kedua
- Monitor manual setiap 1-2 jam jika ada masalah

---

# 6. CARA MENAMBAH SEKTOR BARU

## 6.1 Kapan Perlu Tambah Sektor?

- ✅ Ada lahan baru yang perlu dimonitor
- ✅ Petani baru bergabung
- ✅ Ekspansi area pertanian

---

## 6.2 Langkah-langkah Menambah Sektor

**LANGKAH 1:** Klik tombol "+ Tambah Sektor"  
```
Tombol hijau di pojok kanan atas dashboard
```

**LANGKAH 2:** Isi form yang muncul  

### **Data yang harus diisi:**

**A. Informasi Sektor**
```
Nama Sektor: Sektor 11
(Ketik nama sektor, contoh: Sektor 11, Lahan Utara, dll)
```

**B. Informasi Pemilik**
```
Nama Pemilik: Pak Dadang
Nomor HP: 081234567890
Lokasi: Jl. Raya Desa No. 123
```

**⚠️ PENTING - Format Nomor HP:**
- ✅ BENAR: `081234567890` (tanpa +62, tanpa spasi, tanpa strip)
- ❌ SALAH: `+62 812-3456-7890`
- ❌ SALAH: `0812 3456 7890`

**C. Informasi Tanaman**
```
Jenis Tanaman: Cabai Merah
Tanggal Tanam: 01/02/2026 (pilih dari kalender)
Perkiraan Panen: 01/05/2026 (pilih dari kalender)
```

**LANGKAH 3:** Klik tombol "Simpan"  
```
Sektor baru akan muncul di dashboard
```

**LANGKAH 4:** Verifikasi sektor muncul  
```
Cek di dashboard, harus ada card sektor baru
Data sensor masih 0 (belum ada ESP32 yang kirim data)
```

**LANGKAH 5:** (Untuk Teknisi) Setup ESP32  
```
Hubungi teknisi untuk pasang sensor di lapangan
ESP32 akan dikonfigurasi dengan ID sektor baru
Setelah selesai, data sensor akan mulai muncul
```

---

# 7. CARA MENGEDIT DATA SEKTOR

## 7.1 Kapan Perlu Edit Sektor?

- ✅ Ganti pemilik lahan
- ✅ Update nomor HP
- ✅ Ganti jenis tanaman
- ✅ Update alamat lokasi
- ✅ Perbaiki kesalahan data

---

## 7.2 Langkah-langkah Edit Sektor

**LANGKAH 1:** Buka detail sektor  
```
Tap/klik card sektor yang ingin diedit
```

**LANGKAH 2:** Klik icon "Pencil" (Edit)  
```
Icon berbentuk pensil di pojok kanan atas popup
```

**LANGKAH 3:** Form edit akan muncul  
```
Data lama akan terisi otomatis
```

**LANGKAH 4:** Edit data yang perlu diubah  
```
Ketik data baru
Atau biarkan data lama jika tidak perlu diubah
```

**Data yang bisa diedit:**
- ✏️ Nama sektor
- ✏️ Nama pemilik
- ✏️ Nomor HP
- ✏️ Lokasi
- ✏️ Jenis tanaman
- ✏️ Tanggal tanam
- ✏️ Perkiraan panen

**Data yang TIDAK bisa diedit:**
- ❌ Data sensor (suhu, kelembapan, dll) → otomatis dari ESP32
- ❌ Status pompa → kontrol via tombol pompa
- ❌ ID sektor → otomatis dari sistem

**LANGKAH 5:** Klik "Simpan"  
```
Data akan diupdate
```

**LANGKAH 6:** Verifikasi perubahan  
```
Tutup popup dan buka lagi
Pastikan data sudah berubah
```

---

# 8. CARA MENGHAPUS SEKTOR

## 8.1 Kapan Perlu Hapus Sektor?

- ✅ Lahan tidak digunakan lagi
- ✅ Petani keluar dari program
- ✅ Sektor duplikat/salah input

---

## 8.2 ⚠️ PERINGATAN PENTING

**SEBELUM HAPUS, PAHAMI INI:**

### ❗ **Data yang akan HILANG PERMANEN:**
- ❌ Semua data sensor (history 24 jam)
- ❌ Semua riwayat pompa
- ❌ Informasi pemilik
- ❌ Informasi tanaman
- ❌ **TIDAK BISA DIKEMBALIKAN!**

### ✅ **Yang TIDAK hilang:**
- ESP32 masih akan kirim data (perlu dimatikan manual)
- Data di buku log fisik (jika Anda catat)

---

## 8.3 Langkah-langkah Hapus Sektor

**LANGKAH 1:** Buka detail sektor  
```
Tap/klik card sektor yang ingin dihapus
```

**LANGKAH 2:** Klik icon "Trash" (Hapus)  
```
Icon berbentuk tempat sampah di pojok kanan atas popup
```

**LANGKAH 3:** Konfirmasi penghapusan  
```
⚠️ POPUP PERINGATAN AKAN MUNCUL:

"Hapus Sektor 3?"

Data sensor, riwayat pompa, dan informasi pemilik 
akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.

[Batal]  [Ya, Hapus]
```

**LANGKAH 4:** Klik "Ya, Hapus" jika yakin  
```
Sektor akan dihapus dari dashboard
```

**LANGKAH 5:** (Untuk Teknisi) Matikan ESP32  
```
Hubungi teknisi untuk:
- Matikan ESP32 di lapangan
- Cabut sensor
- Simpan perangkat untuk sektor lain
```

---

# 9. CARA MENGHUBUNGI PEMILIK LAHAN

## 9.1 Via Dashboard (WhatsApp Langsung)

### Langkah-langkah:

**LANGKAH 1:** Buka detail sektor  
```
Tap/klik card sektor
```

**LANGKAH 2:** Klik tombol WhatsApp  
```
Tombol hijau dengan icon WhatsApp
Di bagian informasi pemilik
```

**LANGKAH 3:** WhatsApp akan terbuka otomatis  
```
Pesan template sudah terisi:
"Halo Pak Budi, saya ingin menanyakan 
kondisi Padi di Sektor 1."
```

**LANGKAH 4:** Edit pesan (jika perlu)  
```
Tambahkan informasi spesifik
Contoh: "Level air di sektor Anda sedang rendah (4 cm). 
Tolong cek sumber air."
```

**LANGKAH 5:** Kirim pesan  
```
Tap tombol Send di WhatsApp
```

---

## 9.2 Via Nomor HP (Manual)

### Jika Anda ingin telepon atau SMS:

**LANGKAH 1:** Buka detail sektor  

**LANGKAH 2:** Catat nomor HP pemilik  
```
Tertera di bagian informasi pemilik
Contoh: 081234567890
```

**LANGKAH 3:** Telepon/SMS manual  
```
Gunakan aplikasi telepon HP Anda
```

---

## 9.3 Template Pesan WhatsApp

### **Untuk Alert Level Air Kritis:**
```
Assalamualaikum Pak/Bu [Nama],

Saya dari [Admin Desa/Koperasi]. 
Level air di lahan Anda (Sektor [X]) 
sedang sangat rendah: [X] cm.

Mohon segera cek:
1. Sumber air utama
2. Pompa air
3. Pipa irigasi

Jika perlu, saya bisa hidupkan pompa 
manual dari sistem. Konfirmasi ya Pak/Bu.

Terima kasih 🙏
```

### **Untuk Cuaca Ekstrem:**
```
Assalamualaikum Pak/Bu [Nama],

Info cuaca: [Hujan deras/Panas terik] 
hari ini.

Saya sudah [matikan/hidupkan] pompa 
manual untuk sektor Anda.

Mohon pantau kondisi tanaman.

Terima kasih 🙏
```

### **Untuk Koordinasi Panen:**
```
Assalamualaikum Pak/Bu [Nama],

Mengingatkan rencana panen [Jenis Tanaman] 
di Sektor [X] pada tanggal [DD/MM/YYYY].

Apakah jadwal masih sesuai?

Terima kasih 🙏
```

---

# 10. MASALAH YANG SERING TERJADI

## 10.1 Tidak Bisa Login

### **Gejala:**
- ❌ Pesan: "Username atau password salah"
- ❌ Tombol login tidak merespon

### **Solusi:**

**COBA INI DULU (5 menit):**

1. **Cek Capslock**
   - Pastikan Capslock tidak aktif
   - Password harus huruf kecil/besar sesuai asli

2. **Cek Username dan Password**
   - Tanyakan ke admin jika lupa
   - Password default (jika belum diganti): `admin123`

3. **Refresh halaman**
   - Tarik layar ke bawah (HP)
   - Tekan Ctrl+R (komputer)
   - Atau tutup browser dan buka lagi

4. **Cek koneksi internet**
   - Buka website lain (Google, Facebook)
   - Jika tidak bisa, cek WiFi/data seluler

**JIKA MASIH GAGAL:**
- 📞 Hubungi admin untuk reset password
- 📞 Minta username dan password baru

---

## 10.2 Data Sensor Tidak Update

### **Gejala:**
- 🕐 Waktu update terakhir >5 menit lalu
- 📊 Data sensor stuck di angka yang sama
- 0️⃣ Semua sensor menunjukkan angka 0

### **Solusi:**

**COBA INI DULU (5 menit):**

1. **Refresh dashboard**
   - Tarik layar ke bawah (HP)
   - Tekan Ctrl+R (komputer)

2. **Tunggu 1-2 menit**
   - ESP32 kirim data setiap 20 detik
   - Beri waktu sistem update

3. **Cek koneksi internet Anda**
   - Pastikan HP/komputer tersambung internet

**JIKA MASIH TIDAK UPDATE:**
- 📞 Hubungi teknisi
- 💬 Kemungkinan ESP32 di lapangan bermasalah:
  - WiFi putus
  - Listrik mati
  - Sensor rusak
- 🔧 Teknisi perlu cek fisik ke lapangan

---

## 10.3 Pompa Tidak Merespon

### **Gejala:**
- 🔘 Klik tombol pompa tidak berubah status
- ⏱️ Loading terus-menerus (>10 detik)
- ⚠️ Muncul pesan "ESP32 belum konfirmasi"

### **Solusi:**

**COBA INI DULU (5 menit):**

1. **Tunggu 10 detik penuh**
   - ESP32 perlu waktu polling
   - Jangan klik tombol berkali-kali

2. **Refresh dashboard**
   - Tutup popup detail
   - Refresh halaman (Ctrl+R)
   - Buka detail sektor lagi
   - Cek status pompa terbaru

3. **Coba lagi sekali**
   - Klik tombol pompa sekali lagi
   - Tunggu 10 detik

**JIKA MASIH TIDAK MERESPON:**
- 📞 Hubungi teknisi
- 💬 Kemungkinan masalah:
  - ESP32 offline
  - Relay pompa rusak
  - Kabel putus
- 🔧 Teknisi perlu cek fisik ke lapangan

**ALTERNATIF SEMENTARA:**
- 🚶 Pergi ke lapangan
- 🔌 Hidupkan/matikan pompa manual (switch fisik)
- 📝 Catat di buku log

---

## 10.4 Tidak Menerima Alert WhatsApp

### **Gejala:**
- 📱 Alert tidak masuk ke WhatsApp
- 🔕 Padahal ada kondisi kritis di dashboard

### **Solusi:**

**COBA INI DULU (5 menit):**

1. **Cek nomor HP di sistem**
   - Buka detail sektor
   - Cek nomor HP pemilik sudah benar?
   - Format: 081234567890 (tanpa +62, tanpa spasi)

2. **Cek WhatsApp Anda**
   - Pastikan WhatsApp terinstall
   - Pastikan nomor HP aktif
   - Cek folder "Chat Lain" atau "Unknown"

3. **Test kirim pesan manual**
   - Klik tombol WhatsApp di detail sektor
   - Jika bisa buka chat → Nomor benar
   - Jika tidak bisa → Nomor salah

**JIKA MASIH TIDAK TERIMA:**
- 📞 Hubungi admin sistem
- 💬 Kemungkinan masalah:
  - Fonnte WhatsApp Gateway belum setup
  - Token Fonnte expired
  - Kuota pesan habis
  - Device Fonnte disconnect
- 🔧 Admin perlu cek konfigurasi WhatsApp Gateway

---

## 10.5 Dashboard Lemot/Lambat

### **Gejala:**
- 🐌 Dashboard loading lama (>10 detik)
- 🔄 Sering loading terus
- 💤 Card sektor tidak muncul

### **Solusi:**

**COBA INI DULU (5 menit):**

1. **Cek koneksi internet**
   - Tes kecepatan internet: speedtest.net
   - Minimal 1 Mbps untuk lancar
   - Pindah ke WiFi jika pakai data seluler

2. **Tutup aplikasi lain**
   - Tutup tab browser lain
   - Tutup aplikasi yang tidak dipakai
   - Free RAM/memori HP

3. **Clear cache browser**
   
   **Android (Chrome):**
   - Menu (3 titik) → Settings → Privacy
   - Clear browsing data
   - Pilih: Cached images and files
   - Clear data

   **iPhone (Safari):**
   - Settings → Safari → Clear History and Website Data
   - Confirm

4. **Restart HP/komputer**
   - Matikan dan hidupkan lagi
   - Buka aplikasi lagi

**JIKA MASIH LEMOT:**
- 📞 Hubungi admin sistem
- 💬 Beri info: "Dashboard lemot, internet [X] Mbps"
- 🔧 Admin perlu optimasi server/database

---

## 10.6 Card Sektor Tidak Muncul

### **Gejala:**
- 🔳 Dashboard kosong
- ❌ Tidak ada card sektor
- 📝 Tertulis "Tidak ada data"

### **Solusi:**

**COBA INI DULU (2 menit):**

1. **Cek search bar**
   - Apakah ada teks di kotak pencarian?
   - Jika ada, klik X untuk hapus
   - Semua sektor akan muncul lagi

2. **Refresh halaman**
   - Ctrl+R (komputer)
   - Tarik layar ke bawah (HP)

3. **Logout dan login lagi**
   - Klik tombol logout
   - Login dengan username/password
   - Dashboard harus muncul

**JIKA MASIH KOSONG:**
- 📞 Hubungi admin sistem
- 💬 Kemungkinan: Database belum ada data
- 🔧 Admin perlu inisialisasi database

---

# 📋 CHECKLIST HARIAN UNTUK ADMIN

## ☀️ **Pagi (07:00 WIB)**

### Monitoring Rutin (10 menit):
- [ ] Login ke dashboard
- [ ] Cek semua 10 sektor
- [ ] Perhatikan yang MERAH (level air <5 cm)
- [ ] Screenshot jika ada anomali
- [ ] Catat di buku log

### Action Items:
- [ ] Hubungi pemilik jika ada sektor kritis
- [ ] Matikan pompa manual jika hujan deras
- [ ] Hidupkan pompa manual jika panas terik

---

## ☀️ **Siang (13:00 WIB)**

### Quick Check (5 menit):
- [ ] Login ke dashboard
- [ ] Scan cepat 10 sektor (10 detik per sektor)
- [ ] Cek pompa seharusnya OFF (menit 13:00 bukan 0-14)
- [ ] Screenshot jika ada masalah

### Action Items:
- [ ] Respond alert WhatsApp (jika ada)
- [ ] Update buku log (jika ada kejadian)

---

## 🌙 **Sore (18:00 WIB)**

### Monitoring & Review (10 menit):
- [ ] Login ke dashboard
- [ ] Cek semua 10 sektor
- [ ] Review riwayat pompa hari ini
- [ ] Hitung total alert hari ini
- [ ] Update buku log (summary harian)

### Action Items:
- [ ] Koordinasi dengan teknisi (jika ada masalah)
- [ ] Reminder ke pemilik (jika perlu tindakan besok)
- [ ] Logout dari dashboard

---

# 📞 KONTAK DARURAT

## 🆘 Jika Ada Masalah Teknis

### **Admin Sistem**
- Nama: [Isi nama admin]
- HP: [Isi nomor HP]
- Jam kerja: Senin-Jumat, 08:00-17:00

### **Teknisi Lapangan**
- Nama: [Isi nama teknisi]
- HP: [Isi nomor HP]
- Tersedia: 24/7 untuk emergency

### **Support WhatsApp**
- Nomor: [Isi nomor WhatsApp support]
- Chat only: 08:00-20:00

---

## 📝 TEMPLATE PESAN KE TEKNISI

### **Jika Sensor Tidak Update:**
```
Halo [Nama Teknisi],

Ada masalah di Sektor [X]:
- Data sensor tidak update >30 menit
- Terakhir update: [HH:MM]
- Lokasi: [Alamat lahan]

Mohon cek ESP32 di lapangan.

Terima kasih!
```

### **Jika Pompa Tidak Bisa Dikontrol:**
```
Halo [Nama Teknisi],

Pompa di Sektor [X] tidak merespon:
- Sudah coba hidup/matikan 3x
- Selalu timeout
- Lokasi: [Alamat lahan]

Mohon cek ESP32 dan relay pompa.

Terima kasih!
```

---

# ✅ SELESAI!

## 🎉 Selamat!

Anda sudah selesai membaca SOP Penggunaan Sistem Monitoring Pertanian.

### **Yang sudah Anda pelajari:**
1. ✅ Cara login dan logout
2. ✅ Cara membaca kondisi sektor
3. ✅ Cara mengontrol pompa manual
4. ✅ Cara membaca alert WhatsApp
5. ✅ Cara menambah, edit, hapus sektor
6. ✅ Cara menghubungi pemilik lahan
7. ✅ Cara mengatasi masalah umum

### **Tips untuk Sukses:**
1. 📱 Simpan aplikasi di home screen HP
2. 📖 Simpan SOP ini untuk referensi
3. 📝 Selalu catat di buku log
4. 🤝 Koordinasi dengan pemilik lahan
5. 📞 Jangan ragu hubungi admin/teknisi

---

## 📚 Dokumen Pendukung

Jika ingin belajar lebih dalam:
- **SOP_LENGKAP.md** - SOP untuk admin & teknisi
- **ESP32_TROUBLESHOOTING_GUIDE.md** - Troubleshooting ESP32
- **HASIL_AUDIT_RINGKASAN.md** - Info sistem secara keseluruhan

---

**🌾 Selamat Menggunakan Sistem Monitoring!**

**Versi:** 1.0  
**Terakhir diupdate:** 7 Februari 2026  
**Contact Support:** [Isi email/WhatsApp support]

---

**Catatan:** SOP ini dibuat khusus untuk pengguna akhir (petani/admin desa) dengan bahasa yang mudah dipahami. Untuk dokumentasi teknis, silakan lihat dokumen lain.
