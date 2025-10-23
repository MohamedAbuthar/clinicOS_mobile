// API Configuration for mobile app
// Update this URL to match your deployed web application

export const API_CONFIG = {
  // Replace with your actual web app URL (e.g., https://your-app.vercel.app)
  // Common Vercel URLs: https://your-app-name.vercel.app
  // Common Netlify URLs: https://your-app-name.netlify.app
  BASE_URL: 'https://clinic-os-web-new-neon.vercel.app',
  
  // API endpoints
  ENDPOINTS: {
    SEND_OTP: '/api/otp/send',
    VERIFY_OTP: '/api/otp/verify',
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log(`🌐 API URL: ${fullUrl}`);
  return fullUrl;
};

// Helper function to validate API configuration
export const validateApiConfig = (): { isValid: boolean; message: string } => {
  if (API_CONFIG.BASE_URL === 'https://your-web-app-url.vercel.app') {
    return {
      isValid: false,
      message: 'Please update API_CONFIG.BASE_URL in lib/config/api.ts with your actual web app URL'
    };
  }
  
  if (!API_CONFIG.BASE_URL.startsWith('http')) {
    return {
      isValid: false,
      message: 'API_CONFIG.BASE_URL must start with http:// or https://'
    };
  }
  
  return { isValid: true, message: 'API configuration looks good' };
};
