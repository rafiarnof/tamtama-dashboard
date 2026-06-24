# 🚀 QUICK FIX - DEPLOY EDGE FUNCTION

> **Error:** `Failed to fetch` - Edge Function belum aktif  
> **Status:** ⚠️ PERLU DEPLOYMENT

---

## ⚡ SOLUSI CEPAT

### **Opsi 1: Deploy Edge Function (RECOMMENDED)**

Jalankan command ini di terminal:

```bash
supabase functions deploy make-server-5aa965b0
```

**Output yang diharapkan:**
```
Deploying make-server-5aa965b0 (project: wgjudfgqjqorkhdlvlgc)
✓ Function deployed successfully
✓ URL: https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0
```

**Tunggu 10-20 detik** setelah deploy, lalu refresh browser.

---

### **Opsi 2: Gunakan Mock Data (Sementara)**

Jika Anda tidak bisa deploy sekarang, edit `/env.config.js`:

```javascript
export const ENV_CONFIG = {
  // ... existing config
  
  // Ubah ini menjadi true untuk development mode
  DEV_MODE: true,  // ← Ubah dari false ke true
  
  // ... existing config
};
```

Dengan `DEV_MODE: true`, aplikasi akan menggunakan **mock data** tanpa perlu Edge Function.

---

## 🔍 TROUBLESHOOTING

### **Problem 1: Command `supabase` tidak ditemukan**

**Solusi:** Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# atau via npm
npm install -g supabase
```

---

### **Problem 2: `supabase login` gagal**

**Solusi:** Login ke Supabase

```bash
# Login dengan access token
supabase login

# Atau gunakan token langsung
supabase login --token YOUR_ACCESS_TOKEN
```

Get access token dari: https://app.supabase.com/account/tokens

---

### **Problem 3: Deployment berhasil tapi masih error**

**Checklist:**
1. ✅ Edge Function sudah deploy?
2. ✅ Tunggu 10-20 detik setelah deploy
3. ✅ Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
4. ✅ Clear browser cache
5. ✅ Cek console untuk error baru

---

### **Problem 4: Error "Environment variables not set"**

Environment variables sudah di-set otomatis oleh Supabase:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

Tidak perlu set manual.

---

## ✅ VERIFICATION STEPS

### **1. Cek Edge Function Status**

Buka di browser:
```
https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-03T...",
  "database": "normalized-postgres"
}
```

### **2. Test Sectors Endpoint**

```bash
curl -X GET \
  'https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0/sectors' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "success": true,
  "sectors": [...]
}
```

### **3. Cek Dashboard**

1. Refresh browser
2. Error banner harus hilang
3. Data sectors muncul (atau empty state jika belum ada data)

---

## 🎯 DETAILED DEPLOYMENT STEPS

### **Step 1: Open Terminal**

```bash
cd /path/to/your/project
```

### **Step 2: Verify Supabase CLI**

```bash
supabase --version
# Output: supabase version 1.x.x
```

### **Step 3: Login (Jika Belum)**

```bash
supabase login
```

### **Step 4: Link Project (Jika Belum)**

```bash
supabase link --project-ref wgjudfgqjqorkhdlvlgc
```

### **Step 5: Deploy Function**

```bash
supabase functions deploy make-server-5aa965b0
```

### **Step 6: Verify Deployment**

```bash
# Test health endpoint
curl https://wgjudfgqjqorkhdlvlgc.supabase.co/functions/v1/make-server-5aa965b0/health
```

### **Step 7: Refresh Dashboard**

- Hard refresh browser (Ctrl+Shift+R)
- Error harus hilang
- Mock data banner harus hilang

---

## 📊 DEPLOYMENT CHECKLIST

- [ ] Supabase CLI terinstall
- [ ] Sudah login ke Supabase
- [ ] Project sudah linked
- [ ] Edge Function di-deploy
- [ ] Health check endpoint OK (200)
- [ ] Sectors endpoint OK (200)
- [ ] Browser di-refresh
- [ ] Error banner hilang
- [ ] Data muncul di dashboard

---

## 🔄 ALTERNATIVE: REDEPLOY ALL

Jika ada masalah, redeploy semua functions:

```bash
# Deploy semua functions sekaligus
supabase functions deploy

# Atau deploy satu per satu dengan verbose
supabase functions deploy make-server-5aa965b0 --debug
```

---

## 📝 COMMON ERRORS & SOLUTIONS

### Error: "Failed to deploy"
```
❌ Error: Failed to deploy function
```

**Solution:**
1. Cek sintaks error di Edge Function code
2. Cek logs: `supabase functions logs make-server-5aa965b0`
3. Redeploy dengan debug: `supabase functions deploy make-server-5aa965b0 --debug`

### Error: "401 Unauthorized"
```
❌ Error: Unauthorized
```

**Solution:**
1. Re-login: `supabase login`
2. Verify project: `supabase projects list`
3. Relink project: `supabase link --project-ref wgjudfgqjqorkhdlvlgc`

### Error: "CORS"
```
❌ CORS error
```

**Solution:**
Edge Function sudah ada CORS middleware, tapi pastikan:
1. Request header `Authorization: Bearer <anon_key>`
2. Content-Type: `application/json`
3. Hard refresh browser

---

## 🎉 SUCCESS INDICATORS

Ketika berhasil, Anda akan melihat:

✅ **Di Terminal:**
```
Deploying make-server-5aa965b0...
✓ Function deployed successfully
```

✅ **Di Browser:**
```
No error banner
Sectors loaded (or empty state)
Console: "✅ Fetched X sectors from Supabase"
```

✅ **Di Network Tab:**
```
Status: 200 OK
Response: {"success": true, "sectors": [...]}
```

---

## 🆘 MASIH ERROR?

Jika masih error setelah deployment:

1. **Cek Logs:**
   ```bash
   supabase functions logs make-server-5aa965b0 --tail
   ```

2. **Cek Browser Console:**
   - F12 → Console tab
   - Lihat error message lengkap

3. **Cek Network Tab:**
   - F12 → Network tab
   - Filter: "sectors"
   - Lihat Request/Response

4. **Reset Everything:**
   ```bash
   # Redeploy
   supabase functions deploy make-server-5aa965b0
   
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   ```

---

## 📚 NEXT STEPS AFTER DEPLOYMENT

1. ✅ **Add First Sector**
   - Click "Tambah Sektor Baru"
   - Fill form
   - Save

2. ✅ **Test IoT Integration**
   - ESP32 kirim data
   - Dashboard update otomatis

3. ✅ **Test Pump Control**
   - Click toggle switch
   - Lihat instant feedback
   - ESP32 execute command

---

**🚀 Deploy sekarang dan aplikasi siap digunakan!**
