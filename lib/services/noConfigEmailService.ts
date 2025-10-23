// No Configuration Email Service
// This service works without any external email service configuration
// It generates OTP and shows it in console for testing

// Generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP without external email service
export const sendOTPWithoutConfig = async (email: string): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Generate OTP
    const otp = generateOTP();

    // Create beautiful email content (for display purposes)
    const emailContent = {
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

    // Log the email content for testing
    console.log(`📧 Email would be sent to ${email}:`);
    console.log(`📧 Subject: ${emailContent.subject}`);
    console.log(`📧 OTP Code: ${otp}`);
    console.log(`📧 Text: ${emailContent.text}`);
    console.log(`📧 Full email data:`, emailContent);

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`✅ OTP generated and logged: ${otp}`);
    
    return { 
      success: true, 
      message: `OTP generated: ${otp} (Check console for OTP code)`,
      otp: otp
    };

  } catch (error: any) {
    console.error('Send OTP error:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to generate OTP.' 
    };
  }
};
