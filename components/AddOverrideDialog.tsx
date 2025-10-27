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
  title: string;
  date: string;
  timeRange: string;
  type: 'special-event' | 'holiday' | 'extended-hours';
  description?: string;
}

interface AddOverrideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: OverrideData) => void;
  isLoading?: boolean;
}

export function AddOverrideDialog({ isOpen, onClose, onSave, isLoading = false }: AddOverrideDialogProps) {
  const [formData, setFormData] = useState<OverrideData>({
    title: '',
    date: '',
    timeRange: '',
    type: 'special-event',
    description: '',
  });

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState(new Date());

  // Initialize with current date when dialog opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      setFormData(prev => ({
        ...prev,
        date: formattedDate,
        timeRange: '09:00 - 17:00', // Default time range
      }));
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof OverrideData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: formattedDate }));
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setSelectedStartTime(selectedTime);
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      const endTime = formData.timeRange.split(' - ')[1] || '';
      setFormData(prev => ({ ...prev, timeRange: `${formattedTime} - ${endTime}` }));
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setSelectedEndTime(selectedTime);
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      const startTime = formData.timeRange.split(' - ')[0] || '';
      setFormData(prev => ({ ...prev, timeRange: `${startTime} - ${formattedTime}` }));
    }
  };

  const handleTimeRangeChange = (field: 'start' | 'end', value: string) => {
    const [startTime, endTime] = formData.timeRange.split(' - ');
    if (field === 'start') {
      setFormData(prev => ({ ...prev, timeRange: `${value} - ${endTime || ''}` }));
    } else {
      setFormData(prev => ({ ...prev, timeRange: `${startTime || ''} - ${value}` }));
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
      title: '',
      date: '',
      timeRange: '',
      type: 'special-event',
      description: '',
    });
    setShowTypeDropdown(false);
    onClose();
  };

  const typeOptions = [
    { value: 'special-event', label: 'Special Event' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'extended-hours', label: 'Extended Hours' },
  ];

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
            <ThemedText style={styles.title}>Add Schedule Holiday</ThemedText>
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
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* Time Range */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                <Clock /> Time Range
              </ThemedText>
              <View style={styles.timeRangeContainer}>
                <TouchableOpacity
                  style={[styles.input, styles.timeInput]}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <ThemedText style={styles.inputText}>{formData.timeRange.split(' - ')[0] || 'From'}</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.timeSeparator}>to</ThemedText>
                <TouchableOpacity
                  style={[styles.input, styles.timeInput]}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <ThemedText style={styles.inputText}>{formData.timeRange.split(' - ')[1] || 'To'}</ThemedText>
                </TouchableOpacity>
              </View>
              {showStartTimePicker && (
                <DateTimePicker
                  value={selectedStartTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleStartTimeChange}
                  is24Hour={false}
                />
              )}
              {showEndTimePicker && (
                <DateTimePicker
                  value={selectedEndTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleEndTimeChange}
                  is24Hour={false}
                />
              )}
              <ThemedText style={styles.hintText}>Leave empty for full day</ThemedText>
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
                {isLoading ? 'Adding...' : 'Add Holiday'}
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
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    flex: 1,
  },
  timeSeparator: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
  inputText: {
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