# 🚀 QUICK START - Setup WhatsApp Alert (5 Menit!)

## ✅ **FILE `.env` SUDAH DIBUAT!**

File sudah ada di root project: `/.env`

---

## 📝 **LANGKAH SETUP (5 MENIT):**

### **STEP 1: Edit Nomor HP Admin (1 menit)**

Buka file `/.env`, cari baris:

```bash
VITE_ADMIN_PHONE=081234567890
```

**GANTI** dengan nomor HP Admin yang benar!

Contoh:
```bash
VITE_ADMIN_PHONE=08123456789  # Nomor HP Anda
```

**Format:**
- ✅ `081234567890` (benar)
- ✅ `08123456789` (benar)
- ❌ `+6281234567890` (salah - jangan pakai +62)
- ❌ `0812 3456 7890` (salah - jangan ada spasi)

**Save file!**

---

### **STEP 2: Daftar Fonnte (3 menit)**

#### **A. Buka Website Fonnte**
```
https://fonnte.com/
```

#### **B. Klik "Daftar Gratis"**
- Isi email
- Isi password
- Klik "Daftar"
- Cek email → Klik link verifikasi

#### **C. Login ke Dashboard**
```
https://console.fonnte.com/
```

---

### **STEP 3: Connect WhatsApp (1 menit)**

#### **A. Di Dashboard Fonnte:**
1. Klik menu **"Device"** (sidebar kiri)
2. Klik tombol **"+ Tambah Device"**
3. Akan muncul **QR Code**

#### **B. Di HP Admin:**
1. Buka WhatsApp
2. Tap menu (3 titik) → **"Linked Devices"** / **"Perangkat Tertaut"**
3. Tap **"Link a Device"** / **"Tautkan Perangkat"**
4. **Scan QR Code** dari dashboard Fonnte

#### **C. Verify:**
- Status di dashboard Fonnte berubah jadi: **"Connected"** ✅
- Muncul nama device (misal: "Chrome - Windows")

---

### **STEP 4: Copy Token API (1 menit)**

#### **A. Di Dashboard Fonnte:**
1. Klik menu **"API"** (sidebar kiri)
2. Lihat section **"Your Token"**
3. Klik tombol **"Copy"** atau copy manual

Token biasanya format: `abc123@defg456` atau `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

#### **B. Paste ke File `.env`:**

Buka file `/.env`, cari baris:

```bash
VITE_FONNTE_TOKEN=
```

Paste token di sana:

```bash
VITE_FONNTE_TOKEN=abc123@defg456
```

**Save file!**

---

### **STEP 5: Restart Aplikasi (1 menit)**

#### **Di Terminal/Command Prompt:**

```bash
# Stop aplikasi (tekan):
Ctrl+C

# Tunggu sampai benar-benar stop

# Restart:
npm run dev
```

**Tunggu sampai muncul:**
```
✓ ready in XXX ms
➜ Local:   http://localhost:5173/
```

---

### **STEP 6: Refresh Browser (10 detik)**

Di browser tempat aplikasi buka:

```
Tekan: Ctrl + Shift + R
```

Atau:
```
Tekan F5 beberapa kali
```

---

### **STEP 7: Verify Success (10 detik)**

#### **A. Buka Console Browser**
```
Tekan: F12
Atau klik kanan → Inspect → Tab "Console"
```

#### **B. Lihat Log:**

**✅ SUCCESS (Kalau setup benar):**
```
✅ Admin settings loaded from localStorage: {
  adminName: "Admin Desa",
  adminPhone: "08123456789",    ← Nomor Anda
  enableAdminAlert: true,
  enableWargaAlert: true,
  waterThreshold: 5
}

╔═══════════════════════════════════════════════════════════╗
║  ⚙️  ADMIN SETTINGS - USING ENVIRONMENT VARIABLES       ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║  📱 SETUP WHATSAPP AUTO-ALERT (DUAL MODE)                ║
╚═══════════════════════════════════════════════════════════╝

✅ Real-time update: 10 sectors
```

**❌ ERROR (Kalau ada yang salah):**
```
Error getting admin settings: FirebaseError: permission-denied
```

Jika muncul error → Cek apakah file `.env` sudah benar!

---

## 🧪 **TEST WhatsApp Alert:**

### **Test 1: Manual Edit di Firebase**

1. **Buka Firebase Console:**
   ```
   https://console.firebase.google.com/
   ```

2. **Pilih project → Firestore Database → Data tab**

3. **Pilih collection `sectors` → Pilih sektor mana saja**

4. **Edit field `data.waterLevel`:**
   - Klik field `waterLevel`
   - Ganti jadi `3` (atau angka < 5)
   - Save

5. **Tunggu 5-10 detik**

6. **Cek HP Admin & Warga:**
   - ✅ Admin terima WhatsApp (detail lengkap)
   - ✅ Warga terima WhatsApp (instruksi action)

---

### **Test 2: Lihat Console Log**

Di console browser (F12), seharusnya muncul:

```
🚨 Level air kritis di Sektor Padi 1: 3 cm
✅ WhatsApp alert terkirim ke Pak Budi (WARGA)
✅ WhatsApp alert terkirim ke Admin Desa (ADMIN)
```

---

### **Test 3: Cek HP**

**HP Admin seharusnya terima:**
```
⚠️ [ADMIN ALERT] LEVEL AIR KRITIS

Halo Admin Desa,

Ada sektor yang membutuhkan perhatian:

📊 DETAIL SEKTOR:
• ID: SEC-001
• Nama: Sektor Padi 1
• Level Air: 3 cm ⚠️
• Status: KRITIS

👤 PEMILIK SEKTOR:
• Nama: Pak Budi
• No. HP: 08123456789

✅ STATUS NOTIFIKASI:
• Alert sudah dikirim ke Pak Budi
• Menunggu konfirmasi dari pemilik

📝 ACTION PLAN:
1. Monitor apakah warga sudah isi tangki
2. Hubungi warga jika tidak ada respon dalam 1 jam
3. Cek lapangan jika diperlukan

🔗 Quick Action:
Hubungi warga: https://wa.me/628123456789?text=Halo%20Pak%20Budi

_Sistem Monitoring Pertanian Desa_
```

**HP Warga (pemilik sektor) seharusnya terima:**
```
🚨 PERINGATAN LEVEL AIR KRITIS

Halo Pak Budi,

Terdapat peringatan penting untuk sektor Anda:

📍 Sektor: Sektor Padi 1
💧 Level Air: 3 cm
⚠️ Status: KRITIS (< 5 cm)

⚡ Tindakan Segera:
1. Cek kondisi tangki air
2. Isi ulang tangki segera
3. Pastikan pompa berfungsi normal

Harap segera lakukan pengecekan untuk menghindari gagal panen.

_Pesan ini dikirim otomatis oleh Sistem Monitoring Pertanian Desa_
```

---

## ✅ **VERIFICATION CHECKLIST:**

Setup berhasil jika semua ini ✅:

- [ ] File `.env` sudah ada di root project
- [ ] `VITE_ADMIN_PHONE` sudah diganti dengan nomor yang benar
- [ ] Fonnte.com sudah daftar & login
- [ ] WhatsApp sudah di-connect di Fonnte (status: Connected)
- [ ] Token API sudah di-copy dari Fonnte
- [ ] `VITE_FONNTE_TOKEN` di `.env` sudah diisi dengan token
- [ ] Aplikasi sudah di-restart (npm run dev)
- [ ] Browser sudah di-refresh (Ctrl+Shift+R)
- [ ] Console browser tidak ada error
- [ ] Console menampilkan nomor HP yang benar
- [ ] Test edit waterLevel < 5 → WhatsApp masuk ke HP Admin & Warga

---

## 🐛 **TROUBLESHOOTING:**

### **❌ WhatsApp tidak terkirim**

**Cek 1: Token sudah benar?**
```bash
# Di console browser (F12):
console.log(import.meta.env.VITE_FONNTE_TOKEN);

# Seharusnya tampil token, bukan undefined
```

**Cek 2: WhatsApp masih connected?**
- Buka dashboard Fonnte
- Menu "Device"
- Status: "Connected" ✅
- Jika "Disconnected" → Scan QR lagi

**Cek 3: Nomor HP valid?**
```bash
# Di console browser (F12):
console.log(import.meta.env.VITE_ADMIN_PHONE);

# Seharusnya tampil: "081234567890"
```

**Cek 4: Kuota Fonnte habis?**
- Buka dashboard Fonnte
- Cek "Sisa Kuota"
- FREE plan: 100 pesan/hari
- Jika habis → Tunggu besok atau upgrade

---

### **❌ Error: "Fonnte Token belum diset"**

**Console log:**
```
⚠️ Fonnte Token belum diset. Pesan WhatsApp tidak terkirim.
📱 Target (WARGA): 628123456789
💬 Pesan: [pesan lengkap]
```

**Solusi:**
1. Buka file `/.env`
2. Cek baris `VITE_FONNTE_TOKEN=`
3. Pastikan ada isinya (bukan kosong)
4. Restart app
5. Refresh browser

---

### **❌ Settings tidak berubah setelah edit .env**

**Penyebab:** App belum di-restart atau localStorage masih pakai settings lama.

**Solusi:**
```bash
# 1. Restart app
Ctrl+C
npm run dev

# 2. Clear localStorage di browser
# Console (F12):
localStorage.clear();

# 3. Hard refresh
Ctrl+Shift+R
```

---

### **❌ Nomor HP salah format**

**Error di console:**
```
❌ Nomor HP warga tidak valid: +6281234567890
```

**Solusi:**
- Format yang benar: `081234567890`
- JANGAN pakai: `+62`, spasi, atau dash `-`

---

## 💡 **TIPS:**

### **Tip 1: Test Mode (tanpa Fonnte)**

Jika belum setup Fonnte, app tetap jalan normal. Alert hanya log di console (tidak terkirim ke WA).

Console log:
```
⚠️ Fonnte Token belum diset. Pesan WhatsApp tidak terkirim.
📱 Target (WARGA): 628123456789
💬 Pesan: [pesan lengkap ditampilkan di sini]
```

Berguna untuk development/testing tanpa kirim WA beneran.

---

### **Tip 2: HP Khusus untuk Admin**

Recommended: Pakai HP khusus untuk sistem (bukan HP pribadi).

**Kenapa?**
- ✅ Lebih professional
- ✅ Tidak campur dengan chat pribadi
- ✅ Bisa dipantau 24/7
- ✅ Tidak ganggu HP pribadi

**Alternatif:** Pakai nomor WhatsApp Business.

---

### **Tip 3: Backup Token**

Copy token Fonnte ke tempat aman (Notepad, Google Keep, dll).

Jika lupa token:
1. Login dashboard Fonnte
2. Menu "API"
3. Copy lagi

---

### **Tip 4: Monitor Kuota**

Cek kuota Fonnte secara berkala:
- Dashboard Fonnte → Lihat "Sisa Kuota"
- FREE: 100 pesan/hari (reset setiap hari)
- Jika sering habis → Upgrade ke plan berbayar (Rp 50k/bulan unlimited)

---

## 📊 **SISTEM DUAL ALERT:**

```
┌─────────────────────────────────────────────────┐
│  ESP32 deteksi: waterLevel = 3 cm (< 5 cm)      │
│                 ↓                                │
│  Firebase update real-time                      │
│                 ↓                                │
│  React App detect kritis via onSnapshot         │
│                 ↓                                │
│         DUAL ALERT TRIGGERED!                   │
│                 ↓                                │
│     ┌───────────┴───────────┐                  │
│     ▼                       ▼                   │
│  WA ke WARGA             WA ke ADMIN            │
│  (Simple, action)        (Detail, monitoring)   │
└─────────────────────────────────────────────────┘
```

---

## 🎊 **SELESAI!**

Jika semua step sudah diikuti:

✅ **Aplikasi berjalan tanpa error**  
✅ **Admin settings load dari .env**  
✅ **WhatsApp alert otomatis terkirim**  
✅ **Dual alert ke Admin & Warga**  
✅ **Sistem monitoring pertanian COMPLETE!**

---

## 📖 **DOKUMENTASI LENGKAP:**

- `/SIMPLIFIED_SETUP_GUIDE.md` - Setup admin settings
- `/DUAL_ALERT_SYSTEM_GUIDE.md` - Cara kerja dual alert
- `/SETUP_WHATSAPP_GATEWAY.md` - Detail WhatsApp gateway
- `/.env.example` - Template configuration

---

**READY TO GO!** 🚀

**Butuh bantuan?** Tanya saja! 😊
