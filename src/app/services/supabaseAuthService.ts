/**
 * Supabase Auth Service
 * Handles authentication and user management via Supabase Auth
 */

import { getSupabaseClient } from './supabaseClient';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5aa965b0`;

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  phone?: string;
  assignedSectors: string[];
  createdAt: string;
  updatedAt?: string;
}

// ============================================================
// HELPER: fetch ke server dengan auth token opsional
// ============================================================
const fetchServer = async (
  endpoint: string,
  options: RequestInit = {},
  token?: string
) => {
  const response = await fetch(`${SERVER_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Selalu gunakan publicAnonKey di Authorization agar diterima Supabase gateway.
      // User JWT (jika ada) dikirim via X-User-Token agar server bisa identifikasi user.
      Authorization: `Bearer ${publicAnonKey}`,
      ...(token ? { 'X-User-Token': token } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server error ${response.status}: ${errorText}`);
  }

  return response.json();
};

// ============================================================
// AUTH FUNCTIONS
// ============================================================

/** Login dengan email + password menggunakan Supabase Auth */
export const login = async (
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error.message);
    // Terjemahkan pesan error Supabase ke Bahasa Indonesia
    let errorMsg = error.message;
    if (error.message.includes('Invalid login credentials')) {
      errorMsg = 'Email atau password salah. Pastikan akun sudah dibuat melalui Setup Admin.';
    } else if (error.message.includes('Email not confirmed')) {
      errorMsg = 'Email belum dikonfirmasi. Hubungi administrator.';
    } else if (error.message.includes('Too many requests')) {
      errorMsg = 'Terlalu banyak percobaan login. Tunggu beberapa menit dan coba lagi.';
    }
    return { success: false, error: errorMsg };
  }

  console.log('✅ Login berhasil:', data.user?.email);
  return { success: true };
};

/** Logout dari Supabase Auth */
export const logout = async (): Promise<void> => {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
  console.log('👋 Logout berhasil');
};

/** Ambil sesi aktif */
export const getSession = async () => {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};

/** Cek apakah user sudah login */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  return session !== null;
};

/** Ambil access token dari sesi aktif */
export const getAccessToken = async (): Promise<string | null> => {
  const session = await getSession();
  return session?.access_token || null;
};

// ============================================================
// USER PROFILE FUNCTIONS
// ============================================================

/** Ambil profil user yang sedang login */
export const getMyProfile = async (): Promise<UserProfile | null> => {
  try {
    const token = await getAccessToken();
    if (!token) return null;

    const result = await fetchServer('/auth/me', {}, token);
    return result.profile || null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/** Cek apakah setup admin pertama kali diperlukan */
export const checkSetupStatus = async (): Promise<{ needsSetup: boolean }> => {
  try {
    const result = await fetchServer('/auth/status');
    const needsSetup = !result.hasAdmins;

    // Cache status agar bisa dipakai sebagai fallback saat server tidak terjangkau
    if (!needsSetup) {
      localStorage.setItem('admin_setup_done', 'true');
    }

    return { needsSetup };
  } catch (error) {
    console.error('Error checking setup status:', error);
    // Gunakan cache localStorage sebagai fallback
    // Jika setup pernah dilakukan sebelumnya → tampilkan login
    // Jika belum pernah (fresh install) → tampilkan setup page
    const setupDone = localStorage.getItem('admin_setup_done') === 'true';
    console.warn(`⚠️ Server tidak terjangkau. Menggunakan cached status: setup_done=${setupDone}`);
    return { needsSetup: !setupDone };
  }
};

/** Setup admin pertama kali (hanya bisa dilakukan sekali) */
export const setupAdmin = async (
  email: string,
  password: string,
  name: string,
  phone?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await fetchServer('/auth/setup-admin', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone }),
    });

    if (result.success) {
      // Tandai setup sudah selesai di localStorage
      localStorage.setItem('admin_setup_done', 'true');
    }

    return { success: result.success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================================
// ADMIN USER MANAGEMENT FUNCTIONS
// ============================================================

/** Ambil semua user (admin only) */
export const getAllUsers = async (token: string): Promise<UserProfile[]> => {
  try {
    const result = await fetchServer('/auth/users', {}, token);
    return result.users || [];
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

/** Buat user baru (admin only) */
export const createUser = async (
  userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    assignedSectors: string[];
  },
  token: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await fetchServer(
      '/auth/create-user',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      },
      token
    );
    return { success: result.success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/** Update user (admin only) */
export const updateUser = async (
  userId: string,
  data: Partial<UserProfile>,
  token: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await fetchServer(
      `/auth/users/${userId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );
    return { success: result.success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/** Hapus user (admin only) */
export const deleteUser = async (
  userId: string,
  token: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await fetchServer(
      `/auth/users/${userId}`,
      { method: 'DELETE' },
      token
    );
    return { success: result.success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/** Assign sektor ke user (admin only) */
export const assignSectors = async (
  userId: string,
  sectorIds: string[],
  token: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await fetchServer(
      `/auth/users/${userId}/assign-sectors`,
      {
        method: 'POST',
        body: JSON.stringify({ sectorIds }),
      },
      token
    );
    return { success: result.success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================================
// RESET PASSWORD (untuk user yang lupa/tidak bisa login)
// ============================================================

/** Reset password berdasarkan email terdaftar — tanpa perlu login */
export const resetPassword = async (
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await fetchServer('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
    return { success: result.success };
  } catch (error: any) {
    // Coba parse pesan error yang lebih spesifik dari server
    const msg = error.message || '';
    if (msg.includes('404')) return { success: false, error: 'Email tidak ditemukan dalam sistem.' };
    if (msg.includes('400')) return { success: false, error: 'Password baru minimal 6 karakter.' };
    return { success: false, error: msg || 'Gagal reset password. Coba lagi.' };
  }
};