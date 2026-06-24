#!/bin/bash

# =====================================================
# QUICK FIX: Disable Development Mode
# Kembali ke production mode (gunakan Edge Function)
# =====================================================

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║  🚀  DISABLE DEVELOPMENT MODE                            ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

CONFIG_FILE="env.config.js"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ File $CONFIG_FILE tidak ditemukan!"
    echo ""
    exit 1
fi

echo "📝 Mengubah DEV_MODE menjadi false..."
echo ""

# Backup original file
cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"
echo "✅ Backup dibuat: ${CONFIG_FILE}.backup"

# Replace DEV_MODE: true menjadi DEV_MODE: false
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's/DEV_MODE: true/DEV_MODE: false/' "$CONFIG_FILE"
else
    # Linux
    sed -i 's/DEV_MODE: true/DEV_MODE: false/' "$CONFIG_FILE"
fi

echo "✅ DEV_MODE diubah menjadi false"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PRODUCTION MODE AKTIF"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Aplikasi akan menggunakan Edge Function + Database."
echo ""
echo "Next steps:"
echo "1. Pastikan Edge Function sudah di-deploy:"
echo "   ./check-deployment.sh"
echo ""
echo "2. Refresh browser (Ctrl+R atau Cmd+R)"
echo ""
echo "3. Aplikasi akan connect ke Supabase"
echo ""
