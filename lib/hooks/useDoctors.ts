import { useEffect, useState } from 'react';
import { getAllDoctors } from '../firebase/firestore';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  consultationDuration?: number;
  status?: 'In' | 'Out' | 'Break';
  user?: {
    name: string;
    email?: string;
  };
}

export interface UseDoctorsReturn {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  refreshDoctors: () => Promise<void>;
}

export const useDoctors = (): UseDoctorsReturn => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAllDoctors();
      
      if (result.success && result.data) {
        setDoctors(result.data as Doctor[]);
      } else {
        setError(result.error || 'Failed to fetch doctors');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('useDoctors error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return {
    doctors,
    loading,
    error,
    refreshDoctors: fetchDoctors,
  };
};

