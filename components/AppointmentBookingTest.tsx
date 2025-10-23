import { getCurrentUser } from '@/lib/firebase/auth';
import { createDocument, getDocuments } from '@/lib/firebase/firestore';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

export function AppointmentBookingTest() {
  const [isLoading, setIsLoading] = useState(false);

  const testBooking = async () => {
    setIsLoading(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'No user logged in');
        return;
      }

      // Test appointment data
      const testAppointment = {
        patientId: user.uid,
        patientName: user.displayName || 'Test Patient',
        doctorId: 'test-doctor-123',
        doctorName: 'Dr. Test Doctor',
        specialty: 'General Medicine',
        appointmentDate: '2024-01-15',
        appointmentTime: '09:00',
        status: 'scheduled',
        tokenNumber: '001',
        notes: 'Test appointment booking',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Creating test appointment:', testAppointment);
      
      const result = await createDocument('appointments', testAppointment);
      
      if (result.success) {
        Alert.alert('Success', 'Test appointment created successfully!');
        console.log('Appointment created with ID:', result.id);
      } else {
        Alert.alert('Error', `Failed to create appointment: ${result.error}`);
        console.error('Create appointment error:', result.error);
      }
    } catch (error) {
      console.error('Test booking error:', error);
      Alert.alert('Error', `Test booking failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testGetAppointments = async () => {
    try {
      const result = await getDocuments('appointments');
      if (result.success) {
        Alert.alert('Success', `Found ${result.data?.length || 0} appointments`);
        console.log('Appointments:', result.data);
      } else {
        Alert.alert('Error', `Failed to get appointments: ${result.error}`);
        console.error('Get appointments error:', result.error);
      }
    } catch (error) {
      console.error('Get appointments error:', error);
      Alert.alert('Error', `Get appointments failed: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Appointment Booking Test</ThemedText>
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={testBooking}
        disabled={isLoading}
      >
        <ThemedText style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Create Appointment'}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={testGetAppointments}
      >
        <ThemedText style={styles.buttonText}>Test Get Appointments</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#14B8A6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
