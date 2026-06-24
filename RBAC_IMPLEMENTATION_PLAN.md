# 🔐 SISTEM RBAC & REGISTRASI - IMPLEMENTASI PLAN

## 📋 OVERVIEW PERUBAHAN

Transformasi dari sistem single-user menjadi multi-user dengan Role-Based Access Control (RBAC).

---

## 📊 COMPARISON TABLE

| Aspek | Kondisi Awal | Perubahan/Sistem Baru |
|-------|--------------|----------------------|
| **Manajemen Pengguna** | Hanya Admin yang memantau dan mengelola data | **Role-Based Access**: Pembagian peran menjadi Admin (Kadet/Mahasiswa) dan Warga |
| **Pendaftaran** | Akun dibuatkan secara manual oleh pengembang | **Laman Registrasi & Verifikasi**: Warga mendaftar mandiri, namun akses baru terbuka setelah diverifikasi oleh Admin |
| **Akses Data** | Seluruh data terbuka untuk siapa saja yang punya link | **Data Isolation (RLS)**: Warga hanya bisa melihat data sensor dan kontrol pompa milik sektornya sendiri |
| **Kontrol Pompa** | Sepenuhnya otomatis berdasarkan timer dari sistem | **Manual Override**: Warga memiliki tombol kontrol di web untuk menyalakan/mematikan pompa secara mandiri |
| **Antarmuka (UI)** | Satu tampilan teknis untuk semua kebutuhan | **Dual Dashboard**: Tampilan Admin fokus pada manajemen 10 sektor, tampilan Warga fokus pada kemudahan penggunaan di HP |
| **Keamanan Sistem** | Tanpa verifikasi pengguna luar | **Admin Approval Workflow**: Mencegah akses tidak sah dan memastikan validitas pengguna di setiap sektor |

---

## 🎯 USER ROLES

### 1. **Admin (Kadet/Mahasiswa)**
**Hak Akses:**
- ✅ Lihat semua 10 sektor
- ✅ Kontrol pompa di semua sektor
- ✅ Edit informasi sektor
- ✅ Tambah/hapus sektor
- ✅ Approve/reject registrasi warga baru
- ✅ Lihat semua pengguna
- ✅ Kelola WhatsApp alerts
- ✅ Export data & reports

**Dashboard:**
- Multi-sector view (10 cards)
- Pending registration notifications
- System-wide analytics

### 2. **Warga (Pemilik Lahan)**
**Hak Akses:**
- ✅ Lihat data sensor sektor sendiri saja
- ✅ Kontrol pompa sektor sendiri
- ✅ Lihat history sektor sendiri
- ✅ Update profile sendiri
- ❌ Tidak bisa lihat sektor lain
- ❌ Tidak bisa approve pengguna
- ❌ Tidak bisa edit system settings

**Dashboard:**
- Single-sector view
- Mobile-optimized
- Simple controls

---

## 🗄️ DATABASE SCHEMA

### New Table: `users_5aa965b0`

```sql
CREATE TABLE users_5aa965b0 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'warga')),
  sector_id TEXT, -- NULL untuk admin, required untuk warga (e.g., 'SEC-001')
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES users_5aa965b0(id),
  approved_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  notes TEXT -- Admin notes for approval/rejection
);

-- Index untuk performance
CREATE INDEX idx_users_email ON users_5aa965b0(email);
CREATE INDEX idx_users_sector ON users_5aa965b0(sector_id);
CREATE INDEX idx_users_status ON users_5aa965b0(status);
CREATE INDEX idx_users_role ON users_5aa965b0(role);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE users_5aa965b0 ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admin bisa lihat semua users
CREATE POLICY admin_view_all ON users_5aa965b0
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Policy 2: Warga hanya bisa lihat profile sendiri
CREATE POLICY warga_view_own ON users_5aa965b0
  FOR SELECT
  USING (id = auth.uid());

-- Policy 3: Public bisa register (INSERT untuk status pending)
CREATE POLICY public_register ON users_5aa965b0
  FOR INSERT
  WITH CHECK (status = 'pending');

-- Policy 4: User bisa update profile sendiri (kecuali role & status)
CREATE POLICY user_update_own ON users_5aa965b0
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = OLD.role AND status = OLD.status);

-- Policy 5: Admin bisa update semua users
CREATE POLICY admin_update_all ON users_5aa965b0
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );
```

### RLS untuk Sectors

```sql
-- Update kv_store_5aa965b0 untuk data isolation
ALTER TABLE kv_store_5aa965b0 ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admin bisa lihat semua data
CREATE POLICY admin_view_all_data ON kv_store_5aa965b0
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Policy 2: Warga hanya bisa lihat data sektor sendiri
CREATE POLICY warga_view_own_sector ON kv_store_5aa965b0
  FOR SELECT
  USING (
    key LIKE 'sector:%' AND
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = auth.uid() 
        AND u.role = 'warga' 
        AND u.status = 'approved'
        AND u.sector_id = SPLIT_PART(key, ':', 2)
    )
  );

-- Policy 3: Warga bisa update pump command sektor sendiri
CREATE POLICY warga_control_own_pump ON kv_store_5aa965b0
  FOR UPDATE
  USING (
    key LIKE 'pump_command:%' AND
    EXISTS (
      SELECT 1 FROM users_5aa965b0 u
      WHERE u.id = auth.uid() 
        AND u.role = 'warga' 
        AND u.status = 'approved'
        AND u.sector_id = SPLIT_PART(key, ':', 2)
    )
  );
```

---

## 🔧 BACKEND ENDPOINTS

### New Endpoints di `/supabase/functions/server/index.tsx`:

#### 1. **POST /api/register** - Public registration
```typescript
{
  email: string;
  password: string;
  fullName: string;
  phone: string;
  sectorId: string; // e.g., "SEC-001"
}
Response: { success: boolean, message: string }
```

#### 2. **GET /api/pending-users** - Admin only
```typescript
Response: [
  {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    sectorId: string;
    createdAt: string;
  }
]
```

#### 3. **POST /api/approve-user** - Admin only
```typescript
{
  userId: string;
  action: 'approve' | 'reject';
  notes?: string;
}
Response: { success: boolean, message: string }
```

#### 4. **GET /api/my-sector** - Warga only
```typescript
Response: {
  sectorId: string;
  sensorData: {...};
  pumpStatus: string;
  history: [...];
}
```

#### 5. **POST /api/login** - Updated with role & sector
```typescript
{
  email: string;
  password: string;
}
Response: {
  success: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'admin' | 'warga';
    sectorId?: string;
    status: string;
  };
  token: string;
}
```

---

## 🎨 FRONTEND COMPONENTS

### New Components:

#### 1. **RegistrationPage.tsx**
- Form pendaftaran warga
- Input: email, password, nama lengkap, no HP, pilih sektor
- Validasi input
- Submit ke `/api/register`
- Show success message + instruksi tunggu approval

#### 2. **AdminApprovalPage.tsx**
- List pending registrations
- Show user details (nama, email, HP, sektor)
- Tombol Approve / Reject
- Input notes untuk rejection reason
- Real-time update setelah approve/reject

#### 3. **WargaDashboard.tsx**
- Mobile-first design
- Single sector view
- Sensor cards: Suhu, Kelembapan, Level Air, Cahaya
- Tombol Pompa besar (ON/OFF)
- History chart simplified
- Profile section

#### 4. **AdminDashboard.tsx** (existing App.tsx refactored)
- Multi-sector view (existing)
- Add notification badge untuk pending users
- Add link ke Approval page

#### 5. **Updated LoginPage.tsx**
- Add link "Daftar sebagai Warga"
- Show error jika status = pending / rejected

---

## 🚦 ROUTING FLOW

```
/                          → LoginPage
/register                  → RegistrationPage
/admin/dashboard           → AdminDashboard (10 sectors)
/admin/approvals           → AdminApprovalPage
/warga/dashboard           → WargaDashboard (1 sector)
/profile                   → ProfilePage (common)
```

### Protected Routes:
- Admin routes require: role === 'admin' && status === 'approved'
- Warga routes require: role === 'warga' && status === 'approved'
- Redirect to login if not authenticated
- Show "Menunggu Approval" page if status === 'pending'

---

## 📱 UI/UX IMPROVEMENTS

### Admin Dashboard:
- Existing 10-sector grid view
- Add floating notification badge: "3 Pending Approvals"
- Add quick link to Approval page

### Warga Dashboard (Mobile-First):
- **Header**: Sektor badge besar, nama warga, logout button
- **Hero Section**: Status pompa besar dengan toggle switch
- **Sensor Cards**: 2x2 grid, icon besar, value besar, easy to read
- **Chart**: Simplified 24h chart, swipe untuk switch sensor
- **Bottom Navigation**: Dashboard, History, Profile
- **Color Scheme**: Friendly colors (green = good, orange = warning, red = critical)

### Registration Page:
- Simple form, friendly language
- Dropdown pilih sektor dengan nama desa/lokasi
- Show expected approval time: "~24 jam"
- Success page with WhatsApp contact admin

### Approval Page:
- Card-based layout untuk each pending user
- Show sector name & location
- Show registration date
- Quick approve button (green)
- Reject button with notes modal (red)

---

## 🔒 SECURITY FEATURES

### 1. **Password Hashing**
- Use bcrypt with salt rounds = 10
- Never store plain passwords

### 2. **JWT Tokens**
- Short expiry (24 hours)
- Include role & sectorId in payload
- Validate on every protected route

### 3. **Input Validation**
- Email format validation
- Password strength: min 8 chars, 1 uppercase, 1 number
- Phone number format: Indonesia (+62)
- Sector ID must exist in database

### 4. **Rate Limiting**
- Registration: max 5 per IP per hour
- Login attempts: max 5 per email per 15 minutes
- Pump control: max 10 per user per hour

### 5. **Audit Logging**
- Log all pump control actions (who, when, sector)
- Log all approvals/rejections (admin, timestamp, user)
- Log all login attempts

---

## 📊 DATA ISOLATION

### Admin View:
```sql
SELECT * FROM kv_store_5aa965b0 WHERE key LIKE 'sector:%';
-- Returns all 10 sectors
```

### Warga View (SEC-003):
```sql
SELECT * FROM kv_store_5aa965b0 
WHERE key LIKE 'sector:%' 
  AND key LIKE '%SEC-003%';
-- Returns only SEC-003 data
```

---

## 🚀 IMPLEMENTATION PHASES

### **Phase 1: Backend Setup** (Priority 1)
- [ ] Create users table in Supabase
- [ ] Setup RLS policies
- [ ] Implement /api/register endpoint
- [ ] Implement /api/login with role
- [ ] Implement /api/pending-users
- [ ] Implement /api/approve-user
- [ ] Add password hashing utility

### **Phase 2: Registration Flow** (Priority 2)
- [ ] Create RegistrationPage component
- [ ] Update LoginPage with register link
- [ ] Create "Pending Approval" page
- [ ] Test registration flow end-to-end

### **Phase 3: Admin Approval** (Priority 2)
- [ ] Create AdminApprovalPage component
- [ ] Add notification badge to admin dashboard
- [ ] Implement approve/reject actions
- [ ] Add email notification (optional)

### **Phase 4: Warga Dashboard** (Priority 3)
- [ ] Create WargaDashboard component (mobile-first)
- [ ] Implement single-sector data fetching
- [ ] Add pump control for warga
- [ ] Add simple history chart
- [ ] Add profile page

### **Phase 5: Role-Based Routing** (Priority 3)
- [ ] Setup React Router with protected routes
- [ ] Implement role-based redirects
- [ ] Add middleware untuk check role & status
- [ ] Test all routing scenarios

### **Phase 6: Testing & Polish** (Priority 4)
- [ ] Test admin flow: approve/reject
- [ ] Test warga flow: register → approved → login → control pump
- [ ] Test data isolation (warga can't see other sectors)
- [ ] Mobile responsiveness testing
- [ ] Security audit
- [ ] Performance testing

---

## 📝 USER STORIES

### Story 1: Warga Registration
```
As a warga (farmer),
I want to register myself on the website,
So that I can monitor and control my sector's pump independently.

Acceptance Criteria:
- I can fill registration form with my details
- I can select my sector from dropdown
- System shows "Wait for approval" message after registration
- I receive confirmation (optional: via WhatsApp)
```

### Story 2: Admin Approval
```
As an admin (kadet/mahasiswa),
I want to approve or reject warga registrations,
So that I can ensure only valid users have access to the system.

Acceptance Criteria:
- I see list of pending registrations
- I can view user details before approval
- I can approve or reject with notes
- Approved users can login immediately
- Rejected users see rejection message on login
```

### Story 3: Warga Dashboard
```
As an approved warga,
I want to see my sector's data on mobile,
So that I can monitor and control my farm easily from my phone.

Acceptance Criteria:
- Dashboard loads quickly on mobile
- I see current sensor readings (big, clear numbers)
- I can control my pump with one tap
- I see 24-hour history chart
- I cannot see other sectors' data
```

### Story 4: Data Isolation
```
As a warga with SEC-003,
I should only see data for SEC-003,
So that my privacy is protected and I don't get confused with other sectors.

Acceptance Criteria:
- API returns only my sector's data
- Attempting to access other sectors returns 403 Forbidden
- Dashboard shows only my sector name
- No UI elements for switching sectors
```

---

## 🎯 SUCCESS METRICS

### Technical:
- ✅ RLS policies working (tested with different users)
- ✅ 0 security vulnerabilities
- ✅ Page load < 3 seconds on mobile
- ✅ API response time < 500ms

### User Experience:
- ✅ Registration completion rate > 80%
- ✅ Admin approval time < 24 hours
- ✅ Warga dashboard usable on phone (System Usability Scale > 70)
- ✅ Pump control success rate > 95%

### Business:
- ✅ 100% warga self-register (no manual account creation)
- ✅ Reduced admin workload (no direct sensor monitoring for each user)
- ✅ Increased user satisfaction
- ✅ Scalable to 100+ users

---

## 📞 SUPPORT & TRAINING

### Admin Training:
- Video tutorial: How to approve users
- SOP: Approval criteria checklist
- FAQ: Common approval scenarios

### Warga Onboarding:
- WhatsApp message template: Registration success
- WhatsApp message template: Approval notification
- Video tutorial: How to use warga dashboard
- Quick start guide (1 page PDF)

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Warga lupa password | High | Implement password reset via email/WhatsApp |
| Admin delay approval > 24h | Medium | Auto-reminder to admin, escalation after 48h |
| Data leak between sectors | Critical | Thorough RLS testing, security audit |
| Mobile UI tidak responsive | High | Mobile-first design, extensive testing |
| Pump control conflict (admin vs warga) | Medium | Show last control action (by who), lock UI during action |

---

## 📚 DOCUMENTATION

### For Developers:
- API documentation (Swagger/Postman)
- Database schema diagram
- RLS policy explanations
- Component structure diagram

### For Admins:
- SOP_APPROVAL_WORKFLOW.md
- Admin dashboard user guide
- Troubleshooting common issues

### For Warga:
- PANDUAN_PENDAFTARAN.md (Bahasa Indonesia)
- CARA_GUNAKAN_DASHBOARD.md (Bahasa Indonesia)
- FAQ untuk warga

---

**Ready to implement! 🚀**
