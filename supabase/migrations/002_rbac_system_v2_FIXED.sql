-- =============================================
-- TAMTAMA RBAC SYSTEM - SIMPLIFIED MIGRATION
-- =============================================
-- Version: 2.1 (FIXED for Supabase)
-- Date: 20 Feb 2026
-- 
-- CARA PAKAI:
-- 1. Copy script ini PER SECTION (jangan sekaligus!)
-- 2. Run section 1, tunggu success, baru run section 2, dst
-- 3. Kalau ada error, skip section tersebut dan lanjut

-- =============================================
-- SECTION 1: CREATE TABLES
-- =============================================

-- Table 1: Users
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

-- Table 2: Pump Commands
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

-- Table 3: Audit Logs
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

-- =============================================
-- SECTION 2: CREATE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users_5aa965b0(email);
CREATE INDEX IF NOT EXISTS idx_users_sector ON users_5aa965b0(sector_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users_5aa965b0(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users_5aa965b0(role);
CREATE INDEX IF NOT EXISTS idx_pump_commands_sector ON pump_commands(sector_id);
CREATE INDEX IF NOT EXISTS idx_pump_commands_executed ON pump_commands(executed);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- =============================================
-- SECTION 3: INSERT DEFAULT ADMIN
-- =============================================

-- Default admin user
-- Password: Admin@123
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

-- =============================================
-- SECTION 4: ENABLE RLS (DISABLED FIRST)
-- =============================================
-- NOTE: RLS akan kita enable nanti setelah semua policy ready
-- Untuk testing awal, kita DISABLE RLS dulu

ALTER TABLE users_5aa965b0 DISABLE ROW LEVEL SECURITY;
ALTER TABLE pump_commands DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- Kalau mau enable RLS existing tables (optional):
-- ALTER TABLE sectors DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE sensor_data DISABLE ROW LEVEL SECURITY;

-- =============================================
-- SECTION 5: VERIFICATION
-- =============================================

-- Check tables created
SELECT 'Tables created successfully!' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users_5aa965b0', 'pump_commands', 'audit_logs');

-- Check default admin exists
SELECT email, full_name, role, status, created_at 
FROM users_5aa965b0 
WHERE email = 'admin@tamtama.com';

-- Check indexes created
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('users_5aa965b0', 'pump_commands', 'audit_logs')
ORDER BY tablename, indexname;

-- =============================================
-- DONE! 
-- =============================================
-- Next steps:
-- 1. Verify admin user exists
-- 2. Test insert warga user manually
-- 3. Enable RLS later when backend ready
