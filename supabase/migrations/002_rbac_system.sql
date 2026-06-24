-- =============================================
-- TAMTAMA RBAC SYSTEM - DATABASE MIGRATION
-- =============================================
-- Version: 2.0
-- Description: Add users table with role-based access control
-- Date: 20 Feb 2026

-- =============================================
-- 1. CREATE USERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS users_5aa965b0 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'warga')),
  sector_id TEXT, -- NULL untuk admin, required untuk warga (e.g., 'SEC-001')
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES users_5aa965b0(id),
  approved_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  notes TEXT, -- Admin notes for approval/rejection
  CONSTRAINT valid_warga_sector CHECK (
    (role = 'admin') OR (role = 'warga' AND sector_id IS NOT NULL)
  )
);

-- =============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_users_email ON users_5aa965b0(email);
CREATE INDEX idx_users_sector ON users_5aa965b0(sector_id);
CREATE INDEX idx_users_status ON users_5aa965b0(status);
CREATE INDEX idx_users_role ON users_5aa965b0(role);
CREATE INDEX idx_users_created ON users_5aa965b0(created_at DESC);

-- =============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE users_5aa965b0 ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. CREATE RLS POLICIES FOR USERS TABLE
-- =============================================

-- Policy 1: Admin can view all users
CREATE POLICY admin_view_all_users ON users_5aa965b0
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = current_setting('app.user_id')::uuid 
        AND u.role = 'admin' 
        AND u.status = 'approved'
    )
  );

-- Policy 2: Warga can only view their own profile
CREATE POLICY warga_view_own_profile ON users_5aa965b0
  FOR SELECT
  USING (id = current_setting('app.user_id')::uuid);

-- Policy 3: Public can register (INSERT with status = 'pending')
CREATE POLICY public_can_register ON users_5aa965b0
  FOR INSERT
  WITH CHECK (
    status = 'pending' AND 
    role = 'warga' AND
    sector_id IS NOT NULL
  );

-- Policy 4: Users can update their own profile (except role, status, sector_id)
CREATE POLICY user_update_own_profile ON users_5aa965b0
  FOR UPDATE
  USING (id = current_setting('app.user_id')::uuid)
  WITH CHECK (
    id = current_setting('app.user_id')::uuid AND
    role = (SELECT role FROM users_5aa965b0 WHERE id = current_setting('app.user_id')::uuid) AND
    status = (SELECT status FROM users_5aa965b0 WHERE id = current_setting('app.user_id')::uuid) AND
    sector_id = (SELECT sector_id FROM users_5aa965b0 WHERE id = current_setting('app.user_id')::uuid)
  );

-- Policy 5: Admin can update all users (for approval/rejection)
CREATE POLICY admin_update_all_users ON users_5aa965b0
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = current_setting('app.user_id')::uuid 
        AND u.role = 'admin' 
        AND u.status = 'approved'
    )
  );

-- =============================================
-- 5. CREATE RLS POLICIES FOR SECTORS TABLE
-- =============================================

ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admin can view all sectors
CREATE POLICY admin_view_all_sectors ON sectors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = current_setting('app.user_id')::uuid 
        AND u.role = 'admin' 
        AND u.status = 'approved'
    )
  );

-- Policy 2: Warga can only view their own sector
CREATE POLICY warga_view_own_sector ON sectors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = current_setting('app.user_id')::uuid 
        AND u.role = 'warga' 
        AND u.status = 'approved'
        AND u.sector_id = sectors.sector_id
    )
  );

-- Policy 3: Admin can manage all sectors
CREATE POLICY admin_manage_all_sectors ON sectors
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = current_setting('app.user_id')::uuid 
        AND u.role = 'admin' 
        AND u.status = 'approved'
    )
  );

-- =============================================
-- 6. CREATE RLS POLICIES FOR SENSOR_DATA TABLE
-- =============================================

ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admin can view all sensor data
CREATE POLICY admin_view_all_sensor_data ON sensor_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = current_setting('app.user_id')::uuid 
        AND u.role = 'admin' 
        AND u.status = 'approved'
    )
  );

-- Policy 2: Warga can only view sensor data for their sector
CREATE POLICY warga_view_own_sensor_data ON sensor_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = current_setting('app.user_id')::uuid 
        AND u.role = 'warga' 
        AND u.status = 'approved'
        AND u.sector_id = sensor_data.sector_id
    )
  );

-- Policy 3: ESP32 can insert sensor data (via service role key)
-- This is handled by service role key, no RLS policy needed

-- =============================================
-- 7. CREATE RLS POLICIES FOR PUMP_COMMANDS TABLE
-- =============================================

-- Create pump_commands table if not exists
CREATE TABLE IF NOT EXISTS pump_commands (
  id SERIAL PRIMARY KEY,
  sector_id TEXT NOT NULL,
  command TEXT NOT NULL CHECK (command IN ('ON', 'OFF')),
  requested_by UUID REFERENCES users_5aa965b0(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  executed BOOLEAN DEFAULT FALSE,
  executed_at TIMESTAMPTZ
);

CREATE INDEX idx_pump_commands_sector ON pump_commands(sector_id);
CREATE INDEX idx_pump_commands_executed ON pump_commands(executed, sector_id);

ALTER TABLE pump_commands ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admin can view all pump commands
CREATE POLICY admin_view_all_pump_commands ON pump_commands
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = current_setting('app.user_id')::uuid 
        AND u.role = 'admin' 
        AND u.status = 'approved'
    )
  );

-- Policy 2: Warga can view pump commands for their sector
CREATE POLICY warga_view_own_pump_commands ON pump_commands
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = current_setting('app.user_id')::uuid 
        AND u.role = 'warga' 
        AND u.status = 'approved'
        AND u.sector_id = pump_commands.sector_id
    )
  );

-- Policy 3: Admin can control all pumps
CREATE POLICY admin_control_all_pumps ON pump_commands
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = current_setting('app.user_id')::uuid 
        AND u.role = 'admin' 
        AND u.status = 'approved'
    )
  );

-- Policy 4: Warga can control their own sector's pump
CREATE POLICY warga_control_own_pump ON pump_commands
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = current_setting('app.user_id')::uuid 
        AND u.role = 'warga' 
        AND u.status = 'approved'
        AND u.sector_id = pump_commands.sector_id
    )
  );

-- =============================================
-- 8. CREATE ADMIN USER (DEFAULT)
-- =============================================

-- Insert default admin user
-- Password: Admin@123 (CHANGE THIS IN PRODUCTION!)
-- Hash generated with bcrypt, rounds=10
INSERT INTO users_5aa965b0 (
  email, 
  password_hash, 
  full_name, 
  phone, 
  role, 
  sector_id, 
  status,
  created_at,
  approved_by,
  approved_at
) VALUES (
  'admin@tamtama.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin@123
  'Administrator Tamtama',
  '+6281234567890',
  'admin',
  NULL,
  'approved',
  NOW(),
  NULL,
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- =============================================
-- 9. CREATE AUDIT LOG TABLE (OPTIONAL)
-- =============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users_5aa965b0(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- =============================================
-- 10. CREATE HELPER FUNCTIONS
-- =============================================

-- Function to get user's sector(s)
CREATE OR REPLACE FUNCTION get_user_sectors(user_id_param UUID)
RETURNS TABLE(sector_id TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN u.role = 'admin' THEN s.sector_id
      WHEN u.role = 'warga' THEN u.sector_id
    END AS sector_id
  FROM users_5aa965b0 u
  LEFT JOIN sectors s ON u.role = 'admin'
  WHERE u.id = user_id_param AND u.status = 'approved';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access sector
CREATE OR REPLACE FUNCTION can_access_sector(user_id_param UUID, sector_id_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_sector TEXT;
  user_status TEXT;
BEGIN
  SELECT role, sector_id, status INTO user_role, user_sector, user_status
  FROM users_5aa965b0
  WHERE id = user_id_param;
  
  IF user_status != 'approved' THEN
    RETURN FALSE;
  END IF;
  
  IF user_role = 'admin' THEN
    RETURN TRUE;
  ELSIF user_role = 'warga' AND user_sector = sector_id_param THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 11. GRANT PERMISSIONS
-- =============================================

-- Grant permissions to anon role (for public registration)
GRANT INSERT ON users_5aa965b0 TO anon;

-- Grant permissions to authenticated role
GRANT SELECT, UPDATE ON users_5aa965b0 TO authenticated;
GRANT SELECT ON sectors TO authenticated;
GRANT SELECT ON sensor_data TO authenticated;
GRANT SELECT, INSERT ON pump_commands TO authenticated;
GRANT INSERT ON audit_logs TO authenticated;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Verify tables created
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - users_5aa965b0';
  RAISE NOTICE '  - pump_commands';
  RAISE NOTICE '  - audit_logs';
  RAISE NOTICE 'RLS policies applied to:';
  RAISE NOTICE '  - users_5aa965b0';
  RAISE NOTICE '  - sectors';
  RAISE NOTICE '  - sensor_data';
  RAISE NOTICE '  - pump_commands';
  RAISE NOTICE 'Default admin user created:';
  RAISE NOTICE '  - Email: admin@tamtama.com';
  RAISE NOTICE '  - Password: Admin@123 (CHANGE THIS!)';
END $$;

-- =============================================
-- ROLLBACK SCRIPT (if needed)
-- =============================================

/*
-- Uncomment to rollback changes:

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS pump_commands CASCADE;
DROP TABLE IF EXISTS users_5aa965b0 CASCADE;

DROP FUNCTION IF EXISTS get_user_sectors(UUID);
DROP FUNCTION IF EXISTS can_access_sector(UUID, TEXT);

-- Remove RLS policies from existing tables
ALTER TABLE sectors DISABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_data DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_view_all_sectors ON sectors;
DROP POLICY IF EXISTS warga_view_own_sector ON sectors;
DROP POLICY IF EXISTS admin_manage_all_sectors ON sectors;
DROP POLICY IF EXISTS admin_view_all_sensor_data ON sensor_data;
DROP POLICY IF EXISTS warga_view_own_sensor_data ON sensor_data;
*/
