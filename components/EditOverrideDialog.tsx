import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { ThemedText } from './themed-text';

// Custom SVG Components
const X = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
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

interface OverrideData {
  id: string;
  title: string;
  date: string;
  session: 'morning' | 'evening' | 'both';
  type: 'special-event' | 'holiday' | 'extended-hours';
  description?: string;
}

interface EditOverrideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: OverrideData) => void;
  initialData?: OverrideData | null;
  isLoading?: boolean;
}

// Helper function to convert startTime/endTime to session
const timeRangeToSession = (startTime?: string, endTime?: string): 'morning' | 'evening' | 'both' => {
  if (!startTime || !endTime) {
    return 'both';
  }
  
  const [hours] = startTime.split(':').map(Number);
  
  // Morning session typically starts before 13:00 (1 PM)
  // Evening session typically starts at or after 13:00 (1 PM)
  if (hours < 13) {
    return 'morning';
  } else {
    return 'evening';
  }
};

export function EditOverrideDialog({ isOpen, onClose, onSave, initialData, isLoading = false }: EditOverrideDialogProps) {
  const [formData, setFormData] = useState<OverrideData>({
    id: '',
    title: '',
    date: '',
    session: 'both',
    type: 'special-event',
    description: '',
  });

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData && isOpen) {
      // Use the session directly from initialData (it's already computed in parent)
      const session = initialData.session || 'both';
      
      // Use the type directly from initialData (it's already mapped in parent)
      const type = initialData.type || 'special-event';
      
      const dateValue = initialData.date || '';
      if (dateValue) {
        try {
          const dateObj = new Date(dateValue);
          if (!isNaN(dateObj.getTime())) {
            setSelectedDate(dateObj);
          }
        } catch (e) {
          console.error('Error parsing date:', e);
        }
      }
      
      setFormData({
        id: initialData.id || '',
        title: initialData.title || '',
        date: dateValue,
        session,
        type,
        description: initialData.description || '',
      });
      
      // Reset dropdowns
      setShowTypeDropdown(false);
      setShowSessionDropdown(false);
      setShowDatePicker(false);
    }
  }, [initialData, isOpen]);

  const handleInputChange = (field: keyof OverrideData, value: string | 'morning' | 'evening' | 'both') => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: formattedDate }));
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!formData.date) {
      Alert.alert('Error', 'Please select a date');
      return;
    }
    if (!formData.type) {
      Alert.alert('Error', 'Please select a type');
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      id: '',
      title: '',
      date: '',
      session: 'both',
      type: 'special-event',
      description: '',
    });
    setShowTypeDropdown(false);
    setShowSessionDropdown(false);
    onClose();
  };

  const typeOptions = [
    { value: 'special-event', label: 'Special Event' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'extended-hours', label: 'Extended Hours' },
  ];

  const sessionOptions = [
    { value: 'both', label: 'Both' },
    { value: 'morning', label: 'Morning Session' },
    { value: 'evening', label: 'Evening Session' },
  ];

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>Edit Schedule Holiday</ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                <Calendar /> Title <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                placeholder="e.g., Extended Hours, Personal Leave"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Date */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                <Calendar /> Date <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText style={styles.inputText}>{formData.date || 'Select date'}</ThemedText>
              </TouchableOpacity>
              {showDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
              {showDatePicker && Platform.OS === 'ios' && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => {
                      if (date) {
                        handleDateChange(event, date);
                      }
                    }}
                    minimumDate={new Date()}
                  />
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => {
                      setShowDatePicker(false);
                      // Ensure the date is set if it hasn't been set yet
                      if (!formData.date) {
                        const formattedDate = selectedDate.toISOString().split('T')[0];
                        setFormData(prev => ({ ...prev, date: formattedDate }));
                      }
                    }}
                  >
                    <ThemedText style={styles.datePickerButtonText}>Done</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Select Session */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                <Clock /> Select Session <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowSessionDropdown(!showSessionDropdown)}
              >
                <ThemedText style={styles.dropdownText}>
                  {sessionOptions.find(option => option.value === formData.session)?.label || 'Select Session'}
                </ThemedText>
                <ChevronDown />
              </TouchableOpacity>
              
              {showSessionDropdown && (
                <View style={styles.dropdownMenu}>
                  {sessionOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.dropdownItem}
                      onPress={() => {
                        handleInputChange('session', option.value as 'morning' | 'evening' | 'both');
                        setShowSessionDropdown(false);
                      }}
                    >
                      <ThemedText style={styles.dropdownItemText}>{option.label}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Type */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Type <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowTypeDropdown(!showTypeDropdown)}
              >
                <ThemedText style={styles.dropdownText}>
                  {typeOptions.find(option => option.value === formData.type)?.label || 'Select Type'}
                </ThemedText>
                <ChevronDown />
              </TouchableOpacity>
              
              {showTypeDropdown && (
                <View style={styles.dropdownMenu}>
                  {typeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.dropdownItem}
                      onPress={() => {
                        handleInputChange('type', option.value);
                        setShowTypeDropdown(false);
                      }}
                    >
                      <ThemedText style={styles.dropdownItemText}>{option.label}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Description</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Optional description..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <ThemedText style={styles.saveButtonText}>
                {isLoading ? 'Updating...' : 'Update Holiday'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    maxWidth: 400,
    width: '100%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 24,
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
  inputText: {
    fontSize: 16,
    color: '#111827',
  },
  datePickerContainer: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  datePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#14B8A6',
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  datePickerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
  },
  dropdownMenu: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    paddingTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#14B8A6',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

