// Firebase Authentication utilities for React Native
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { getPatientProfile } from './firestore';

// Patient profile interface matching web application
export interface PatientProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  allergies?: string;
  chronicConditions?: string;
  familyId?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Create new user account
export const signUp = async (email: string, password: string, displayName?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name if provided
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign out current user
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Listen to authentication state changes
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Send password reset email
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Patient sign in with email (used by PatientAuthContext)
export const patientSignInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get patient profile from Firestore
    const result = await getPatientProfile(user.uid);
    if (result.success && result.data) {
      return {
        success: true,
        patient: result.data as PatientProfile,
        firebaseUser: user
      };
    } else {
      return {
        success: false,
        error: 'Patient profile not found'
      };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const adminSignIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await signOut();
      return { success: false, error: 'User profile not found. Please contact support.' };
    }

    const userData = userDoc.data();
    if (!['admin', 'doctor', 'assistant'].includes(userData.role)) {
      await signOut();
      return { success: false, error: 'Unauthorized: This login is for staff only.' };
    }

    return {
      success: true,
      user: { id: user.uid, ...userData },
      firebaseUser: user,
    };
  } catch (error: any) {
    console.error("Admin sign in error:", error);
    return { success: false, error: error.message };
  }
};

// Patient Registration
export const registerPatient = async (
  email: string,
  password: string,
  patientData: Omit<PatientProfile, 'id' | 'createdAt' | 'updatedAt'>
) => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, {
      displayName: patientData.name
    });
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Create patient profile in Firestore
    const newPatient: PatientProfile = {
      ...patientData,
      id: user.uid,
      email: email,
      familyId: user.uid, // Use patient's own ID as initial familyId
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'patients', user.uid), newPatient);
    
    return {
      success: true,
      patient: newPatient,
      message: 'Registration successful. Please verify your email.'
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Failed to register');
  }
};
