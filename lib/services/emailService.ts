// Direct SMTP Email Service for Mobile App
// This sends emails directly from the mobile app using SMTP

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

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

// Send OTP email using direct SMTP
export const sendOTPEmail = async (email: string): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Get SMTP configuration from environment variables
    const smtpConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      }
    };

    // Validate SMTP configuration
    if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
      return { 
        success: false, 
        message: 'SMTP configuration missing. Please check your .env file.' 
      };
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Create email content
    const htmlContent = createOTPEmailHTML(otp);
    const textContent = `Your ClinicOS OTP is: ${otp} (valid for 10 minutes)`;

    // For React Native, we'll use a fetch request to a simple email service
    // Since we can't use nodemailer directly in React Native
    const emailData = {
      to: email,
      from: smtpConfig.auth.user,
      subject: 'Your ClinicOS Login OTP',
      html: htmlContent,
      text: textContent,
      smtp: smtpConfig
    };

    // Use a simple email service API (you can replace this with your preferred service)
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID || 'your_service_id',
        template_id: process.env.EMAILJS_TEMPLATE_ID || 'your_template_id',
        user_id: process.env.EMAILJS_USER_ID || 'your_user_id',
        template_params: {
          to_email: email,
          otp_code: otp,
          from_name: 'ClinicOS'
        }
      })
    });

    if (response.ok) {
      console.log(`✅ OTP sent to ${email}: ${otp}`);
      return { 
        success: true, 
        message: 'OTP sent successfully to your email',
        otp: otp // Return OTP for testing purposes
      };
    } else {
      const errorData = await response.text();
      console.error('Email service error:', errorData);
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

// Alternative: Use a simple HTTP email service
export const sendOTPEmailSimple = async (email: string): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Generate OTP
    const otp = generateOTP();

    // Use a simple email service (like EmailJS, SendGrid, etc.)
    // This is a placeholder - replace with your actual email service
    const emailServiceUrl = process.env.EMAIL_SERVICE_URL || 'https://your-email-service.com/send';
    
    const response = await fetch(emailServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMAIL_SERVICE_API_KEY || ''}`
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
      console.error('Email service error:', errorData);
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
