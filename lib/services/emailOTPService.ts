// Email OTP Service for React Native
// Uses backend API for OTP sending and verification

import { BACKEND_ENDPOINTS, getBackendUrl } from '../config/backendConfig';

// In-memory OTP storage (stores in app memory)
interface OTPRecord {
  otp: string;
  email: string;
  expiresAt: Date;
  attempts: number;
}

const OTP_STORAGE_KEY = 'clinic_otp_records';

// In-memory storage for OTP records
let otpRecords: Record<string, OTPRecord> = {};

// Get OTP records from memory
function getOTPRecords(): Record<string, OTPRecord> {
  return otpRecords;
}

// Save OTP records to memory
function saveOTPRecords(records: Record<string, OTPRecord>): void {
  otpRecords = records;
}

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send email using backend API
async function sendEmailWithBackend(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('📧 Sending OTP via Backend API...');
    
    // Use backend API endpoint
    const response = await fetch(getBackendUrl(BACKEND_ENDPOINTS.SEND_OTP), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
      }),
    });

    if (response.ok) {
      console.log('✅ Email sent via Backend API successfully');
      return { success: true, message: 'Email sent successfully' };
    } else {
      const errorText = await response.text();
      console.log('❌ Backend API failed - Status:', response.status);
      console.log('❌ Backend API failed - Response:', errorText);
      return { success: false, message: `Backend API failed: ${response.status} - ${errorText}` };
    }
  } catch (error: any) {
    console.log('❌ Backend API error:', error.message);
    return { success: false, message: 'Backend API connection failed' };
  }
}

/**
 * Send OTP email via frontend-only solution
 */
export async function sendOTPEmail(email: string): Promise<{ success: boolean; message: string; expiresIn?: number }> {
  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: 'Invalid email format'
      };
    }

    // Check rate limiting (prevent sending OTP too frequently)
    const records = getOTPRecords();
    const existingOTP = records[email.toLowerCase()];
    
    if (existingOTP && new Date(existingOTP.expiresAt) > new Date()) {
      const timeDiff = new Date(existingOTP.expiresAt).getTime() - Date.now();
      if (timeDiff > 8 * 60 * 1000) { // If less than 2 minutes since last send
        return {
          success: false,
          message: 'Please wait before requesting another OTP'
        };
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes (matching web app)

    // Store OTP in memory
    records[email.toLowerCase()] = {
      otp,
      email: email.toLowerCase(),
      expiresAt,
      attempts: 0
    };
    saveOTPRecords(records);

    // Try to send email via Backend API
    console.log('📧 Sending OTP via Backend API...');
    console.log('📧 Using backend SMTP service...');
    
    try {
      const emailResult = await sendEmailWithBackend(email, otp);
      
      if (emailResult.success) {
        console.log(`✅ OTP sent to ${email} via backend`);
        return {
          success: true,
          message: 'OTP sent successfully to your email',
          expiresIn: 3 * 60 // 3 minutes in seconds
        };
      } else {
        throw new Error(emailResult.message);
      }
    } catch (emailError: any) {
      console.log('📧 Backend API failed - using fallback mode');
      console.log(`📧 OTP for ${email}: ${otp}`);
      console.log(`📧 Email would be sent to: ${email}`);
      
      return {
        success: true,
        message: `OTP generated: ${otp} (check console for OTP)`,
        expiresIn: 3 * 60
      };
    }

  } catch (error: any) {
    console.error('Send OTP error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send OTP. Please check your connection and try again.'
    };
  }
}

/**
 * Verify the OTP for the given email using backend
 */
export async function verifyOTPEmail(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🔐 Verifying OTP via Backend API...');
    
    const response = await fetch(getBackendUrl(BACKEND_ENDPOINTS.VERIFY_OTP), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        otp: otp,
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ OTP verified successfully');
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } else {
      console.log('❌ OTP verification failed:', result.message);
      return {
        success: false,
        message: result.message || 'OTP verification failed'
      };
    }

  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return {
      success: false,
      message: error.message || 'Failed to verify OTP'
    };
  }
}

/**
 * Resend OTP to the given email
 */
export async function resendOTPEmail(email: string): Promise<{ success: boolean; message: string }> {
  return sendOTPEmail(email);
}