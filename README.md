# 🌱 Website Monitoring Pertanian

**Status:** ✅ Production Ready  
**Last Update:** 24 Juni 2026  
**Version:** 4.0 (Supabase Auth + RBAC + Modern UI Setup)

---

## 🚨 MENGALAMI ERROR ATAU BARU PERTAMA KALI?

### Error "Failed to Fetch" atau Edge Function bermasalah?
**👉 BACA INI:** [START_HERE.md](./START_HERE.md) ← **Mulai di sini!**

---

## ✨ PEMBARUAN TERBARU (Juni 2026)

Proyek ini telah menerima pembaruan besar-besaran:
1. **Perubahan Nama & Branding**: Kini menggunakan penamaan "Website Monitoring Pertanian" (sebelumnya Tamtama/HidroTower).
2. **Sistem Database & Backend Baru**: Beralih sepenuhnya ke **Supabase** (PostgreSQL, Supabase Auth, Edge Functions) menggantikan Firebase.
3. **Role-Based Access Control (RBAC)**: Pemisahan akses dengan dashboard spesifik untuk **Admin** (Akses Penuh) dan **User** (Akses Terbatas ke sektor tertentu).
4. **Pembaruan UI/UX (Frontend)**: 
   - Komponen UI modern berbasis **shadcn/ui** (Tailwind CSS v4).
   - Penambahan **Landing Page**, **Loading Spinner**, dan **ErrorBoundary** untuk stabilitas aplikasi.
   - Tampilan yang sepenuhnya responsif (Desktop & Mobile).
5. **Manajemen Sektor Real-time**: Sektor kini dinamis (tidak lock di 10 sektor) dan dapat ditambah, diubah, maupun dihapus oleh Admin.

---

## 🎯 QUICK START

### 📧 Email & Password untuk Login?

**Tidak ada kredensial default!** Sistem menggunakan Supabase Auth yang lebih aman.

**Langkah:**
1. Buka aplikasi → Akan tampil halaman **"Setup Admin Pertama"** jika database masih kosong.
2. Buat akun admin dengan kredensial pilihan Anda:
   - Email: Bebas (contoh: `admin@pertanian.com`)
   - Password: min 6 karakter
3. Klik "Buat Akun Admin".
4. Gunakan email & password tersebut untuk login.

**Lupa password?** Klik "Lupa password?" di UI login (Fitur bypass tanpa email verifikasi sudah disiapkan untuk kemudahan testing).

---

## 🚀 DEPLOYMENT (Pilih Salah Satu)

### Opsi 1: One-Click Setup (TERCEPAT)
```bash
chmod +x setup-all.sh
./setup-all.sh
```

### Opsi 2: Development Mode (Testing UI Only)
```bash
chmod +x enable-dev-mode.sh
./enable-dev-mode.sh
# Refresh browser
```

### Opsi 3: Produksi Manual (Supabase Edge Function)
```bash
npm install -g supabase
supabase login
supabase link --project-ref wgjudfgqjqorkhdlvlgc
# Setup Schema SQL: Buka file supabase/migrations/002_rbac_system_v2_FIXED.sql dan copy ke Supabase SQL Editor
supabase functions deploy make-server-5aa965b0
./check-deployment.sh
```

---

## 📚 DOKUMENTASI UTAMA

| File | Deskripsi | Prioritas |
|------|-----------|-----------|
| **[START_HERE.md](./START_HERE.md)** | 🚨 Error troubleshooting & quick start | ⭐⭐⭐ |
| **[MULAI_DISINI.md](./MULAI_DISINI.md)** | Panduan Utama Monitoring (Sudah Diupdate) | ⭐⭐⭐ |
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | Panduan deployment lengkap ke Supabase | ⭐⭐⭐ |
| **[RBAC_IMPLEMENTATION_PLAN.md](./RBAC_IMPLEMENTATION_PLAN.md)** | Dokumentasi flow Admin vs User | ⭐⭐ |
| **[env.config.js](./env.config.js)** | Konfigurasi aplikasi (EDIT INI!) | ⭐⭐⭐ |

---

## 🎯 COMMAND CENTER

Untuk mempermudah manajemen, gunakan script interaktif:

```bash
chmod +x hidrotower.sh
./hidrotower.sh
```

---

## ✨ FITUR APLIKASI
- 📊 **Monitoring Real-Time**: Tarik data sensor (Suhu, Kelembaban, Level Air, Cahaya) setiap 20 detik dari IoT ESP32.
- 💧 **Kontrol Pompa Otomatis & Manual**: Penjadwalan terjadwal menit 0-15 atau manual remote lewat website.
- 📱 **Integrasi WhatsApp**: Auto-alert WhatsApp via Fonnte Gateway saat level air kritis.
- 🔐 **Multi-Role Security**: Login dengan Supabase Auth untuk Admin (pengelola sistem) dan User (petani/warga penerima notifikasi).
- 🌱 **Manajemen Sektor Dinamis**: Lengkap dengan data pemilik, tanaman, dan info status sensor. 
