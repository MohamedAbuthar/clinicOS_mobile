import React, { useEffect, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
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

const Briefcase = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Users = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Save = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17 21V13H7V21"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 3V8H15"
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
}

interface Assistant {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  assignedDoctors: string[];
  isActive: boolean;
  status: string;
  statusColor: string;
}

interface EditAssistantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (assistantData: any) => void;
  assistant: Assistant | null;
  doctors: Doctor[];
  isLoading?: boolean;
}

export function EditAssistantDialog({ isOpen, onClose, onSubmit, assistant, doctors, isLoading = false }: EditAssistantDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'assistant',
    assignedDoctors: [] as string[],
    status: ''
  });
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  // Refs for scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  const doctorRef = useRef<View>(null);
  const statusRef = useRef<View>(null);

  // Initialize form data when assistant changes
  useEffect(() => {
    if (assistant) {
      setFormData({
        name: assistant.name || '',
        email: assistant.email || '',
        phone: assistant.phone || '',
        role: assistant.role || 'assistant',
        assignedDoctors: assistant.assignedDoctors || [],
        status: assistant.status === 'Active' ? 'active' : 'inactive'
      });
    }
  }, [assistant]);

  const handleInputChange = (field: string, value: string) => {
    // Phone number validation - limit to 13 digits
    if (field === 'phone') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 13 digits
      const limitedValue = digitsOnly.slice(0, 13);
      setFormData(prev => ({ ...prev, [field]: limitedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleDoctorToggle = (doctorId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedDoctors: prev.assignedDoctors.includes(doctorId)
        ? prev.assignedDoctors.filter(id => id !== doctorId)
        : [...prev.assignedDoctors, doctorId]
    }));
  };

  const handleStatusSelect = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
    setShowStatusPicker(false);
  };

  const handleStatusToggle = () => {
    setShowStatusPicker(!showStatusPicker);
    setShowDoctorPicker(false); // Close other dropdown
  };

  const handleDoctorDropdownToggle = () => {
    setShowDoctorPicker(!showDoctorPicker);
    setShowStatusPicker(false); // Close other dropdown
  };

  const getSelectedDoctorNames = () => {
    return formData.assignedDoctors.map(id => {
      const doctor = doctors.find(d => d.id === id);
      return doctor ? `${doctor.name} - ${doctor.specialty}` : 'Unknown Doctor';
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.status) {
      return;
    }
    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'assistant',
      assignedDoctors: [],
      status: ''
    });
    setShowDoctorPicker(false);
    setShowStatusPicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen && assistant) {
      setFormData({
        name: assistant.name || '',
        email: assistant.email || '',
        phone: assistant.phone || '',
        role: assistant.role || 'assistant',
        assignedDoctors: assistant.assignedDoctors || [],
        status: assistant.status === 'Active' ? 'active' : 'inactive'
      });
    }
  }, [isOpen, assistant]);

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} />
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.dialogTitle}>Edit Assistant</ThemedText>
              <ThemedText style={styles.dialogSubtitle}>Update assistant information</ThemedText>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X />
            </TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollViewRef} 
            style={styles.content} 
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            bounces={false}
          >
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
                  placeholder="Enter full name"
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="next"
                />
              </View>

              {/* Email and Phone */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <ThemedText style={styles.label}>
                    <Mail /> Email <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    placeholder="email@example.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <ThemedText style={styles.label}>
                    <Phone /> Phone <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    placeholder="Enter 13-digit phone number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    maxLength={13}
                  />
                </View>
              </View>

              {/* Role */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  <Briefcase /> Role <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <View style={styles.selectContainer}>
                  <TouchableOpacity style={styles.select}>
                    <ThemedText style={styles.selectText}>
                      {formData.role === 'assistant' ? 'Assistant' :
                       formData.role === 'Queue Manager' ? 'Queue Manager' :
                       formData.role === 'Medical Assistant' ? 'Medical Assistant' :
                       formData.role === 'Administrative' ? 'Administrative' : 'Assistant'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Assigned Doctors */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  <Users /> Assigned Doctors
                </ThemedText>
                <View ref={doctorRef} style={styles.doctorWrapper}>
                  <View style={styles.selectContainer}>
                    <TouchableOpacity 
                      style={styles.select}
                      onPress={handleDoctorDropdownToggle}
                    >
                      <ThemedText style={[styles.selectText, formData.assignedDoctors.length === 0 && styles.placeholderText]}>
                        {formData.assignedDoctors.length > 0 ? 
                          `${formData.assignedDoctors.length} doctor(s) selected` : 
                          'Select doctors...'}
                      </ThemedText>
                      <ChevronDown />
                    </TouchableOpacity>
                  </View>
                
                  {/* Doctor Dropdown */}
                  {showDoctorPicker && (
                    <View style={[styles.dropdown, styles.doctorDropdown]}>
                      <ScrollView 
                        style={styles.doctorDropdownList}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                        bounces={true}
                        scrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                        alwaysBounceVertical={false}
                        scrollEventThrottle={16}
                        removeClippedSubviews={false}
                        persistentScrollbar={true}
                      >
                        {doctors.map((doctor, index) => {
                          const isSelected = formData.assignedDoctors.includes(doctor.id);
                          const isLast = index === doctors.length - 1;
                          
                          return (
                            <TouchableOpacity
                              key={doctor.id}
                              style={[
                                styles.dropdownItem,
                                isSelected && styles.dropdownItemSelected,
                                isLast && styles.dropdownItemLast
                              ]}
                              onPress={() => handleDoctorToggle(doctor.id)}
                            >
                              <ThemedText style={[
                                styles.dropdownItemText,
                                isSelected && styles.dropdownItemTextSelected
                              ]}>
                                {doctor.name} - {doctor.specialty}
                              </ThemedText>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>
                
                {formData.assignedDoctors.length > 0 && (
                  <View style={styles.selectedDoctors}>
                    {getSelectedDoctorNames().map((name, index) => (
                      <View key={index} style={styles.doctorTag}>
                        <ThemedText style={styles.doctorTagText}>{name}</ThemedText>
                        <TouchableOpacity 
                          onPress={() => handleDoctorToggle(formData.assignedDoctors[index])}
                          style={styles.removeTag}
                        >
                          <X />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                <ThemedText style={styles.helpText}>Click to select multiple doctors</ThemedText>
              </View>

              {/* Status */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Status</ThemedText>
                <View ref={statusRef} style={styles.statusWrapper}>
                  <View style={styles.selectContainer}>
                    <TouchableOpacity 
                      style={styles.select}
                      onPress={handleStatusToggle}
                    >
                      <ThemedText style={[styles.selectText, !formData.status && styles.placeholderText]}>
                        {formData.status === 'active' ? 'Active' : 
                         formData.status === 'inactive' ? 'Inactive' : 
                         'Select the status'}
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
                          style={[styles.dropdownItem, formData.status === 'active' && styles.dropdownItemSelected]}
                          onPress={() => handleStatusSelect('active')}
                        >
                          <ThemedText style={[styles.dropdownItemText, formData.status === 'active' && styles.dropdownItemTextSelected]}>
                            Active
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.dropdownItem, styles.dropdownItemLast, formData.status === 'inactive' && styles.dropdownItemSelected]}
                          onPress={() => handleStatusSelect('inactive')}
                        >
                          <ThemedText style={[styles.dropdownItemText, formData.status === 'inactive' && styles.dropdownItemTextSelected]}>
                            Inactive
                          </ThemedText>
                        </TouchableOpacity>
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, (!formData.name || !formData.email || !formData.phone || !formData.status || isLoading) && styles.submitButtonDisabled]} 
                onPress={handleSubmit}
                disabled={!formData.name || !formData.email || !formData.phone || !formData.status || isLoading}
              >
                <Save />
                <ThemedText style={styles.submitButtonText}>
                  {isLoading ? 'Updating...' : 'Update Assistant'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    borderRadius: 12,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
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
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  halfWidth: {
    flex: 1,
    minWidth: 150,
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
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    minHeight: 44,
    textAlignVertical: 'center',
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 44,
  },
  select: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  selectText: {
    fontSize: 14,
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  helpText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  doctorWrapper: {
    position: 'relative',
    zIndex: 15,
  },
  statusWrapper: {
    position: 'relative',
    zIndex: 20,
  },
  dropdown: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    maxHeight: 200,
    zIndex: 1000,
    marginBottom: 1,
  },
  doctorDropdown: {
    zIndex: 1002,
    maxHeight: 350,
    minHeight: 120,
  },
  statusDropdown: {
    zIndex: 1003,
    maxHeight: 180,
  },
  dropdownList: {
    maxHeight: 150,
    flexGrow: 0,
  },
  doctorDropdownList: {
    maxHeight: 300,
    flexGrow: 0,
  },
  statusDropdownList: {
    maxHeight: 150,
    flexGrow: 0,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 50,
    justifyContent: 'center',
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
  selectedDoctors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  doctorTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  doctorTagText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '500',
  },
  removeTag: {
    padding: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
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
    minHeight: 44,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
