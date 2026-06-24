import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Droplets, Wifi, Bell, Shield,
  ChevronDown, LogIn, ArrowRight, Activity, Zap, BarChart2,
  Smartphone, Clock, Users, CheckCircle, MessageSquare,
  Power, Menu, X, FlaskConical, Layers, Wind
} from 'lucide-react';

interface LandingPageProps {
  onGoToLogin: () => void;
}

// Counter animasi
const useCountUp = (target: number, duration: number = 2000, start: boolean = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, start]);
  return count;
};

const StatItem = ({ value, label, suffix = '', inView }: { value: number; label: string; suffix?: string; inView: boolean }) => {
  const count = useCountUp(value, 1800, inView);
  return (
    <div className="text-center">
      <p className="text-4xl md:text-5xl font-extrabold text-white">{count}{suffix}</p>
      <p className="text-[#8fc4aa] mt-2 text-sm md:text-base">{label}</p>
    </div>
  );
};

export function LandingPage({ onGoToLogin }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const features = [
    {
      icon: <Activity size={28} />,
      color: 'text-[#026644]', bg: 'bg-[#e6f2ec]',
      title: 'Monitoring Real-Time',
      desc: 'Pantau suhu air, kelembapan udara, level nutrisi, dan intensitas cahaya setiap tower secara langsung — data diperbarui setiap 20 detik dari perangkat ESP32.',
    },
    {
      icon: <Power size={28} />,
      color: 'text-blue-600', bg: 'bg-blue-50',
      title: 'Kontrol Pompa Nutrisi',
      desc: 'Aktifkan atau matikan pompa sirkulasi nutrisi dari mana saja melalui dashboard. Sistem safety check mencegah pompa berjalan saat level air kritis.',
    },
    {
      icon: <Bell size={28} />,
      color: 'text-amber-600', bg: 'bg-amber-50',
      title: 'Alert WhatsApp Otomatis',
      desc: 'Notifikasi instan ke WhatsApp pengelola saat kondisi abnormal — level nutrisi rendah, suhu terlalu tinggi, atau pompa bermasalah.',
    },
    {
      icon: <Clock size={28} />,
      color: 'text-purple-600', bg: 'bg-purple-50',
      title: 'Jadwal Sirkulasi Otomatis',
      desc: 'Atur jadwal pompa nutrisi secara fleksibel sesuai kebutuhan tanaman. Sistem menjalankan siklus sirkulasi otomatis tanpa perlu pengawasan manual.',
    },
    {
      icon: <BarChart2 size={28} />,
      color: 'text-[#025538]', bg: 'bg-[#c2dfd0]',
      title: 'Histori & Grafik 24 Jam',
      desc: 'Analisis tren kondisi setiap tower dalam 24 jam terakhir dengan grafik interaktif untuk pengambilan keputusan yang lebih baik.',
    },
    {
      icon: <Shield size={28} />,
      color: 'text-rose-600', bg: 'bg-rose-50',
      title: 'Multi-User Teraman',
      desc: 'Role Admin & User dengan Supabase Auth. Admin mengelola akses dan assign tower ke setiap pengguna secara mudah dan aman.',
    },
  ];

  const howItWorks = [
    {
      step: '01', icon: <Wifi size={24} />, color: 'bg-[#026644]',
      title: 'ESP32 Kirim Data',
      desc: 'Sensor di setiap tower membaca suhu, kelembapan, level air nutrisi, dan cahaya lalu mengirimkan data ke server Supabase setiap 20 detik.',
    },
    {
      step: '02', icon: <BarChart2 size={24} />, color: 'bg-blue-500',
      title: 'Dashboard Update Otomatis',
      desc: 'Tampilan dashboard diperbarui setiap 5 detik. Pengelola melihat kondisi semua tower sekaligus dalam satu layar yang informatif.',
    },
    {
      step: '03', icon: <Bell size={24} />, color: 'bg-amber-500',
      title: 'Alert Terkirim',
      desc: 'Kondisi kritis terdeteksi secara otomatis dan pesan WhatsApp langsung dikirim ke pengelola melalui Fonnte API.',
    },
    {
      step: '04', icon: <Power size={24} />, color: 'bg-purple-500',
      title: 'Kontrol & Optimalkan',
      desc: 'Pengelola mengambil tindakan: nyalakan pompa manual, atur jadwal nutrisi, atau pantau tren pertumbuhan dari dashboard.',
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className={`font-black text-lg tracking-tight ${scrolled ? 'text-slate-800' : 'text-white'}`}>
                Tam<span className={scrolled ? 'text-[#026644]' : 'text-[#8fc4aa]'}>tama</span>
              </span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {['Fitur', 'Cara Kerja', 'Tentang'].map((item) => (
                <button key={item}
                  onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}
                  className={`text-sm font-medium transition-colors ${
                    scrolled ? 'text-slate-600 hover:text-[#026644]' : 'text-white/90 hover:text-white'
                  }`}
                >{item}</button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={onGoToLogin}
                className={`hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  scrolled
                    ? 'bg-[#026644] text-white hover:bg-[#025538] shadow-md'
                    : 'bg-white text-[#026644] hover:bg-[#e6f2ec] shadow-lg'
                }`}>
                <LogIn size={16} /> Masuk Dashboard
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)}
                className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-slate-700' : 'text-white'}`}>
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100 shadow-lg">
              <div className="px-4 py-4 space-y-2">
                {['Fitur', 'Cara Kerja', 'Statistik', 'Tentang'].map((item) => (
                  <button key={item} onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}
                    className="block w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium">
                    {item}
                  </button>
                ))}
                <button onClick={onGoToLogin}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#026644] text-white rounded-full text-sm font-semibold hover:bg-[#025538] transition-colors">
                  <LogIn size={16} /> Masuk Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1761587706588-593f4e30e2ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoeWRyb3BvbmljJTIwdG93ZXIlMjB2ZXJ0aWNhbCUyMGdhcmRlbiUyMGluZG9vcnxlbnwxfHx8fDE3NzI0MzU0ODd8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Tower Hidroponik" className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#011f14]/85 via-[#013d27]/75 to-slate-900/85" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div key={i}
              className="absolute rounded-full opacity-40"
              style={{
                width: `${4 + (i % 3) * 3}px`,
                height: `${4 + (i % 3) * 3}px`,
                background: i % 2 === 0 ? '#026644' : '#5caa85',
                left: `${8 + i * 9}%`,
                top: `${15 + (i % 4) * 20}%`,
              }}
              animate={{ y: [0, -24, 0], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-16">
          {/* Badge */}
          

          {/* Heading */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Kelola Tower Hidroponik{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8fc4aa] to-[#5caa85]">
              Real-Time
            </span>
            <br />dari Mana Saja
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
            Platform IoT berbasis ESP32 untuk monitoring 10 unit Tower Hidroponik —
            lengkap dengan kontrol pompa nutrisi, notifikasi WhatsApp otomatis,
            dan penjadwalan sirkulasi cerdas.
          </motion.p>

          {/* CTA */}
          
        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2">
        </motion.div>
      </section>

      {/* ── FITUR ── */}
      <section id="fitur" className="bg-slate-50 px-[0px] py-[75px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">
              Semua yang Dibutuhkan Pengelola Tower
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Dari monitoring real-time hingga otomasi sirkulasi nutrisi —
              HidroTower hadir sebagai platform manajemen tower hidroponik lengkap berbasis IoT.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <motion.div key={feat.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center text-center">
                <div className={`inline-flex p-3 rounded-xl ${feat.bg} ${feat.color} mb-5 group-hover:scale-110 transition-transform`}>
                  {feat.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{feat.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARA KERJA ── */}
      <section id="cara-kerja" className="bg-white px-[0px] py-[30px]">
      </section>

      {/* ── PREVIEW DASHBOARD ── */}
      <section className="py-8 bg-gradient-to-br from-slate-900 to-[#011f14] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">
              Dari Tower ke Layar Anda
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-slate-300">
              Proses sederhana, hasil maksimal. Begini cara HidroTower bekerja dari ujung ke ujung.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#5caa85] via-blue-300 via-amber-300 to-purple-300" />
            {howItWorks.map((step, i) => (
              <motion.div key={step.step}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex flex-col items-center text-center">
                <div className={`relative w-20 h-20 ${step.color} rounded-full flex items-center justify-center shadow-lg mb-5 text-white z-10`}>
                  {step.icon}
                </div>
                <h3 className="font-bold text-base mb-2 text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
                Pantau 10 Tower Hidroponik dalam Satu Tampilan
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                Dashboard HidroTower menampilkan kondisi semua tower secara bersamaan.
                Setiap kartu tower menampilkan status sensor terkini, kondisi pompa nutrisi,
                dan identitas pengelola secara ringkas dan mudah dibaca.
              </p>
            </motion.div>

            {/* Mock Dashboard */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <img
                  src=""
                  alt="HidroTower Dashboard Preview"
                  className="w-full h-full object-cover rounded-3xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm font-semibold">Tambahkan Screenshot Dashboard</p>
                    <p className="text-white/40 text-xs mt-1">Isi atribut <code className="bg-white/10 px-1 rounded text-[#5caa85]">src</code> dengan URL gambar Anda</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TENTANG ── */}
      <section id="tentang" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} className="relative">
              <img
                src="https://images.unsplash.com/photo-1648780265064-ddbbd9392484?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoeWRyb3BvbmljcyUyMGxldHR1Y2UlMjBwbGFudHMlMjBncm93aW5nJTIwd2F0ZXJ8ZW58MXx8fHwxNzcyNDM1NDg4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Tanaman Hidroponik"
                className="rounded-3xl shadow-2xl w-full object-cover h-[450px]"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-6">
                Teknologi untuk Petani Hidroponik Modern
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                HidroTower adalah sistem monitoring berbasis IoT yang dirancang khusus untuk
                pengelolaan unit Tower Hidroponik secara real-time tanpa perlu hadir langsung
                di lokasi instalasi.
              </p>
              <p className="text-slate-600 leading-relaxed mb-8">
                Dengan sensor ESP32 yang terpasang di setiap tower, pengelola dapat memantau
                kondisi nutrisi, suhu, kelembapan, dan cahaya secara akurat — memastikan
                tanaman tumbuh optimal dengan sirkulasi nutrisi yang terjadwal dan terkontrol.
              </p>
              <button onClick={onGoToLogin}
                className="group inline-flex items-center gap-3 bg-[#026644] hover:bg-[#025538] text-white px-10 py-4 rounded-full text-lg font-bold shadow-2xl hover:shadow-[#026644]/40 transition-all duration-300">
                <LogIn size={22} /> Masuk ke Dashboard
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-950 py-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            
            <span className="text-white font-black">Tam<span className="text-[#5caa85]">tama</span></span>
            
          </div>
          <p className="text-slate-600 text-sm">
            © 2026 HidroTower. Platform Manajemen Tower Hidroponik.
          </p>
        </div>
      </footer>

    </div>
  );
}
