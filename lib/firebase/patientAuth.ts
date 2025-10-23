// Patient Authentication utilities for React Native
// OTP-based authentication system matching web app
import {
    onAuthStateChanged,
    signOut,
    User
} from 'firebase/auth';
import { sendOTPWithWebApp } from '../services/webAppEmailService';
import { auth } from './config';
import { createDocument, getDocuments, updateDocument } from './firestore';

// Generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP temporarily (in production, use a secure backend service)
const otpStore = new Map<string, { otp: string; expires: number }>();

// Send OTP to email using frontend-only email service
export const sendOTP = async (email: string) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Check rate limiting (prevent sending OTP too frequently)
    const existingOTP = otpStore.get(email.toLowerCase());
    if (existingOTP && Date.now() < existingOTP.expires) {
      const timeDiff = existingOTP.expires - Date.now();
      if (timeDiff > 8 * 60 * 1000) { // If less than 2 minutes since last send
        return {
          success: false,
          message: 'Please wait before requesting another OTP'
        };
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Store OTP
    otpStore.set(email.toLowerCase(), { otp, expires });
    
    console.log('📧 Sending OTP via web app email service...');
    
    // Use the web app email service
    const result = await sendOTPWithWebApp(email);
    if (result.success) {
      // Update stored OTP with the one from email service
      otpStore.set(email.toLowerCase(), { otp: result.otp || otp, expires });
      return result;
    }
    
    // If email service fails, return error
    otpStore.delete(email.toLowerCase());
    return {
      success: false,
      message: 'Failed to send OTP. Please check your email service configuration.'
    };

  } catch (error: any) {
    console.error('Send OTP error:', error);
    // Clean up OTP on error
    otpStore.delete(email.toLowerCase());
    return { 
      success: false, 
      message: error.message || 'Failed to send OTP. Please check your connection and try again.' 
    };
  }
};

// Resend OTP
export const resendOTP = async (email: string) => {
  return sendOTP(email);
};

// Verify OTP and login/register patient
export const login = async (email: string, otp: string) => {
  try {
    // Check if OTP exists and is valid
    const storedOtp = otpStore.get(email.toLowerCase());
    
    if (!storedOtp) {
      return { success: false, message: 'OTP not found. Please request a new one.' };
    }
    
    if (Date.now() > storedOtp.expires) {
      otpStore.delete(email.toLowerCase());
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }
    
    if (storedOtp.otp !== otp) {
      return { success: false, message: 'Invalid OTP. Please try again.' };
    }
    
    // OTP is valid, check if patient exists
    const patientsResult = await getDocuments('patients', [
      { field: 'email', operator: '==', value: email }
    ]);
    
    if (patientsResult.success && patientsResult.data && patientsResult.data.length > 0) {
      // Existing patient - check if registration is complete
      const patient = patientsResult.data[0];
      
      // Check if patient has completed registration (has name and other required fields)
      const hasCompletedRegistration = (patient as any).name && 
        (patient as any).name.trim() !== '' && 
        (patient as any).phone && 
        (patient as any).phone.trim() !== '';
      
      console.log('🔍 Patient registration check:', {
        email,
        hasName: !!(patient as any).name,
        hasPhone: !!(patient as any).phone,
        hasCompletedRegistration,
        patientData: {
          name: (patient as any).name,
          phone: (patient as any).phone,
          address: (patient as any).address
        }
      });
      
      // Clean up OTP
      otpStore.delete(email.toLowerCase());
      
      return { 
        success: true, 
        patient: { ...patient, firebaseUid: (patient as any).firebaseUid || 'existing' },
        token: 'patient_token_' + Date.now(),
        isNewUser: !hasCompletedRegistration // Only new user if registration is incomplete
      };
    } else {
      // New patient - create patient record without Firebase auth
      const patientData = {
        email: email,
        firebaseUid: 'mobile_' + Date.now(), // Use mobile-specific UID
        name: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        emergencyContact: '',
        medicalHistory: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const createResult = await createDocument('patients', patientData);
      
      if (!createResult.success) {
        throw new Error('Failed to create patient record');
      }
      
      // Clean up OTP
      otpStore.delete(email.toLowerCase());
      
      return { 
        success: true, 
        patient: { ...patientData, id: createResult.id },
        token: 'patient_token_' + Date.now(),
        isNewUser: true
      };
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, message: error.message || 'Login failed' };
  }
};

// Listen to authentication state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Register a new patient with complete information
export const registerPatient = async (email: string, password: string, patientData: any) => {
  try {
    // Check if patient already exists
    const existingPatients = await getDocuments('patients', [
      { field: 'email', operator: '==', value: email }
    ]);
    
    if (existingPatients.success && existingPatients.data && existingPatients.data.length > 0) {
      // Patient exists - update the existing record with complete information
      const existingPatient = existingPatients.data[0];
      
      // Update the patient record with complete information
      const updatedPatientData = {
        ...existingPatient,
        ...patientData,
        email: email,
        updatedAt: new Date().toISOString()
      };
      
      console.log('📝 Updating patient record:', {
        patientId: existingPatient.id,
        updatedData: updatedPatientData
      });
      
      // Update the existing patient record
      const updateResult = await updateDocument('patients', existingPatient.id, updatedPatientData);
      
      if (!updateResult.success) {
        console.error('❌ Failed to update patient record:', updateResult);
        throw new Error('Failed to update patient record');
      }
      
      console.log('✅ Patient record updated successfully');
      
      return { 
        success: true, 
        patient: { ...updatedPatientData, id: existingPatient.id },
        token: 'patient_token_' + Date.now()
      };
    } else {
      // No existing patient - create new patient record
      const newPatientData = {
        ...patientData,
        email: email,
        firebaseUid: 'mobile_' + Date.now(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const createResult = await createDocument('patients', newPatientData);
      
      if (!createResult.success) {
        throw new Error('Failed to create patient record');
      }
      
      return { 
        success: true, 
        patient: { ...newPatientData, id: createResult.id },
        token: 'patient_token_' + Date.now()
      };
    }
  } catch (error: any) {
    console.error('Register patient error:', error);
    return { 
      success: false, 
      message: error.message || 'Registration failed' 
    };
  }
};

// Sign out current user
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
