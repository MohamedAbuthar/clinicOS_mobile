import { AddOverrideDialog } from '@/components/AddOverrideDialog';
import { AdminSidebar } from '@/components/AdminSidebar';
import { EditOverrideDialog } from '@/components/EditOverrideDialog';
import { ThemedText } from '@/components/themed-text';
import { getCurrentUser } from '@/lib/firebase/auth';
import { createScheduleOverride, deleteScheduleOverride, getAllDoctors, getDocument, getScheduleOverrides, updateScheduleOverride } from '@/lib/firebase/firestore';
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

const Trash = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
      stroke="#EF4444"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 11V17M14 11V17"
      stroke="#EF4444"
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

interface HolidayData {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: string;
  description?: string;
  displayType?: string;
  doctorId?: string;
}

export default function AdminSchedule() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddHolidayDialogOpen, setIsAddHolidayDialogOpen] = useState(false);
  const [isEditOverrideDialogOpen, setIsEditOverrideDialogOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [holidays, setHolidays] = useState<HolidayData[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);

  // Load doctors data
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          // Load user profile from Firestore to get role
          const userResult = await getDocument('users', currentUser.uid);
          if (userResult.success && userResult.data) {
            const userData = userResult.data as any;
            
            // Check if user is assistant - redirect if they are
            if (userData.role === 'assistant') {
              Alert.alert(
                'Access Denied',
                'Assistants do not have access to the Schedule page.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/admin-dashboard')
                  }
                ]
              );
              return;
            }
            
            setUser(userData);
          } else {
            // Fallback to Firebase user if Firestore data not found
            setUser({
              name: currentUser.displayName || 'Admin User',
              email: currentUser.email || '',
              role: 'admin'
            });
          }
          
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

  // Load holidays when doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      loadHolidays();
    }
  }, [selectedDoctor]);

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
            description: holiday.description || '',
            displayType: holiday.displayType, // Store displayType if available
            doctorId: holiday.doctorId, // Store doctorId
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

  const handleEditOverride = (holiday: HolidayData) => {
    // Check if there's a matching override for the other session (same date, same reason)
    // This helps determine if it was originally created as "both"
    let session: 'morning' | 'evening' | 'both' = timeRangeToSession(holiday.startTime, holiday.endTime);
    
    // Check if there's another override with same date and reason but different time
    const matchingOverride = holidays.find(h => 
      h.id !== holiday.id && 
      h.date === holiday.date && 
      h.title === holiday.title &&
      ((h.startTime === '09:00' && holiday.startTime === '14:00') ||
       (h.startTime === '14:00' && holiday.startTime === '09:00'))
    );
    
    if (matchingOverride) {
      // If we find a matching override, it means this was created as "both"
      session = 'both';
    }
    
    // Map backend type to UI type - use displayType if available (stored when creating)
    let uiType: 'special-event' | 'holiday' | 'extended-hours';
    if (holiday.displayType) {
      // Use stored displayType for accurate mapping
      uiType = holiday.displayType as 'special-event' | 'holiday' | 'extended-hours';
    } else {
      // Fallback: map backend type to UI type
      if (holiday.type === 'holiday') {
        uiType = 'holiday';
      } else if (holiday.type === 'extended_hours') {
        uiType = 'extended-hours';
      } else {
        uiType = 'special-event';
      }
    }
    
    setEditingOverride({
      id: holiday.id,
      title: holiday.title,
      date: holiday.date,
      session,
      type: uiType,
      description: holiday.description || '',
    });
    setIsEditOverrideDialogOpen(true);
  };

  const handleSaveEditOverride = async (data: any) => {
    if (!selectedDoctor) {
      Alert.alert('Error', 'Please select a doctor first');
      return;
    }

    setIsLoading(true);
    try {
      // Get the original override to check if it was "both"
      const originalOverride = holidays.find(h => h.id === data.id);
      const wasBoth = originalOverride && holidays.some(h => 
        h.id !== originalOverride.id && 
        h.date === originalOverride.date && 
        h.title === originalOverride.title &&
        ((h.startTime === '09:00' && originalOverride.startTime === '14:00') ||
         (h.startTime === '14:00' && originalOverride.startTime === '09:00'))
      );

      // Map UI types to backend types
      const overrideType = data.type === 'special-event' || data.type === 'extended-hours' 
        ? 'extended_hours' 
        : data.type === 'holiday' 
        ? 'holiday' 
        : 'extended_hours';
      
      // If changing from "both" to a single session, delete the other session override
      if (wasBoth && data.session !== 'both' && originalOverride) {
        // Find the matching override for the other session
        const otherSessionOverride = holidays.find(h => 
          h.id !== data.id && 
          h.date === originalOverride.date && 
          h.title === originalOverride.title &&
          ((data.session === 'morning' && h.startTime === '14:00') ||
           (data.session === 'evening' && h.startTime === '09:00'))
        );
        
        if (otherSessionOverride) {
          // Delete the other session override
          await deleteScheduleOverride(otherSessionOverride.id);
        }
      }

      // If changing to "both", we need to create/update both sessions
      if (data.session === 'both') {
        // Check if both sessions exist
        const morningOverride = holidays.find(h => 
          h.id !== data.id &&
          h.date === data.date && 
          h.title === originalOverride?.title &&
          h.startTime === '09:00'
        );
        const eveningOverride = holidays.find(h => 
          h.id !== data.id &&
          h.date === data.date && 
          h.title === originalOverride?.title &&
          h.startTime === '14:00'
        );

        const isMorningOverride = originalOverride?.startTime === '09:00';
        const isEveningOverride = originalOverride?.startTime === '14:00';

        // Update or create morning session
        if (isMorningOverride && originalOverride) {
          // Current override is morning, update it
          await updateScheduleOverride(data.id, {
            date: data.date,
            startTime: '09:00',
            endTime: '12:00',
            reason: data.title,
            type: overrideType as 'holiday' | 'extended_hours' | 'reduced_hours',
            description: data.description || '',
            displayType: data.type,
          });
        } else if (morningOverride) {
          // Morning exists but different ID, update it
          await updateScheduleOverride(morningOverride.id, {
            date: data.date,
            startTime: '09:00',
            endTime: '12:00',
            reason: data.title,
            type: overrideType as 'holiday' | 'extended_hours' | 'reduced_hours',
            description: data.description || '',
            displayType: data.type,
          });
        } else {
          // Create morning session
          await createScheduleOverride({
            doctorId: selectedDoctor,
            reason: data.title,
            date: data.date,
            startTime: '09:00',
            endTime: '12:00',
            type: overrideType as 'holiday' | 'extended_hours' | 'reduced_hours',
            description: data.description || '',
            displayType: data.type,
          });
        }

        // Update or create evening session
        if (isEveningOverride && originalOverride) {
          // Current override is evening, update it
          await updateScheduleOverride(data.id, {
            date: data.date,
            startTime: '14:00',
            endTime: '18:00',
            reason: data.title,
            type: overrideType as 'holiday' | 'extended_hours' | 'reduced_hours',
            description: data.description || '',
            displayType: data.type,
          });
        } else if (eveningOverride) {
          // Evening exists but different ID, update it
          await updateScheduleOverride(eveningOverride.id, {
            date: data.date,
            startTime: '14:00',
            endTime: '18:00',
            reason: data.title,
            type: overrideType as 'holiday' | 'extended_hours' | 'reduced_hours',
            description: data.description || '',
            displayType: data.type,
          });
        } else {
          // Create evening session
          await createScheduleOverride({
            doctorId: selectedDoctor,
            reason: data.title,
            date: data.date,
            startTime: '14:00',
            endTime: '18:00',
            type: overrideType as 'holiday' | 'extended_hours' | 'reduced_hours',
            description: data.description || '',
            displayType: data.type,
          });
        }

        // If the current override was a single session that's now part of "both", 
        // and we've created the other session, we might need to delete the current one
        // if it's not morning or evening (shouldn't happen, but handle edge case)
        if (originalOverride && originalOverride.startTime && 
            originalOverride.startTime !== '09:00' && originalOverride.startTime !== '14:00') {
          // If we created both sessions, delete the original single session override
          await deleteScheduleOverride(data.id);
        }
      } else {
        // Single session update
        const { startTime, endTime } = sessionToTimeRange(data.session);
        
        const result = await updateScheduleOverride(data.id, {
          date: data.date,
          startTime,
          endTime,
          reason: data.title,
          type: overrideType as 'holiday' | 'extended_hours' | 'reduced_hours',
          description: data.description || '',
          displayType: data.type, // Store the UI type for correct mapping when editing
        });
        
        if (!result.success) {
          Alert.alert('Error', result.error || 'Failed to update schedule override. Please try again.');
          return;
        }
      }
      
      Alert.alert('Success', 'Schedule override updated successfully!');
      setIsEditOverrideDialogOpen(false);
      setEditingOverride(null);
      await loadHolidays();
    } catch (error) {
      console.error('Error updating override:', error);
      Alert.alert('Error', 'Failed to update schedule override. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOverride = async (holidayId: string) => {
    if (!selectedDoctor) {
      Alert.alert('Error', 'Please select a doctor first');
      return;
    }

    Alert.alert(
      'Delete Holiday',
      'Are you sure you want to delete this holiday?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await deleteScheduleOverride(holidayId);
              
              if (result.success) {
                Alert.alert('Success', 'Holiday deleted successfully!');
                await loadHolidays();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete holiday. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting override:', error);
              Alert.alert('Error', 'Failed to delete holiday. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const closeEditOverrideDialog = () => {
    setIsEditOverrideDialogOpen(false);
    setEditingOverride(null);
  };

  // Helper function to convert session to startTime/endTime
  const sessionToTimeRange = (session: 'morning' | 'evening' | 'both'): { startTime?: string; endTime?: string } => {
    switch (session) {
      case 'morning':
        return { startTime: '09:00', endTime: '12:00' };
      case 'evening':
        return { startTime: '14:00', endTime: '18:00' };
      case 'both':
      default:
        return { startTime: undefined, endTime: undefined };
    }
  };

  const handleSaveHoliday = async (data: any) => {
    if (!selectedDoctor) {
      Alert.alert('Error', 'Please select a doctor first');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Saving holiday:', data);
      
      // Map UI types to backend types
      const overrideType = data.type === 'special-event' || data.type === 'extended-hours' 
        ? 'extended_hours' 
        : data.type === 'holiday' 
        ? 'holiday' 
        : 'extended_hours'; // Default fallback
      
      // If "both" is selected, create two separate overrides (morning and evening)
      if (data.session === 'both') {
        // Create morning session override
        const morningHolidayData = {
          doctorId: selectedDoctor,
          reason: data.title,
          date: data.date,
          startTime: '09:00',
          endTime: '12:00',
          type: overrideType as 'holiday' | 'extended_hours' | 'reduced_hours',
          description: data.description || '',
          displayType: data.type, // Store the UI type for correct mapping when editing
        };
        
        const morningResult = await createScheduleOverride(morningHolidayData);
        
        // Create evening session override
        const eveningHolidayData = {
          doctorId: selectedDoctor,
          reason: data.title,
          date: data.date,
          startTime: '14:00',
          endTime: '18:00',
          type: overrideType as 'holiday' | 'extended_hours' | 'reduced_hours',
          description: data.description || '',
          displayType: data.type, // Store the UI type for correct mapping when editing
        };
        
        const eveningResult = await createScheduleOverride(eveningHolidayData);
        
        if (morningResult.success && eveningResult.success) {
          Alert.alert('Success', 'Holiday added successfully for both sessions!');
          setIsAddHolidayDialogOpen(false);
          // Reload holidays to show the new ones
          await loadHolidays();
        } else {
          Alert.alert('Error', 'Failed to add holiday for one or both sessions. Please try again.');
        }
      } else {
        // For single session (morning or evening)
        const { startTime, endTime } = sessionToTimeRange(data.session);
        
        const holidayData = {
          doctorId: selectedDoctor,
          reason: data.title,
          date: data.date,
          startTime,
          endTime,
          type: overrideType as 'holiday' | 'extended_hours' | 'reduced_hours',
          description: data.description || '',
          displayType: data.type, // Store the UI type for correct mapping when editing
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
      }
    } catch (error) {
      console.error('Error saving holiday:', error);
      Alert.alert('Error', 'Failed to add holiday. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            <ThemedText style={styles.subtitle}>Manage schedule holidays and overrides</ThemedText>
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
        userName={user?.name || 'Admin User'}
        userRole={user?.role || 'Administrator'}
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
                      <View style={styles.holidayCardActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleEditOverride(holiday)}
                          disabled={isLoading}
                        >
                          <Edit />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteOverride(holiday.id)}
                          disabled={isLoading}
                        >
                          <Trash />
                        </TouchableOpacity>
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

      {/* Edit Override Dialog */}
      <EditOverrideDialog
        isOpen={isEditOverrideDialogOpen}
        onClose={closeEditOverrideDialog}
        onSave={handleSaveEditOverride}
        initialData={editingOverride}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  holidayCardLeft: {
    flex: 1,
    gap: 8,
  },
  holidayCardActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
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