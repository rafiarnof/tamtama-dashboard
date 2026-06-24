// Utility to check Fonnte API connection status
import { getEnvVar } from '@/app/utils/env';

const FONNTE_API_URL = 'https://api.fonnte.com/send';

export interface FonnteStatus {
  isConnected: boolean;
  isDeviceConnected: boolean;
  error: string | null;
  message: string;
}

/**
 * Check Fonnte API and WhatsApp device connection status
 */
export const checkFonnteConnection = async (): Promise<FonnteStatus> => {
  const token = getEnvVar('FONNTE_TOKEN');
  
  if (!token || token === '') {
    return {
      isConnected: false,
      isDeviceConnected: false,
      error: 'no_token',
      message: 'Token Fonnte belum diset di env.config.js'
    };
  }

  try {
    // Send a test request (with invalid phone to avoid sending real message)
    const response = await fetch(FONNTE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: '000', // Invalid phone to test connection only
        message: 'test',
        countryCode: '62'
      })
    });

    const result = await response.json();
    
    // Check error messages
    const errorReason = result.reason || result.message || '';
    
    if (errorReason.includes('invalid token') || errorReason.includes('Invalid token')) {
      return {
        isConnected: false,
        isDeviceConnected: false,
        error: 'invalid_token',
        message: 'Token Fonnte tidak valid atau sudah expired'
      };
    }
    
    if (errorReason.includes('disconnected device')) {
      return {
        isConnected: true,
        isDeviceConnected: false,
        error: 'disconnected_device',
        message: 'WhatsApp device belum terkoneksi di Fonnte'
      };
    }
    
    // If we get here and response is ok, connection is good
    // (we expect an error because phone number is invalid, but that's ok)
    return {
      isConnected: true,
      isDeviceConnected: true,
      error: null,
      message: 'Fonnte terhubung dan siap digunakan'
    };
  } catch (error) {
    return {
      isConnected: false,
      isDeviceConnected: false,
      error: 'network_error',
      message: 'Tidak dapat terhubung ke API Fonnte'
    };
  }
};
