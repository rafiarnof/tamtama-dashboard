# 🚀 QUICK START - RBAC SYSTEM IMPLEMENTATION

## 📋 WHAT'S NEW?

Sistem monitoring pertanian sekarang memiliki **Role-Based Access Control (RBAC)** dengan 2 jenis pengguna:
- **Admin** (Kadet/Mahasiswa) - Full access ke semua 10 sektor
- **Warga** (Pemilik lahan) - Akses terbatas ke sektor sendiri saja

---

## 🎯 KEY FEATURES

### ✅ **Registrasi Mandiri**
- Warga bisa daftar sendiri via web
- Form input: email, password, nama, no HP, pilih sektor
- Status: **Pending** → tunggu approval admin

### ✅ **Admin Approval**
- Admin lihat list pending registrations
- Approve atau Reject dengan catatan
- User approved → bisa login langsung

### ✅ **Data Isolation**
- Warga hanya lihat data sektor sendiri
- Tidak bisa akses sektor lain
- Implementasi Row Level Security (RLS)

### ✅ **Dual Dashboard**
- **Admin Dashboard**: 10 sektor grid view (existing)
- **Warga Dashboard**: 1 sektor mobile-friendly (NEW)

### ✅ **Manual Pump Control**
- Warga bisa kontrol pompa sektor sendiri
- Admin bisa kontrol semua pompa
- Tracking siapa yang kontrol terakhir kali

---

## 🔧 IMPLEMENTATION STATUS

### ✅ **Phase 1: Planning & Documentation**
- [x] RBAC_IMPLEMENTATION_PLAN.md - Complete design document
- [x] Database schema design
- [x] API endpoints design
- [x] UI/UX mockups

### 🚧 **Phase 2: Backend Implementation** (CURRENT)
- [x] auth-utils.ts - Password hashing & validation helpers
- [x] 002_rbac_system.sql - Database migration script
- [ ] Update server/index.tsx dengan auth endpoints
- [ ] Test authentication flow
- [ ] Test RLS policies

### ⏳ **Phase 3: Frontend Implementation** (NEXT)
- [ ] RegistrationPage component
- [ ] AdminApprovalPage component  
- [ ] WargaDashboard component
- [ ] Update LoginPage
- [ ] Role-based routing

---

## 📂 FILES CREATED

### Documentation:
1. **RBAC_IMPLEMENTATION_PLAN.md** - Complete implementation guide
   - Database schema
   - API endpoints
   - UI components
   - Security features
   - Implementation phases

### Backend:
2. **supabase/functions/server/auth-utils.ts** - Authentication utilities
   - Password hashing (bcrypt)
   - Password validation
   - Email & phone validation
   - JWT token generation
   - Token verification

3. **supabase/migrations/002_rbac_system.sql** - Database migration
   - Create users table
   - Enable RLS on all tables
   - Create RLS policies (admin vs warga)
   - Create pump_commands table
   - Create audit_logs table
   - Helper functions
   - Default admin user

---

## 🗄️ DATABASE SCHEMA

### New Tables:

#### 1. **users_5aa965b0**
```sql
- id (UUID, Primary Key)
- email (TEXT, UNIQUE)
- password_hash (TEXT)
- full_name (TEXT)
- phone (TEXT)
- role ('admin' | 'warga')
- sector_id (TEXT, NULL for admin)
- status ('pending' | 'approved' | 'rejected')
- created_at (TIMESTAMPTZ)
- approved_by (UUID, FK)
- approved_at (TIMESTAMPTZ)
- last_login (TIMESTAMPTZ)
- notes (TEXT)
```

#### 2. **pump_commands**
```sql
- id (SERIAL, Primary Key)
- sector_id (TEXT)
- command ('ON' | 'OFF')
- requested_by (UUID, FK to users)
- requested_at (TIMESTAMPTZ)
- executed (BOOLEAN)
- executed_at (TIMESTAMPTZ)
```

#### 3. **audit_logs**
```sql
- id (SERIAL, Primary Key)
- user_id (UUID, FK)
- action (TEXT)
- resource (TEXT)
- resource_id (TEXT)
- details (JSONB)
- ip_address (TEXT)
- user_agent (TEXT)
- created_at (TIMESTAMPTZ)
```

---

## 🔒 ROW LEVEL SECURITY (RLS)

### Users Table:
- ✅ Admin bisa lihat semua users
- ✅ Warga hanya bisa lihat profile sendiri
- ✅ Public bisa register (INSERT dengan status pending)
- ✅ User bisa update profile sendiri (kecuali role/status/sector)
- ✅ Admin bisa update semua users (untuk approval)

### Sectors Table:
- ✅ Admin bisa lihat & manage semua sektor
- ✅ Warga hanya bisa lihat sektor sendiri

### Sensor Data Table:
- ✅ Admin bisa lihat semua data
- ✅ Warga hanya bisa lihat data sektor sendiri

### Pump Commands Table:
- ✅ Admin bisa kontrol & lihat semua pumps
- ✅ Warga bisa kontrol & lihat pump sektor sendiri

---

## 🚀 HOW TO DEPLOY

### Step 1: Run Database Migration
```bash
# Login to Supabase dashboard
# Go to: SQL Editor
# Copy paste content dari: /supabase/migrations/002_rbac_system.sql
# Click RUN

# Or via CLI:
supabase db push
```

### Step 2: Verify Tables Created
```sql
SELECT * FROM users_5aa965b0;
SELECT * FROM pump_commands;
SELECT * FROM audit_logs;
```

### Step 3: Test Default Admin Login
```
Email: admin@tamtama.com
Password: Admin@123

⚠️ CHANGE THIS PASSWORD IN PRODUCTION!
```

### Step 4: Update Server Code (Next Phase)
- Implement auth endpoints
- Test registration flow
- Test approval flow

### Step 5: Build Frontend Components (Phase 3)
- RegistrationPage
- AdminApprovalPage
- WargaDashboard

---

## 🎯 USER FLOW

### Warga Registration:
```
1. Warga buka website → Klik "Daftar"
2. Isi form: email, password, nama, HP, pilih sektor
3. Submit → Status: PENDING
4. Show message: "Tunggu approval dari admin (max 24 jam)"
5. (Optional) Kirim WhatsApp ke admin: "Ada registrasi baru!"
```

### Admin Approval:
```
1. Admin login → Lihat badge "3 Pending Approvals"
2. Klik → Lihat list pending users
3. Review detail user (nama, HP, sektor)
4. Klik "Approve" → Status: APPROVED
   OR
   Klik "Reject" + tulis alasan → Status: REJECTED
5. (Optional) Kirim WhatsApp ke warga: "Akun approved!"
```

### Warga Login (After Approved):
```
1. Warga login dengan email & password
2. Check role & status:
   - If status = PENDING → Show "Menunggu approval"
   - If status = REJECTED → Show "Pendaftaran ditolak: [alasan]"
   - If status = APPROVED → Redirect to WargaDashboard
3. Dashboard tampil: 1 sektor saja, mobile-friendly
4. Warga bisa:
   - Lihat sensor real-time
   - Kontrol pompa ON/OFF
   - Lihat history 24 jam
```

### Admin Login:
```
1. Admin login
2. Check role = 'admin' → Redirect to AdminDashboard
3. Dashboard tampil: 10 sektor grid (existing)
4. Admin bisa:
   - Lihat semua sektor
   - Kontrol semua pompa
   - Approve pending users
   - Manage system settings
```

---

## 🔐 DEFAULT CREDENTIALS

### Admin Account:
```
Email: admin@tamtama.com
Password: Admin@123
Role: admin
Status: approved
```

**⚠️ IMPORTANT**: Ganti password ini setelah login pertama kali!

---

## 📱 NEXT STEPS

### Untuk Developer:

1. **Run migration script** di Supabase SQL Editor
2. **Test database** dengan query manual
3. **Implement server endpoints**:
   - POST /api/register
   - POST /api/login
   - GET /api/pending-users
   - POST /api/approve-user
   - GET /api/my-sector
4. **Test API endpoints** dengan Postman/curl
5. **Build frontend components** (Phase 3)

### Untuk Admin/User:

1. **Wait for deployment** - developer akan inform
2. **Test registration flow** dengan dummy account
3. **Test approval flow** via admin dashboard
4. **Provide feedback** untuk UI/UX improvements
5. **Final testing** dengan real data

---

## 📚 DOCUMENTATION REFERENCES

- 📖 [RBAC_IMPLEMENTATION_PLAN.md](./RBAC_IMPLEMENTATION_PLAN.md) - Complete design doc
- 📖 [supabase/migrations/002_rbac_system.sql](./supabase/migrations/002_rbac_system.sql) - Migration script
- 📖 [supabase/functions/server/auth-utils.ts](./supabase/functions/server/auth-utils.ts) - Auth utilities
- 📖 [INDEX.md](./INDEX.md) - Main documentation index

---

## ❓ FAQ

### Q: Berapa lama approval dari admin?
**A:** Target < 24 jam. Admin akan notifikasi via WhatsApp.

### Q: Bisa daftar 2 sektor berbeda?
**A:** Tidak. 1 akun = 1 sektor. Jika punya 2 sektor, buat 2 akun berbeda.

### Q: Lupa password gimana?
**A:** Hubungi admin untuk reset password (fitur auto-reset coming soon).

### Q: Warga bisa lihat data sektor lain?
**A:** Tidak. RLS memastikan warga hanya bisa akses sektor sendiri.

### Q: Admin bisa kontrol pompa sektor warga?
**A:** Ya. Admin punya full access untuk monitoring & emergency control.

### Q: Data histori berapa lama disimpan?
**A:** Default 30 hari. Admin bisa export untuk archiving.

---

## 🆘 SUPPORT

**Issues atau pertanyaan?**
- 📧 Email: admin@tamtama.com
- 💬 WhatsApp: +62 812-3456-7890
- 📖 Dokumentasi: [INDEX.md](./INDEX.md)

---

**Status: Phase 1 Complete ✅ | Phase 2 In Progress 🚧**

Last Updated: 20 Feb 2026
