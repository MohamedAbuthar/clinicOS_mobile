// Frontend-only Email Service using EmailJS
// No backend required - works directly from React Native

// Generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// EmailJS configuration - you can set these directly in the code
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_clinic_os', // Replace with your EmailJS service ID
  TEMPLATE_ID: 'template_otp', // Replace with your EmailJS template ID
  USER_ID: 'your_emailjs_user_id', // Replace with your EmailJS user ID
};

// Send OTP using EmailJS (frontend only)
export const sendOTPWithEmailJS = async (email: string): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Generate OTP
    const otp = generateOTP();

    // Check if EmailJS is configured
    if (EMAILJS_CONFIG.SERVICE_ID === 'service_clinic_os' || 
        EMAILJS_CONFIG.TEMPLATE_ID === 'template_otp' || 
        EMAILJS_CONFIG.USER_ID === 'your_emailjs_user_id') {
      return { 
        success: false, 
        message: 'EmailJS not configured. Please update EMAILJS_CONFIG in frontendEmailService.ts' 
      };
    }

    // Send email using EmailJS
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
      const errorData = await response.text();
      console.error('EmailJS error:', errorData);
      return { 
        success: false, 
        message: 'Failed to send email. Please check your EmailJS configuration.' 
      };
    }

  } catch (error: any) {
    console.error('Send OTP error:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to send OTP. Please check your connection.' 
    };
  }
};

// Alternative: Use a simple email service that doesn't require backend
export const sendOTPWithSimpleService = async (email: string): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Generate OTP
    const otp = generateOTP();

    // Use a simple email service like EmailJS or similar
    // This is a placeholder - you can replace with any frontend email service
    const emailData = {
      to: email,
      subject: 'Your ClinicOS Login OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #14B8A6, #0D9488); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏥 ClinicOS</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Login OTP</p>
          </div>
          
          <div style="background: #f8fafc; border: 2px dashed #14B8A6; border-radius: 10px; padding: 30px; text-align: center; margin: 20px 0;">
            <h2 style="color: #0f766e; margin: 0 0 10px 0; font-size: 24px;">Your OTP Code</h2>
            <div style="background: white; border: 2px solid #14B8A6; border-radius: 8px; padding: 20px; margin: 15px 0;">
              <span style="font-size: 36px; letter-spacing: 8px; color: #0f766e; font-weight: bold; font-family: 'Courier New', monospace;">
                ${otp}
              </span>
            </div>
            <p style="color: #64748b; margin: 0; font-size: 14px;">This code expires in 10 minutes</p>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> Do not share this code with anyone. ClinicOS will never ask for your OTP via phone or email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is an automated message from ClinicOS. Please do not reply to this email.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              If you didn't request this OTP, please ignore this email.
            </p>
          </div>
        </div>
      `,
      text: `Your ClinicOS OTP is: ${otp} (valid for 10 minutes)`
    };

    // Try to send via EmailJS first
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'service_clinic_os', // Default service ID
          template_id: 'template_otp', // Default template ID
          user_id: 'user_default', // Default user ID
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
        console.log(`❌ EmailJS failed, using fallback. OTP: ${otp}`);
        return { 
          success: true, 
          message: `OTP generated: ${otp} (Check console for OTP code)`,
          otp: otp
        };
      }
    } catch (error) {
      console.log(`❌ EmailJS error, using fallback. OTP: ${otp}`);
      return { 
        success: true, 
        message: `OTP generated: ${otp} (Check console for OTP code)`,
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
