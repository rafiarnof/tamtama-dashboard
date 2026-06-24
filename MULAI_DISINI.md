# 🌱 WEBSITE MONITORING PERTANIAN

> **Dashboard monitoring sektor pertanian dengan IoT ESP32, Supabase Real-time (sebelumnya Firebase), WhatsApp auto-alert, dan sistem penjadwalan pompa terintegrasi.**

---

## 🚀 **QUICK START (VERSI TERBARU JUNI 2026)**

### **1. Login ke Dashboard**
Aplikasi **Website Monitoring Pertanian** menggunakan pengamanan via **Supabase Auth**.

- **Tidak ada kredensial bawaan/default!** 
- Saat pertama kali dijalankan, web akan otomatis mengalihkan Anda ke halaman **Setup Admin Pertama**.
- Masukkan Email & Password yang Anda inginkan disana, kemudian login.

### **2. Setup Database & Backend (WAJIB!)**
Kami merekomendasikan setup otomatis menggunakan **Supabase**:
1. Jalankan `./setup-all.sh` di terminal (pastikan Git dan Node.js sudah tepasang).
2. Jika setup manual, import query dari `supabase/migrations/002_rbac_system_v2_FIXED.sql` ke Supabase SQL Editor Anda.
3. Refresh browser!

### **3. Konfigurasi Sistem (env.config.js)**
Ubah konfigurasi di file `env.config.js` sesuai data proyek Anda:
- Token Fonnte (untuk WhatsApp Alert)
- Nama dan Kontak Administrator Utama

### **4. Setup Perangkat IoT ESP32 (Opsional)**
1. Kode Production dapat ditemukan di file `TAMTAMA_ESP32_PRODUCTION.ino`.
2. Koneksikan sensor (DHT22, Ultrasonik, Relay Pompa, LDR).
3. Update kredensial WiFi & Supabase URL/API KEY yang ada di dalam file .ino.
4. Upload ke ESP32. Dashboard akan update otomatis setiap 20 detik.

---

## 📚 **DOKUMENTASI LENGKAP**

| File | Deskripsi |
|------|-----------|
| **START_HERE.md** | Penyelesaian Error "Failed to Fetch" dan Edge Functions |
| **README.md** | Dokumentasi Umum & Status Proyek Terkini |
| **RBAC_QUICK_START.md** | Panduan tentang perbedaan role Admin dan User |
| **DEPLOYMENT_GUIDE.md** | Petunjuk setup Supabase & Edge Function manual |
| **ESP32_INTEGRATION_GUIDE.md** | Panduan wiring dan setting IoT ESP32 |

---

## 🎯 **FITUR UTAMA SEKARANG**
- **Modern & Cepat**: Web sudah dioptimasi dengan standard Shadcn UI terbaru, Landing Page interaktif, serta perbaikan error boundaries.
- **Sistem Role-based (RBAC)**:
  - **Admin**: bisa tambah sektor, edit data pengguna, menghidup/matikan pompa, monitor semua status.
  - **User**: View only untuk sektor yang telah ditugaskan, fokus pada notifikasi jika ada krisis air.
- **Auto-Alert WhatsApp**: Pemberitahuan kondisi sektor via WhatsApp otomatis ke petani dan warga.
- **Data Tersinkronisasi**: Sistem polling dan edge function Supabase di backend sudah dioptimasi dari model serverless sebelumnya (Firebase).

---

## ✅ **CHECKLIST READY-TO-USE**

Sistem dinyatakan ready jika:
- [ ] Berhasil melewati halaman "Setup Admin Pertama" dan bisa login ke Dashboard Admin.
- [ ] Koneksi Fonnte/WhatsApp Token telah dikonfigurasi di `env.config.js` (Jika perlu alert WhatsApp).
- [ ] Database Table di Supabase (users, profiles, sectors, dll) ter-isi.
- [ ] Status ESP32 Connected (Ditandai Ikon Hijau di tampilan Dashboard IoT-nya).

**SELAMAT MEMONITORING HASIL PERTANIAN ANDA!** 🌱
