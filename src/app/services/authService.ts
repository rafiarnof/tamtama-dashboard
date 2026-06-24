/**
 * Authentication Service
 * Simple authentication system using localStorage
 */

import { getEnvVar } from '@/app/utils/checkEnvironment';

// Session storage key
const AUTH_SESSION_KEY = 'tamtama_auth_session';
const SESSION_EXPIRY_HOURS = 24; // Session berlaku 24 jam

export interface AuthSession {
  username: string;
  loginTime: string;
  expiryTime: string;
}

/**
 * Login dengan username dan password
 * @returns true jika login berhasil, false jika gagal
 */
export const login = async (username: string, password: string): Promise<boolean> => {
  // Get credentials from env config
  const validUsername = getEnvVar('ADMIN_USERNAME') || 'admin';
  const validPassword = getEnvVar('ADMIN_PASSWORD') || 'admin123';

  // Validate credentials
  if (username === validUsername && password === validPassword) {
    // Create session
    const now = new Date();
    const expiry = new Date(now.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
    
    const session: AuthSession = {
      username: username,
      loginTime: now.toISOString(),
      expiryTime: expiry.toISOString(),
    };

    // Save session to localStorage
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    
    console.log('✅ Login berhasil:', username);
    console.log('🔒 Session akan expire pada:', expiry.toLocaleString('id-ID'));
    
    return true;
  } else {
    console.log('❌ Login gagal: Username atau password salah');
    return false;
  }
};

/**
 * Logout dan hapus session
 */
export const logout = (): void => {
  localStorage.removeItem(AUTH_SESSION_KEY);
  console.log('👋 Logout berhasil');
};

/**
 * Check apakah user sudah login dan session masih valid
 * @returns true jika sudah login dan session valid, false jika belum/expired
 */
export const isAuthenticated = (): boolean => {
  try {
    const sessionData = localStorage.getItem(AUTH_SESSION_KEY);
    
    if (!sessionData) {
      return false;
    }

    const session: AuthSession = JSON.parse(sessionData);
    const now = new Date();
    const expiry = new Date(session.expiryTime);

    // Check if session expired
    if (now > expiry) {
      console.log('⏰ Session expired. Silakan login kembali.');
      logout(); // Clear expired session
      return false;
    }

    // Session valid
    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Get current session data
 * @returns Session data atau null jika tidak ada
 */
export const getSession = (): AuthSession | null => {
  try {
    const sessionData = localStorage.getItem(AUTH_SESSION_KEY);
    
    if (!sessionData) {
      return null;
    }

    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

/**
 * Get remaining session time in minutes
 * @returns Remaining minutes atau 0 jika session tidak ada/expired
 */
export const getRemainingSessionTime = (): number => {
  try {
    const session = getSession();
    
    if (!session) {
      return 0;
    }

    const now = new Date();
    const expiry = new Date(session.expiryTime);
    const remainingMs = expiry.getTime() - now.getTime();
    
    if (remainingMs <= 0) {
      return 0;
    }

    return Math.floor(remainingMs / (60 * 1000)); // Convert to minutes
  } catch (error) {
    console.error('Error calculating remaining session time:', error);
    return 0;
  }
};

/**
 * Extend session (refresh expiry time)
 */
export const extendSession = (): boolean => {
  try {
    const session = getSession();
    
    if (!session) {
      return false;
    }

    // Update expiry time
    const now = new Date();
    const newExpiry = new Date(now.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
    
    const updatedSession: AuthSession = {
      ...session,
      expiryTime: newExpiry.toISOString(),
    };

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(updatedSession));
    
    console.log('🔄 Session diperpanjang hingga:', newExpiry.toLocaleString('id-ID'));
    
    return true;
  } catch (error) {
    console.error('Error extending session:', error);
    return false;
  }
};

/**
 * Initialize auth service - check and log auth status
 */
export const initAuthService = (): void => {
  const authenticated = isAuthenticated();
  const session = getSession();

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║  🔐 AUTHENTICATION SYSTEM INITIALIZED                    ║');
  console.log('║                                                           ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║                                                           ║');
  
  if (authenticated && session) {
    console.log('║  Status: ✅ AUTHENTICATED                                ║');
    console.log(`║  User: ${session.username.padEnd(47)}║`);
    console.log(`║  Remaining: ${getRemainingSessionTime()} minutes${' '.repeat(39)}║`);
  } else {
    console.log('║  Status: ❌ NOT AUTHENTICATED                            ║');
    console.log('║  Action: Redirecting to login page...                   ║');
  }
  
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
};
