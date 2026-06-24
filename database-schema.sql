-- =====================================================
-- HIDROTOWER DATABASE SCHEMA
-- Normalized PostgreSQL Schema for HidroTower System
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: owners
-- Menyimpan informasi pemilik sector
-- =====================================================

CREATE TABLE IF NOT EXISTS owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE owners IS 'Informasi pemilik sector hidroponik';
COMMENT ON COLUMN owners.name IS 'Nama pemilik';
COMMENT ON COLUMN owners.phone IS 'Nomor HP pemilik (format: 08xxxxxxxxxx)';
COMMENT ON COLUMN owners.location IS 'Lokasi rumah/alamat pemilik';

-- =====================================================
-- TABLE: plants
-- Menyimpan informasi tanaman yang ditanam
-- =====================================================

CREATE TABLE IF NOT EXISTS plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  planted_date DATE,
  expected_harvest DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE plants IS 'Informasi tanaman yang ditanam di sector';
COMMENT ON COLUMN plants.name IS 'Nama tanaman (contoh: Selada Hijau)';
COMMENT ON COLUMN plants.type IS 'Jenis/varietas tanaman';
COMMENT ON COLUMN plants.planted_date IS 'Tanggal tanam';
COMMENT ON COLUMN plants.expected_harvest IS 'Perkiraan tanggal panen';

-- =====================================================
-- TABLE: sectors
-- Menyimpan informasi sector hidroponik tower
-- =====================================================

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

COMMENT ON TABLE sectors IS 'Sector hidroponik tower (1 sector = 1 tower)';
COMMENT ON COLUMN sectors.sector_id IS 'ID unik sector (contoh: SEC-001)';
COMMENT ON COLUMN sectors.name IS 'Nama sector';
COMMENT ON COLUMN sectors.owner_id IS 'Foreign key ke table owners';
COMMENT ON COLUMN sectors.plant_id IS 'Foreign key ke table plants';
COMMENT ON COLUMN sectors.schedule_enabled IS 'Apakah penjadwalan otomatis aktif';
COMMENT ON COLUMN sectors.schedule_start_hour IS 'Jam mulai penjadwalan (0-23)';
COMMENT ON COLUMN sectors.schedule_end_hour IS 'Jam selesai penjadwalan (0-23)';
COMMENT ON COLUMN sectors.schedule_duration IS 'Durasi pompa ON per jam (menit)';

-- =====================================================
-- TABLE: sensor_data
-- Menyimpan data sensor dari ESP32 IoT
-- =====================================================

CREATE TABLE IF NOT EXISTS sensor_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
  temperature REAL DEFAULT 0,
  humidity REAL DEFAULT 0,
  water_level REAL DEFAULT 0,
  light_level REAL DEFAULT 0,
  pump_status TEXT DEFAULT 'OFF' CHECK (pump_status IN ('ON', 'OFF')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE sensor_data IS 'Data sensor dari ESP32 (real-time)';
COMMENT ON COLUMN sensor_data.sector_id IS 'Foreign key ke table sectors';
COMMENT ON COLUMN sensor_data.temperature IS 'Suhu (°C)';
COMMENT ON COLUMN sensor_data.humidity IS 'Kelembapan (%)';
COMMENT ON COLUMN sensor_data.water_level IS 'Level air (cm) - tinggi dari sensor ultrasonik';
COMMENT ON COLUMN sensor_data.light_level IS 'Intensitas cahaya (0-1023)';
COMMENT ON COLUMN sensor_data.pump_status IS 'Status pompa (ON/OFF)';

-- =====================================================
-- TABLE: pump_history
-- Menyimpan riwayat aktivitas pompa
-- =====================================================

CREATE TABLE IF NOT EXISTS pump_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('ON', 'OFF')),
  triggered_by TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE pump_history IS 'Riwayat aktivitas pompa (untuk audit & tracking)';
COMMENT ON COLUMN pump_history.sector_id IS 'Foreign key ke table sectors';
COMMENT ON COLUMN pump_history.action IS 'Aksi pompa (ON/OFF)';
COMMENT ON COLUMN pump_history.triggered_by IS 'Pemicu (manual/schedule/automatic/alert)';

-- =====================================================
-- TABLE: kv_store_5aa965b0
-- Key-Value store untuk command queue & config
-- =====================================================

CREATE TABLE IF NOT EXISTS kv_store_5aa965b0 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE kv_store_5aa965b0 IS 'Key-value store untuk pump commands & config';
COMMENT ON COLUMN kv_store_5aa965b0.key IS 'Key unik (contoh: pump-command:SEC-001)';
COMMENT ON COLUMN kv_store_5aa965b0.value IS 'Value dalam format JSON';

-- =====================================================
-- INDEXES untuk performa query
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_sectors_sector_id ON sectors(sector_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_sector_id ON sensor_data(sector_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_created_at ON sensor_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pump_history_sector_id ON pump_history(sector_id);
CREATE INDEX IF NOT EXISTS idx_pump_history_created_at ON pump_history(created_at DESC);

-- =====================================================
-- FUNCTION: Auto update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_owners_updated_at ON owners;
CREATE TRIGGER update_owners_updated_at
    BEFORE UPDATE ON owners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plants_updated_at ON plants;
CREATE TRIGGER update_plants_updated_at
    BEFORE UPDATE ON plants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sectors_updated_at ON sectors;
CREATE TRIGGER update_sectors_updated_at
    BEFORE UPDATE ON sectors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kv_store_updated_at ON kv_store_5aa965b0;
CREATE TRIGGER update_kv_store_updated_at
    BEFORE UPDATE ON kv_store_5aa965b0
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Optional
-- Uncomment jika ingin enable RLS
-- =====================================================

-- ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pump_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SAMPLE DATA (Optional - Untuk Testing)
-- =====================================================

-- Uncomment untuk insert sample data

/*
-- Sample Owner
INSERT INTO owners (name, phone, location) VALUES
('Pak Budi', '081234567890', 'Jl. Merdeka No. 123, Jakarta');

-- Sample Plant
INSERT INTO plants (name, type, planted_date, expected_harvest) VALUES
('Selada Hijau', 'Lettuce', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days');

-- Sample Sector
INSERT INTO sectors (sector_id, name, owner_id, plant_id) VALUES
('SEC-001', 'Tower 1 - Depan Rumah', 
  (SELECT id FROM owners WHERE phone = '081234567890'),
  (SELECT id FROM plants WHERE name = 'Selada Hijau')
);

-- Sample Sensor Data
INSERT INTO sensor_data (sector_id, temperature, humidity, water_level, light_level, pump_status) VALUES
((SELECT id FROM sectors WHERE sector_id = 'SEC-001'), 28.5, 65.0, 15.0, 512, 'OFF');
*/

-- =====================================================
-- VERIFICATION QUERY
-- Jalankan untuk verifikasi setup berhasil
-- =====================================================

SELECT 
  'owners' AS table_name, COUNT(*) AS row_count FROM owners
UNION ALL
SELECT 'plants', COUNT(*) FROM plants
UNION ALL
SELECT 'sectors', COUNT(*) FROM sectors
UNION ALL
SELECT 'sensor_data', COUNT(*) FROM sensor_data
UNION ALL
SELECT 'pump_history', COUNT(*) FROM pump_history
UNION ALL
SELECT 'kv_store_5aa965b0', COUNT(*) FROM kv_store_5aa965b0;

-- =====================================================
-- CLEANUP (DANGER! HANYA UNTUK RESET DEVELOPMENT)
-- Uncomment HANYA jika ingin HAPUS SEMUA DATA
-- =====================================================

/*
DROP TABLE IF EXISTS pump_history CASCADE;
DROP TABLE IF EXISTS sensor_data CASCADE;
DROP TABLE IF EXISTS sectors CASCADE;
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS owners CASCADE;
DROP TABLE IF EXISTS kv_store_5aa965b0 CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
*/

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Berhasil! Schema database HidroTower telah dibuat.
-- Next steps:
-- 1. Deploy Edge Function: supabase functions deploy make-server-5aa965b0
-- 2. Refresh aplikasi browser
-- 3. Setup admin pertama kali
-- 4. Mulai monitoring!
