# 🚨 MULAI DI SINI - Error "Failed to Fetch"

## ❌ Error yang Anda Alami

```
Fetch error for /sectors: TypeError: Failed to fetch
⚠️  EDGE FUNCTION BELUM DI-DEPLOY
```

---

## 🎯 SOLUSI PALING MUDAH (1 Command!)

Jalankan setup otomatis:

```bash
chmod +x make-executable.sh setup-all.sh
./setup-all.sh
```

Script ini akan:
1. ✅ Check prerequisites (Node.js, npm, Supabase CLI)
2. ✅ Login ke Supabase (buka browser)
3. ✅ Link project otomatis
4. ✅ Setup database schema
5. ✅ Deploy Edge Function
6. ✅ Verify deployment

**Selesai dalam 5 menit!**

---

## ✅ ALTERNATIF: Manual Step-by-Step

### 🛠️ Opsi 1: Development Mode (Testing UI, 2 Menit)

**Kelebihan:** Cepat, tidak perlu deploy  
**Kekurangan:** Hanya testing UI, ESP32 tidak bisa connect

```bash
chmod +x enable-dev-mode.sh
./enable-dev-mode.sh
```

Lalu **refresh browser** (Ctrl+R).

---

### 🚀 Opsi 2: Deploy Edge Function Manual (Production, 5 Menit)

**Kelebihan:** Full production, ESP32 bisa connect  
**Kekurangan:** Perlu setup sedikit

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link project
supabase link --project-ref wgjudfgqjqorkhdlvlgc

# 4. Setup database (copy-paste SQL dari database-schema.sql)
#    Buka: Supabase Dashboard → SQL Editor → Paste → Run

# 5. Deploy Edge Function
supabase functions deploy make-server-5aa965b0

# 6. Verifikasi
chmod +x check-deployment.sh
./check-deployment.sh
```

---

## 🔑 Email & Password untuk Login?

### ⚠️ PENTING: Tidak Ada Kredensial Default!

Sistem menggunakan **Supabase Auth**. Anda harus membuat akun sendiri.

### 📝 Langkah Login

#### 1️⃣ Pertama Kali (Belum Ada Admin)

Saat buka aplikasi:
- Akan muncul halaman **"Setup Admin Pertama"**
- Isi form:
  - **Email:** `admin@hidrotower.com` (atau email lain)
  - **Password:** `admin123` (minimal 6 karakter)
  - **Nama:** `Admin HidroTower`
  - **Nomor HP:** `082195668584` (opsional)
- Klik **"Buat Akun Admin"**
- Sistem akan otomatis login

#### 2️⃣ Setelah Setup

Login dengan:
- **Email:** Yang Anda buat tadi
- **Password:** Yang Anda buat tadi

#### 3️⃣ Lupa Password?

Klik **"Lupa password?"** di halaman login, lalu:
1. Masukkan email terdaftar
2. Masukkan password baru
3. Konfirmasi password baru
4. Password langsung diperbarui (tanpa verifikasi email)

---

## 🎯 Command Center (Semua Dalam 1 Script)

Gunakan script interaktif:

```bash
chmod +x hidrotower.sh
./hidrotower.sh
```

**Menu yang tersedia:**
1. 📊 Cek Status Deployment
2. 🚀 Deploy Edge Function
3. 🛠️  Enable Development Mode
4. 🗄️  Disable Development Mode
5. 📝 Lihat Logs Edge Function
6. 🔑 Info Login & Credentials
7. 📖 Buka Panduan Lengkap
8. ❌ Exit

---

## 📊 Verifikasi Deployment Berhasil

Setelah deploy, cek status:

```bash
./check-deployment.sh
```

**Output yang benar:**
```
✅ Edge Function is ONLINE!

Response:
{
  "status": "ok",
  "timestamp": "2026-03-03T...",
  "database": "normalized-postgres"
}
```

**Atau buka di browser:**
```
https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0/health
```

---

## 🆘 Troubleshooting Cepat

### Problem: Edge Function Error
```bash
./check-deployment.sh
```

### Problem: Invalid Login Credentials
1. Pastikan sudah setup admin pertama kali
2. Atau gunakan fitur "Lupa password?" di halaman login
3. Atau cek di Supabase Dashboard → Authentication → Users

### Problem: CORS Error
Clear browser cache (Ctrl+Shift+Del) lalu refresh

### Problem: Database Error
Pastikan SQL schema sudah dijalankan:
1. Buka Supabase Dashboard → SQL Editor
2. Copy-paste isi file `database-schema.sql`
3. Klik "Run" atau tekan Ctrl+Enter

---

## 📁 File Penting

| File | Fungsi |
|------|--------|
| **START_HERE.md** | 👈 Anda di sini! Quick start guide |
| **setup-all.sh** | 🚀 One-click setup otomatis |
| **hidrotower.sh** | 🎯 Interactive command center |
| **check-deployment.sh** | ✅ Cek status deployment |
| **enable-dev-mode.sh** | 🛠️  Enable dev mode (mock data) |
| **disable-dev-mode.sh** | 🗄️  Disable dev mode (production) |
| **database-schema.sql** | 📊 SQL script untuk database |
| **DEPLOYMENT_GUIDE.md** | 📚 Panduan deployment lengkap |
| **QUICK_REFERENCE.md** | 📖 Quick reference guide |
| **env.config.js** | ⚙️ Konfigurasi aplikasi |

---

## 🎬 Quick Start (TL;DR)

### Super Cepat (1 Command):
```bash
chmod +x setup-all.sh && ./setup-all.sh
```

### Untuk Testing UI Only (2 menit):
```bash
chmod +x enable-dev-mode.sh
./enable-dev-mode.sh
# Refresh browser
```

### Untuk Production Manual (5 menit):
```bash
npm install -g supabase
supabase login
supabase link --project-ref wgjudfgqjqorkhdlvlgc
# Copy-paste database-schema.sql ke Supabase SQL Editor
supabase functions deploy make-server-5aa965b0
./check-deployment.sh
# Refresh browser → Setup admin → Login
```

---

## 📝 Checklist Deployment

- [ ] Supabase CLI installed
- [ ] Logged in to Supabase
- [ ] Project linked
- [ ] Database tables created (6 tables)
- [ ] Edge Function deployed
- [ ] Health endpoint returns 200 OK
- [ ] Setup admin completed
- [ ] Login successful
- [ ] Dashboard loads data

---

## 🌐 URLs Penting

| Service | URL |
|---------|-----|
| **Supabase Dashboard** | https://supabase.com/dashboard/project/wgjudfgqjqorkhdlvlgc |
| **Edge Function Health** | https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0/health |
| **SQL Editor** | https://supabase.com/dashboard/project/wgjudfgqjqorkhdlvlgc/sql |
| **Auth Users** | https://supabase.com/dashboard/project/wgjudfgqjqorkhdlvlgc/auth/users |
| **Function Logs** | https://supabase.com/dashboard/project/wgjudfgqjqorkhdlvlgc/functions/make-server-5aa965b0/logs |

---

**🌱 Selamat Menggunakan HidroTower!**

**Need help?** Jalankan: `./hidrotower.sh`