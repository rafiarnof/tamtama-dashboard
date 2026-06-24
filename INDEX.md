# 📚 DOKUMENTASI WEBSITE MONITORING PERTANIAN

**Project:** Monitoring Sektor Pertanian dengan IoT ESP32  
**Platform:** React Vite + Supabase + WhatsApp Gateway  
**Last Updated:** 24 Juni 2026

---

## 🚀 MULAI DARI SINI

### 1. **Setup Awal**
- 📖 [MULAI_DISINI.md](./MULAI_DISINI.md) - Panduan lengkap setup project (Update Utama)
- 📖 [QUICK_START.md](./QUICK_START.md) - Quick start guide untuk developer
- 📖 [README.md](./README.md) - Project overview terkini

### 2. **Deployment**
- 📖 [QUICK_DEPLOYMENT_FIX.md](./QUICK_DEPLOYMENT_FIX.md) - ⭐ Panduan deployment cepat
- 📖 [DEPLOY_ESP32_FIX.md](./DEPLOY_ESP32_FIX.md) - Deployment ESP32 + Server lengkap

---

## 🔧 DOKUMENTASI TEKNIS

### ESP32 & Hardware
- 📖 [ESP32_INTEGRATION_GUIDE.md](./ESP32_INTEGRATION_GUIDE.md) - Integrasi ESP32 dengan server Supabase
- 📖 [ESP32_QUICK_REFERENCE.md](./ESP32_QUICK_REFERENCE.md) - Quick reference ESP32
- 📖 [ESP32_SETUP_GUIDE_PRODUCTION.md](./ESP32_SETUP_GUIDE_PRODUCTION.md) - Setup production ESP32
- 📖 [ESP32_TROUBLESHOOTING_GUIDE.md](./ESP32_TROUBLESHOOTING_GUIDE.md) - Troubleshooting ESP32
- 📖 [SOP_PERAKITAN_HARDWARE.md](./SOP_PERAKITAN_HARDWARE.md) - ⭐ SOP perakitan hardware lengkap

### Code ESP32
- 📄 [TAMTAMA_ESP32_PRODUCTION.ino](./TAMTAMA_ESP32_PRODUCTION.ino) - ⭐ **PRODUCTION CODE**
- 📄 [TAMTAMA_SENSOR_DEBUG.ino](./TAMTAMA_SENSOR_DEBUG.ino) - 🔧 **DEBUG & TESTING TOOL**

---

## 📋 STANDARD OPERATING PROCEDURES (SOP)

### Untuk Admin/Developer
- 📖 [SOP_LENGKAP.md](./SOP_LENGKAP.md) - ⭐ SOP lengkap untuk operasional
- 📖 [AUDIT_HASIL_UJI.md](./AUDIT_HASIL_UJI.md) - Hasil audit lengkap sistem
- 📖 [REVISI_PRIORITAS.md](./REVISI_PRIORITAS.md) - Action plan perbaikan

### Untuk Pengguna Akhir
- 📖 [SOP_PENGGUNA_AKHIR.md](./SOP_PENGGUNA_AKHIR.md) - ⭐ SOP untuk petani/user biasa

### RBAC System (Role-Based Access Control):
- 📖 [RBAC_QUICK_START.md](./RBAC_QUICK_START.md) - Quick start panduan role
- 📖 [RBAC_IMPLEMENTATION_PLAN.md](./RBAC_IMPLEMENTATION_PLAN.md) - Design logic implementasi
- 📖 [MIGRATION_TROUBLESHOOTING.md](./MIGRATION_TROUBLESHOOTING.md) - Troubleshooting error

---

## 🛠️ HELPER SCRIPTS

### Bash Scripts
- 🔧 [quick-fix.sh](./quick-fix.sh) - Script otomatis deployment
- 🔧 [verify-deployment.sh](./verify-deployment.sh) - Verifikasi deployment
- 🔧 [test-pump-control.sh](./test-pump-control.sh) - Test pompa
- 🔧 [show-help.sh](./show-help.sh) - Bantuan command

### Config Files
- ⚙️ [env.config.js](./env.config.js) - ⭐ File setting (Token WA, Admin)

---

## 📊 FILE STRUCTURE TERKINI

```
/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── App.tsx                    # Main app
│   │   ├── 📁 components/             # React components (Landing, Login, Dashboard)
│   │   ├── 📁 services/               # API, Supabase Auth
│   │   ├── 📁 ui/                     # Shadcn components
│   │   └── 📁 utils/                  # Helper
│   └── 📁 styles/                     # TailwindCSS v4
├── 📁 supabase/
│   ├── 📁 functions/              # Edge Functions
│   └── 📁 migrations/             # SQL Schema RBAC
├── 📄 *.ino                           # ESP32 code files
├── 📄 *.md                            # Documentation
├── 🔧 *.sh                            # Bash scripts
└── ⚙️ env.config.js                   # Config
```

---

## ⭐ CHANGELOG & VERSI

### v4.0 (24 Juni 2026) - Current
- ✅ Transisi branding ke Website Monitoring Pertanian
- ✅ Penyempurnaan Role-Based Access Control (Admin & User Dashboard)
- ✅ Integrasi komponen shadcn/ui dan optimasi UX/UI
- ✅ ErrorBoundary dan stabilitas sinkronisasi IoT
- ✅ Manajemen sektor dinamis (CRUD sektor oleh admin)

### v3.0 (Maret 2026)
- ✅ Supabase Auth diimplementasikan (RBAC V1)
- ✅ Database Normalized (PostgreSQL)

### v2.0 (Feb 2026)
- ✅ Full migrasi dari Firebase ke Supabase
- ✅ Optimistic UI pump control

### v1.0 (Previous)
- ✅ Initial release (Firebase, 10 sektor fix)

---

**Happy Monitoring! 🌾**
