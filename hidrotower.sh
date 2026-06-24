#!/bin/bash

# =====================================================
# HIDROTOWER HELPER - Command Center
# Script utama untuk management HidroTower
# =====================================================

show_banner() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║  🌱 HIDROTOWER COMMAND CENTER                            ║"
    echo "║     Sistem Monitoring Hidroponik Tower IoT               ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
}

show_menu() {
    echo "Pilih menu:"
    echo ""
    echo "  1) 📊 Cek Status Deployment"
    echo "  2) 🚀 Deploy Edge Function"
    echo "  3) 🛠️  Enable Development Mode (Mock Data)"
    echo "  4) 🗄️  Disable Development Mode (Production)"
    echo "  5) 📝 Lihat Logs Edge Function"
    echo "  6) 🔑 Info Login & Credentials"
    echo "  7) 📖 Buka Panduan Lengkap"
    echo "  8) ❌ Exit"
    echo ""
    read -p "Masukkan pilihan (1-8): " choice
    echo ""
}

check_deployment() {
    if [ -f "./check-deployment.sh" ]; then
        chmod +x check-deployment.sh
        ./check-deployment.sh
    else
        echo "❌ File check-deployment.sh tidak ditemukan"
    fi
}

deploy_function() {
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║  🚀 DEPLOY EDGE FUNCTION                                 ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    
    # Check if supabase CLI installed
    if ! command -v supabase &> /dev/null; then
        echo "❌ Supabase CLI belum terinstall!"
        echo ""
        echo "Install dengan:"
        echo "  npm install -g supabase"
        echo ""
        return 1
    fi
    
    echo "📦 Deploying Edge Function..."
    echo ""
    
    supabase functions deploy make-server-5aa965b0
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deploy berhasil!"
        echo ""
        echo "Verifikasi deployment:"
        check_deployment
    else
        echo ""
        echo "❌ Deploy gagal!"
        echo ""
        echo "Pastikan Anda sudah:"
        echo "1. Login: supabase login"
        echo "2. Link project: supabase link --project-ref wgjudfgqjqorkhdlvlgc"
        echo ""
    fi
}

enable_dev() {
    if [ -f "./enable-dev-mode.sh" ]; then
        chmod +x enable-dev-mode.sh
        ./enable-dev-mode.sh
    else
        echo "❌ File enable-dev-mode.sh tidak ditemukan"
    fi
}

disable_dev() {
    if [ -f "./disable-dev-mode.sh" ]; then
        chmod +x disable-dev-mode.sh
        ./disable-dev-mode.sh
    else
        echo "❌ File disable-dev-mode.sh tidak ditemukan"
    fi
}

view_logs() {
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║  📝 VIEWING LOGS                                         ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    
    if ! command -v supabase &> /dev/null; then
        echo "❌ Supabase CLI belum terinstall!"
        return 1
    fi
    
    echo "Showing last 50 logs (press Ctrl+C to exit)..."
    echo ""
    
    supabase functions logs make-server-5aa965b0
}

show_login_info() {
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║  🔑 LOGIN & CREDENTIALS INFO                             ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    echo "📧 EMAIL & PASSWORD"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Sistem menggunakan Supabase Auth (bukan hardcoded credentials)."
    echo ""
    echo "PERTAMA KALI (Belum ada admin):"
    echo "  1. Buka aplikasi di browser"
    echo "  2. Akan muncul halaman 'Setup Admin Pertama'"
    echo "  3. Isi form dengan email & password pilihan Anda"
    echo ""
    echo "CONTOH KREDENSIAL YANG DISARANKAN:"
    echo "  Email    : admin@hidrotower.com"
    echo "  Password : admin123"
    echo ""
    echo "SETELAH SETUP:"
    echo "  Login dengan email & password yang sudah Anda buat"
    echo ""
    echo "LUPA PASSWORD?"
    echo "  Klik 'Lupa password?' di halaman login"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

show_guide() {
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║  📖 PANDUAN & DOKUMENTASI                                ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    echo "📁 File dokumentasi yang tersedia:"
    echo ""
    echo "  QUICK_REFERENCE.md       - Quick start guide"
    echo "  DEPLOYMENT_GUIDE.md      - Panduan deployment lengkap"
    echo "  env.config.js            - Konfigurasi aplikasi"
    echo ""
    echo "Buka file dengan text editor atau cat:"
    echo "  cat QUICK_REFERENCE.md"
    echo ""
}

# Main loop
show_banner

while true; do
    show_menu
    
    case $choice in
        1)
            check_deployment
            ;;
        2)
            deploy_function
            ;;
        3)
            enable_dev
            ;;
        4)
            disable_dev
            ;;
        5)
            view_logs
            ;;
        6)
            show_login_info
            ;;
        7)
            show_guide
            ;;
        8)
            echo "👋 Terima kasih telah menggunakan HidroTower!"
            echo ""
            exit 0
            ;;
        *)
            echo "❌ Pilihan tidak valid. Silakan pilih 1-8."
            ;;
    esac
    
    echo ""
    read -p "Tekan Enter untuk kembali ke menu..."
    echo ""
done
