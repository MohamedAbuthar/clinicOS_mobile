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

const ToggleLeft = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 5H8C6.34315 5 5 6.34315 5 8V16C5 17.6569 6.34315 19 8 19H16C17.6569 19 19 17.6569 19 16V8C19 6.34315 17.6569 5 16 5Z"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 8C8.55228 8 9 8.44772 9 9C9 9.55228 8.55228 10 8 10C7.44772 10 7 9.55228 7 9C7 8.44772 7.44772 8 8 8Z"
      fill="#9CA3AF"
    />
  </Svg>
);

const ToggleRight = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 5H8C6.34315 5 5 6.34315 5 8V16C5 17.6569 6.34315 19 8 19H16C17.6569 19 19 17.6569 19 16V8C19 6.34315 17.6569 5 16 5Z"
      stroke="#14B8A6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 8C16.5523 8 17 8.44772 17 9C17 9.55228 16.5523 10 16 10C15.4477 10 15 9.55228 15 9C15 8.44772 15.4477 8 16 8Z"
      fill="#14B8A6"
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

interface ScheduleData {
  day: string;
  dayOfWeek: number;
  scheduleData?: {
    id?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDuration: number;
    isActive: boolean;
  };
}

interface EditScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: ScheduleData | null;
  isLoading?: boolean;
}

export function EditScheduleDialog({ isOpen, onClose, onSave, initialData, isLoading = false }: EditScheduleDialogProps) {
  const [formData, setFormData] = useState({
    status: 'active' as 'active' | 'off',
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: '10 min slots'
  });
  const [showSlotDurationPicker, setShowSlotDurationPicker] = useState(false);
  
  // Refs for scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  const slotDurationRef = useRef<View>(null);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData?.scheduleData) {
      const schedule = initialData.scheduleData;
      setFormData({
        status: schedule.isActive ? 'active' : 'off',
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        slotDuration: `${schedule.slotDuration} min slots`
      });
    } else {
      setFormData({
        status: 'off',
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: '10 min slots'
      });
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSlotDurationSelect = (value: string) => {
    setFormData(prev => ({ ...prev, slotDuration: value }));
    setShowSlotDurationPicker(false);
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

  const toggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'off' : 'active'
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const resetForm = () => {
    setFormData({
      status: 'active',
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: '10 min slots'
    });
    setShowSlotDurationPicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (initialData?.scheduleData) {
        const schedule = initialData.scheduleData;
        setFormData({
          status: schedule.isActive ? 'active' : 'off',
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          slotDuration: `${schedule.slotDuration} min slots`
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen || !initialData) return null;

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
            <ThemedText style={styles.dialogTitle}>
              Edit {initialData.day} Schedule
            </ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X />
            </TouchableOpacity>
          </View>

          <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              {/* Status Toggle */}
              <View style={styles.statusContainer}>
                <View style={styles.statusInfo}>
                  <ThemedText style={styles.statusTitle}>Schedule Status</ThemedText>
                  <ThemedText style={styles.statusSubtitle}>
                    {formData.status === 'active' ? 'Schedule is active' : 'Schedule is off'}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={toggleStatus}
                >
                  {formData.status === 'active' ? (
                    <ToggleRight />
                  ) : (
                    <ToggleLeft />
                  )}
                </TouchableOpacity>
              </View>

              {formData.status === 'active' && (
                <>
                  {/* Time Range */}
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>
                      Time Range <ThemedText style={styles.required}>*</ThemedText>
                    </ThemedText>
                    <View style={styles.timeRow}>
                      <View style={styles.timeInputContainer}>
                        <Clock />
                        <TextInput
                          style={styles.timeInput}
                          value={formData.startTime}
                          onChangeText={(value) => handleInputChange('startTime', value)}
                          placeholder="09:00"
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>
                      <ThemedText style={styles.timeSeparator}>to</ThemedText>
                      <View style={styles.timeInputContainer}>
                        <Clock />
                        <TextInput
                          style={styles.timeInput}
                          value={formData.endTime}
                          onChangeText={(value) => handleInputChange('endTime', value)}
                          placeholder="17:00"
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>
                    </View>
                  </View>

                  {/* Slot Duration */}
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>
                      Slot Duration <ThemedText style={styles.required}>*</ThemedText>
                    </ThemedText>
                    <View ref={slotDurationRef} style={styles.slotDurationWrapper}>
                      <View style={styles.selectContainer}>
                        <TouchableOpacity 
                          style={styles.select}
                          onPress={handleSlotDurationToggle}
                        >
                          <ThemedText style={styles.selectText}>
                            {formData.slotDuration}
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
                              style={[styles.dropdownItem, formData.slotDuration === '5 min slots' && styles.dropdownItemSelected]}
                              onPress={() => handleSlotDurationSelect('5 min slots')}
                            >
                              <ThemedText style={[styles.dropdownItemText, formData.slotDuration === '5 min slots' && styles.dropdownItemTextSelected]}>
                                5 min slots
                              </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.dropdownItem, formData.slotDuration === '10 min slots' && styles.dropdownItemSelected]}
                              onPress={() => handleSlotDurationSelect('10 min slots')}
                            >
                              <ThemedText style={[styles.dropdownItemText, formData.slotDuration === '10 min slots' && styles.dropdownItemTextSelected]}>
                                10 min slots
                              </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.dropdownItem, formData.slotDuration === '15 min slots' && styles.dropdownItemSelected]}
                              onPress={() => handleSlotDurationSelect('15 min slots')}
                            >
                              <ThemedText style={[styles.dropdownItemText, formData.slotDuration === '15 min slots' && styles.dropdownItemTextSelected]}>
                                15 min slots
                              </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.dropdownItem, formData.slotDuration === '20 min slots' && styles.dropdownItemSelected]}
                              onPress={() => handleSlotDurationSelect('20 min slots')}
                            >
                              <ThemedText style={[styles.dropdownItemText, formData.slotDuration === '20 min slots' && styles.dropdownItemTextSelected]}>
                                20 min slots
                              </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.dropdownItem, formData.slotDuration === '30 min slots' && styles.dropdownItemSelected]}
                              onPress={() => handleSlotDurationSelect('30 min slots')}
                            >
                              <ThemedText style={[styles.dropdownItemText, formData.slotDuration === '30 min slots' && styles.dropdownItemTextSelected]}>
                                30 min slots
                              </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.dropdownItem, formData.slotDuration === '45 min slots' && styles.dropdownItemSelected]}
                              onPress={() => handleSlotDurationSelect('45 min slots')}
                            >
                              <ThemedText style={[styles.dropdownItemText, formData.slotDuration === '45 min slots' && styles.dropdownItemTextSelected]}>
                                45 min slots
                              </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.dropdownItem, styles.dropdownItemLast, formData.slotDuration === '60 min slots' && styles.dropdownItemSelected]}
                              onPress={() => handleSlotDurationSelect('60 min slots')}
                            >
                              <ThemedText style={[styles.dropdownItemText, formData.slotDuration === '60 min slots' && styles.dropdownItemTextSelected]}>
                                60 min slots
                              </ThemedText>
                            </TouchableOpacity>
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleClose}
              disabled={isLoading}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <ThemedText style={styles.submitButtonText}>
                {isLoading ? 'Saving...' : 'Save Changes'}
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
    maxWidth: 400,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  toggleButton: {
    padding: 4,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  required: {
    color: '#EF4444',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  timeInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  timeSeparator: {
    fontSize: 14,
    color: '#6B7280',
  },
  slotDurationWrapper: {
    position: 'relative',
    zIndex: 10,
    elevation: 5,
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
    paddingVertical: 12,
    backgroundColor: '#14B8A6',
    borderRadius: 8,
    alignItems: 'center',
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
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    maxHeight: 300,
    zIndex: 9999,
    marginBottom: 2,
  },
  slotDurationDropdown: {
    zIndex: 1000,
    maxHeight: 250,
  },
  dropdownList: {
    maxHeight: 200,
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
