import React, { useState } from 'react';
import { Droplets, Lock, User, Mail, Phone, Eye, EyeOff, Shield } from 'lucide-react';
import * as supabaseAuthService from '@/app/services/supabaseAuthService';

interface SetupAdminPageProps {
  onSetupComplete: () => void;
  onGoToLogin?: () => void;
}

export function SetupAdminPage({ onSetupComplete, onGoToLogin }: SetupAdminPageProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) { setError('Nama wajib diisi'); return; }
    if (!form.email.trim()) { setError('Email wajib diisi'); return; }
    if (!form.password || form.password.length < 6) { setError('Password minimal 6 karakter'); return; }
    if (form.password !== form.confirmPassword) { setError('Password dan konfirmasi password tidak cocok'); return; }

    setIsLoading(true);
    try {
      const result = await supabaseAuthService.setupAdmin(
        form.email.trim(),
        form.password,
        form.name.trim(),
        form.phone.trim()
      );

      if (result.success) {
        await new Promise(resolve => setTimeout(resolve, 1200));

        let loginResult = { success: false, error: '' };
        for (let attempt = 1; attempt <= 3; attempt++) {
          console.log(`🔐 Mencoba login (percobaan ${attempt}/3)...`);
          loginResult = await supabaseAuthService.login(form.email.trim(), form.password);
          if (loginResult.success) break;
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, attempt * 800));
          }
        }

        if (loginResult.success) {
          onSetupComplete();
        } else {
          console.warn('⚠️ Auto-login gagal setelah setup:', loginResult.error);
          setError('Setup berhasil! Silakan klik tombol di bawah untuk masuk ke dashboard.');
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      } else {
        setError(result.error || 'Gagal membuat akun admin');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f2ec] via-white to-[#c2dfd0]/40 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#c2dfd0] rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#e6f2ec] rounded-full opacity-30 blur-3xl" />
        
        
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 mb-1">
            Tam<span className="text-[#026644]">tama</span>
          </h1>
          <p className="text-slate-500 text-sm">Sistem Monitoring Hidroponik Tower IoT</p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            
            <div>
              <h2 className="text-xl font-bold text-slate-800">Setup Admin Pertama</h2>
              <p className="text-slate-500 text-xs">Buat akun admin untuk mengelola sistem tower</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="Nama Admin"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#026644] focus:border-[#026644] outline-none bg-slate-50 focus:bg-white transition-all text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="admin@email.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#026644] focus:border-[#026644] outline-none bg-slate-50 focus:bg-white transition-all text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nomor HP <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#026644] focus:border-[#026644] outline-none bg-slate-50 focus:bg-white transition-all text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#026644] focus:border-[#026644] outline-none bg-slate-50 focus:bg-white transition-all text-sm"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#026644] focus:border-[#026644] outline-none bg-slate-50 focus:bg-white transition-all text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                <span className="font-medium">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#026644] to-[#025538] hover:from-[#025538] hover:to-[#01442c] text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-[#026644]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Membuat akun...</span>
                </>
              ) : (
                <>
                  <Shield size={18} />
                  <span>Buat Akun Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center">Akun ini akan menjadi administrator utama sistem</p>
            {onGoToLogin && (
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="text-xs text-slate-400 hover:text-[#026644] transition-colors"
                >
                  Sudah punya akun? Masuk di sini
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          &copy; 2026 HidroTower. Monitoring Hidroponik Tower Digital.
        </p>
      </div>
    </div>
  );
}
