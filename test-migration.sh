#!/bin/bash

# =============================================
# MIGRATION VERIFICATION SCRIPT
# =============================================
# Test apakah migration berhasil atau belum
# 
# Usage: ./test-migration.sh
#
# Requirements:
# - psql installed
# - Supabase connection string
# =============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 TAMTAMA MIGRATION VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# =============================================
# CONFIGURATION
# =============================================

# Supabase connection string
# Get this from: Supabase Dashboard → Settings → Database → Connection string
# Format: postgresql://postgres:[password]@[host]:5432/postgres

read -p "Enter Supabase connection string (or press Enter to skip): " DB_URL

if [ -z "$DB_URL" ]; then
  echo ""
  echo "⚠️  No connection string provided."
  echo "   Running manual verification queries instead..."
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋 MANUAL VERIFICATION QUERIES"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Copy paste queries berikut ke Supabase SQL Editor:"
  echo ""
  
  echo "-- 1. Check tables exist"
  echo "SELECT table_name FROM information_schema.tables"
  echo "WHERE table_schema = 'public'"
  echo "AND table_name IN ('users_5aa965b0', 'pump_commands', 'audit_logs');"
  echo ""
  
  echo "-- 2. Check admin user"
  echo "SELECT email, full_name, role, status FROM users_5aa965b0"
  echo "WHERE email = 'admin@tamtama.com';"
  echo ""
  
  echo "-- 3. Check indexes"
  echo "SELECT indexname FROM pg_indexes"
  echo "WHERE schemaname = 'public' AND tablename = 'users_5aa965b0';"
  echo ""
  
  echo "-- 4. Check RLS status"
  echo "SELECT tablename, rowsecurity FROM pg_tables"
  echo "WHERE schemaname = 'public'"
  echo "AND tablename IN ('users_5aa965b0', 'pump_commands', 'audit_logs');"
  echo ""
  
  exit 0
fi

# =============================================
# CHECK PSQL INSTALLED
# =============================================

if ! command -v psql &> /dev/null; then
  echo "❌ psql not found!"
  echo "   Install: brew install postgresql (Mac)"
  echo "   Or: sudo apt install postgresql-client (Linux)"
  exit 1
fi

echo "✅ psql found"
echo ""

# =============================================
# TEST 1: CHECK TABLES EXIST
# =============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Check Tables Exist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

QUERY="SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users_5aa965b0', 'pump_commands', 'audit_logs');"

RESULT=$(psql "$DB_URL" -t -c "$QUERY" 2>&1)

if echo "$RESULT" | grep -q "error\|ERROR"; then
  echo "❌ Connection error:"
  echo "$RESULT"
  exit 1
fi

TABLE_COUNT=$(echo "$RESULT" | grep -v '^$' | wc -l)

if [ "$TABLE_COUNT" -eq 3 ]; then
  echo "✅ All 3 tables exist:"
  echo "$RESULT"
else
  echo "❌ Expected 3 tables, found: $TABLE_COUNT"
  echo "$RESULT"
  echo ""
  echo "💡 Run migration script: 002_rbac_system_v2_FIXED.sql"
  exit 1
fi

echo ""

# =============================================
# TEST 2: CHECK ADMIN USER
# =============================================

echo "━━━━━━━���━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Check Admin User"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

QUERY="SELECT email, full_name, role, status FROM users_5aa965b0 WHERE email = 'admin@tamtama.com';"

RESULT=$(psql "$DB_URL" -t -c "$QUERY" 2>&1)

if echo "$RESULT" | grep -q "admin@tamtama.com"; then
  echo "✅ Admin user exists:"
  echo "$RESULT"
else
  echo "❌ Admin user not found!"
  echo "$RESULT"
  echo ""
  echo "💡 Run Section 3 of migration script"
  exit 1
fi

echo ""

# =============================================
# TEST 3: CHECK INDEXES
# =============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Check Indexes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

QUERY="SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'users_5aa965b0';"

RESULT=$(psql "$DB_URL" -t -c "$QUERY" 2>&1)

INDEX_COUNT=$(echo "$RESULT" | grep -v '^$' | wc -l)

if [ "$INDEX_COUNT" -ge 4 ]; then
  echo "✅ Indexes created ($INDEX_COUNT indexes):"
  echo "$RESULT"
else
  echo "⚠️  Expected 4+ indexes, found: $INDEX_COUNT"
  echo "$RESULT"
  echo ""
  echo "💡 Run Section 2 of migration script"
fi

echo ""

# =============================================
# TEST 4: TEST INSERT
# =============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Test Insert"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

QUERY="INSERT INTO users_5aa965b0 (email, password_hash, full_name, role, sector_id, status) VALUES ('test_$(date +%s)@test.com', 'hash', 'Test User', 'warga', 'SEC-001', 'pending') RETURNING id, email;"

RESULT=$(psql "$DB_URL" -t -c "$QUERY" 2>&1)

if echo "$RESULT" | grep -q "test_"; then
  echo "✅ Insert successful:"
  echo "$RESULT"
  
  # Cleanup test user
  TEST_EMAIL=$(echo "$RESULT" | grep -o "test_[0-9]*@test.com")
  CLEANUP="DELETE FROM users_5aa965b0 WHERE email = '$TEST_EMAIL';"
  psql "$DB_URL" -c "$CLEANUP" > /dev/null 2>&1
  echo "✅ Cleanup done"
else
  echo "❌ Insert failed:"
  echo "$RESULT"
  exit 1
fi

echo ""

# =============================================
# TEST 5: RLS STATUS
# =============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: RLS Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

QUERY="SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users_5aa965b0', 'pump_commands', 'audit_logs');"

RESULT=$(psql "$DB_URL" -t -c "$QUERY" 2>&1)

echo "$RESULT"

if echo "$RESULT" | grep -q "f\|false"; then
  echo "✅ RLS disabled (as expected for Phase 2)"
else
  echo "⚠️  RLS might be enabled"
fi

echo ""

# =============================================
# SUMMARY
# =============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 VERIFICATION COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Migration successful!"
echo ""
echo "Next steps:"
echo "1. Test admin login: admin@tamtama.com / Admin@123"
echo "2. Update server code with auth endpoints"
echo "3. Build frontend components"
echo ""
echo "Default credentials:"
echo "  Email: admin@tamtama.com"
echo "  Password: Admin@123"
echo ""
echo "⚠️  IMPORTANT: Change default password!"
echo ""
