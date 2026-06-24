// ============================================================
//  KONFIGURASI WEBSITE — HidroTower
//  Edit file ini untuk mengubah nama, deskripsi, kontak,
//  statistik, dan seluruh konten teks website.
// ============================================================

// ── BRANDING ────────────────────────────────────────────────
export const SITE = {
  /** Nama brand utama (bagian tebal) */
  name: 'Tamtama',
  /** Bagian pertama nama (sebelum warna aksen) */
  namePrefix: 'Tam',
  /** Bagian kedua nama (diberi warna aksen teal) */
  nameSuffix: 'tama',

  /** Tagline singkat untuk navbar & footer */
  tagline: 'Sistem Monitoring Hidroponik Tower IoT',

  /** Deskripsi meta (SEO / tab browser) */
  metaDescription:
    'Platform IoT berbasis ESP32 untuk monitoring Tower Hidroponik — kontrol pompa nutrisi, notifikasi WhatsApp, dan penjadwalan sirkulasi otomatis.',

  /** Tahun copyright */
  copyrightYear: 2026,
} as const;

// ── HERO SECTION ─────────────────────────────────────────────
export const HERO = {
  badge: 'Sistem Monitoring Hidroponik Tower Cerdas',

  /** Baris pertama heading (sebelum teks berwarna) */
  headingLine1: 'Kelola Tower Hidroponik',
  /** Teks berwarna gradien teal–cyan di heading */
  headingHighlight: 'Real-Time',
  /** Baris terakhir heading */
  headingLine2: 'dari Mana Saja',

  description:
    'Platform IoT berbasis ESP32 untuk monitoring 10 unit Tower Hidroponik — ' +
    'lengkap dengan kontrol pompa nutrisi, notifikasi WhatsApp otomatis, ' +
    'dan penjadwalan sirkulasi cerdas.',

  ctaPrimary: 'Masuk ke Dashboard',
  ctaSecondary: 'Pelajari Lebih Lanjut',
} as const;

// ── STATISTIK (angka animasi counter) ────────────────────────
export const STATS = [
  { value: 10,  suffix: '+', label: 'Unit Tower Terpantau' },
  { value: 20,  suffix: '',  label: 'Interval Kirim Sensor (detik)' },
  { value: 5,   suffix: '',  label: 'Polling Dashboard (detik)' },
  { value: 24,  suffix: '',  label: 'Histori Grafik (jam)' },
] as const;

// ── KEUNGGULAN HIDROPONIK (strip teal di bawah hero) ─────────
export const ADVANTAGES = [
  {
    title: 'Hemat Air',
    desc: 'Hingga 90% lebih hemat dibanding tanam konvensional',
  },
  {
    title: 'Vertikal & Kompak',
    desc: 'Maksimalkan ruang terbatas dengan sistem tower berlapis',
  },
  {
    title: 'Tumbuh 2× Cepat',
    desc: 'Nutrisi langsung ke akar mempercepat pertumbuhan',
  },
  {
    title: 'Tanpa Tanah',
    desc: 'Bebas hama tanah, hasil lebih bersih dan higienis',
  },
] as const;

// ── FITUR UNGGULAN ────────────────────────────────────────────
export const FEATURES_SECTION = {
  badge: 'Fitur Unggulan',
  heading: 'Semua yang Dibutuhkan Pengelola Tower',
  subheading:
    'Dari monitoring real-time hingga otomasi sirkulasi nutrisi — ' +
    'HidroTower hadir sebagai platform manajemen tower hidroponik lengkap berbasis IoT.',
} as const;

export const FEATURES = [
  {
    title: 'Monitoring Real-Time',
    desc: 'Pantau suhu air, kelembapan udara, level nutrisi, dan intensitas cahaya setiap tower secara langsung — data diperbarui setiap 20 detik dari perangkat ESP32.',
    colorText: 'text-teal-600',
    colorBg:   'bg-teal-50',
  },
  {
    title: 'Kontrol Pompa Nutrisi',
    desc: 'Aktifkan atau matikan pompa sirkulasi nutrisi dari mana saja melalui dashboard. Sistem safety check mencegah pompa berjalan saat level air kritis.',
    colorText: 'text-blue-600',
    colorBg:   'bg-blue-50',
  },
  {
    title: 'Alert WhatsApp Otomatis',
    desc: 'Notifikasi instan ke WhatsApp pengelola saat kondisi abnormal — level nutrisi rendah, suhu terlalu tinggi, atau pompa bermasalah.',
    colorText: 'text-amber-600',
    colorBg:   'bg-amber-50',
  },
  {
    title: 'Jadwal Sirkulasi Otomatis',
    desc: 'Atur jadwal pompa nutrisi secara fleksibel sesuai kebutuhan tanaman. Sistem menjalankan siklus sirkulasi otomatis tanpa perlu pengawasan manual.',
    colorText: 'text-purple-600',
    colorBg:   'bg-purple-50',
  },
  {
    title: 'Histori & Grafik 24 Jam',
    desc: 'Analisis tren kondisi setiap tower dalam 24 jam terakhir dengan grafik interaktif untuk pengambilan keputusan yang lebih baik.',
    colorText: 'text-cyan-600',
    colorBg:   'bg-cyan-50',
  },
  {
    title: 'Multi-User Teraman',
    desc: 'Role Admin & User dengan Supabase Auth. Admin mengelola akses dan assign tower ke setiap pengguna secara mudah dan aman.',
    colorText: 'text-rose-600',
    colorBg:   'bg-rose-50',
  },
] as const;

// ── CARA KERJA ────────────────────────────────────────────────
export const HOW_IT_WORKS_SECTION = {
  badge: 'Cara Kerja Sistem',
  heading: 'Dari Tower ke Layar Anda',
  subheading:
    'Proses sederhana, hasil maksimal. Begini cara HidroTower bekerja dari ujung ke ujung.',
} as const;

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'ESP32 Kirim Data',
    desc: 'Sensor di setiap tower membaca suhu, kelembapan, level air nutrisi, dan cahaya lalu mengirimkan data ke server Supabase setiap 20 detik.',
    color: 'bg-teal-500',
  },
  {
    step: '02',
    title: 'Dashboard Update Otomatis',
    desc: 'Tampilan dashboard diperbarui setiap 5 detik. Pengelola melihat kondisi semua tower sekaligus dalam satu layar yang informatif.',
    color: 'bg-blue-500',
  },
  {
    step: '03',
    title: 'Alert Terkirim',
    desc: 'Kondisi kritis terdeteksi secara otomatis dan pesan WhatsApp langsung dikirim ke pengelola melalui Fonnte API.',
    color: 'bg-amber-500',
  },
  {
    step: '04',
    title: 'Kontrol & Optimalkan',
    desc: 'Pengelola mengambil tindakan: nyalakan pompa manual, atur jadwal nutrisi, atau pantau tren pertumbuhan dari dashboard.',
    color: 'bg-purple-500',
  },
] as const;

// ── PREVIEW DASHBOARD SECTION ─────────────────────────────────
export const PREVIEW_SECTION = {
  badge: 'Dashboard Interaktif',
  heading: 'Pantau 10 Tower Hidroponik dalam Satu Tampilan',
  description:
    'Dashboard HidroTower menampilkan kondisi semua tower secara bersamaan. ' +
    'Setiap kartu tower menampilkan status sensor terkini, kondisi pompa nutrisi, ' +
    'dan identitas pengelola secara ringkas dan mudah dibaca.',
  ctaButton: 'Coba Dashboard Sekarang',

  /** Checklist poin di bawah deskripsi */
  checklistItems: [
    'Update otomatis setiap 5 detik',
    'Indikator koneksi IoT real-time',
    'Cache data terakhir saat IoT offline',
    'Histori pompa & grafik tren 24 jam',
    'Filter & pencarian cepat tower',
  ],

  /** Floating badge kiri (pompa) */
  badgePompa: {
    title: 'Pompa T7 ON',
    subtitle: 'Jadwal sirkulasi 06:00',
  },
  /** Floating badge kanan (alert) */
  badgeAlert: {
    title: 'Alert Terkirim!',
    subtitle: 'Nutrisi Tower-3 rendah → WA dikirim',
  },

  /**
   * URL screenshot dashboard Anda.
   * Kosongkan ("") untuk menampilkan placeholder.
   */
  dashboardImageUrl: '',
} as const;

// ── TENTANG ───────────────────────────────────────────────────
export const ABOUT_SECTION = {
  badge: 'Tentang HidroTower',
  heading: 'Teknologi untuk Petani Hidroponik Modern',
  paragraph1:
    'HidroTower adalah sistem monitoring berbasis IoT yang dirancang khusus untuk ' +
    'pengelolaan unit Tower Hidroponik secara real-time tanpa perlu hadir langsung ' +
    'di lokasi instalasi.',
  paragraph2:
    'Dengan sensor ESP32 yang terpasang di setiap tower, pengelola dapat memantau ' +
    'kondisi nutrisi, suhu, kelembapan, dan cahaya secara akurat — memastikan ' +
    'tanaman tumbuh optimal dengan sirkulasi nutrisi yang terjadwal dan terkontrol.',

  highlights: [
    'Akses dari perangkat apa pun',
    'Notifikasi WhatsApp instan',
    'Multi-user dengan role access',
    'Kontrol sirkulasi nutrisi otomatis',
  ],

  imageBadge: {
    title: '10 Tower Aktif',
    subtitle: 'Dipantau 24/7 secara real-time',
  },
} as const;

// ── CTA BOTTOM ────────────────────────────────────────────────
export const CTA_BOTTOM = {
  heading: 'Siap Kelola Tower Anda?',
  description:
    'Masuk ke dashboard HidroTower dan mulai pantau 10 unit tower hidroponik ' +
    'Anda dengan lebih efisien menggunakan teknologi IoT.',
  ctaButton: 'Masuk ke Dashboard',
} as const;

// ── NAVBAR ────────────────────────────────────────────────────
export const NAVBAR = {
  links: ['Fitur', 'Cara Kerja', 'Statistik', 'Tentang'],
  ctaButton: 'Masuk Dashboard',
} as const;

// ── TEKNOLOGI (strip logo) ────────────────────────────────────
export const TECH_STACK = [
  { name: 'ESP32',        desc: 'Mikrokontroler IoT' },
  { name: 'Supabase',     desc: 'Database & Auth' },
  { name: 'React',        desc: 'UI Framework' },
  { name: 'Fonnte API',   desc: 'WhatsApp Gateway' },
  { name: 'Tailwind CSS', desc: 'Styling' },
  { name: 'TypeScript',   desc: 'Type Safety' },
] as const;