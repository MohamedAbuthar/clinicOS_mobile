import { AppointmentCard } from '@/components/AppointmentCard';
import PatientLayout from '@/components/PatientLayout';
import { ThemedText } from '@/components/themed-text';
import { useBackendPatientAuth } from '@/lib/contexts/BackendPatientAuthContext';
import { getAppointmentsByPatient, getDoctorById } from '@/lib/firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

// Custom SVG Components
const Calendar = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  tokenNumber?: string;
}

function PatientAppointmentsContent() {
  const router = useRouter();
  const { patient } = useBackendPatientAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load appointments from Firebase
  useEffect(() => {
    const loadAppointments = async () => {
      if (!patient) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const appointmentsResult = await getAppointmentsByPatient(patient.id);
        
        if (appointmentsResult.success && appointmentsResult.data) {
          // Fetch doctor details for each appointment
          const appointmentsWithDoctorDetails = await Promise.all(
            appointmentsResult.data.map(async (apt: any) => {
              let doctorName = 'Dr. Unknown';
              let doctorSpecialty = 'General';

              if (apt.doctorId) {
                const doctorResult = await getDoctorById(apt.doctorId);
                if (doctorResult.success && doctorResult.data) {
                  const doctorData = doctorResult.data as any;
                  // Assuming doctor's name is in user.name and specialty is in doctor's doc
                  doctorName = doctorData.user?.name || `Dr. ${doctorData.name}` || 'Dr. Unknown';
                  doctorSpecialty = doctorData.specialty || 'General';
                }
              }
              
              // Handle various date formats
              let formattedDate = 'TBD';
              if (apt.appointmentDate) {
                try {
                  if (apt.appointmentDate.seconds) {
                    formattedDate = new Date(apt.appointmentDate.seconds * 1000).toISOString().split('T')[0];
                  } else if (typeof apt.appointmentDate === 'string') {
                    formattedDate = apt.appointmentDate;
                  } else if (apt.appointmentDate instanceof Date) {
                    formattedDate = apt.appointmentDate.toISOString().split('T')[0];
                  } else if (typeof apt.appointmentDate === 'number') {
                    formattedDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
                  }
                } catch (error) {
                  console.warn('Error formatting appointment date:', error, 'Raw date:', apt.appointmentDate);
                  formattedDate = 'Invalid Date';
                }
              }

              return {
                id: apt.id,
                doctorName,
                doctorSpecialty,
                appointmentDate: formattedDate,
                appointmentTime: apt.appointmentTime || 'N/A',
                status: apt.status || 'scheduled',
                tokenNumber: apt.tokenNumber || 'N/A',
              };
            })
          );
          setAppointments(appointmentsWithDoctorDetails);
        } else {
          setAppointments([]);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
        Alert.alert('Error', `Failed to load appointments: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, [patient]);


  const handleViewAppointmentDetails = (appointment: Appointment) => {
    console.log('View appointment details:', appointment.id);
    // Navigation logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <ThemedText style={styles.title}>My Appointments</ThemedText>
            <ThemedText style={styles.subtitle}>View and manage your appointments</ThemedText>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#14B8A6" />
              <ThemedText style={styles.loadingText}>Loading appointments...</ThemedText>
            </View>
          ) : appointments.length > 0 ? (
            <View style={styles.appointmentsContainer}>
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onViewDetails={handleViewAppointmentDetails}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Calendar />
              <ThemedText style={styles.emptyTitle}>No Appointments</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                You don't have any appointments scheduled
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function PatientAppointments() {
  return (
    <PatientLayout>
      <PatientAppointmentsContent />
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
  appointmentsContainer: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
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
});
