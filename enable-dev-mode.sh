#!/bin/bash

# =====================================================
# QUICK FIX: Enable Development Mode
# Aktifkan mode development untuk testing tanpa deploy
# =====================================================

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║  🛠️  ENABLE DEVELOPMENT MODE                            ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

CONFIG_FILE="env.config.js"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ File $CONFIG_FILE tidak ditemukan!"
    echo ""
    exit 1
fi

echo "📝 Mengubah DEV_MODE menjadi true..."
echo ""

# Backup original file
cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"
echo "✅ Backup dibuat: ${CONFIG_FILE}.backup"

# Replace DEV_MODE: false menjadi DEV_MODE: true
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's/DEV_MODE: false/DEV_MODE: true/' "$CONFIG_FILE"
else
    # Linux
    sed -i 's/DEV_MODE: false/DEV_MODE: true/' "$CONFIG_FILE"
fi

echo "✅ DEV_MODE diubah menjadi true"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEVELOPMENT MODE AKTIF"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Aplikasi akan menggunakan MOCK DATA."
echo ""
echo "Next steps:"
echo "1. Refresh browser (Ctrl+R atau Cmd+R)"
echo "2. Aplikasi akan berjalan dengan mock data"
echo "3. Bisa testing UI tanpa Edge Function"
echo ""
echo "⚠️  CATATAN:"
echo "- Mode ini HANYA untuk testing UI"
echo "- ESP32 tidak bisa connect di mode ini"
echo "- Untuk production, deploy Edge Function dan disable DEV_MODE"
echo ""
echo "Untuk disable development mode:"
echo "./disable-dev-mode.sh"
echo ""
