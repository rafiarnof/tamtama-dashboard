#!/bin/bash

# ============================================
# TAMTAMA - HELP & DOCUMENTATION
# ============================================

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

clear

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     🌾 TAMTAMA - Smart Agriculture IoT Dashboard 🚜      ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# ============================================
# QUICK ACTIONS
# ============================================

echo -e "${CYAN}⚡ QUICK ACTIONS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}1. Deploy Edge Function${NC}"
echo "   bash quick-fix.sh"
echo ""
echo -e "${GREEN}2. Verify Deployment${NC}"
echo "   bash verify-deployment.sh"
echo ""
echo -e "${GREEN}3. Test Pump Control${NC}"
echo "   bash test-pump-control.sh"
echo ""
echo -e "${GREEN}4. Start Development Server${NC}"
echo "   npm run dev"
echo ""
echo -e "${GREEN}5. View Edge Function Logs${NC}"
echo "   supabase functions logs make-server-5aa965b0 --tail"
echo ""

# ============================================
# COMMON PROBLEMS
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}🔧 COMMON PROBLEMS & SOLUTIONS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${RED}Problem: \"Failed to Fetch\" Error${NC}"
echo -e "${GREEN}Solution:${NC} bash quick-fix.sh"
echo ""

echo -e "${RED}Problem: Pump Toggle Tidak Responsif${NC}"
echo -e "${GREEN}Solution:${NC} Already fixed! Hard refresh browser (Ctrl+Shift+R)"
echo ""

echo -e "${RED}Problem: supabase command not found${NC}"
echo -e "${GREEN}Solution:${NC} brew install supabase/tap/supabase"
echo ""

echo -e "${RED}Problem: Not logged in${NC}"
echo -e "${GREEN}Solution:${NC} supabase login"
echo ""

# ============================================
# DOCUMENTATION
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📚 DOCUMENTATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Essential Guides:"
echo "  📖 START_HERE.md              - Navigation & quick start"
echo "  🚀 DEPLOYMENT_README.md       - Deployment guide"
echo "  ✅ FIX_SUMMARY.md             - What's been fixed"
echo ""

echo "Technical Docs:"
echo "  🎨 UI_PUMP_CONTROL_FIX.md     - Frontend improvements"
echo "  ⚙️  ESP32_PUMP_CONTROL_FIX.md  - Backend command queue"
echo "  📡 DEPLOY_ESP32_FIX.md        - Full deployment"
echo ""

echo "Detailed Guides:"
echo "  📝 QUICK_DEPLOYMENT_FIX.md    - Troubleshooting"
echo ""

# ============================================
# SYSTEM STATUS
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${MAGENTA}🔍 QUICK SYSTEM CHECK${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed:${NC} $NODE_VERSION"
else
    echo -e "${RED}✗ Node.js not found${NC}"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm installed:${NC} $NPM_VERSION"
else
    echo -e "${RED}✗ npm not found${NC}"
fi

# Check Supabase CLI
if command -v supabase &> /dev/null; then
    SUPABASE_VERSION=$(supabase --version)
    echo -e "${GREEN}✓ Supabase CLI installed:${NC} $SUPABASE_VERSION"
else
    echo -e "${YELLOW}⚠ Supabase CLI not found${NC}"
    echo "  Install: brew install supabase/tap/supabase"
fi

# Check if logged in to Supabase
if supabase projects list &> /dev/null 2>&1; then
    echo -e "${GREEN}✓ Logged in to Supabase${NC}"
else
    echo -e "${YELLOW}⚠ Not logged in to Supabase${NC}"
    echo "  Login: supabase login"
fi

echo ""

# Check Edge Function health
PROJECT_ID="wgjudfgqjqorkhdlvlgc"
FUNCTION_NAME="make-server-5aa965b0"
HEALTH_URL="https://${PROJECT_ID}.supabase.co/functions/v1/${FUNCTION_NAME}/health"

echo "Checking Edge Function..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Edge Function deployed and healthy${NC}"
else
    echo -e "${YELLOW}⚠ Edge Function not responding (HTTP $HTTP_CODE)${NC}"
    echo "  Deploy: bash quick-fix.sh"
fi

echo ""

# ============================================
# URLS
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}🔗 IMPORTANT URLS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Edge Function:"
echo "  https://${PROJECT_ID}.supabase.co/functions/v1/${FUNCTION_NAME}"
echo ""

echo "Health Check:"
echo "  ${HEALTH_URL}"
echo ""

echo "Supabase Dashboard:"
echo "  https://supabase.com/dashboard/project/${PROJECT_ID}"
echo ""

# ============================================
# NEXT STEPS
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎯 RECOMMENDED NEXT STEPS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$HTTP_CODE" != "200" ]; then
    echo "1. Deploy Edge Function:"
    echo "   ${YELLOW}bash quick-fix.sh${NC}"
    echo ""
    echo "2. Verify deployment:"
    echo "   ${YELLOW}bash verify-deployment.sh${NC}"
    echo ""
    echo "3. Refresh browser (Ctrl+Shift+R)"
else
    echo "Edge Function is deployed! ✅"
    echo ""
    echo "You can now:"
    echo "  • Open dashboard in browser"
    echo "  • Add sectors"
    echo "  • Connect ESP32"
    echo "  • Test pump control"
    echo "  • Enable WhatsApp alerts"
fi

echo ""

# ============================================
# FOOTER
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📖 For detailed help, read:${NC} ${YELLOW}START_HERE.md${NC}"
echo ""
echo -e "${GREEN}🌾 Happy Smart Farming! 🚜${NC}"
echo ""
