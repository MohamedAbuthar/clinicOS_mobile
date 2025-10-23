// Real Email Service - Sends actual emails to user's inbox
// This service uses EmailJS to send real emails

// EmailJS Configuration - Replace with your actual credentials
const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID || 'service_clinic_os',
  TEMPLATE_ID: process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_otp', 
  USER_ID: process.env.EXPO_PUBLIC_EMAILJS_USER_ID || 'user_default',
};

// Generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to actual email address
export const sendOTPToRealEmail = async (email: string): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Generate OTP
    const otp = generateOTP();

    // Check if EmailJS is properly configured
    const isEmailJSConfigured = EMAILJS_CONFIG.SERVICE_ID !== 'service_clinic_os' && 
                                EMAILJS_CONFIG.TEMPLATE_ID !== 'template_otp' && 
                                EMAILJS_CONFIG.USER_ID !== 'user_default';

    if (!isEmailJSConfigured) {
      console.log(`📧 EmailJS not configured, using fallback method`);
      console.log(`📧 OTP generated: ${otp}`);
      console.log(`📧 Email would be sent to: ${email}`);
      
      return { 
        success: true, 
        message: `OTP generated: ${otp} (EmailJS not configured - check console for OTP)`,
        otp: otp
      };
    }

    // Try to send via EmailJS
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: EMAILJS_CONFIG.SERVICE_ID,
          template_id: EMAILJS_CONFIG.TEMPLATE_ID,
          user_id: EMAILJS_CONFIG.USER_ID,
          template_params: {
            to_email: email,
            otp_code: otp,
            from_name: 'ClinicOS',
            subject: 'Your ClinicOS Login OTP'
          }
        })
      });

      if (response.ok) {
        console.log(`✅ OTP sent to ${email}: ${otp}`);
        return { 
          success: true, 
          message: 'OTP sent successfully to your email',
          otp: otp
        };
      } else {
        const errorText = await response.text();
        console.log(`❌ EmailJS failed: ${response.status} - ${errorText}`);
        
        // Fallback to console method
        console.log(`📧 EmailJS failed, using fallback method`);
        console.log(`📧 OTP generated: ${otp}`);
        console.log(`📧 Email would be sent to: ${email}`);
        
        return { 
          success: true, 
          message: `OTP generated: ${otp} (EmailJS failed - check console for OTP)`,
          otp: otp
        };
      }
    } catch (emailJSError) {
      console.log(`❌ EmailJS error:`, emailJSError);
      
      // Fallback to console method
      console.log(`📧 EmailJS error, using fallback method`);
      console.log(`📧 OTP generated: ${otp}`);
      console.log(`📧 Email would be sent to: ${email}`);
      
      return { 
        success: true, 
        message: `OTP generated: ${otp} (EmailJS error - check console for OTP)`,
        otp: otp
      };
    }

  } catch (error: any) {
    console.error('Send OTP error:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to send OTP. Please check your email service configuration.' 
    };
  }
};