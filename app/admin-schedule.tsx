import { AddOverrideDialog } from '@/components/AddOverrideDialog';
import { AdminSidebar } from '@/components/AdminSidebar';
import { EditScheduleDialog } from '@/components/EditScheduleDialog';
import { ThemedText } from '@/components/themed-text';
import { getCurrentUser } from '@/lib/firebase/auth';
import { createDoctorSchedule, createScheduleOverride, getAllDoctors, getDoctorSchedule, getScheduleOverrides, updateDoctorSchedule } from '@/lib/firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

// Custom SVG Components
const Menu = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12H21M3 6H21M3 18H21"
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

const Edit = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Calendar = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
      stroke="#D1D5DB"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.6947 13.7H15.7037M15.6947 16.7H15.7037M11.9955 13.7H12.0045M11.9955 16.7H12.0045M8.29431 13.7H8.30329M8.29431 16.7H8.30329"
      stroke="#D1D5DB"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Check = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke="#10B981"
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
    email: string;
    phone: string;
  };
}

interface ScheduleData {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

interface HolidayData {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: string;
  description?: string;
}

interface ScheduleRowProps {
  day: string;
  dayOfWeek: number;
  timeRange?: string;
  slotDuration?: string;
  status: 'active' | 'off';
  scheduleId?: string;
  onEdit: (day: string, dayOfWeek: number, scheduleData?: ScheduleData) => void;
}

const ScheduleRow: React.FC<ScheduleRowProps> = ({
  day,
  dayOfWeek,
  timeRange,
  slotDuration,
  status,
  scheduleId,
  onEdit,
}) => {
  const handleEdit = () => {
    const scheduleData = status === 'active' && timeRange ? {
      id: scheduleId,
      dayOfWeek,
      startTime: timeRange.split(' - ')[0],
      endTime: timeRange.split(' - ')[1],
      slotDuration: parseInt(slotDuration?.replace(' min slots', '') || '10'),
      isActive: true
    } : undefined;
    
    onEdit(day, dayOfWeek, scheduleData);
  };

  return (
    <View style={styles.scheduleRow}>
      <View style={styles.scheduleRowContent}>
        <View style={styles.scheduleRowLeft}>
          <ThemedText style={styles.dayName}>{day}</ThemedText>
          
          {status === 'active' ? (
            <View style={styles.scheduleDetailsContainer}>
              <View style={styles.timeContainer}>
                <Clock />
                <ThemedText style={styles.timeText}>{timeRange}</ThemedText>
              </View>
              
              <View style={styles.badgesContainer}>
                <View style={[styles.badge, styles.slotBadge]}>
                  <ThemedText style={styles.badgeText}>{slotDuration}</ThemedText>
                </View>
                
                <View style={[styles.badge, styles.activeBadge]}>
                  <ThemedText style={styles.badgeText}>Active</ThemedText>
                </View>
              </View>
            </View>
          ) : (
            <View style={[styles.badge, styles.offBadge]}>
              <ThemedText style={styles.offBadgeText}>Off Day</ThemedText>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEdit}
        >
          <Edit />
          <ThemedText style={styles.editButtonText}>Edit</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function AdminSchedule() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddHolidayDialogOpen, setIsAddHolidayDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<{
    day: string;
    dayOfWeek: number;
    scheduleData?: ScheduleData;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [holidays, setHolidays] = useState<HolidayData[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);

  // Load doctors data
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          
          const doctorsResult = await getAllDoctors();
          if (doctorsResult.success && doctorsResult.data) {
            const transformedDoctors = doctorsResult.data.map((doctor: any) => ({
              id: doctor.id,
              name: doctor.user?.name || 'Unknown Doctor',
              specialty: doctor.specialty || 'General Medicine',
              user: doctor.user
            }));
            setDoctors(transformedDoctors);
            
            // Auto-select first doctor
            if (transformedDoctors.length > 0 && !selectedDoctor) {
              setSelectedDoctor(transformedDoctors[0].id);
            }
          }
        } else {
          router.push('/auth-login');
        }
      } catch (error) {
        console.error('Error loading doctors:', error);
        Alert.alert('Error', 'Failed to load doctors data');
      }
    };

    loadDoctors();
  }, [router]);

  // Load schedules when doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      loadSchedules();
      loadHolidays();
    }
  }, [selectedDoctor]);

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      console.log('Loading schedules for doctor:', selectedDoctor);
      const result = await getDoctorSchedule(selectedDoctor);
      console.log('Schedule result:', result);
      if (result.success && result.data) {
        console.log('Setting schedules:', result.data);
        setSchedules(result.data as ScheduleData[]);
      } else {
        console.log('No schedule data, setting empty array');
        setSchedules([]);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHolidays = async () => {
    try {
      console.log('Loading holidays for doctor:', selectedDoctor);
      const result = await getScheduleOverrides(selectedDoctor);
      console.log('Holidays result:', result);
      if (result.success && result.data) {
        console.log('Setting holidays:', result.data);
        // Transform the data to match HolidayData interface
        const transformedHolidays = result.data.map((holiday: any) => {
          // Format the date to YYYY-MM-DD for display
          let formattedDate = holiday.date;
          if (holiday.date instanceof Date || typeof holiday.date === 'object') {
            formattedDate = new Date(holiday.date).toISOString().split('T')[0];
          } else if (typeof holiday.date === 'string' && holiday.date.includes('T')) {
            formattedDate = holiday.date.split('T')[0];
          }
          
          return {
            id: holiday.id,
            title: holiday.reason || holiday.title,
            date: formattedDate,
            startTime: holiday.startTime,
            endTime: holiday.endTime,
            type: holiday.type,
            description: holiday.description || ''
          };
        });
        setHolidays(transformedHolidays);
      } else {
        console.log('No holiday data, setting empty array');
        setHolidays([]);
      }
    } catch (error) {
      console.error('Error loading holidays:', error);
      setHolidays([]);
    }
  };

  const handleLogout = () => {
    router.push('/auth-login');
  };

  const handleNavigate = (path: string) => {
    router.push(path as any);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleEditSchedule = (day: string, dayOfWeek: number, scheduleData?: ScheduleData) => {
    setEditingSchedule({ day, dayOfWeek, scheduleData });
    setIsEditDialogOpen(true);
  };

  const handleSaveSchedule = async (formData: any) => {
    if (!selectedDoctor || !editingSchedule) return;
    
    setIsLoading(true);
    try {
      const scheduleData = {
        dayOfWeek: editingSchedule.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        slotDuration: parseInt(formData.slotDuration.replace(' min slots', '')),
        isActive: formData.status === 'active'
      };

      let result;
      if (editingSchedule.scheduleData?.id) {
        // Update existing schedule
        result = await updateDoctorSchedule(selectedDoctor, editingSchedule.scheduleData.id, scheduleData);
      } else {
        // Create new schedule
        result = await createDoctorSchedule(selectedDoctor, scheduleData);
      }

      if (result.success) {
        Alert.alert('Success', 'Schedule updated successfully!');
        setIsEditDialogOpen(false);
        setEditingSchedule(null);
        // Reload schedules to reflect changes
        await loadSchedules();
      } else {
        Alert.alert('Error', result.error || 'Failed to update schedule. Please try again.');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Error', 'Failed to update schedule. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingSchedule(null);
  };

  const handleDoctorSelect = (doctorId: string) => {
    console.log('Doctor selected:', doctorId);
    setSelectedDoctor(doctorId);
    setShowDoctorDropdown(false);
  };

  const toggleDoctorDropdown = () => {
    console.log('Toggling dropdown, current state:', showDoctorDropdown);
    setShowDoctorDropdown(!showDoctorDropdown);
  };

  const handleOpenAddHolidayDialog = () => {
    setIsAddHolidayDialogOpen(true);
  };

  const handleCloseAddHolidayDialog = () => {
    setIsAddHolidayDialogOpen(false);
  };

  const handleSaveHoliday = async (data: any) => {
    if (!selectedDoctor) {
      Alert.alert('Error', 'Please select a doctor first');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Saving holiday:', data);
      
      // Parse time range into start and end times
      const [startTime = '', endTime = ''] = data.timeRange ? data.timeRange.split(' - ') : ['', ''];
      
      const holidayData = {
        doctorId: selectedDoctor,
        reason: data.title,
        date: data.date,
        startTime: startTime.trim() || undefined,
        endTime: endTime.trim() || undefined,
        type: data.type === 'special-event' ? 'extended_hours' : data.type,
        description: data.description || '',
      };
      
      const result = await createScheduleOverride(holidayData);
      
      if (result.success) {
        Alert.alert('Success', 'Holiday added successfully!');
        setIsAddHolidayDialogOpen(false);
        // Reload holidays to show the new one
        await loadHolidays();
      } else {
        Alert.alert('Error', result.error || 'Failed to add holiday. Please try again.');
      }
    } catch (error) {
      console.error('Error saving holiday:', error);
      Alert.alert('Error', 'Failed to add holiday. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get weekly schedule data
  const getWeeklySchedule = (): ScheduleRowProps[] => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    console.log('getWeeklySchedule - schedules:', schedules);
    console.log('getWeeklySchedule - selectedDoctor:', selectedDoctor);
    
    return days.map((day, index) => {
      const schedule = schedules.find(s => s.dayOfWeek === index);
      console.log(`Day ${day} (${index}):`, schedule);
      
      if (schedule && schedule.isActive) {
        return {
          day,
          dayOfWeek: index,
          timeRange: `${schedule.startTime} - ${schedule.endTime}`,
          slotDuration: `${schedule.slotDuration} min slots`,
          status: 'active' as const,
          scheduleId: schedule.id,
          onEdit: handleEditSchedule,
        };
      } else {
        return {
          day,
          dayOfWeek: index,
          status: 'off' as const,
          onEdit: handleEditSchedule,
        };
      }
    });
  };

  const weeklySchedule = getWeeklySchedule();
  const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <Menu />
          </TouchableOpacity>
          <View>
            <ThemedText style={styles.title}>Schedule</ThemedText>
            <ThemedText style={styles.subtitle}>Manage doctor schedules and slot durations</ThemedText>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleOpenAddHolidayDialog}
          disabled={isLoading}
        >
          <Plus />
          <ThemedText style={styles.addButtonText}>Add Holiday</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        currentPath="/admin-schedule"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userName="Admin User"
        userRole="Administrator"
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Doctor Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Select Doctor:</ThemedText>
            <TouchableOpacity 
              style={styles.doctorSelector}
              onPress={toggleDoctorDropdown}
            >
              <User />
              <ThemedText style={styles.doctorName}>
                {selectedDoctorData?.name || 'Select a doctor'}
              </ThemedText>
              <ChevronDown />
            </TouchableOpacity>
          </View>

          {/* Weekly Schedule */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Weekly Schedule</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                Default schedule for {selectedDoctorData?.name || 'selected doctor'}
              </ThemedText>
            </View>
            
            <View style={styles.scheduleList}>
              {weeklySchedule.map((schedule, index) => (
                <ScheduleRow
                  key={index}
                  day={schedule.day}
                  dayOfWeek={schedule.dayOfWeek}
                  timeRange={schedule.timeRange}
                  slotDuration={schedule.slotDuration}
                  status={schedule.status}
                  scheduleId={schedule.scheduleId}
                  onEdit={schedule.onEdit}
                />
              ))}
            </View>
          </View>

          {/* Schedule Overrides */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Schedule Holidays</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                Holidays, extended hours, and special schedules
              </ThemedText>
            </View>
            
            {holidays.length > 0 ? (
              <View style={styles.holidayList}>
                {holidays.map((holiday) => (
                  <View key={holiday.id} style={styles.holidayCard}>
                    <View style={styles.holidayCardContent}>
                      <View style={styles.holidayCardLeft}>
                        <ThemedText style={styles.holidayTitle}>{holiday.title}</ThemedText>
                        <View style={styles.holidayMeta}>
                          <View style={styles.holidayMetaItem}>
                            <Calendar />
                            <ThemedText style={styles.holidayMetaText}>{holiday.date}</ThemedText>
                          </View>
                          {holiday.startTime && holiday.endTime && (
                            <View style={styles.holidayMetaItem}>
                              <Clock />
                              <ThemedText style={styles.holidayMetaText}>
                                {holiday.startTime} - {holiday.endTime}
                              </ThemedText>
                            </View>
                          )}
                        </View>
                        <View style={styles.holidayBadge}>
                          <ThemedText style={styles.holidayBadgeText}>{holiday.type}</ThemedText>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Calendar />
                <ThemedText style={styles.emptyStateText}>No schedule overrides found</ThemedText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Doctor Selection Modal */}
      <Modal
        visible={showDoctorDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDoctorDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDoctorDropdown(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Doctor</ThemedText>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {doctors.map((doctor) => (
                <TouchableOpacity
                  key={doctor.id}
                  style={[
                    styles.modalDoctorItem,
                    selectedDoctor === doctor.id && styles.modalDoctorItemSelected
                  ]}
                  onPress={() => handleDoctorSelect(doctor.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalDoctorInfo}>
                    <ThemedText style={[
                      styles.modalDoctorName,
                      selectedDoctor === doctor.id && styles.modalDoctorNameSelected
                    ]}>
                      {doctor.name}
                    </ThemedText>
                    <ThemedText style={styles.modalDoctorSpecialty}>
                      {doctor.specialty}
                    </ThemedText>
                  </View>
                  {selectedDoctor === doctor.id && (
                    <Check />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Schedule Dialog */}
      <EditScheduleDialog
        isOpen={isEditDialogOpen}
        onClose={closeEditDialog}
        onSave={handleSaveSchedule}
        initialData={editingSchedule}
        isLoading={isLoading}
      />

      {/* Add Holiday Dialog */}
      <AddOverrideDialog
        isOpen={isAddHolidayDialogOpen}
        onClose={handleCloseAddHolidayDialog}
        onSave={handleSaveHoliday}
        isLoading={isLoading}
      />
    </SafeAreaView>
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
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 16,
  },
  menuButton: {
    padding: 8,
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
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    marginTop: 4,
    flexShrink: 0,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  doctorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  doctorName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  scheduleList: {
    gap: 12,
  },
  scheduleRow: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
  },
  scheduleRowContent: {
    flexDirection: 'column',
    gap: 12,
  },
  scheduleRowLeft: {
    flexDirection: 'column',
    flex: 1,
    gap: 10,
  },
  dayName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  scheduleDetailsContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 95,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBadge: {
    backgroundColor: '#14B8A6',
  },
  activeBadge: {
    backgroundColor: '#10B981',
  },
  offBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  offBadgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalDoctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalDoctorItemSelected: {
    backgroundColor: '#F0FDF4',
  },
  modalDoctorInfo: {
    flex: 1,
  },
  modalDoctorName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  modalDoctorNameSelected: {
    color: '#059669',
  },
  modalDoctorSpecialty: {
    fontSize: 13,
    color: '#6B7280',
  },
  holidayList: {
    gap: 12,
  },
  holidayCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
  },
  holidayCardContent: {
    gap: 12,
  },
  holidayCardLeft: {
    gap: 8,
  },
  holidayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  holidayMeta: {
    flexDirection: 'column',
    gap: 8,
  },
  holidayMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  holidayMetaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  holidayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  holidayBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400E',
    textTransform: 'capitalize',
  },
});