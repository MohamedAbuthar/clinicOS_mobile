import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
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

const Phone = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.271 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59531 1.99522 8.06679 2.16708 8.43376 2.48353C8.80073 2.79999 9.04207 3.23945 9.11999 3.72C9.23662 4.68007 9.47144 5.62273 9.81999 6.53C9.94454 6.88792 9.97366 7.27691 9.9039 7.65088C9.83415 8.02485 9.6682 8.36811 9.42499 8.64L8.08999 9.97C9.51355 12.4378 11.5622 14.4864 14.03 15.91L15.36 14.58C15.6319 14.3368 15.9751 14.1708 16.3491 14.1011C16.7231 14.0313 17.1121 14.0605 17.47 14.185C18.3773 14.5335 19.3199 14.7684 20.28 14.885C20.7658 14.9636 21.2094 15.2032 21.5265 15.5665C21.8437 15.9298 22.0122 16.3966 22 16.92Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Mail = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 6L12 13L2 6"
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

const Plus = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5V19M5 12H19"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronDown = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9L12 15L18 9"
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
  user?: {
    name: string;
  };
}

interface AddAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointmentData: any) => void;
  doctors: Doctor[];
  isLoading?: boolean;
}

export function AddAppointmentDialog({ isOpen, onClose, onSubmit, doctors, isLoading = false }: AddAppointmentDialogProps) {
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    email: '',
    doctor: '',
    date: '',
    time: '',
    notes: ''
  });

  const [phoneNumber, setPhoneNumber] = useState('');

  // Picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    
    // Limit to 10 digits (for numbers after +91)
    if (numericValue.length <= 10) {
      setPhoneNumber(numericValue);
      // Store with country code in formData
      setFormData(prev => ({ ...prev, phone: `+91${numericValue}` }));
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: dateString }));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setSelectedTime(selectedTime);
      const timeString = selectedTime.toTimeString().split(' ')[0].substring(0, 5);
      setFormData(prev => ({ ...prev, time: timeString }));
    }
  };

  const confirmDateSelection = () => {
    setShowDatePicker(false);
  };

  const confirmTimeSelection = () => {
    setShowTimePicker(false);
  };

  const cancelDateSelection = () => {
    setShowDatePicker(false);
  };

  const cancelTimeSelection = () => {
    setShowTimePicker(false);
  };


  const handleDoctorSelect = (doctorId: string) => {
    setFormData(prev => ({ ...prev, doctor: doctorId }));
    setShowDoctorPicker(false);
  };

  const handleSubmit = () => {
    if (!formData.patientName || !formData.phone || !formData.doctor || !formData.date || !formData.time) {
      return;
    }
    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      patientName: '',
      phone: '',
      email: '',
      doctor: '',
      date: '',
      time: '',
      notes: ''
    });
    setPhoneNumber('');
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowDoctorPicker(false);
    setSelectedDate(new Date());
    setSelectedTime(new Date());
  };

  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Debugging logs
  React.useEffect(() => {
    console.log('AddAppointmentDialog - Doctors prop:', doctors);
    console.log('AddAppointmentDialog - formData.doctor:', formData.doctor);
    const selectedDoctor = doctors.find(d => d.id === formData.doctor);
    console.log('AddAppointmentDialog - Selected Doctor object:', selectedDoctor);
    if (doctors.length > 0) {
      console.log('AddAppointmentDialog - First doctor:', doctors[0]);
    }
  }, [doctors, formData.doctor]);

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
              <ThemedText style={styles.dialogTitle}>New Appointment</ThemedText>
              <ThemedText style={styles.dialogSubtitle}>Create a new patient appointment</ThemedText>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              {/* Patient Name */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  Patient Name <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <View style={styles.inputWithIcon}>
                  <User />
                  <TextInput
                    style={styles.input}
                    value={formData.patientName}
                    onChangeText={(value) => handleInputChange('patientName', value)}
                    placeholder="Enter patient name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  Phone Number <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCode}>
                    <ThemedText style={styles.countryCodeText}>+91</ThemedText>
                  </View>
                  <View style={[styles.inputWithIcon, styles.phoneInput]}>
                    <Phone />
                    <TextInput
                      style={styles.input}
                      value={phoneNumber}
                      onChangeText={handlePhoneChange}
                      placeholder="1234567890"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <View style={styles.inputWithIcon}>
                  <Mail />
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    placeholder="patient@example.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Doctor Selection */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  Select Doctor <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <View style={styles.selectContainer}>
                  <TouchableOpacity 
                    style={styles.select}
                    onPress={() => setShowDoctorPicker(!showDoctorPicker)}
                  >
                  <ThemedText style={[styles.selectText, !formData.doctor && styles.placeholderText]}>
                    {formData.doctor ?
                      (() => {
                        const selectedDoctor = doctors.find(d => d.id === formData.doctor);
                        console.log('Selected doctor found:', selectedDoctor);
                        console.log('All doctors:', doctors);
                        if (selectedDoctor) {
                          const doctorName = selectedDoctor.name || selectedDoctor.user?.name || 'Unknown Doctor';
                          const specialty = selectedDoctor.specialty || 'General Medicine';
                          return `${doctorName} - ${specialty}`;
                        }
                        return 'Choose a doctor';
                      })() :
                      'Choose a doctor'}
                  </ThemedText>
                    <ChevronDown />
                  </TouchableOpacity>
                </View>
                
                {/* Doctor Dropdown */}
                {showDoctorPicker && (
                  <View style={styles.dropdown}>
                    <ScrollView style={styles.dropdownList}>
                      {doctors.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.dropdownItem,
                            formData.doctor === item.id && styles.dropdownItemSelected
                          ]}
                          onPress={() => handleDoctorSelect(item.id)}
                        >
                          <ThemedText style={[
                            styles.dropdownItemText,
                            formData.doctor === item.id && styles.dropdownItemTextSelected
                          ]}>
                            {item.name || item.user?.name || 'Unknown Doctor'} - {item.specialty || 'General Medicine'}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

            {/* Date and Time */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <ThemedText style={styles.label}>
                  Date <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <TouchableOpacity 
                  style={styles.inputWithIcon}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar />
                  <ThemedText style={[styles.input, formData.date ? styles.inputText : styles.placeholderText]}>
                    {formData.date || 'YYYY-MM-DD'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <ThemedText style={styles.label}>
                  Time <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <TouchableOpacity 
                  style={styles.inputWithIcon}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock />
                  <ThemedText style={[styles.input, formData.time ? styles.inputText : styles.placeholderText]}>
                    {formData.time || 'HH:MM'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Notes (Optional)</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(value) => handleInputChange('notes', value)}
                  placeholder="Additional notes about the appointment"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>

          {/* Date Picker */}
          {showDatePicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
              {Platform.OS === 'ios' && (
                <View style={styles.pickerButtons}>
                  <TouchableOpacity style={styles.pickerCancelButton} onPress={cancelDateSelection}>
                    <ThemedText style={styles.pickerCancelText}>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pickerConfirmButton} onPress={confirmDateSelection}>
                    <ThemedText style={styles.pickerConfirmText}>Confirm</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Time Picker */}
          {showTimePicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
              {Platform.OS === 'ios' && (
                <View style={styles.pickerButtons}>
                  <TouchableOpacity style={styles.pickerCancelButton} onPress={cancelTimeSelection}>
                    <ThemedText style={styles.pickerCancelText}>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pickerConfirmButton} onPress={confirmTimeSelection}>
                    <ThemedText style={styles.pickerConfirmText}>Confirm</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, (!formData.patientName || !formData.phone || !formData.doctor || !formData.date || !formData.time || isLoading) && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={!formData.patientName || !formData.phone || !formData.doctor || !formData.date || !formData.time || isLoading}
            >
              <Plus />
              <ThemedText style={styles.submitButtonText}>
                {isLoading ? 'Creating...' : 'Create Appointment'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  dialogSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCode: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    justifyContent: 'center',
    minWidth: 50,
  },
  countryCodeText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  required: {
    color: '#EF4444',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 12,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  select: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  inputText: {
    color: '#111827',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 1000,
    maxHeight: 200,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: {
    backgroundColor: '#F0FDF4',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdownItemTextSelected: {
    color: '#059669',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#14B8A6',
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  pickerCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  pickerConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#10B981',
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
