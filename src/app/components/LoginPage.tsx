import React, { useState } from 'react';
import { Droplets, Lock, Mail, Eye, EyeOff, LogIn, Settings, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '../services/supabaseAuthService';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onGoToSetup?: () => void;
}

type PageMode = 'login' | 'reset';

export function LoginPage({ onLogin, onGoToSetup }: LoginPageProps) {
  const [mode, setMode] = useState<PageMode>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Reset state
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email tidak boleh kosong'); return; }
    if (!password.trim()) { setError('Password tidak boleh kosong'); return; }

    setIsLoading(true);
    setError('');
    try {
      const success = await onLogin(email.trim(), password);
      if (!success) {
        const attempts = loginAttempts + 1;
        setLoginAttempts(attempts);
        setError('Email atau password tidak valid.');
        setPassword('');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!resetEmail.trim()) { setResetError('Email wajib diisi'); return; }
    if (!newPassword || newPassword.length < 6) { setResetError('Password baru minimal 6 karakter'); return; }
    if (newPassword !== confirmNewPassword) { setResetError('Konfirmasi password tidak cocok'); return; }

    setResetLoading(true);
    try {
      const result = await resetPassword(resetEmail.trim(), newPassword);
      if (result.success) {
        setResetSuccess(true);
        setEmail(resetEmail.trim());
      } else {
        setResetError(result.error || 'Gagal reset password. Coba lagi.');
      }
    } catch (err: any) {
      setResetError(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setResetLoading(false);
    }
  };

  const goToLogin = () => {
    setMode('login');
    setResetError('');
    setResetSuccess(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f2ec] via-white to-[#c2dfd0]/40 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#c2dfd0] rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#e6f2ec] rounded-full opacity-30 blur-3xl" />
        <div className="absolute top-1/4 left-8 w-3 h-3 bg-[#5caa85] rounded-full opacity-30" />
        <div className="absolute top-1/3 right-12 w-2 h-2 bg-[#2d9166] rounded-full opacity-40" />
        <div className="absolute bottom-1/4 left-1/4 w-4 h-4 bg-[#8fc4aa] rounded-full opacity-20" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 mb-1">
            Tam<span className="text-[#026644]">tama</span>
          </h1>
          <p className="text-slate-500 text-sm">Sistem Monitoring Hidroponik Tower IoT</p>
        </div>

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Masuk</h2>
              <p className="text-slate-500 text-sm">
                Masukkan email dan password Anda untuk mengakses dashboard tower
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input
                    id="email" type="email" value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="email@domain.com"
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#026644] focus:border-[#026644] outline-none transition-all bg-slate-50 focus:bg-white"
                    disabled={isLoading} autoComplete="email" autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                  <button type="button" onClick={() => { setResetEmail(email); setMode('reset'); }}
                    className="text-xs text-[#026644] hover:text-[#025538] font-medium transition-colors flex items-center gap-1">
                     Lupa password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Masukkan password"
                    className="w-full pl-11 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#026644] focus:border-[#026644] outline-none transition-all bg-slate-50 focus:bg-white"
                    disabled={isLoading} autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    disabled={isLoading} tabIndex={-1}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className=" text-red-700 text-sm">
                  <p className="mt-0.5">{error}</p>
                  {loginAttempts >= 1 && (
                    <button type="button" onClick={() => { setResetEmail(email); setMode('reset'); }}
                      className="mt-2 text-xs text-red-600 underline font-medium">
                      Reset password sekarang →
                    </button>
                  )}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#026644] to-[#025538] hover:from-[#025538] hover:to-[#01442c] text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-[#026644]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isLoading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Memproses...</span></>
                ) : (
                  <><span>Masuk</span></>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <p className="text-xs text-slate-500 text-center">Koneksi aman dan terenkripsi</p>
              {onGoToSetup && (loginAttempts >= 2 || loginAttempts === 0) && (
                <div className="text-center"><button type="button" onClick={onGoToSetup}
                    className="inline-flex items-center gap-1.5 text-xs text-[#026644] hover:text-[#025538] font-medium transition-colors"><span>Belum ada akun? Buka Setup Admin</span></button></div>
              )}
            </div>
          </div>
        )}

        {/* ── RESET PASSWORD FORM ── */}
        {mode === 'reset' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
            {/* Back button */}
            <button type="button" onClick={goToLogin}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#026644] font-medium mb-5 transition-colors">
              <ArrowLeft size={16} /> Kembali ke Login
            </button>

            {!resetSuccess ? (
              <>
                <div className="mb-6">
                  <div className="inline-flex p-2.5 bg-amber-100 rounded-xl mb-3">
                    <KeyRound size={20} className="text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Reset Password</h2>
                  <p className="text-slate-500 text-sm">
                    Masukkan email terdaftar dan password baru Anda.
                    Password akan diperbarui langsung tanpa verifikasi email.
                  </p>
                </div>

                <form onSubmit={handleReset} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Terdaftar</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="email" value={resetEmail}
                        onChange={e => { setResetEmail(e.target.value); setResetError(''); }}
                        placeholder="email@domain.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none bg-slate-50 focus:bg-white transition-all text-sm"
                        disabled={resetLoading} autoFocus
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Baru</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => { setNewPassword(e.target.value); setResetError(''); }}
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none bg-slate-50 focus:bg-white transition-all text-sm"
                        disabled={resetLoading}
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={e => { setConfirmNewPassword(e.target.value); setResetError(''); }}
                        placeholder="Ulangi password baru"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 outline-none bg-slate-50 focus:bg-white transition-all text-sm ${
                          confirmNewPassword && confirmNewPassword !== newPassword
                            ? 'border-red-300 focus:ring-red-300 focus:border-red-400'
                            : 'border-slate-200 focus:ring-amber-400 focus:border-amber-400'
                        }`}
                        disabled={resetLoading}
                      />
                    </div>
                    {confirmNewPassword && confirmNewPassword !== newPassword && (
                      <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
                    )}
                  </div>

                  {/* Reset Error */}
                  {resetError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      <p className="font-medium">⚠️ Reset Gagal</p>
                      <p className="mt-0.5">{resetError}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button type="submit" disabled={resetLoading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
                    {resetLoading ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Mereset...</span></>
                    ) : (
                      <><KeyRound size={18} /><span>Reset Password</span></>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* SUCCESS STATE */
              <div className="text-center py-4">
                <div className="inline-flex p-4 bg-[#e6f2ec] rounded-full mb-4">
                  <CheckCircle2 size={36} className="text-[#026644]" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Password Berhasil Direset!</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Password untuk <strong className="text-slate-700">{resetEmail}</strong> telah diperbarui.
                  Silakan login dengan password baru Anda.
                </p>
                <button type="button" onClick={goToLogin}
                  className="w-full bg-gradient-to-r from-[#026644] to-[#025538] hover:from-[#025538] hover:to-[#01442c] text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                  <LogIn size={18} /> Masuk Sekarang
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bottom Text */}
        <p className="text-center text-xs text-slate-500 mt-6">
          &copy; 2026 HidroTower. Monitoring Hidroponik Tower Digital.
        </p>
      </div>
    </div>
  );
}
