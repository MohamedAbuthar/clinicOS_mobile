import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
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

const MapPin = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UserPlus = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M8.5 7C8.5 9.20914 6.70914 11 4.5 11C2.29086 11 0.5 9.20914 0.5 7C0.5 4.79086 2.29086 3 4.5 3C6.70914 3 8.5 4.79086 8.5 7ZM20 8V14M17 11H23"
      stroke="#6B7280"
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

interface AddDoctorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (doctorData: any) => void;
  isLoading?: boolean;
}

export function AddDoctorDialog({ isOpen, onClose, onSubmit, isLoading = false }: AddDoctorDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    password: '',
    startTime: '09:00',
    endTime: '17:00',
    room: '',
    slotDuration: '20',
    status: 'In'
  });
  const [showSlotDurationPicker, setShowSlotDurationPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  
  // Refs for scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  const slotDurationRef = useRef<View>(null);
  const statusRef = useRef<View>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSlotDurationSelect = (value: string) => {
    setFormData(prev => ({ ...prev, slotDuration: value }));
    setShowSlotDurationPicker(false);
  };

  const handleStatusSelect = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
    setShowStatusPicker(false);
  };

  const handleSlotDurationToggle = () => {
    setShowSlotDurationPicker(!showSlotDurationPicker);
    if (!showSlotDurationPicker) {
      // Scroll to slot duration field when opening
      setTimeout(() => {
        slotDurationRef.current?.measureInWindow((x, y, width, height) => {
          const screenHeight = Dimensions.get('window').height;
          const dropdownHeight = 250; // Approximate dropdown height
          const availableSpace = screenHeight - y - height;
          
          if (availableSpace < dropdownHeight) {
            // Scroll up to make room for dropdown
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, y - dropdownHeight - 50),
              animated: true
            });
          }
        });
      }, 150);
    }
  };

  const handleStatusToggle = () => {
    setShowStatusPicker(!showStatusPicker);
    if (!showStatusPicker) {
      // Scroll to status field when opening
      setTimeout(() => {
        statusRef.current?.measureInWindow((x, y, width, height) => {
          const screenHeight = Dimensions.get('window').height;
          const dropdownHeight = 200; // Approximate dropdown height
          const availableSpace = screenHeight - y - height;
          
          if (availableSpace < dropdownHeight) {
            // Scroll up to make room for dropdown
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, y - dropdownHeight - 50),
              animated: true
            });
          }
        });
      }, 150);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.specialty || !formData.phone || !formData.email || !formData.password) {
      return;
    }
    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialty: '',
      phone: '',
      email: '',
      password: '',
      startTime: '09:00',
      endTime: '17:00',
      room: '',
      slotDuration: '20',
      status: 'In'
    });
    setShowSlotDurationPicker(false);
    setShowStatusPicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

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
              <ThemedText style={styles.dialogTitle}>Add New Doctor</ThemedText>
              <ThemedText style={styles.dialogSubtitle}>Fill in the doctor information</ThemedText>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X />
            </TouchableOpacity>
          </View>

          <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  <User /> Full Name <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Dr. John Doe"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Specialty */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  Specialization <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.specialty}
                  onChangeText={(value) => handleInputChange('specialty', value)}
                  placeholder="General Physician, Cardiologist, etc."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Contact Info */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <ThemedText style={styles.label}>
                    <Phone /> Phone Number <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <ThemedText style={styles.label}>
                    <Mail /> Email <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    placeholder="doctor@clinic.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  <User /> Password <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="Enter password for doctor login"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                />
                <ThemedText style={styles.helpText}>
                  This password will be used for doctor to login to the admin portal
                </ThemedText>
              </View>

              {/* Schedule Times */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <ThemedText style={styles.label}>
                    <Clock /> Start Time <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    value={formData.startTime}
                    onChangeText={(value) => handleInputChange('startTime', value)}
                    placeholder="09:00"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <ThemedText style={styles.label}>
                    <Clock /> End Time <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    value={formData.endTime}
                    onChangeText={(value) => handleInputChange('endTime', value)}
                    placeholder="17:00"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Room */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  <MapPin /> Room <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.room}
                  onChangeText={(value) => handleInputChange('room', value)}
                  placeholder="Room 101"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Slot Duration */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  <Clock /> Slot Duration <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <View ref={slotDurationRef} style={styles.slotDurationWrapper}>
                  <View style={styles.selectContainer}>
                    <TouchableOpacity 
                      style={styles.select}
                      onPress={handleSlotDurationToggle}
                    >
                      <ThemedText style={styles.selectText}>
                        {formData.slotDuration} minutes
                      </ThemedText>
                      <ChevronDown />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Slot Duration Dropdown */}
                  {showSlotDurationPicker && (
                    <View style={[styles.dropdown, styles.slotDurationDropdown]}>
                      <ScrollView 
                        style={styles.dropdownList}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                      >
                        <TouchableOpacity
                          style={[styles.dropdownItem, formData.slotDuration === '10' && styles.dropdownItemSelected]}
                          onPress={() => handleSlotDurationSelect('10')}
                        >
                          <ThemedText style={[styles.dropdownItemText, formData.slotDuration === '10' && styles.dropdownItemTextSelected]}>
                            10 minutes
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.dropdownItem, formData.slotDuration === '15' && styles.dropdownItemSelected]}
                          onPress={() => handleSlotDurationSelect('15')}
                        >
                          <ThemedText style={[styles.dropdownItemText, formData.slotDuration === '15' && styles.dropdownItemTextSelected]}>
                            15 minutes
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.dropdownItem, formData.slotDuration === '20' && styles.dropdownItemSelected]}
                          onPress={() => handleSlotDurationSelect('20')}
                        >
                          <ThemedText style={[styles.dropdownItemText, formData.slotDuration === '20' && styles.dropdownItemTextSelected]}>
                            20 minutes
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.dropdownItem, formData.slotDuration === '30' && styles.dropdownItemSelected]}
                          onPress={() => handleSlotDurationSelect('30')}
                        >
                          <ThemedText style={[styles.dropdownItemText, formData.slotDuration === '30' && styles.dropdownItemTextSelected]}>
                            30 minutes
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.dropdownItem, formData.slotDuration === '45' && styles.dropdownItemSelected]}
                          onPress={() => handleSlotDurationSelect('45')}
                        >
                          <ThemedText style={[styles.dropdownItemText, formData.slotDuration === '45' && styles.dropdownItemTextSelected]}>
                            45 minutes
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.dropdownItem, styles.dropdownItemLast, formData.slotDuration === '60' && styles.dropdownItemSelected]}
                          onPress={() => handleSlotDurationSelect('60')}
                        >
                          <ThemedText style={[styles.dropdownItemText, formData.slotDuration === '60' && styles.dropdownItemTextSelected]}>
                            60 minutes
                          </ThemedText>
                        </TouchableOpacity>
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {/* Status */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Initial Status</ThemedText>
                <View ref={statusRef} style={styles.statusWrapper}>
                  <View style={styles.selectContainer}>
                    <TouchableOpacity 
                      style={styles.select}
                      onPress={handleStatusToggle}
                    >
                      <ThemedText style={styles.selectText}>
                        {formData.status === 'In' ? 'Available (In)' : 
                         formData.status === 'Break' ? 'On Break' : 'Not Available (Out)'}
                      </ThemedText>
                      <ChevronDown />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Status Dropdown */}
                  {showStatusPicker && (
                    <View style={[styles.dropdown, styles.statusDropdown]}>
                      <ScrollView 
                        style={styles.statusDropdownList}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                        bounces={false}
                      >
                        <TouchableOpacity
                          style={[styles.dropdownItem, formData.status === 'In' && styles.dropdownItemSelected]}
                          onPress={() => handleStatusSelect('In')}
                        >
                          <ThemedText style={[styles.dropdownItemText, formData.status === 'In' && styles.dropdownItemTextSelected]}>
                            Available (In)
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.dropdownItem, formData.status === 'Break' && styles.dropdownItemSelected]}
                          onPress={() => handleStatusSelect('Break')}
                        >
                          <ThemedText style={[styles.dropdownItemText, formData.status === 'Break' && styles.dropdownItemTextSelected]}>
                            On Break
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.dropdownItem, styles.dropdownItemLast, formData.status === 'Out' && styles.dropdownItemSelected]}
                          onPress={() => handleStatusSelect('Out')}
                        >
                          <ThemedText style={[styles.dropdownItemText, formData.status === 'Out' && styles.dropdownItemTextSelected]}>
                            Not Available (Out)
                          </ThemedText>
                        </TouchableOpacity>
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, (!formData.name || !formData.specialty || !formData.phone || !formData.email || !formData.password || isLoading) && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={!formData.name || !formData.specialty || !formData.phone || !formData.email || !formData.password || isLoading}
            >
              <UserPlus />
              <ThemedText style={styles.submitButtonText}>
                {isLoading ? 'Creating...' : 'Add Doctor'}
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
    overflow: 'visible',
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
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'visible',
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
    fontSize: 18,
    fontWeight: '600',
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
    overflow: 'visible',
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
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  selectContainerWrapper: {
    position: 'relative',
  },
  slotDurationWrapper: {
    position: 'relative',
    zIndex: 10,
    elevation: 5,
  },
  statusWrapper: {
    position: 'relative',
    zIndex: 5,
    elevation: 3,
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
  },
  helpText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
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
    paddingVertical: 10,
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
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    maxHeight: 300,
    zIndex: 9999,
    marginTop: 2,
  },
  slotDurationDropdown: {
    zIndex: 1000,
    maxHeight: 250,
  },
  statusDropdown: {
    zIndex: 500,
    maxHeight: 200,
  },
  dropdownList: {
    maxHeight: 200,
    flexGrow: 0,
  },
  statusDropdownList: {
    maxHeight: 150,
    flexGrow: 0,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 48,
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
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
});
