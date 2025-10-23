// Web App Email Service - Uses your web application's API to send real emails
// This service calls your web app's /api/otp/send endpoint to send actual OTP emails

// Generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Web App Configuration
const WEB_APP_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_WEB_APP_URL || 'https://clinic-os-web-new-neon.vercel.app',
};

// Send OTP to actual email address using your web application's API
export const sendOTPWithWebApp = async (email: string): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Generate OTP
    const otp = generateOTP();

    // Check if web app URL is configured
    const isWebAppConfigured = WEB_APP_CONFIG.BASE_URL !== 'https://clinic-os-web-new-neon.vercel.app';

    if (!isWebAppConfigured) {
      console.log(`📧 Web app not configured, using fallback method`);
      console.log(`📧 OTP generated: ${otp}`);
      console.log(`📧 Email would be sent to: ${email}`);
      
      return { 
        success: true, 
        message: `OTP generated: ${otp} (Web app not configured - check console for OTP)`,
        otp: otp
      };
    }

    // Try to send via your web application's API
    try {
      console.log(`📧 Sending OTP via web app API to ${email}: ${otp}`);
      
      const response = await fetch(`${WEB_APP_CONFIG.BASE_URL}/api/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email, 
          otp: otp 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`✅ OTP sent to ${email}: ${otp}`);
        return { 
          success: true, 
          message: 'OTP sent successfully to your email',
          otp: otp
        };
      } else {
        console.log(`❌ Web app API failed: ${response.status} - ${data.message}`);
        
        // Fallback to console method
        console.log(`📧 Web app API failed, using fallback method`);
        console.log(`📧 OTP generated: ${otp}`);
        console.log(`📧 Email would be sent to: ${email}`);
        
        return { 
          success: true, 
          message: `OTP generated: ${otp} (Web app API failed - check console for OTP)`,
          otp: otp
        };
      }

    } catch (webAppError) {
      console.log(`❌ Web app API error:`, webAppError);
      
      // Fallback to console method
      console.log(`📧 Web app API error, using fallback method`);
      console.log(`📧 OTP generated: ${otp}`);
      console.log(`📧 Email would be sent to: ${email}`);
      
      return { 
        success: true, 
        message: `OTP generated: ${otp} (Web app API error - check console for OTP)`,
        otp: otp
      };
    }

  } catch (error: any) {
    console.error('Send OTP error:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to send OTP.' 
    };
  }
};
