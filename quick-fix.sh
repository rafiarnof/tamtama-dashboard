#!/bin/bash

# ============================================
# QUICK FIX SCRIPT - Deploy & Verify
# ============================================

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║  🚀 QUICK FIX - DEPLOY EDGE FUNCTION                     ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

PROJECT_ID="wgjudfgqjqorkhdlvlgc"
FUNCTION_NAME="make-server-5aa965b0"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# STEP 1: Check Supabase CLI
# ============================================

echo "📦 Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}✗ Supabase CLI not found!${NC}"
    echo ""
    echo "Please install Supabase CLI first:"
    echo ""
    echo "  macOS/Linux:"
    echo "    brew install supabase/tap/supabase"
    echo ""
    echo "  Windows:"
    echo "    scoop install supabase"
    echo ""
    echo "  npm:"
    echo "    npm install -g supabase"
    echo ""
    exit 1
fi

VERSION=$(supabase --version)
echo -e "${GREEN}✓ Supabase CLI installed: $VERSION${NC}"
echo ""

# ============================================
# STEP 2: Check Login
# ============================================

echo "🔐 Checking login status..."
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠ Not logged in to Supabase${NC}"
    echo ""
    echo "Logging in..."
    supabase login
    echo ""
fi

echo -e "${GREEN}✓ Logged in to Supabase${NC}"
echo ""

# ============================================
# STEP 3: Deploy Edge Function
# ============================================

echo "🚀 Deploying Edge Function..."
echo "   Function: $FUNCTION_NAME"
echo "   Project: $PROJECT_ID"
echo ""

if supabase functions deploy $FUNCTION_NAME; then
    echo ""
    echo -e "${GREEN}✓ Edge Function deployed successfully!${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Deployment failed!${NC}"
    echo ""
    echo "Check the error messages above and try again."
    echo "Common issues:"
    echo "  - Not logged in: supabase login"
    echo "  - Project not linked: supabase link --project-ref $PROJECT_ID"
    echo "  - Syntax errors in Edge Function code"
    echo ""
    exit 1
fi

# ============================================
# STEP 4: Wait for deployment
# ============================================

echo "⏳ Waiting for deployment to propagate (20 seconds)..."
sleep 20
echo ""

# ============================================
# STEP 5: Verify Health Check
# ============================================

echo "🏥 Verifying health endpoint..."
HEALTH_URL="https://${PROJECT_ID}.supabase.co/functions/v1/${FUNCTION_NAME}/health"

HTTP_CODE=$(curl -s -o /tmp/health_check.json -w "%{http_code}" "$HEALTH_URL")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Response:"
    cat /tmp/health_check.json | python3 -m json.tool 2>/dev/null || cat /tmp/health_check.json
    echo ""
else
    echo -e "${RED}✗ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "This is unusual. The function was deployed but isn't responding."
    echo "Wait a minute and try again: bash verify-deployment.sh"
    echo ""
    exit 1
fi

# ============================================
# SUCCESS
# ============================================

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║  ✅ DEPLOYMENT SUCCESSFUL                                ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Edge Function URL:"
echo "  https://${PROJECT_ID}.supabase.co/functions/v1/${FUNCTION_NAME}"
echo ""
echo "Next steps:"
echo "  1. Open your dashboard in browser"
echo "  2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)"
echo "  3. The error banner should be gone"
echo "  4. Add sectors or connect ESP32"
echo ""
echo -e "${GREEN}🎉 You're all set! The application is now live.${NC}"
echo ""

# Cleanup
rm -f /tmp/health_check.json
