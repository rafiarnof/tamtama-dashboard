# 🚀 DEPLOYMENT GUIDE - ESP32 PUMP CONTROL FIX

> **Quick Reference untuk Deploy Perbaikan ESP32**

---

## ⚡ QUICK START (3 LANGKAH)

### 1️⃣ Deploy Edge Function

```bash
# Login & Link Project (hanya sekali)
supabase login
supabase link --project-ref wgjudfgqjqorkhdlvlgc

# Deploy Edge Function
supabase functions deploy make-server-5aa965b0

# ✅ Verify
curl https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0/health
```

**Expected:** `{"status":"ok","timestamp":"...","database":"normalized-postgres"}`

---

### 2️⃣ Test Command Queue

```bash
# Jalankan test script
chmod +x test-pump-control.sh
./test-pump-control.sh
```

**Expected:** Semua test ✅ PASS

---

### 3️⃣ Upload ESP32 Code

> **TIDAK PERLU UBAH CODE ESP32!**  
> Code ESP32 yang ada (`ESP32_SUPABASE_CODE.ino`) sudah compatible dengan sistem baru.

1. Buka Arduino IDE
2. Upload `ESP32_SUPABASE_CODE.ino` ke board
3. Pastikan WiFi & Supabase credentials sudah benar
4. Monitor Serial untuk verifikasi

---

## 📋 CHECKLIST DEPLOYMENT

- [ ] **Supabase Edge Function deployed**
  ```bash
  supabase functions deploy make-server-5aa965b0
  ```

- [ ] **Health check returns OK**
  ```bash
  curl https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0/health
  ```

- [ ] **Test script passed**
  ```bash
  ./test-pump-control.sh
  ```

- [ ] **ESP32 code uploaded**
  - WiFi connected
  - Sensor data sending every 20s
  - Checking pump command every 5s

- [ ] **Web dashboard working**
  - Login successful
  - Can toggle pump status
  - Pump status updated in UI

- [ ] **End-to-end test passed**
  - Web → ESP32 → Pump fisik

---

## 🔧 JIKA TERJADI ERROR

### Error: "Failed to fetch"

**Cause:** Edge Function belum deployed atau error

**Fix:**
```bash
# Re-deploy
supabase functions deploy make-server-5aa965b0 --no-verify-jwt

# Check logs
supabase functions logs make-server-5aa965b0 --tail
```

---

### Error: "Sector not found"

**Cause:** Sector ID di ESP32 tidak match dengan database

**Fix:**
1. Cek sector ID di Arduino code: `#define SECTOR_ID "SEC-001"`
2. Cek database: `SELECT sector_id FROM sectors;`
3. Pastikan match dengan salah satu sector yang ada

---

### ESP32: "No WiFi"

**Cause:** WiFi credentials salah atau sinyal lemah

**Fix:**
```cpp
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
```

---

### ESP32: "Sector not found"

**Cause:** Sector belum dibuat di database

**Fix:**
1. Login ke web dashboard
2. Klik "Tambah Sektor" 
3. Buat sector dengan ID yang sama dengan ESP32 (`SEC-001`, etc.)

---

## 📊 MONITORING

### Check Edge Function Logs

```bash
# Real-time logs
supabase functions logs make-server-5aa965b0 --tail

# Filter by sector
supabase functions logs make-server-5aa965b0 --tail | grep "SEC-001"
```

**Expected Logs:**
```
📊 ESP32 sensor update received: SEC-001
✅ Sensor data saved: SEC-001 - Temp: 28.5°C...
🔧 Pump control: SEC-001 → ON (command queued for ESP32)
✅ Pump command acknowledged: SEC-001 - marked as executed
```

---

### Check Command Queue

1. Buka Supabase Dashboard
2. Table Editor → `kv_store_5aa965b0`
3. Filter: `key` contains `pump-command:`

**Example:**
```
key: pump-command:SEC-001
value: {"status":"ON","executed":false,"timestamp":"2026-02-03T12:34:56Z"}
```

---

## 🎯 VERIFICATION STEPS

### Test dari Web Dashboard

1. **Login** → `admin` / `admin123`
2. **Click sector card** → Buka detail
3. **Toggle pump** → Klik "Pompa OFF" jadi "Pompa ON"
4. **Check logs** → Lihat di Edge Function logs
5. **Verify ESP32** → Monitor Serial ESP32

### Expected Serial Output (ESP32):

```
🎮 New pump command received: ON
  ✅ Pompa DINYALAKAN (SSR ON)
  ✅ Command acknowledged (executed = true)
```

---

## 📚 REFERENCE FILES

| File | Purpose |
|------|---------|
| `/supabase/functions/server/index.tsx` | Edge Function (server) |
| `/ESP32_SUPABASE_CODE.ino` | ESP32 code (Arduino) |
| `/ESP32_PUMP_CONTROL_FIX.md` | Technical documentation |
| `/test-pump-control.sh` | Test script |
| `/DEPLOY_ESP32_FIX.md` | This deployment guide |

---

## 🆘 SUPPORT

Jika masih ada masalah:

1. **Check logs** di semua layer:
   - Edge Function: `supabase functions logs`
   - ESP32 Serial Monitor: 115200 baud
   - Browser Console: F12 → Console

2. **Review documentation**:
   - `/ESP32_PUMP_CONTROL_FIX.md` - Technical details
   - `/ESP32_TROUBLESHOOTING_GUIDE.md` - Common issues

3. **Test manually** dengan `curl`:
   ```bash
   # Send ON command
   curl -X POST https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0/iot/pump-control \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -d '{"sectorId":"SEC-001","pumpStatus":"ON"}'
   
   # Check command
   curl https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0/pump-command/SEC-001 \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

---

## ✅ SUCCESS CRITERIA

- ✅ Edge Function deployed without errors
- ✅ Web dashboard can toggle pump status
- ✅ Command appears in KV store with `executed: false`
- ✅ ESP32 receives command via polling
- ✅ ESP32 executes pump ON/OFF
- ✅ ESP32 acknowledges command
- ✅ Command updated to `executed: true`
- ✅ Pump physical state matches web dashboard

---

**🎉 Selamat! Sistem ESP32 pump control sudah berfungsi dengan sempurna!**
