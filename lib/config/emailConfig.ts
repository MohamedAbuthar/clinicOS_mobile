// Email Configuration for Mobile App
// This file contains the email service configuration

export const EMAIL_CONFIG = {
  // Option 1: EmailJS Configuration (Recommended for React Native)
  EMAILJS: {
    SERVICE_ID: process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID || '',
    TEMPLATE_ID: process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID || '',
    USER_ID: process.env.EXPO_PUBLIC_EMAILJS_USER_ID || '',
  },
  
  // Option 2: SendGrid Configuration
  SENDGRID: {
    API_KEY: process.env.EXPO_PUBLIC_SENDGRID_API_KEY || '',
    FROM_EMAIL: process.env.EXPO_PUBLIC_SENDGRID_FROM_EMAIL || '',
  },
  
  // Option 3: Custom Email Service
  CUSTOM: {
    SERVICE_URL: process.env.EXPO_PUBLIC_EMAIL_SERVICE_URL || '',
    API_KEY: process.env.EXPO_PUBLIC_EMAIL_SERVICE_API_KEY || '',
  }
};

// Check which email services are configured
export const getAvailableEmailServices = () => {
  const services = [];
  
  if (EMAIL_CONFIG.EMAILJS.SERVICE_ID && EMAIL_CONFIG.EMAILJS.TEMPLATE_ID && EMAIL_CONFIG.EMAILJS.USER_ID) {
    services.push('EmailJS');
  }
  
  if (EMAIL_CONFIG.SENDGRID.API_KEY && EMAIL_CONFIG.SENDGRID.FROM_EMAIL) {
    services.push('SendGrid');
  }
  
  if (EMAIL_CONFIG.CUSTOM.SERVICE_URL) {
    services.push('Custom Service');
  }
  
  return services;
};

// Get configuration status
export const getEmailConfigStatus = () => {
  const availableServices = getAvailableEmailServices();
  
  if (availableServices.length === 0) {
    return {
      hasConfig: false,
      message: 'No email service configured. Please check your .env file.',
      availableServices: []
    };
  }
  
  return {
    hasConfig: true,
    message: `Configured services: ${availableServices.join(', ')}`,
    availableServices
  };
};
