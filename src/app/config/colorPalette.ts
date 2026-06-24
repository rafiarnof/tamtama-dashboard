// ============================================================
//  🎨 COLOR PALETTE — HidroTower
//  Satu file untuk mengatur SEMUA warna di seluruh aplikasi.
//  Ubah di sini → otomatis berlaku ke semua komponen.
//
//  CARA PAKAI:
//  import { LOGIN_COLORS } from '../config/colorPalette';
//  className={LOGIN_COLORS.submitBtn}
// ============================================================

// ── PETA SHADE HIJAU — #026644 ───────────────────────────────
//
//  Semua shade diturunkan dari warna brand utama #026644.
//  Tidak ada teal / cyan di sini — murni GREEN.
//
//  ┌─────────────┬───────────┬────────────────────────────────┐
//  │ Nama        │ Hex       │ Kegunaan                       │
//  ├─────────────┼───────────┼────────────────────────────────┤
//  │ green-50    │ #e6f2ec   │ Background kartu, hover ringan │
//  │ green-100   │ #c2dfd0   │ Badge light, role tag          │
//  │ green-200   │ #8fc4aa   │ Border, shadow                 │
//  │ green-300   │ #5caa85   │ Teks di atas bg gelap          │
//  │ green-400   │ #2d9166   │ Ikon, checklist, footer aksen  │
//  │ green-500   │ #026644   │ ★ WARNA UTAMA — tombol, logo  │
//  │ green-600   │ #025538   │ Hover tombol                   │
//  │ green-700   │ #01442c   │ Active / pressed               │
//  │ green-900   │ #013d27   │ Via gradien gelap              │
//  │ green-950   │ #011f14   │ Background hero / section gelap│
//  └─────────────┴───────────┴────────────────────────────────┘
//
//  Cukup edit nilai HEX di tabel ini lalu cari-ganti
//  di seluruh file untuk mengubah tema secara global.
// ─────────────────────────────────────────────────────────────

// ── TOMBOL / BUTTON ──────────────────────────────────────────
export const BTN = {
  /** Tombol utama (CTA, Submit, Masuk) */
  primary:
    'bg-gradient-to-r from-[#026644] to-[#025538] ' +
    'hover:from-[#025538] hover:to-[#01442c] ' +
    'text-white shadow-md hover:shadow-lg hover:shadow-[#026644]/25 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',

  /** Tombol outline / ghost */
  outline:
    'border border-[#026644] text-[#026644] ' +
    'hover:bg-[#e6f2ec] hover:text-[#025538]',

  /** Tombol bahaya / hapus */
  danger:
    'bg-gradient-to-r from-red-500 to-red-600 ' +
    'hover:from-red-600 hover:to-red-700 ' +
    'text-white shadow-md hover:shadow-red-200',

  /** Tombol sukses (opsional — bisa disamakan dengan primary) */
  success:
    'bg-gradient-to-r from-emerald-500 to-emerald-600 ' +
    'hover:from-emerald-600 hover:to-emerald-700 ' +
    'text-white shadow-md hover:shadow-emerald-200',

  /** Tombol netral / sekunder */
  neutral:
    'bg-slate-100 hover:bg-slate-200 text-slate-700',

  /** Tombol hero di atas background gelap */
  heroLight:
    'bg-white text-[#026644] hover:bg-[#e6f2ec] shadow-lg',

  /** Tombol navbar transparan (saat belum scroll) */
  navTransparent:
    'bg-white/10 border border-white/30 text-white hover:bg-white/20 shadow-lg backdrop-blur-sm',

  /** Tombol navbar setelah di-scroll */
  navScrolled:
    'bg-[#026644] text-white hover:bg-[#025538] shadow-md',
} as const;

// ── WARNA STATUS / SEMANTIK ──────────────────────────────────
export const STATUS = {
  /** Sukses / online / aktif */
  success: {
    text:   'text-emerald-600',
    bg:     'bg-emerald-50',
    badge:  'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200',
    dot:    'bg-emerald-500',
  },

  /** Bahaya / offline / error */
  danger: {
    text:   'text-red-600',
    bg:     'bg-red-50',
    badge:  'bg-red-100 text-red-700',
    border: 'border-red-200',
    dot:    'bg-red-500',
  },

  /** Peringatan / level rendah */
  warning: {
    text:   'text-amber-600',
    bg:     'bg-amber-50',
    badge:  'bg-amber-100 text-amber-700',
    border: 'border-amber-200',
    dot:    'bg-amber-500',
  },

  /** Informasi / netral */
  info: {
    text:   'text-blue-600',
    bg:     'bg-blue-50',
    badge:  'bg-blue-100 text-blue-700',
    border: 'border-blue-200',
    dot:    'bg-blue-500',
  },
} as const;

// ── NAVBAR ───────────────────────────────────────────────────
export const NAVBAR_COLORS = {
  /** Background saat halaman belum di-scroll */
  bgTransparent: 'bg-transparent',

  /** Background saat halaman sudah di-scroll */
  bgScrolled: 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100',

  /** Link saat transparan */
  linkTransparent: 'text-white/90 hover:text-white',

  /** Link saat sudah di-scroll */
  linkScrolled: 'text-slate-600 hover:text-[#026644]',

  /** Nama brand saat transparan */
  brandTransparent: 'text-white',

  /** Nama brand saat scrolled */
  brandScrolled: 'text-slate-800',

  /** Aksen nama brand (suffix "tama") */
  brandAccentTransparent: 'text-[#8fc4aa]',   // green-200 — terlihat di bg gelap
  brandAccentScrolled:    'text-[#026644]',   // green-500 — primary di bg putih

  /** Ikon logo */
  logoIconBg:   'bg-[#026644]',
  logoIconText: 'text-white',
} as const;

// ── HERO SECTION ─────────────────────────────────────────────
export const HERO_COLORS = {
  /** Overlay gradien di atas foto hero */
  overlay: 'bg-gradient-to-br from-[#011f14]/85 via-[#013d27]/75 to-slate-900/85',

  /** Badge pill di atas heading */
  badge: 'bg-[#026644]/25 border border-[#5caa85]/40 text-[#8fc4aa]',

  /** Teks heading highlight — gradien green muda ke green medium */
  headingHighlight: 'from-[#8fc4aa] to-[#5caa85]',

  /** Teks deskripsi hero */
  description: 'text-white/80',

  /** Partikel dekoratif warna 1 */
  particle1: '#026644',   // green-500 primary
  /** Partikel dekoratif warna 2 */
  particle2: '#5caa85',   // green-300 — lebih terang
} as const;

// ── SECTION FITUR ─────────────────────────────────────────────
//  Warna per-kartu fitur. Urutan sesuai array FEATURES di siteConfig.
export const FEATURE_CARD_COLORS = [
  { text: 'text-[#026644]', bg: 'bg-[#e6f2ec]' },  // Monitoring   — brand
  { text: 'text-blue-600',  bg: 'bg-blue-50'   },  // Pompa        — biru
  { text: 'text-amber-600', bg: 'bg-amber-50'  },  // Alert WA     — kuning
  { text: 'text-purple-600',bg: 'bg-purple-50' },  // Jadwal       — ungu
  { text: 'text-[#025538]', bg: 'bg-[#c2dfd0]' },  // Histori      — green gelap
  { text: 'text-rose-600',  bg: 'bg-rose-50'   },  // Multi-user   — rose
] as const;

// ── CARA KERJA (STEP CIRCLES) ─────────────────────────────────
export const STEP_COLORS = [
  'bg-[#026644]',   // Step 01 — brand primary
  'bg-blue-500',    // Step 02
  'bg-amber-500',   // Step 03
  'bg-purple-500',  // Step 04
] as const;

// ── PREVIEW / DASHBOARD SECTION ───────────────────────────────
export const PREVIEW_COLORS = {
  /** Gradient background section gelap */
  sectionBg: 'bg-gradient-to-br from-slate-900 to-[#011f14]',

  /** Teks heading di atas bg gelap */
  heading:    'text-white',
  subheading: 'text-slate-300',

  /** Blob dekoratif background */
  blob1: 'bg-[#026644]',   // kiri atas — primary
  blob2: 'bg-[#2d9166]',   // tengah    — green-400
  blob3: 'bg-[#025538]',   // kanan     — green-600

  /** Badge floating pompa */
  badgePompa: 'bg-[#026644]',

  /** Badge floating alert */
  badgeAlert: 'bg-amber-500',

  /** Checklist icon */
  checkIcon: 'text-[#5caa85]',   // green-300

  /** Frame mock dashboard */
  frame: 'bg-white/10 border border-white/20',
} as const;

// ── LOGIN PAGE ────────────────────────────────────────────────
export const LOGIN_COLORS = {
  /** Background halaman login */
  pageBg: 'bg-gradient-to-br from-[#e6f2ec] via-white to-[#c2dfd0]/40',

  /** Background kartu login */
  cardBg: 'bg-white',

  /** Border kartu */
  cardBorder: 'border border-slate-100',

  /** Heading kartu */
  heading: 'text-slate-800',

  /** Subheading / deskripsi */
  subheading: 'text-slate-500',

  /** Label input */
  label: 'text-slate-700',

  /** Input field */
  input:
    'border-slate-200 focus:ring-2 focus:ring-[#026644] focus:border-[#026644] ' +
    'bg-slate-50 text-slate-800 placeholder-slate-400',

  /** Ikon di dalam input */
  inputIcon: 'text-slate-400',

  /** Tombol submit */
  submitBtn:
    'bg-gradient-to-r from-[#026644] to-[#025538] ' +
    'hover:from-[#025538] hover:to-[#01442c] ' +
    'text-white shadow-md hover:shadow-lg hover:shadow-[#026644]/25 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',

  /** Logo / ikon header kartu */
  logoIconBg:   'bg-[#026644]',
  logoIconText: 'text-white',

  /** Link (lupa password, dll) */
  link: 'text-[#026644] hover:text-[#025538]',

  /** Alert error */
  errorBg:     'bg-red-50',
  errorText:   'text-red-600',
  errorBorder: 'border border-red-200',
} as const;

// ── SETUP ADMIN PAGE ──────────────────────────────────────────
export const SETUP_COLORS = {
  pageBg:     'bg-gradient-to-br from-[#e6f2ec] via-white to-[#c2dfd0]/40',
  cardBg:     'bg-white',
  heading:    'text-slate-800',
  logoIconBg: 'bg-[#026644]',
  submitBtn:
    'bg-gradient-to-r from-[#026644] to-[#025538] ' +
    'hover:from-[#025538] hover:to-[#01442c] ' +
    'text-white shadow-md hover:shadow-[#026644]/25',
} as const;

// ── DASHBOARD USER ────────────────────────────────────────────
export const DASHBOARD_COLORS = {
  /** Navbar dashboard */
  navBg:     'bg-white border-b border-slate-200',
  navText:   'text-slate-700',
  navBrand:  'text-slate-800',
  navAccent: 'text-[#026644]',

  /** Background halaman */
  pageBg: 'bg-slate-50',

  /** Kartu sensor tower */
  cardBg:     'bg-white',
  cardBorder: 'border border-slate-100',
  cardShadow: 'shadow-sm hover:shadow-md',

  /** Header kartu */
  cardHeading: 'text-slate-800',
  cardSub:     'text-slate-500',

  /** Pompa ON */
  pumpOn:  'bg-emerald-500',
  /** Pompa OFF */
  pumpOff: 'bg-slate-300',

  /** Grafik line warna (hex untuk recharts) */
  chartLine1: '#026644',   // ★ brand primary
  chartLine2: '#2d9166',   // green-400
  chartLine3: '#f59e0b',   // amber-500
  chartLine4: '#6366f1',   // indigo-500
} as const;

// ── FOOTER ────────────────────────────────────────────────────
export const FOOTER_COLORS = {
  bg:      'bg-slate-950',
  text:    'text-slate-600',
  brand:   'text-white',
  accent:  'text-[#5caa85]',   // green-300 — terlihat di bg gelap
  tagline: 'text-slate-500',
} as const;

// ── ADMIN USER MANAGEMENT ─────────────────────────────────────
export const ADMIN_COLORS = {
  pageBg:     'bg-slate-50',
  cardBg:     'bg-white',
  heading:    'text-slate-800',
  roleAdmin:  'bg-purple-100 text-purple-700',
  roleUser:   'bg-[#e6f2ec] text-[#026644]',   // green light + primary
  actionEdit: 'text-blue-600 hover:text-blue-700',
  actionDel:  'text-red-500 hover:text-red-600',
} as const;
