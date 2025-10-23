import PatientLayout from '@/components/PatientLayout';
import { ThemedText } from '@/components/themed-text';
import { useBackendPatientAuth } from '@/lib/contexts/BackendPatientAuthContext';
import { getAppointmentsByPatient } from '@/lib/firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

// Custom SVG Components
const FileText = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 2V8H20M16 13H8M16 17H8M10 9H8"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface MedicalRecord {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  notes?: string;
}

function PatientMedicalRecordsContent() {
  const router = useRouter();
  const { patient, firebaseUser } = useBackendPatientAuth();
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load medical records from completed appointments
  useEffect(() => {
    const loadMedicalRecords = async () => {
      try {
        if (patient) {
          setUser({
            id: patient.id,
            email: patient.email,
            name: patient.name
          });
          
          const appointmentsResult = await getAppointmentsByPatient(patient.id);
          if (appointmentsResult.success && appointmentsResult.data) {
            // Filter completed appointments and format as medical records
            const completedAppointments = appointmentsResult.data.filter(
              (apt: any) => apt.status === 'completed'
            );
            
            const records = completedAppointments.map((apt: any) => ({
              id: apt.id,
              doctorName: apt.doctorName || 'Dr. Unknown',
              specialty: apt.specialty || 'General',
              date: apt.appointmentDate ? new Date(apt.appointmentDate.seconds * 1000).toLocaleDateString() : 'Unknown',
              diagnosis: apt.diagnosis || 'General checkup',
              treatment: apt.treatment || 'Consultation completed',
              prescription: apt.prescription || '',
              notes: apt.notes || '',
            }));
            
            setMedicalRecords(records);
          }
        }
      } catch (error) {
        console.error('Error loading medical records:', error);
        Alert.alert('Error', 'Failed to load medical records');
      } finally {
        setIsLoading(false);
      }
    };

    loadMedicalRecords();
  }, [patient]);


  return (
    <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              <ThemedText style={styles.title}>Medical Records</ThemedText>
              <ThemedText style={styles.subtitle}>View your medical history and records</ThemedText>
            </View>
          </View>
        </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyTitle}>Loading medical records...</ThemedText>
            </View>
          ) : medicalRecords.length > 0 ? (
            <View style={styles.recordsContainer}>
              {medicalRecords.map((record) => (
                <View key={record.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <ThemedText style={styles.recordDoctor}>{record.doctorName}</ThemedText>
                    <ThemedText style={styles.recordDate}>{record.date}</ThemedText>
                  </View>
                  <ThemedText style={styles.recordSpecialty}>{record.specialty}</ThemedText>
                  <ThemedText style={styles.recordDiagnosis}>Diagnosis: {record.diagnosis}</ThemedText>
                  <ThemedText style={styles.recordTreatment}>Treatment: {record.treatment}</ThemedText>
                  {record.prescription && (
                    <ThemedText style={styles.recordPrescription}>Prescription: {record.prescription}</ThemedText>
                  )}
                  {record.notes && (
                    <ThemedText style={styles.recordNotes}>Notes: {record.notes}</ThemedText>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <FileText />
              <ThemedText style={styles.emptyTitle}>No Medical Records</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                Your medical records will appear here after completed appointments
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
      </SafeAreaView>
  );
}

export default function PatientMedicalRecords() {
  return (
    <PatientLayout>
      <PatientMedicalRecordsContent />
    </PatientLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  recordsContainer: {
    gap: 16,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordDoctor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  recordDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  recordSpecialty: {
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '500',
    marginBottom: 12,
  },
  recordDiagnosis: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
    fontWeight: '500',
  },
  recordTreatment: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  recordPrescription: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  recordNotes: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
