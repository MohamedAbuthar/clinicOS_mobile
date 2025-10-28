// Backend Configuration for OTP Service
// This file contains the backend URL configuration for the OTP service

export const BACKEND_CONFIG = {
  // Development backend URL (local backend server)
  DEV_URL: 'http://192.168.31.63:3005',
  
  // Production backend URL (when deployed)
  PROD_URL: 'https://your-production-backend-url.com',
  
  // Current environment - change this to 'production' when deploying APK
  // Set to 'production' to use the deployed backend for APK builds
  ENVIRONMENT: 'development' as 'development' | 'production',
  
  // Get the current backend URL based on environment
  getCurrentUrl: (): string => {
    return BACKEND_CONFIG.ENVIRONMENT === 'development' 
      ? BACKEND_CONFIG.DEV_URL 
      : BACKEND_CONFIG.PROD_URL;
  }
};

// API endpoints
export const BACKEND_ENDPOINTS = {
  SEND_OTP: '/api/otp/send',
  VERIFY_OTP: '/api/otp/verify',
  HEALTH: '/api/otp/health',
  CLEANUP: '/api/otp/cleanup'
};

// Helper function to get full backend URL
export const getBackendUrl = (endpoint: string): string => {
  const baseUrl = BACKEND_CONFIG.getCurrentUrl();
  const fullUrl = `${baseUrl}${endpoint}`;
  console.log(`🔗 Backend URL: ${fullUrl}`);
  return fullUrl;
};

// Helper function to validate backend configuration
export const validateBackendConfig = (): { isValid: boolean; message: string } => {
  const currentUrl = BACKEND_CONFIG.getCurrentUrl();
  
  if (!currentUrl.startsWith('http')) {
    return {
      isValid: false,
      message: 'Backend URL must start with http:// or https://'
    };
  }
  
  return { 
    isValid: true, 
    message: `Backend configuration is valid. Using: ${currentUrl}` 
  };
};
