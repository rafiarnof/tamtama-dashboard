#!/bin/bash

# =====================================================
# HIDROTOWER ONE-CLICK SETUP
# Setup otomatis database + edge function
# =====================================================

set -e  # Exit on error

PROJECT_REF="wgjudfgqjqorkhdlvlgc"

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║  🚀 HIDROTOWER ONE-CLICK SETUP                           ║"
echo "║     Automated deployment script                          ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# =====================================================
# STEP 1: Check prerequisites
# =====================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Checking Prerequisites"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed!"
    echo "   Install from: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not installed!"
    exit 1
fi
echo "✅ npm: $(npm --version)"

# Check Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not installed"
    echo ""
    read -p "Install Supabase CLI now? (y/n): " install_cli
    
    if [ "$install_cli" = "y" ] || [ "$install_cli" = "Y" ]; then
        echo ""
        echo "Installing Supabase CLI..."
        npm install -g supabase
        echo ""
        echo "✅ Supabase CLI installed"
    else
        echo "❌ Supabase CLI required for deployment"
        exit 1
    fi
fi
echo "✅ Supabase CLI: $(supabase --version)"

echo ""

# =====================================================
# STEP 2: Login to Supabase
# =====================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Login to Supabase"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if supabase projects list &> /dev/null; then
    echo "✅ Already logged in to Supabase"
else
    echo "⚠️  Not logged in to Supabase"
    echo ""
    read -p "Login now? This will open browser (y/n): " do_login
    
    if [ "$do_login" = "y" ] || [ "$do_login" = "Y" ]; then
        supabase login
        echo ""
        echo "✅ Logged in successfully"
    else
        echo "❌ Login required for deployment"
        exit 1
    fi
fi

echo ""

# =====================================================
# STEP 3: Link Project
# =====================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Link Supabase Project"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Project Ref: $PROJECT_REF"
echo ""
read -p "Link project now? (y/n): " do_link

if [ "$do_link" = "y" ] || [ "$do_link" = "Y" ]; then
    supabase link --project-ref "$PROJECT_REF"
    echo ""
    echo "✅ Project linked"
else
    echo "⚠️  Skipping project link"
fi

echo ""

# =====================================================
# STEP 4: Setup Database
# =====================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Setup Database Schema"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "database-schema.sql" ]; then
    echo "Found database-schema.sql"
    echo ""
    read -p "Run database schema setup? (y/n): " do_db
    
    if [ "$do_db" = "y" ] || [ "$do_db" = "Y" ]; then
        echo ""
        echo "Running SQL script..."
        supabase db push --db-url "postgresql://postgres.[YOUR_REF]:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" < database-schema.sql
        echo ""
        echo "✅ Database schema created"
    else
        echo "⚠️  Skipping database setup"
        echo ""
        echo "❗ MANUAL SETUP REQUIRED:"
        echo "   1. Open Supabase Dashboard"
        echo "   2. Go to SQL Editor"
        echo "   3. Paste contents of database-schema.sql"
        echo "   4. Run the script"
    fi
else
    echo "⚠️  database-schema.sql not found"
    echo ""
    echo "❗ MANUAL SETUP REQUIRED:"
    echo "   1. Open Supabase Dashboard"
    echo "   2. Go to SQL Editor"
    echo "   3. Create tables: owners, plants, sectors, sensor_data, pump_history, kv_store_5aa965b0"
fi

echo ""

# =====================================================
# STEP 5: Deploy Edge Function
# =====================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Deploy Edge Function"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Deploy Edge Function now? (y/n): " do_deploy

if [ "$do_deploy" = "y" ] || [ "$do_deploy" = "Y" ]; then
    echo ""
    echo "Deploying make-server-5aa965b0..."
    echo ""
    
    if supabase functions deploy make-server-5aa965b0; then
        echo ""
        echo "✅ Edge Function deployed successfully"
    else
        echo ""
        echo "❌ Edge Function deployment failed"
        echo ""
        echo "Try manual deployment:"
        echo "  supabase functions deploy make-server-5aa965b0"
        exit 1
    fi
else
    echo "⚠️  Skipping Edge Function deployment"
fi

echo ""

# =====================================================
# STEP 6: Verify Deployment
# =====================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 6: Verify Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

HEALTH_URL="https://${PROJECT_REF}.supabase.co/functions/v1/make-server-5aa965b0/health"

echo "Testing health endpoint..."
echo "URL: $HEALTH_URL"
echo ""

HTTP_CODE=$(curl -s -o /tmp/health_response.json -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Edge Function is ONLINE!"
    echo ""
    echo "Response:"
    cat /tmp/health_response.json | jq '.' 2>/dev/null || cat /tmp/health_response.json
    echo ""
else
    echo "❌ Edge Function health check failed"
    echo "   HTTP Status: $HTTP_CODE"
    echo ""
fi

# =====================================================
# FINAL SUMMARY
# =====================================================

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║  ✅ SETUP COMPLETE                                       ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "🎉 Deployment successful!"
    echo ""
    echo "Next steps:"
    echo ""
    echo "  1. Open aplikasi di browser"
    echo "  2. Halaman 'Setup Admin Pertama' akan muncul"
    echo "  3. Buat akun admin dengan:"
    echo "     - Email: admin@hidrotower.com (atau email lain)"
    echo "     - Password: admin123 (minimal 6 karakter)"
    echo "  4. Login dan mulai monitoring!"
    echo ""
    echo "📝 Credentials untuk login:"
    echo "   Email    : (yang Anda buat saat setup)"
    echo "   Password : (yang Anda buat saat setup)"
    echo ""
else
    echo "⚠️  Setup completed with warnings"
    echo ""
    echo "Manual verification required:"
    echo ""
    echo "  1. Check deployment status:"
    echo "     ./check-deployment.sh"
    echo ""
    echo "  2. View logs:"
    echo "     supabase functions logs make-server-5aa965b0"
    echo ""
    echo "  3. Or enable development mode for testing:"
    echo "     ./enable-dev-mode.sh"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
