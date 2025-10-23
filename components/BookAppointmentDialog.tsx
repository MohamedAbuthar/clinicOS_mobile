import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { ThemedText } from './themed-text';

// Custom SVG Components
const X = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const User = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Calendar = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Clock = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 6V12L16 14"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Sun = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Moon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Check = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Star = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  consultationDuration: number;
  rating: number;
}

interface BookAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointmentData: any) => void;
  doctors: Doctor[];
  isLoading?: boolean;
}

export function BookAppointmentDialog({ isOpen, onClose, onSubmit, doctors, isLoading = false }: BookAppointmentDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<'morning' | 'evening' | null>(null);
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateError, setDateError] = useState<string>('');

  // Initialize with current date when dialog opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      setSelectedDate(formattedDate);
      setDateError('');
    }
  }, [isOpen]);

  const validateDate = (dateString: string): boolean => {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    // Check if date is valid
    if (isNaN(date.getTime())) return false;
    
    // Check if date is not in the past
    if (date < today) return false;
    
    // Check if date is not more than 3 months in the future
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    if (date > maxDate) return false;
    
    return true;
  };

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'searchQuery':
        setSearchQuery(value);
        break;
      case 'reason':
        setReason(value);
        break;
      case 'date':
        setSelectedDate(value);
        if (value && !validateDate(value)) {
          setDateError('Please select a valid date (today or future, max 3 months)');
        } else {
          setDateError('');
        }
        break;
    }
  };

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    setCurrentStep(2);
  };

  const handleSessionSelect = (session: 'morning' | 'evening') => {
    setSelectedSession(session);
    setCurrentStep(3);
  };

  const handleSubmit = () => {
    // Validate all required fields
    if (!selectedDoctor || !selectedDate || !selectedSession || !reason.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate date
    if (!validateDate(selectedDate)) {
      Alert.alert('Error', 'Please select a valid date (today or future, max 3 months)');
      return;
    }

    const selectedDoctorData = getSelectedDoctor();
    if (!selectedDoctorData) {
      Alert.alert('Error', 'Selected doctor not found');
      return;
    }

    // Generate time based on session
    const time = selectedSession === 'morning' ? '09:00' : '14:00';
    
    const appointmentData = {
      doctorId: selectedDoctor,
      doctorName: selectedDoctorData.name,
      specialty: selectedDoctorData.specialty,
      date: selectedDate,
      time: time,
      notes: reason.trim(),
    };
    
    onSubmit(appointmentData);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedSession(null);
    setReason('');
    setSearchQuery('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getSelectedDoctor = () => {
    return doctors.find(d => d.id === selectedDoctor);
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} />
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.dialogTitle}>Book Appointment</ThemedText>
              <ThemedText style={styles.dialogSubtitle}>
                Step {currentStep} of 3
              </ThemedText>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Step 1: Select Doctor */}
            {currentStep === 1 && (
              <View style={styles.step}>
                <ThemedText style={styles.stepTitle}>Step 1: Select Doctor</ThemedText>
                
                {/* Search */}
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={(value) => handleInputChange('searchQuery', value)}
                    placeholder="Search by name or specialty..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Doctor List */}
                <View style={styles.doctorsList}>
                  {filteredDoctors.map((doctor) => (
                    <TouchableOpacity
                      key={doctor.id}
                      style={[
                        styles.doctorCard,
                        selectedDoctor === doctor.id && styles.selectedDoctorCard
                      ]}
                      onPress={() => handleDoctorSelect(doctor.id)}
                    >
                      <View style={styles.doctorInfo}>
                        <View style={styles.doctorAvatar}>
                          <User />
                        </View>
                        <View style={styles.doctorDetails}>
                          <ThemedText style={styles.doctorName}>{doctor.name}</ThemedText>
                          <ThemedText style={styles.doctorSpecialty}>{doctor.specialty}</ThemedText>
                          <View style={styles.doctorMeta}>
                            <ThemedText style={styles.consultationDuration}>
                              {doctor.consultationDuration} min consultation
                            </ThemedText>
                            <View style={styles.rating}>
                              <Star />
                              <ThemedText style={styles.ratingText}>{doctor.rating}</ThemedText>
                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Step 2: Select Date and Session */}
            {currentStep === 2 && (
              <View style={styles.step}>
                <ThemedText style={styles.stepTitle}>Step 2: Select Date & Session</ThemedText>
                
                {/* Selected Doctor */}
                <View style={styles.selectedDoctorInfo}>
                  <ThemedText style={styles.selectedDoctorLabel}>Selected Doctor:</ThemedText>
                  <ThemedText style={styles.selectedDoctorName}>
                    {getSelectedDoctor()?.name} - {getSelectedDoctor()?.specialty}
                  </ThemedText>
                </View>

                {/* Date Input */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>
                    <Calendar /> Select Date <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <TextInput
                    style={[styles.input, dateError && styles.inputError]}
                    value={selectedDate}
                    onChangeText={(value) => handleInputChange('date', value)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                  {dateError ? (
                    <ThemedText style={styles.errorText}>{dateError}</ThemedText>
                  ) : null}
                </View>

                {/* Session Selection */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>
                    <Clock /> Select Session <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <View style={styles.sessionContainer}>
                    <TouchableOpacity
                      style={[
                        styles.sessionCard,
                        selectedSession === 'morning' && styles.selectedSessionCard
                      ]}
                      onPress={() => handleSessionSelect('morning')}
                    >
                      <Sun />
                      <ThemedText style={styles.sessionText}>Morning Session</ThemedText>
                      <ThemedText style={styles.sessionTime}>9:00 AM - 12:00 PM</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.sessionCard,
                        selectedSession === 'evening' && styles.selectedSessionCard
                      ]}
                      onPress={() => handleSessionSelect('evening')}
                    >
                      <Moon />
                      <ThemedText style={styles.sessionText}>Evening Session</ThemedText>
                      <ThemedText style={styles.sessionTime}>2:00 PM - 5:00 PM</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Step 3: Reason and Confirmation */}
            {currentStep === 3 && (
              <View style={styles.step}>
                <ThemedText style={styles.stepTitle}>Step 3: Reason & Confirmation</ThemedText>
                
                {/* Booking Summary */}
                <View style={styles.summaryCard}>
                  <ThemedText style={styles.summaryTitle}>Booking Summary</ThemedText>
                  <View style={styles.summaryItem}>
                    <User />
                    <View>
                      <ThemedText style={styles.summaryLabel}>Doctor</ThemedText>
                      <ThemedText style={styles.summaryValue}>
                        {getSelectedDoctor()?.name} - {getSelectedDoctor()?.specialty}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.summaryItem}>
                    <Calendar />
                    <View>
                      <ThemedText style={styles.summaryLabel}>Date & Session</ThemedText>
                      <ThemedText style={styles.summaryValue}>
                        {selectedDate} • {selectedSession === 'morning' ? 'Morning (9:00 AM - 12:00 PM)' : 'Evening (2:00 PM - 5:00 PM)'}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Reason Input */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>
                    Reason for Visit <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={reason}
                    onChangeText={(value) => handleInputChange('reason', value)}
                    placeholder="Brief description of your symptoms or concern..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {currentStep > 1 && (
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => setCurrentStep(currentStep - 1)}
              >
                <ThemedText style={styles.backButtonText}>Back</ThemedText>
              </TouchableOpacity>
            )}
            
            {currentStep < 3 ? (
              <TouchableOpacity 
                style={[
                  styles.nextButton,
                  ((currentStep === 1 && !selectedDoctor) || 
                  (currentStep === 2 && (!selectedDate || !selectedSession || !!dateError))) && styles.nextButtonDisabled
                ]} 
                onPress={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && !selectedDoctor) || 
                  (currentStep === 2 && (!selectedDate || !selectedSession || !!dateError))
                }
              >
                <ThemedText style={styles.nextButtonText}>Next</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.submitButton, (!reason.trim() || isLoading) && styles.submitButtonDisabled]} 
                onPress={handleSubmit}
                disabled={!reason.trim() || isLoading}
              >
                <ThemedText style={styles.submitButtonText}>
                  {isLoading ? 'Booking...' : 'Confirm Booking'}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  dialogSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 24,
  },
  step: {
    gap: 16,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  doctorsList: {
    gap: 12,
  },
  doctorCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  selectedDoctorCard: {
    borderColor: '#14B8A6',
    backgroundColor: '#ECFDF5',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  consultationDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
  selectedDoctorInfo: {
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedDoctorLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  selectedDoctorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  required: {
    color: '#EF4444',
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sessionContainer: {
    gap: 12,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  selectedSessionCard: {
    borderColor: '#14B8A6',
    backgroundColor: '#ECFDF5',
  },
  sessionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  sessionTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    paddingTop: 16,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#14B8A6',
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#14B8A6',
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});
