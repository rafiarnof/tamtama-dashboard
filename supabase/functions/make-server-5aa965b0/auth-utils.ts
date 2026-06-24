/**
 * Password hashing & validation utility using bcrypt
 * For Deno/Supabase Edge Functions
 */

import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

/**
 * Hash password dengan bcrypt (salt rounds = 10)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

/**
 * Verify password dengan hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 * Rules:
 * - Min 8 characters
 * - At least 1 uppercase
 * - At least 1 number
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password minimal 8 karakter' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung minimal 1 huruf besar' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung minimal 1 angka' };
  }
  
  return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Indonesian phone number
 * Accepts: 08xx, +628xx, 628xx
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Format phone number to standard format (+62xxx)
 */
export function formatPhone(phone: string): string {
  // Remove spaces and dashes
  let cleaned = phone.replace(/[\s-]/g, '');
  
  // Convert to +62 format
  if (cleaned.startsWith('0')) {
    cleaned = '+62' + cleaned.substring(1);
  } else if (cleaned.startsWith('62')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+62' + cleaned;
  }
  
  return cleaned;
}

/**
 * Generate JWT token (simple implementation)
 * For production, use proper JWT library
 */
export function generateToken(payload: Record<string, any>, secret: string): string {
  // In production, use proper JWT library like jose
  // This is simplified for demo
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  }));
  
  // Simplified signature (in production use proper HMAC)
  const signature = btoa(secret + header + body).substring(0, 43);
  
  return `${header}.${body}.${signature}`;
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string, secret: string): { valid: boolean; payload?: any } {
  try {
    const [header, body, signature] = token.split('.');
    
    // Verify signature
    const expectedSignature = btoa(secret + header + body).substring(0, 43);
    if (signature !== expectedSignature) {
      return { valid: false };
    }
    
    // Decode payload
    const payload = JSON.parse(atob(body));
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }
    
    return { valid: true, payload };
  } catch (error) {
    return { valid: false };
  }
}
