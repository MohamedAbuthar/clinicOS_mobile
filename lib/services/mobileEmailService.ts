// Mobile-specific Email Service for React Native
// Uses environment variables and a simple email API
import { EMAIL_CONFIG } from '../config/emailConfig';

// Generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email template for OTP
const createOTPEmailHTML = (otp: string): string => {
  return `
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
  `;
};

// Send OTP using EmailJS (React Native compatible)
export const sendOTPWithEmailJS = async (email: string): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Generate OTP
    const otp = generateOTP();

    // EmailJS configuration
    const serviceId = EMAIL_CONFIG.EMAILJS.SERVICE_ID;
    const templateId = EMAIL_CONFIG.EMAILJS.TEMPLATE_ID;
    const userId = EMAIL_CONFIG.EMAILJS.USER_ID;

    if (!serviceId || !templateId || !userId) {
      return { 
        success: false, 
        message: 'EmailJS configuration missing. Please check your .env file.' 
      };
    }

    // Send email using EmailJS
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: userId,
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
        message: 'Failed to send email. Please try again.' 
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

// Send OTP using SendGrid (React Native compatible)
export const sendOTPWithSendGrid = async (email: string): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Generate OTP
    const otp = generateOTP();

    // SendGrid configuration
    const apiKey = EMAIL_CONFIG.SENDGRID.API_KEY;
    const fromEmail = EMAIL_CONFIG.SENDGRID.FROM_EMAIL;

    if (!apiKey || !fromEmail) {
      return { 
        success: false, 
        message: 'SendGrid configuration missing. Please check your .env file.' 
      };
    }

    // Send email using SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: email }],
          subject: 'Your ClinicOS Login OTP'
        }],
        from: { email: fromEmail, name: 'ClinicOS' },
        content: [
          {
            type: 'text/html',
            value: createOTPEmailHTML(otp)
          },
          {
            type: 'text/plain',
            value: `Your ClinicOS OTP is: ${otp} (valid for 10 minutes)`
          }
        ]
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
      console.error('SendGrid error:', errorData);
      return { 
        success: false, 
        message: 'Failed to send email. Please try again.' 
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

// Send OTP using a custom email service
export const sendOTPWithCustomService = async (email: string): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Generate OTP
    const otp = generateOTP();

    // Custom email service configuration
    const serviceUrl = EMAIL_CONFIG.CUSTOM.SERVICE_URL;
    const apiKey = EMAIL_CONFIG.CUSTOM.API_KEY;

    if (!serviceUrl) {
      return { 
        success: false, 
        message: 'Email service URL missing. Please check your .env file.' 
      };
    }

    // Send email using custom service
    const response = await fetch(serviceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      },
      body: JSON.stringify({
        to: email,
        subject: 'Your ClinicOS Login OTP',
        html: createOTPEmailHTML(otp),
        text: `Your ClinicOS OTP is: ${otp} (valid for 10 minutes)`
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
      console.error('Custom email service error:', errorData);
      return { 
        success: false, 
        message: 'Failed to send email. Please try again.' 
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
