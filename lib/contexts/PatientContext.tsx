import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Patient data interface
interface Patient {
  id: string;
  email: string;
  name: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  medicalHistory: any[];
  isActive: boolean;
  firebaseUid: string;
  createdAt: string;
  updatedAt: string;
}

interface PatientContextType {
  // Sidebar controls
  toggleSidebar: () => void;
  closeSidebar: () => void;
  
  // Authentication state
  patient: Patient | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Authentication methods
  login: (patient: Patient, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

interface PatientProviderProps {
  children: ReactNode;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const PATIENT_STORAGE_KEY = 'patient_data';
const TOKEN_STORAGE_KEY = 'patient_token';

export function PatientProvider({ children, toggleSidebar, closeSidebar }: PatientProviderProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!patient && !!token;

  // Check authentication state on app start - only once
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        const [storedPatient, storedToken] = await Promise.all([
          AsyncStorage.getItem(PATIENT_STORAGE_KEY),
          AsyncStorage.getItem(TOKEN_STORAGE_KEY)
        ]);

        if (isMounted) {
          if (storedPatient && storedToken) {
            const patientData = JSON.parse(storedPatient);
            setPatient(patientData);
            setToken(storedToken);
            console.log('✅ Patient authentication restored from storage');
          } else {
            console.log('ℹ️ No stored patient authentication found');
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Error checking auth state:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);


  const login = async (patientData: Patient, authToken: string) => {
    try {
      // Store in state
      setPatient(patientData);
      setToken(authToken);

      // Store in AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(PATIENT_STORAGE_KEY, JSON.stringify(patientData)),
        AsyncStorage.setItem(TOKEN_STORAGE_KEY, authToken)
      ]);

      console.log('✅ Patient logged in and data stored');
    } catch (error) {
      console.error('❌ Error storing patient data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear state
      setPatient(null);
      setToken(null);

      // Clear AsyncStorage
      await Promise.all([
        AsyncStorage.removeItem(PATIENT_STORAGE_KEY),
        AsyncStorage.removeItem(TOKEN_STORAGE_KEY)
      ]);

      console.log('✅ Patient logged out and data cleared');
    } catch (error) {
      console.error('❌ Error clearing patient data:', error);
    }
  };

  const value: PatientContextType = {
    toggleSidebar,
    closeSidebar,
    patient,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatientContext() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatientContext must be used within a PatientProvider');
  }
  return context;
}
