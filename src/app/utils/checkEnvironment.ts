/**
 * Environment validation utility
 * Checks if all required environment variables are present
 * 
 * SUPPORTS DUAL CONFIG:
 * 1. .env file (standard Vite way)
 * 2. env.config.js file (Figma Make friendly way)
 */

// Import fallback config for Figma Make environment
import { ENV_CONFIG } from '/env.config.js';

export interface EnvironmentCheck {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
}

/**
 * Get environment variable with fallback to env.config.js
 */
export const getEnvVar = (key: string): string | undefined => {
  // Try to get from Vite env first
  const viteEnvKey = `VITE_${key}`;
  const viteValue = import.meta.env[viteEnvKey];
  
  if (viteValue) {
    return viteValue;
  }
  
  // Fallback to env.config.js (for Figma Make)
  const configKey = key.replace('VITE_', '');
  const configValue = ENV_CONFIG[configKey as keyof typeof ENV_CONFIG];
  
  if (configValue && configValue !== "") {
    console.log(`📦 Using ${key} from env.config.js (fallback)`);
    return configValue;
  }
  
  return undefined;
};

export const checkEnvironment = (): EnvironmentCheck => {
  const missingVars: string[] = [];
  const warnings: string[] = [];

  // Check if we're in development or production
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  // Required environment variables
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  // Check for missing variables (only in development)
  if (isDevelopment) {
    requiredVars.forEach(varName => {
      if (!import.meta.env[varName]) {
        missingVars.push(varName);
      }
    });
  }

  // Warnings for production
  if (isProduction) {
    // Check if using default/demo values
    if (import.meta.env.VITE_SUPABASE_URL?.includes('localhost')) {
      warnings.push('Using localhost URL in production');
    }
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  };
};

export const logEnvironmentStatus = () => {
  const check = checkEnvironment();
  
  console.log('🔍 Environment Check:');
  console.log('━'.repeat(50));
  
  if (check.isValid) {
    console.log('✅ All environment variables present');
  } else {
    console.error('❌ Missing environment variables:', check.missingVars);
  }

  if (check.warnings.length > 0) {
    console.warn('⚠️ Warnings:', check.warnings);
  }
  
  // Log admin settings with fallback support
  const adminName = getEnvVar('ADMIN_NAME') || 'Admin Desa';
  const adminPhone = getEnvVar('ADMIN_PHONE');
  const adminUsername = getEnvVar('ADMIN_USERNAME');
  const adminPassword = getEnvVar('ADMIN_PASSWORD');
  const fonteToken = getEnvVar('FONNTE_TOKEN');
  
  console.log('\n📱 Admin Settings (with fallback):');
  console.log('  • Admin Name:', adminName);
  console.log('  • Admin Phone:', adminPhone || '❌ NOT SET');
  console.log('  • Admin Username:', adminUsername || '❌ NOT SET');
  console.log('  • Admin Password:', adminPassword ? '✅ SET (hidden)' : '❌ NOT SET');
  console.log('  • Fonnte Token:', fonteToken ? '✅ SET' : '❌ NOT SET');

  console.log('━'.repeat(50));
  
  return check;
};