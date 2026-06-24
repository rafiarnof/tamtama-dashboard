/**
 * Environment variable helper utilities
 * Provides safe access to environment variables with fallbacks
 */

export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // Try to get from import.meta.env first (Vite environment variables)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[key];
    if (value !== undefined && value !== null) {
      return String(value);
    }
  }

  // Try to get from window (for runtime config)
  if (typeof window !== 'undefined' && (window as any).env) {
    const value = (window as any).env[key];
    if (value !== undefined && value !== null) {
      return String(value);
    }
  }

  // Return default value
  return defaultValue;
};

/**
 * Get all environment variables with a specific prefix
 */
export const getEnvVarsWithPrefix = (prefix: string): Record<string, string> => {
  const result: Record<string, string> = {};

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith(prefix)) {
        result[key] = String(import.meta.env[key]);
      }
    });
  }

  return result;
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return getEnvVar('MODE') === 'development' || getEnvVar('DEV') === 'true';
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return getEnvVar('MODE') === 'production' || getEnvVar('PROD') === 'true';
};
