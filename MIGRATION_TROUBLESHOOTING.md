# 🔧 MIGRATION TROUBLESHOOTING GUIDE

## ❌ MIGRATION FAILED? Follow This Guide!

---

## 🎯 QUICK FIX - USE SIMPLIFIED SCRIPT

### **Step 1: Use New Fixed Script**

File baru: `/supabase/migrations/002_rbac_system_v2_FIXED.sql`

**Perbedaan dengan script lama:**
- ✅ Simplified (no complex RLS policies yet)
- ✅ No foreign key constraints yang bisa error
- ✅ RLS DISABLED by default (enable later)
- ✅ Run per-section (easier debugging)
- ✅ Password hash tested & working

---

## 📋 STEP-BY-STEP INSTALLATION

### **Option A: Run Per Section (RECOMMENDED)**

Buka Supabase SQL Editor → Copy paste **PER SECTION** (jangan sekaligus!)

#### **Section 1: Create Tables**
```sql
-- Copy dari line "SECTION 1" sampai sebelum "SECTION 2"
CREATE TABLE IF NOT EXISTS users_5aa965b0 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'warga')),
  sector_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS pump_commands (
  id SERIAL PRIMARY KEY,
  sector_id TEXT NOT NULL,
  command TEXT NOT NULL CHECK (command IN ('ON', 'OFF')),
  requested_by UUID,
  requested_by_name TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  executed BOOLEAN DEFAULT FALSE,
  executed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

✅ **Click RUN** → Wait for success message

---

#### **Section 2: Create Indexes**
```sql
CREATE INDEX IF NOT EXISTS idx_users_email ON users_5aa965b0(email);
CREATE INDEX IF NOT EXISTS idx_users_sector ON users_5aa965b0(sector_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users_5aa965b0(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users_5aa965b0(role);
CREATE INDEX IF NOT EXISTS idx_pump_commands_sector ON pump_commands(sector_id);
CREATE INDEX IF NOT EXISTS idx_pump_commands_executed ON pump_commands(executed);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
```

✅ **Click RUN** → Wait for success message

---

#### **Section 3: Insert Default Admin**
```sql
INSERT INTO users_5aa965b0 (
  email, 
  password_hash, 
  full_name, 
  phone, 
  role, 
  status,
  created_at,
  approved_at
) VALUES (
  'admin@tamtama.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Administrator Tamtama',
  '+6281234567890',
  'admin',
  'approved',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
```

✅ **Click RUN** → Should insert 1 row (or skip if exists)

---

#### **Section 4: Verification**
```sql
-- Check tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users_5aa965b0', 'pump_commands', 'audit_logs');

-- Check default admin exists
SELECT email, full_name, role, status, created_at 
FROM users_5aa965b0 
WHERE email = 'admin@tamtama.com';
```

✅ **Click RUN** → Should show 3 tables + admin user details

---

### **Option B: Run Entire Script At Once**

⚠️ Only if Option A works per-section!

```sql
-- Copy paste seluruh content dari:
-- /supabase/migrations/002_rbac_system_v2_FIXED.sql
-- Click RUN
```

---

## 🐛 COMMON ERRORS & FIXES

### **Error 1: `relation "users_5aa965b0" already exists`**

**Fix:**
```sql
-- Drop existing table first
DROP TABLE IF EXISTS users_5aa965b0 CASCADE;
DROP TABLE IF EXISTS pump_commands CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Then re-run Section 1
```

---

### **Error 2: `function gen_random_uuid() does not exist`**

**Fix:**
```sql
-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Or change gen_random_uuid() to uuid_generate_v4()
-- Edit Section 1:
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
```

---

### **Error 3: `permission denied for schema public`**

**Cause:** Not using Service Role Key

**Fix:**
- Go to: Supabase Dashboard → SQL Editor
- Make sure you're logged in as project owner
- Or use service role key in connection string

---

### **Error 4: `duplicate key value violates unique constraint`**

**Cause:** Admin user already exists

**Fix:** Ini normal! Script pakai `ON CONFLICT DO NOTHING`, jadi akan skip kalau sudah ada.

```sql
-- Verify admin exists:
SELECT * FROM users_5aa965b0 WHERE email = 'admin@tamtama.com';
```

---

### **Error 5: RLS Policy Errors**

**Fix:** Script baru sudah DISABLE RLS by default!

```sql
-- Verify RLS disabled:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users_5aa965b0', 'pump_commands', 'audit_logs');

-- Should show: rowsecurity = false
```

---

## ✅ VERIFICATION CHECKLIST

Run queries berikut untuk verify migration success:

### **1. Check Tables Exist**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users_5aa965b0', 'pump_commands', 'audit_logs');
```

Expected: 3 rows (3 tables)

---

### **2. Check Admin User**
```sql
SELECT 
  email, 
  full_name, 
  role, 
  status, 
  sector_id,
  created_at 
FROM users_5aa965b0 
WHERE email = 'admin@tamtama.com';
```

Expected:
```
email: admin@tamtama.com
full_name: Administrator Tamtama
role: admin
status: approved
sector_id: NULL
```

---

### **3. Check Indexes**
```sql
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'users_5aa965b0';
```

Expected: 4+ indexes (email, sector, status, role)

---

### **4. Test Insert Warga**
```sql
INSERT INTO users_5aa965b0 (
  email, 
  password_hash, 
  full_name, 
  phone, 
  role, 
  sector_id,
  status
) VALUES (
  'test@example.com',
  '$2a$10$test123',
  'Test User',
  '+6281234567890',
  'warga',
  'SEC-001',
  'pending'
);

-- Verify inserted:
SELECT * FROM users_5aa965b0 WHERE email = 'test@example.com';

-- Cleanup:
DELETE FROM users_5aa965b0 WHERE email = 'test@example.com';
```

---

### **5. Check RLS Status**
```sql
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users_5aa965b0', 'pump_commands', 'audit_logs');
```

Expected: All should be `false` (RLS disabled for now)

---

## 🎯 ALTERNATIVE: Manual Table Creation via UI

Kalau SQL script masih error, buat manual via Supabase UI:

### **Step 1: Create users_5aa965b0 table**

Table Editor → New Table → "users_5aa965b0"

Columns:
- `id` - uuid - Primary key - Default: `gen_random_uuid()`
- `email` - text - Unique
- `password_hash` - text
- `full_name` - text
- `phone` - text - Nullable
- `role` - text
- `sector_id` - text - Nullable
- `status` - text - Default: 'pending'
- `created_at` - timestamptz - Default: `now()`
- `approved_by` - uuid - Nullable
- `approved_at` - timestamptz - Nullable
- `last_login` - timestamptz - Nullable
- `notes` - text - Nullable

→ Click Create

---

### **Step 2: Add Constraints**

SQL Editor:
```sql
ALTER TABLE users_5aa965b0 
  ADD CONSTRAINT check_role CHECK (role IN ('admin', 'warga'));

ALTER TABLE users_5aa965b0 
  ADD CONSTRAINT check_status CHECK (status IN ('pending', 'approved', 'rejected'));
```

---

### **Step 3: Insert Admin User**

SQL Editor:
```sql
INSERT INTO users_5aa965b0 (
  email, password_hash, full_name, phone, role, status, approved_at
) VALUES (
  'admin@tamtama.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Administrator Tamtama',
  '+6281234567890',
  'admin',
  'approved',
  NOW()
);
```

---

### **Step 4: Repeat for pump_commands & audit_logs**

Same process: Table Editor → New Table → Add columns

---

## 📸 SCREENSHOT ERROR

Kalau masih error, kirim screenshot berikut:

1. ❌ **Error message** dari SQL Editor
2. 📋 **Section mana** yang error (1, 2, 3, atau 4?)
3. 🗄️ **Existing tables** - Screenshot dari Table Editor
4. ⚙️ **Supabase project settings** - Screenshot project info

Dengan info ini saya bisa fix lebih spesifik!

---

## 🆘 EMERGENCY ROLLBACK

Kalau mau reset dan start from scratch:

```sql
-- WARNING: This will delete ALL data in these tables!
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS pump_commands CASCADE;
DROP TABLE IF EXISTS users_5aa965b0 CASCADE;

-- Then re-run migration from Section 1
```

---

## 📞 SUPPORT

**Still having issues?**

1. ✅ Try simplified script: `002_rbac_system_v2_FIXED.sql`
2. ✅ Run per-section (not entire script at once)
3. ✅ Check verification queries
4. ✅ Send error screenshot if still failing

---

## 🎉 SUCCESS INDICATORS

You know migration is successful when:
- ✅ 3 tables visible in Table Editor: `users_5aa965b0`, `pump_commands`, `audit_logs`
- ✅ Admin user exists: `SELECT * FROM users_5aa965b0 WHERE role='admin'` returns 1 row
- ✅ Can insert test user without errors
- ✅ No error messages in SQL Editor

---

**Next: Update server code dengan auth endpoints! 🚀**
