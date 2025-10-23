import { BookAppointmentDialog } from '@/components/BookAppointmentDialog';
import PatientLayout from '@/components/PatientLayout';
import { ThemedText } from '@/components/themed-text';
import { useBackendPatientAuth } from '@/lib/contexts/BackendPatientAuthContext';
import { createDocument, getAllDoctors, getDocuments } from '@/lib/firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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

const Plus = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5V19M5 12H19"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

function PatientBookContent() {
  const router = useRouter();
  const { patient, firebaseUser } = useBackendPatientAuth();
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // Load doctors and user data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (patient) {
          setUser({
            id: patient.id,
            email: patient.email,
            name: patient.name
          });
          
          // Load doctors from Firebase
          const doctorsResult = await getAllDoctors();
          if (doctorsResult.success && doctorsResult.data) {
            const formattedDoctors = doctorsResult.data.map((doc: any) => ({
              id: doc.id,
              name: doc.user?.name || 'Dr. Unknown',
              specialty: doc.specialty || 'General Medicine',
              consultationDuration: doc.consultationDuration || 30,
              rating: doc.rating || 4.5,
              availability: doc.availability || {},
            }));
            setDoctors(formattedDoctors);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load doctors data');
      }
    };

    loadData();
  }, [patient]);


  const handleBookAppointment = async (appointmentData: any) => {
    setIsLoading(true);
    try {
      console.log('Starting appointment booking with data:', appointmentData);
      
      if (!user) {
        Alert.alert('Error', 'Please log in to book an appointment');
        return;
      }

      console.log('User data:', { id: user.id, name: user.name });

      // Generate token number (simple increment for now)
      console.log('Fetching existing appointments...');
      const appointmentsResult = await getDocuments('appointments');
      console.log('Appointments result:', appointmentsResult);
      
      const existingAppointments = appointmentsResult.success && appointmentsResult.data ? appointmentsResult.data : [];
      const tokenNumber = (existingAppointments.length + 1).toString();
      console.log('Generated token number:', tokenNumber);

      // Create appointment document
      const appointmentDoc = {
        patientId: user.id,
        patientName: user.name || 'Unknown Patient',
        doctorId: appointmentData.doctorId,
        doctorName: appointmentData.doctorName,
        specialty: appointmentData.specialty,
        appointmentDate: appointmentData.date,
        appointmentTime: appointmentData.time,
        status: 'scheduled',
        tokenNumber: tokenNumber,
        notes: appointmentData.notes || '',
        // createdAt and updatedAt will be automatically added by createDocument
      };

      console.log('Creating appointment document:', appointmentDoc);
      const result = await createDocument('appointments', appointmentDoc);
      console.log('Create document result:', result);
      
      if (result.success) {
        console.log('Appointment created successfully with ID:', result.id);
        Alert.alert('Success', 'Appointment booked successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setIsBookDialogOpen(false);
              router.push('/patient-appointments');
            }
          }
        ]);
      } else {
        console.error('Failed to create appointment:', result.error);
        Alert.alert('Error', `Failed to book appointment: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', `Failed to book appointment: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <ThemedText style={styles.title}>Book Appointment</ThemedText>
            <ThemedText style={styles.subtitle}>Schedule a new appointment</ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => setIsBookDialogOpen(true)}
          disabled={isLoading}
        >
          <Plus />
          <ThemedText style={styles.bookButtonText}>Book New</ThemedText>
        </TouchableOpacity>
      </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.emptyState}>
              <Calendar />
              <ThemedText style={styles.emptyTitle}>Book New Appointment</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                Click "Book New" to start booking your appointment
              </ThemedText>
            </View>
          </View>
        </ScrollView>

      {/* Book Appointment Dialog */}
      <BookAppointmentDialog
        isOpen={isBookDialogOpen}
        onClose={() => setIsBookDialogOpen(false)}
        onSubmit={handleBookAppointment}
        doctors={doctors}
        isLoading={isLoading}
      />
      </SafeAreaView>
  );
}

export default function PatientBook() {
  return (
    <PatientLayout>
      <PatientBookContent />
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
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    marginTop: 4,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
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
});
