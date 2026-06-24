# 🚀 HidroTower - Quick Start

## ❓ Saya Mengalami Error "Failed to Fetch"

**Penyebab:** Edge Function Supabase belum di-deploy.

**Solusi Cepat:**

### Opsi 1: Gunakan Development Mode (Testing UI Only)
```bash
chmod +x enable-dev-mode.sh
./enable-dev-mode.sh
```
Lalu refresh browser (Ctrl+R).

### Opsi 2: Deploy Edge Function (Production - Recommended)
```bash
# 1. Install CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link project
supabase link --project-ref wgjudfgqjqorkhdlvlgc

# 4. Deploy
supabase functions deploy make-server-5aa965b0

# 5. Verifikasi
chmod +x check-deployment.sh
./check-deployment.sh
```

---

## 📧 Email & Password untuk Login?

**Tidak ada kredensial default!** Sistem menggunakan Supabase Auth.

### Pertama Kali (Belum Ada Admin)
1. Buka aplikasi
2. Akan muncul halaman **"Setup Admin Pertama"**
3. Isi form dengan email & password pilihan Anda
4. Contoh:
   - Email: `admin@hidrotower.com`
   - Password: `admin123`
5. Klik **"Buat Akun Admin"**

### Setelah Setup
Login dengan email & password yang sudah Anda buat.

### Lupa Password?
Klik **"Lupa password?"** di halaman login.

---

## 📁 File Penting

| File | Fungsi |
|------|--------|
| `DEPLOYMENT_GUIDE.md` | Panduan lengkap deployment |
| `env.config.js` | Konfigurasi aplikasi (edit ini!) |
| `check-deployment.sh` | Cek status deployment |
| `enable-dev-mode.sh` | Aktifkan mode development |
| `disable-dev-mode.sh` | Kembali ke production mode |

---

## 🛠️ Useful Commands

```bash
# Cek status deployment
./check-deployment.sh

# Enable dev mode (mock data)
./enable-dev-mode.sh

# Disable dev mode (gunakan database)
./disable-dev-mode.sh

# Deploy Edge Function
supabase functions deploy make-server-5aa965b0

# Lihat logs Edge Function
supabase functions logs make-server-5aa965b0
```

---

## 📊 Database Tables

Jika tables belum ada, jalankan SQL script dari `DEPLOYMENT_GUIDE.md` di Supabase Dashboard → SQL Editor.

Tables yang diperlukan:
- `owners`
- `plants`
- `sectors`
- `sensor_data`
- `pump_history`
- `kv_store_5aa965b0`

---

## 🔧 Troubleshooting

### Edge Function Error
```bash
./check-deployment.sh
```

### Auth Error (Invalid credentials)
1. Pastikan sudah setup admin
2. Atau gunakan fitur "Lupa password?"
3. Atau cek Supabase Dashboard → Authentication → Users

### CORS Error
Edge Function sudah include CORS headers. Clear browser cache.

---

## 📞 Support

Baca dokumentasi lengkap: `DEPLOYMENT_GUIDE.md`
