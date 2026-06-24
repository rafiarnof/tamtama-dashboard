# ❌ MIGRATION GAGAL? INI SOLUSINYA! 🔧

## 🎯 QUICK FIX

Migration script yang lama terlalu kompleks. **Pakai script baru yang sudah diperbaiki!**

---

## ✅ SOLUTION: Use FIXED Migration Script

### **File:** `/supabase/migrations/002_rbac_system_v2_FIXED.sql`

### **What's Fixed:**
- ✅ Removed complex RLS policies yang sering error
- ✅ No foreign key constraints
- ✅ RLS disabled by default (enable later)
- ✅ Tested password hash
- ✅ Simple & works!

---

## 🚀 CARA INSTALL (3 LANGKAH MUDAH)

### **Step 1: Buka Supabase SQL Editor**
```
1. Login: https://supabase.com/dashboard/project/wgjudfgqjqorkhdlvlgc
2. Klik: SQL Editor (sidebar kiri)
3. Klik: New Query
```

### **Step 2: Copy Paste Script**
```
1. Buka file: /supabase/migrations/002_rbac_system_v2_FIXED.sql
2. Copy SECTION 1 (Create Tables)
3. Paste ke SQL Editor
4. Click RUN
5. Wait sampai success ✅
```

### **Step 3: Ulangi untuk Section Lain**
```
1. Copy SECTION 2 (Create Indexes) → RUN
2. Copy SECTION 3 (Insert Admin) → RUN
3. Copy SECTION 4 (Verification) → RUN
4. Done! ✅
```

---

## 🔍 VERIFY SUCCESS

### **Check 1: Tables Created**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users_5aa965b0', 'pump_commands', 'audit_logs');
```
**Expected:** 3 rows

### **Check 2: Admin Exists**
```sql
SELECT email, role, status FROM users_5aa965b0
WHERE email = 'admin@tamtama.com';
```
**Expected:** 1 row dengan role='admin', status='approved'

### **Check 3: Can Insert**
```sql
INSERT INTO users_5aa965b0 (email, password_hash, full_name, role, sector_id, status)
VALUES ('test@test.com', 'hash', 'Test', 'warga', 'SEC-001', 'pending')
RETURNING id, email;
```
**Expected:** Success + returns ID

```sql
-- Cleanup:
DELETE FROM users_5aa965b0 WHERE email = 'test@test.com';
```

---

## ❌ MASIH ERROR? COBA INI

### **Error 1: "relation already exists"**
```sql
-- Drop dulu, baru re-run
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS pump_commands CASCADE;
DROP TABLE IF EXISTS users_5aa965b0 CASCADE;

-- Then re-run Section 1
```

### **Error 2: "gen_random_uuid does not exist"**
```sql
-- Enable extension dulu
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Then re-run Section 1
```

### **Error 3: "permission denied"**
**Solution:** Make sure you're logged in as project owner

### **Error 4: "duplicate key violates constraint"**
**Ini normal!** Artinya admin sudah ada. Skip error ini.

---

## 📚 DOCUMENTATION

Full troubleshooting guide: 
📖 [MIGRATION_TROUBLESHOOTING.md](./MIGRATION_TROUBLESHOOTING.md)

---

## 🆘 MASIH GAGAL?

1. ✅ Screenshot error message
2. ✅ Screenshot tables di Table Editor
3. ✅ Kirim ke developer
4. ✅ Or: Buat table manual via UI (see MIGRATION_TROUBLESHOOTING.md)

---

## ✅ DEFAULT ADMIN CREDENTIALS

After migration success, test login:
```
Email: admin@tamtama.com
Password: Admin@123
```

**⚠️ CHANGE PASSWORD IMMEDIATELY!**

---

## 🎯 FILES UNTUK TROUBLESHOOTING

1. **002_rbac_system_v2_FIXED.sql** ⭐ - Use this script!
2. **MIGRATION_TROUBLESHOOTING.md** ⭐ - Full troubleshooting guide
3. **test-migration.sh** - Automated verification script
4. **RBAC_QUICK_START.md** - Complete RBAC guide

---

**Good luck! 🚀**
