#!/bin/bash

# =====================================================
# HIDROTOWER DEPLOYMENT CHECKER
# Skrip untuk verifikasi status deployment
# =====================================================

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║  🔍  HIDROTOWER DEPLOYMENT CHECKER                       ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

PROJECT_REF="wgjudfgqjqorkhdlvlgc"
HEALTH_URL="https://${PROJECT_REF}.supabase.co/functions/v1/make-server-5aa965b0/health"

# Function untuk cek health endpoint
check_health() {
    echo "📡 Checking Edge Function health..."
    echo "   URL: $HEALTH_URL"
    echo ""
    
    HTTP_CODE=$(curl -s -o /tmp/health_response.json -w "%{http_code}" "$HEALTH_URL")
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo "✅ Edge Function is ONLINE!"
        echo ""
        echo "Response:"
        cat /tmp/health_response.json | jq '.' 2>/dev/null || cat /tmp/health_response.json
        echo ""
        return 0
    else
        echo "❌ Edge Function is OFFLINE or ERROR"
        echo "   HTTP Status: $HTTP_CODE"
        echo ""
        echo "Response:"
        cat /tmp/health_response.json
        echo ""
        return 1
    fi
}

# Function untuk cek Supabase CLI
check_cli() {
    echo "🔧 Checking Supabase CLI..."
    
    if command -v supabase &> /dev/null; then
        VERSION=$(supabase --version)
        echo "✅ Supabase CLI installed: $VERSION"
        echo ""
        return 0
    else
        echo "❌ Supabase CLI not installed"
        echo ""
        echo "Install dengan: npm install -g supabase"
        echo ""
        return 1
    fi
}

# Function untuk cek login status
check_login() {
    echo "👤 Checking Supabase login status..."
    
    if supabase projects list &> /dev/null; then
        echo "✅ Logged in to Supabase"
        echo ""
        return 0
    else
        echo "❌ Not logged in to Supabase"
        echo ""
        echo "Login dengan: supabase login"
        echo ""
        return 1
    fi
}

# Function untuk deploy instructions
show_deploy_instructions() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║  📝  DEPLOYMENT INSTRUCTIONS                             ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    echo "Ikuti langkah ini untuk deploy Edge Function:"
    echo ""
    echo "1. Install Supabase CLI (jika belum):"
    echo "   npm install -g supabase"
    echo ""
    echo "2. Login ke Supabase:"
    echo "   supabase login"
    echo ""
    echo "3. Link project:"
    echo "   supabase link --project-ref $PROJECT_REF"
    echo ""
    echo "4. Deploy Edge Function:"
    echo "   supabase functions deploy make-server-5aa965b0"
    echo ""
    echo "5. Verifikasi deployment:"
    echo "   ./check-deployment.sh"
    echo ""
}

# Main execution
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. CHECKING EDGE FUNCTION STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if check_health; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ DEPLOYMENT STATUS: SUCCESS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Aplikasi siap digunakan!"
    echo ""
    echo "Next steps:"
    echo "1. Buka aplikasi di browser"
    echo "2. Setup admin pertama kali"
    echo "3. Login dengan email & password yang sudah dibuat"
    echo ""
    exit 0
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ DEPLOYMENT STATUS: FAILED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "2. CHECKING PREREQUISITES"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    CLI_OK=0
    LOGIN_OK=0
    
    if check_cli; then
        CLI_OK=1
    fi
    
    if [ $CLI_OK -eq 1 ]; then
        if check_login; then
            LOGIN_OK=1
        fi
    fi
    
    show_deploy_instructions
    
    exit 1
fi
