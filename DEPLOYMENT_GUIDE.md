# 🚀 Panduan Deployment HidroTower

## ❌ Error yang Anda Alami

```
Fetch error for /sectors: TypeError: Failed to fetch
⚠️  EDGE FUNCTION BELUM DI-DEPLOY
Aplikasi otomatis menggunakan MOCK DATA.
```

## 🔍 Penyebab Error

Edge Function Supabase **belum di-deploy** ke server Supabase Anda, sehingga aplikasi tidak bisa berkomunikasi dengan database dan fallback ke mock data.

---

## ✅ Solusi 1: Deploy Edge Function (REKOMENDASI)

### Langkah 1: Pastikan Supabase CLI Terinstall

```bash
# Install Supabase CLI (jika belum)
npm install -g supabase
```

### Langkah 2: Login ke Supabase

```bash
supabase login
```

### Langkah 3: Link Project

```bash
# Link ke project Supabase Anda
supabase link --project-ref egcfzsgfxzgyuldztpgr
```

### Langkah 4: Deploy Edge Function

```bash
# Deploy function server
supabase functions deploy make-server-5aa965b0
```

### Langkah 5: Verifikasi Deployment

Buka browser dan akses:
```
https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0/health
```

**Response yang benar:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-03T...",
  "database": "normalized-postgres"
}
```

---

## ✅ Solusi 2: Gunakan Mode Development (ALTERNATIF)

Jika Anda ingin development tanpa deploy Edge Function terlebih dahulu:

### Edit `/env.config.js`

```javascript
export const ENV = {
  DEV_MODE: true,  // ← Ubah dari false ke true
  VITE_ADMIN_NAME: 'Admin HidroTower',
  VITE_ADMIN_PHONE: '081234567890',
  // ... config lainnya
};
```

### Refresh Browser

```
Tekan Ctrl + R atau F5
```

Mode development akan menggunakan **mock data** yang sudah disiapkan.

---

## 📧 Email & Password untuk Login

### Skenario 1: Pertama Kali (Belum Ada Admin)

Saat pertama kali membuka aplikasi:

1. **Aplikasi akan menampilkan halaman "Setup Admin Pertama"**
2. Isi form dengan:
   - **Nama Lengkap**: Nama Anda (contoh: `Admin Hidroponik`)
   - **Email**: Email bebas (contoh: `admin@hidrotower.com`)
   - **Nomor HP**: Opsional (contoh: `081234567890`)
   - **Password**: Minimal 6 karakter (contoh: `admin123`)
   - **Konfirmasi Password**: Ulangi password

3. Klik **"Buat Akun Admin"**
4. Sistem akan otomatis login

### Skenario 2: Sudah Ada Admin

Gunakan **email dan password** yang Anda buat saat setup untuk login.

**Contoh kredensial yang saya sarankan:**
```
Email    : admin@hidrotower.com
Password : admin123
```

---

## 🔧 Troubleshooting

### Problem: "Invalid login credentials"

**Solusi:**
1. Pastikan Anda sudah membuat akun melalui **Setup Admin**
2. Atau gunakan fitur **"Lupa password?"** di halaman login
3. Atau cek user di Supabase Dashboard → Authentication → Users

### Problem: Edge Function Error 500

**Solusi:**
1. Cek logs di Supabase Dashboard → Functions → Logs
2. Pastikan environment variables sudah di-set:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Problem: CORS Error

**Solusi:**
Edge function sudah dikonfigurasi dengan CORS `origin: "*"`. Jika masih error, cek browser console untuk detail.

---

## 📝 Checklist Deployment

- [ ] Supabase CLI terinstall
- [ ] Login ke Supabase berhasil
- [ ] Project linked dengan benar
- [ ] Edge Function deployed
- [ ] Health check endpoint working
- [ ] Database tables sudah dibuat (owners, plants, sectors, sensor_data, pump_history, kv_store_5aa965b0)
- [ ] Setup Admin selesai
- [ ] Login berhasil

---

## 🆘 Butuh Bantuan?

Jika masih mengalami masalah:

1. Cek console browser (F12 → Console tab)
2. Cek logs di Supabase Dashboard → Functions → make-server-5aa965b0 → Logs
3. Pastikan database tables sudah dibuat dengan struktur yang benar

---

## 📊 Struktur Database yang Diperlukan

```sql
-- Jalankan SQL ini di Supabase SQL Editor jika tables belum ada

-- Table: owners
CREATE TABLE IF NOT EXISTS owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: plants
CREATE TABLE IF NOT EXISTS plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  planted_date DATE,
  expected_harvest DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: sectors
CREATE TABLE IF NOT EXISTS sectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sector_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES owners(id) ON DELETE SET NULL,
  plant_id UUID REFERENCES plants(id) ON DELETE SET NULL,
  schedule_enabled BOOLEAN DEFAULT true,
  schedule_start_hour INTEGER DEFAULT 4,
  schedule_end_hour INTEGER DEFAULT 19,
  schedule_duration INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: sensor_data
CREATE TABLE IF NOT EXISTS sensor_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
  temperature REAL DEFAULT 0,
  humidity REAL DEFAULT 0,
  water_level REAL DEFAULT 0,
  light_level REAL DEFAULT 0,
  pump_status TEXT DEFAULT 'OFF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: pump_history
CREATE TABLE IF NOT EXISTS pump_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  triggered_by TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: kv_store_5aa965b0 (untuk pump commands)
CREATE TABLE IF NOT EXISTS kv_store_5aa965b0 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_sensor_data_sector_id ON sensor_data(sector_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_created_at ON sensor_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pump_history_sector_id ON pump_history(sector_id);
CREATE INDEX IF NOT EXISTS idx_sectors_sector_id ON sectors(sector_id);
```

---

**Selamat menggunakan HidroTower! 🌱💧**
