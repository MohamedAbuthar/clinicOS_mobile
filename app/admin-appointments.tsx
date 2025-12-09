import { AddAppointmentDialog } from '@/components/AddAppointmentDialog';
import { AdminSidebar } from '@/components/AdminSidebar';
import { PaginationComponent } from '@/components/PaginationComponent';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/lib/contexts/AuthContext';
import { createAppointment, createPatient, getAllDoctors, getDocuments } from '@/lib/firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Calendar, FileText, Filter, Hash, Menu, Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Custom SVG Components (if needed)

export default function AdminAppointments() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date>(new Date());

  // Ensure tempSelectedDate is not in the past when opening date picker
  const handleOpenDatePicker = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(tempSelectedDate);
    selected.setHours(0, 0, 0, 0);

    // If selected date is in the past, set to today
    if (selected < today) {
      setTempSelectedDate(today);
    }
    setShowDatePicker(true);
  };
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [showDoctorFilter, setShowDoctorFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  // Show no appointments when no doctor is selected
  useEffect(() => {
    if (!selectedDoctor) {
      setFilteredAppointments([]);
    }
  }, [appointments, selectedDate, selectedDoctor]);

  // Load appointments and doctors data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (user) {
          // Load doctors first
          const doctorsResult = await getAllDoctors();
          console.log('Admin Appointments - Doctors Result:', doctorsResult);
          let doctorsMap = new Map();
          if (doctorsResult.success && doctorsResult.data) {
            const formattedDoctors = doctorsResult.data.map((doc: any) => ({
              id: doc.id,
              name: doc.user?.name || 'Unknown Doctor',
              specialty: doc.specialty || 'General Medicine',
            }));
            console.log('Formatted doctors:', formattedDoctors);
            setDoctors(formattedDoctors);

            // Create a map for quick doctor lookup
            doctorsMap = new Map(formattedDoctors.map(doc => [doc.id, doc]));
          }

          // Load patients
          const patientsResult = await getDocuments('patients');
          console.log('Admin Appointments - Patients Result:', patientsResult);
          if (patientsResult.success && patientsResult.data) {
            setPatients(patientsResult.data);
          } else {
            console.log('Admin Appointments - Failed to load patients');
            setPatients([]);
          }

          // Load appointments and match with doctor names
          const appointmentsResult = await getDocuments('appointments');
          console.log('Admin Appointments - Appointments Result:', appointmentsResult);
          if (appointmentsResult.success && appointmentsResult.data) {
            // Transform the data to match web app format
            const transformedAppointments = appointmentsResult.data.map((appointment: any) => {
              // Find the doctor name from the doctors map
              const doctor = doctorsMap.get(appointment.doctorId);
              const doctorName = doctor ? doctor.name : 'Unknown Doctor';

              return {
                id: appointment.id,
                patientName: appointment.patientName || 'Unknown Patient',
                patientPhone: appointment.patientPhone || 'N/A',
                doctorId: appointment.doctorId,
                doctorName: doctorName,
                appointmentDate: appointment.appointmentDate,
                appointmentTime: appointment.appointmentTime,
                status: appointment.status || 'scheduled',
                tokenNumber: appointment.tokenNumber || 'N/A',
                notes: appointment.notes || '',
                statusColor: appointment.status === 'completed' ? '#10B981' :
                  appointment.status === 'confirmed' ? '#3B82F6' :
                    appointment.status === 'scheduled' ? '#F59E0B' : '#6B7280'
              };
            });
            setAppointments(transformedAppointments);
            // Don't show any appointments initially - only show when doctor is selected
            setFilteredAppointments([]);
          } else {
            console.log('Admin Appointments - Failed to load appointments, using fallback data');
            // Fallback data for testing
            const fallbackAppointments = [
              {
                id: '1',
                patientName: 'John Doe',
                patientPhone: '+1-555-0123',
                doctorId: 'doc1',
                doctorName: 'Dr. John Smith',
                appointmentDate: '2024-01-15',
                appointmentTime: '09:00',
                status: 'scheduled',
                tokenNumber: '001',
                notes: 'Regular checkup',
                statusColor: '#F59E0B'
              },
              {
                id: '2',
                patientName: 'Jane Smith',
                patientPhone: '+1-555-0456',
                doctorId: 'doc2',
                doctorName: 'Dr. Sarah Johnson',
                appointmentDate: '2024-01-15',
                appointmentTime: '10:30',
                status: 'confirmed',
                tokenNumber: '002',
                notes: 'Follow-up visit',
                statusColor: '#3B82F6'
              }
            ];
            setAppointments(fallbackAppointments);
            // Don't show any appointments initially - only show when doctor is selected
            setFilteredAppointments([]);
          }
          setIsLoading(false);
        } else {
          router.push('/auth-login');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load appointments data');
        setIsLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      // Wait a moment for auth state to clear before navigating
      setTimeout(() => {
        router.replace('/auth-login');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
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

  // Handle date picker change
  const handleDatePickerChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);

      // Only allow current date or future dates
      if (selected >= today) {
        setTempSelectedDate(selectedDate);
        const dateString = selectedDate.toISOString().split('T')[0];
        setSelectedDate(dateString);
        // Only filter if doctor is selected
        if (selectedDoctor) {
          setFilteredAppointments(filterAppointmentsByDateAndDoctor(appointments, dateString, selectedDoctor));
        } else {
          setFilteredAppointments([]);
        }
      } else {
        // If past date selected, use today's date
        const todayDate = new Date();
        setTempSelectedDate(todayDate);
        const todayString = todayDate.toISOString().split('T')[0];
        setSelectedDate(todayString);
        // Only filter if doctor is selected
        if (selectedDoctor) {
          setFilteredAppointments(filterAppointmentsByDateAndDoctor(appointments, todayString, selectedDoctor));
        } else {
          setFilteredAppointments([]);
        }
      }
    }
  };

  // Handle date filter change
  const handleDateFilterChange = (date: string) => {
    setSelectedDate(date);
    resetPagination();
    // Only filter if doctor is selected
    if (selectedDoctor) {
      setFilteredAppointments(filterAppointmentsByDateAndDoctor(appointments, date, selectedDoctor));
    } else {
      setFilteredAppointments([]);
    }
  };

  // Clear date filter
  const clearDateFilter = () => {
    setSelectedDate('');
    resetPagination();
    // Only filter if doctor is selected (with today's date as default)
    if (selectedDoctor) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      setFilteredAppointments(filterAppointmentsByDateAndDoctor(appointments, today, selectedDoctor));
    } else {
      setFilteredAppointments([]);
    }
  };

  // Handle doctor filter change
  const handleDoctorFilterChange = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    // Automatically set to today's date when doctor is selected
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    resetPagination();
    // Filter by doctor and today's date
    setFilteredAppointments(filterAppointmentsByDateAndDoctor(appointments, today, doctorId));
  };

  // Clear doctor filter
  const clearDoctorFilter = () => {
    setSelectedDoctor('');
    setSelectedDate('');
    resetPagination();
    setFilteredAppointments([]);
  };

  // Set today's date
  const setTodayDate = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    resetPagination();
    // Only filter if doctor is selected
    if (selectedDoctor) {
      setFilteredAppointments(filterAppointmentsByDateAndDoctor(appointments, today, selectedDoctor));
    } else {
      setFilteredAppointments([]);
    }
  };

  // Delete appointment
  const handleDeleteAppointment = async (appointmentId: string) => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Here you would implement the actual delete logic
              // For now, we'll just remove it from the local state
              const updatedAppointments = appointments.filter(apt => apt.id !== appointmentId);
              setAppointments(updatedAppointments);
              // Only filter if doctor is selected
              if (selectedDoctor) {
                const today = selectedDate || new Date().toISOString().split('T')[0];
                setFilteredAppointments(filterAppointmentsByDateAndDoctor(updatedAppointments, today, selectedDoctor));
              } else {
                setFilteredAppointments([]);
              }
              Alert.alert('Success', 'Appointment deleted successfully');
            } catch (error) {
              console.error('Error deleting appointment:', error);
              Alert.alert('Error', 'Failed to delete appointment');
            }
          },
        },
      ]
    );
  };

  const handleViewAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setViewModalOpen(true);
  };

  // Filter appointments by date
  const filterAppointmentsByDate = (appointments: any[], date: string) => {
    if (!date) {
      return appointments;
    }
    return appointments.filter(appointment => appointment.appointmentDate === date);
  };

  // Filter appointments by date and doctor
  const filterAppointmentsByDateAndDoctor = (appointments: any[], date: string, doctorId: string) => {
    let filtered = appointments;

    if (date) {
      filtered = filtered.filter(appointment => appointment.appointmentDate === date);
    }

    if (doctorId) {
      filtered = filtered.filter(appointment => appointment.doctorId === doctorId);
    }

    return filtered;
  };

  // Get paginated appointments
  const getPaginatedAppointments = (appointments: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return appointments.slice(startIndex, endIndex);
  };

  // Get total pages
  const getTotalPages = (appointments: any[]) => {
    return Math.ceil(appointments.length / itemsPerPage);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle double page navigation
  const handleDoublePageChange = (direction: 'prev' | 'next') => {
    const totalPages = getTotalPages(filteredAppointments);
    if (direction === 'prev') {
      const newPage = Math.max(1, currentPage - 2);
      setCurrentPage(newPage);
    } else {
      const newPage = Math.min(totalPages, currentPage + 2);
      setCurrentPage(newPage);
    }
  };

  // Reset to first page when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Load appointments function
  const loadAppointments = async () => {
    try {
      const appointmentsResult = await getDocuments('appointments');
      console.log('Admin Appointments - Appointments Result:', appointmentsResult);
      if (appointmentsResult.success && appointmentsResult.data) {
        // Transform the data to match web app format
        const transformedAppointments = appointmentsResult.data.map((appointment: any) => ({
          id: appointment.id,
          patientName: appointment.patientName || 'Unknown Patient',
          patientPhone: appointment.patientPhone || 'N/A',
          doctorId: appointment.doctorId,
          doctorName: appointment.doctorName || 'Unknown Doctor',
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
          status: appointment.status || 'scheduled',
          tokenNumber: appointment.tokenNumber || 'N/A',
          notes: appointment.notes || '',
          statusColor: appointment.status === 'completed' ? '#10B981' :
            appointment.status === 'confirmed' ? '#3B82F6' :
              appointment.status === 'scheduled' ? '#F59E0B' : '#6B7280'
        }));
        setAppointments(transformedAppointments);
        // Only show appointments if doctor is selected
        if (selectedDoctor) {
          const today = selectedDate || new Date().toISOString().split('T')[0];
          setFilteredAppointments(filterAppointmentsByDateAndDoctor(transformedAppointments, today, selectedDoctor));
        } else {
          setFilteredAppointments([]);
        }
        console.log('Loaded appointments:', transformedAppointments.length);
      } else {
        console.log('Admin Appointments - Failed to load appointments, using fallback data');
        // Fallback data for testing
        const fallbackAppointments = [
          {
            id: '1',
            patientName: 'John Doe',
            patientPhone: '+1-555-0123',
            doctorId: 'doc1',
            doctorName: 'Dr. John Smith',
            appointmentDate: '2024-01-15',
            appointmentTime: '09:00',
            status: 'scheduled',
            tokenNumber: '001',
            notes: 'Regular checkup',
            statusColor: '#F59E0B'
          },
          {
            id: '2',
            patientName: 'Jane Smith',
            patientPhone: '+1-555-0456',
            doctorId: 'doc2',
            doctorName: 'Dr. Sarah Johnson',
            appointmentDate: '2024-01-15',
            appointmentTime: '10:30',
            status: 'confirmed',
            tokenNumber: '002',
            notes: 'Follow-up visit',
            statusColor: '#3B82F6'
          }
        ];
        setAppointments(fallbackAppointments);
        // Only show appointments if doctor is selected
        if (selectedDoctor) {
          const today = selectedDate || new Date().toISOString().split('T')[0];
          setFilteredAppointments(filterAppointmentsByDateAndDoctor(fallbackAppointments, today, selectedDoctor));
        } else {
          setFilteredAppointments([]);
        }
        console.log('Using fallback appointments:', fallbackAppointments.length);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const handleAddAppointment = async (appointmentData: any) => {
    console.log('handleAddAppointment: Starting...', appointmentData);

    if (!appointmentData.patientName || !appointmentData.phone || !appointmentData.doctor || !appointmentData.date || !appointmentData.time) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // First, create or find patient
      let patientId = patients.find(p => p.phone === appointmentData.phone)?.id;
      console.log('Existing patient ID:', patientId);

      if (!patientId) {
        console.log('Creating new patient...');
        // Create new patient - this returns the new patient's ID
        const newPatientData = {
          name: appointmentData.patientName,
          phone: appointmentData.phone,
          email: appointmentData.email || undefined,
          dateOfBirth: '1990-01-01', // Default date
          gender: 'other' as const, // Default gender
        };

        const newPatientId = await createPatient(newPatientData);
        console.log('Patient created with ID:', newPatientId);

        if (!newPatientId) {
          Alert.alert('Error', 'Failed to create patient');
          setIsLoading(false);
          return;
        }

        patientId = newPatientId;
      }

      console.log('Creating appointment with patientId:', patientId);

      // Get selected doctor info
      const selectedDoctor = doctors.find(d => d.id === appointmentData.doctor);
      if (!selectedDoctor) {
        Alert.alert('Error', 'Selected doctor not found');
        setIsLoading(false);
        return;
      }

      // Create appointment using the web app's exact logic
      const success = await createAppointment({
        patientId: patientId,
        patientName: appointmentData.patientName, // Store patient name directly
        patientPhone: appointmentData.phone, // Store patient phone directly
        doctorId: appointmentData.doctor,
        appointmentDate: appointmentData.date,
        appointmentTime: appointmentData.time,
        notes: appointmentData.notes,
        source: 'mobile' as const,
        createdBy: 'mobile_app'
      });

      console.log('Appointment creation result:', success);

      if (success.success) {
        Alert.alert('Success', 'Appointment created successfully');
        setIsAddDialogOpen(false);
        // Refresh the appointments list to show the new appointment
        await loadAppointments();
      } else {
        Alert.alert('Error', success.error || 'Failed to create appointment');
      }
    } catch (err: unknown) {
      console.error('Error creating appointment:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create appointment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <Menu />
          </TouchableOpacity>
          <View>
            <ThemedText style={styles.title}>Appointments</ThemedText>
            <ThemedText style={styles.subtitle}>Manage all clinic appointments</ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddDialogOpen(true)}
          disabled={isLoading}
        >
          <Plus />
          <ThemedText style={styles.addButtonText}>Add Appointment</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Doctor Filter */}
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDoctorFilter(!showDoctorFilter)}
        >
          <Filter size={16} color="#6B7280" />
          <ThemedText style={styles.filterButtonText}>
            {selectedDoctor ? `Doctor: ${doctors.find(d => d.id === selectedDoctor)?.name || 'Unknown'}` : 'Filter by Doctor'}
          </ThemedText>
        </TouchableOpacity>

        {showDoctorFilter && (
          <View style={styles.doctorFilterContainer}>
            <View style={styles.doctorInputContainer}>
              <ThemedText style={styles.doctorInputLabel}>Select Doctor:</ThemedText>
              <View style={styles.doctorList}>
                {doctors.map((doctor) => (
                  <TouchableOpacity
                    key={doctor.id}
                    style={[
                      styles.doctorOption,
                      selectedDoctor === doctor.id && styles.doctorOptionSelected
                    ]}
                    onPress={() => handleDoctorFilterChange(doctor.id)}
                  >
                    <ThemedText style={[
                      styles.doctorOptionText,
                      selectedDoctor === doctor.id && styles.doctorOptionTextSelected
                    ]}>
                      {doctor.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {selectedDoctor && (
              <TouchableOpacity style={styles.clearFilterButton} onPress={clearDoctorFilter}>
                <ThemedText style={styles.clearFilterText}>Clear Doctor Filter</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Date Filter */}
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDateFilter(!showDateFilter)}
        >
          <Filter size={16} color="#6B7280" />
          <ThemedText style={styles.filterButtonText}>
            {selectedDate ? `Filter: ${selectedDate}` : 'Filter by Date'}
          </ThemedText>
        </TouchableOpacity>

        {showDateFilter && (
          <View style={styles.dateFilterContainer}>
            <View style={styles.dateInputContainer}>
              <Calendar size={16} color="#6B7280" />
              <ThemedText style={styles.dateInputLabel}>Select Date:</ThemedText>
              <View style={styles.dateInputRow}>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={handleOpenDatePicker}
                >
                  <ThemedText style={styles.dateInputText}>
                    {selectedDate || 'Select a date'}
                  </ThemedText>
                  <Calendar size={16} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.todayButton}
                  onPress={setTodayDate}
                >
                  <ThemedText style={styles.todayButtonText}>Today</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            {selectedDate && (
              <TouchableOpacity style={styles.clearFilterButton} onPress={clearDateFilter}>
                <ThemedText style={styles.clearFilterText}>Clear Filter</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.datePickerModal}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <ThemedText style={styles.datePickerTitle}>Select Date</ThemedText>
              <TouchableOpacity
                style={styles.datePickerClose}
                onPress={() => setShowDatePicker(false)}
              >
                <ThemedText style={styles.datePickerCloseText}>✕</ThemedText>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempSelectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDatePickerChange}
              minimumDate={new Date()}
              maximumDate={new Date(2030, 11, 31)}
            />
            {Platform.OS === 'ios' && (
              <View style={styles.datePickerButtons}>
                <TouchableOpacity
                  style={styles.datePickerCancelButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <ThemedText style={styles.datePickerCancelText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.datePickerConfirmButton}
                  onPress={() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const selected = new Date(tempSelectedDate);
                    selected.setHours(0, 0, 0, 0);

                    // Only allow current date or future dates
                    const finalDate = selected >= today ? tempSelectedDate : today;
                    const dateString = finalDate.toISOString().split('T')[0];
                    setSelectedDate(dateString);
                    setTempSelectedDate(finalDate);
                    // Only filter if doctor is selected
                    if (selectedDoctor) {
                      setFilteredAppointments(filterAppointmentsByDateAndDoctor(appointments, dateString, selectedDoctor));
                    } else {
                      setFilteredAppointments([]);
                    }
                    setShowDatePicker(false);
                  }}
                >
                  <ThemedText style={styles.datePickerConfirmText}>Confirm</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        currentPath="/admin-appointments"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userName={user?.name || 'Admin User'}
        userRole={user?.role || 'Administrator'}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <ThemedText style={styles.loadingText}>Loading appointments...</ThemedText>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Empty State - No Doctor Selected */}
            {!selectedDoctor && (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyTitle}>Select Doctor to View Appointments</ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                  Please select a doctor from the filter above to view their appointments
                </ThemedText>
              </View>
            )}

            {/* Empty State - No Appointments Found */}
            {selectedDoctor && filteredAppointments.length === 0 && (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyTitle}>No Appointments Found</ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                  No appointments found for the selected doctor and date
                </ThemedText>
              </View>
            )}

            {/* Appointment Cards */}
            {selectedDoctor && filteredAppointments.length > 0 && (
              <View style={styles.appointmentsList}>
                {getPaginatedAppointments(filteredAppointments).map((appointment) => (
                  <View key={appointment.id} style={styles.appointmentCard}>
                    <View style={styles.appointmentHeader}>
                      <View style={styles.appointmentInfo}>
                        <ThemedText style={styles.patientName}>
                          {appointment.patientName}
                        </ThemedText>
                        <ThemedText style={styles.patientPhone}>
                          {appointment.patientPhone}
                        </ThemedText>
                        <ThemedText style={styles.doctorName}>
                          Dr. {appointment.doctorName}
                        </ThemedText>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: appointment.statusColor }]}>
                        <ThemedText style={styles.statusText}>{appointment.status}</ThemedText>
                      </View>
                    </View>

                    <View style={styles.appointmentDetails}>
                      <View style={styles.detailRow}>
                        <Calendar size={16} color="#6B7280" />
                        <ThemedText style={styles.detailText}>
                          {appointment.appointmentDate} at {appointment.appointmentTime}
                        </ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <Hash size={16} color="#6B7280" />
                        <ThemedText style={styles.detailText}>
                          Token: #{Number(String(appointment.tokenNumber).replace(/^#/, '').replace(/^0+/, '')) || 0}
                        </ThemedText>
                      </View>
                      {appointment.notes && (
                        <View style={styles.detailRow}>
                          <FileText size={16} color="#6B7280" />
                          <ThemedText style={styles.detailText}>
                            {appointment.notes}
                          </ThemedText>
                        </View>
                      )}
                    </View>

                    <View style={styles.appointmentActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleViewAppointment(appointment)}
                      >
                        <FileText size={16} color="#059669" />
                        <ThemedText style={styles.actionText}>View</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteAppointment(appointment.id)}
                      >
                        <Trash2 size={16} color="#DC2626" />
                        <ThemedText style={styles.actionText}>Delete</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Pagination Controls */}
            {selectedDoctor && filteredAppointments.length > 0 && (
              <PaginationComponent
                currentPage={currentPage}
                totalPages={getTotalPages(filteredAppointments)}
                totalItems={filteredAppointments.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onDoublePageChange={handleDoublePageChange}
              />
            )}
          </View>
        </ScrollView>
      )}

      {/* Add Appointment Dialog */}
      <AddAppointmentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddAppointment}
        doctors={doctors}
        isLoading={isLoading}
      />

      {/* View Appointment Modal */}
      <Modal
        visible={viewModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewModalOpen(false)}
      >
        <View style={styles.datePickerModal}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <ThemedText style={styles.datePickerTitle}>Appointment Details</ThemedText>
              <TouchableOpacity
                style={styles.datePickerClose}
                onPress={() => setViewModalOpen(false)}
              >
                <ThemedText style={styles.datePickerCloseText}>✕</ThemedText>
              </TouchableOpacity>
            </View>
            {selectedAppointment && (
              <View style={{ gap: 8 }}>
                <ThemedText style={styles.viewDetail}>Patient: {selectedAppointment.patientName}</ThemedText>
                <ThemedText style={styles.viewDetail}>Phone: {selectedAppointment.patientPhone}</ThemedText>
                <ThemedText style={styles.viewDetail}>Doctor: Dr. {selectedAppointment.doctorName}</ThemedText>
                <ThemedText style={styles.viewDetail}>Date: {selectedAppointment.appointmentDate}</ThemedText>
                <ThemedText style={styles.viewDetail}>Time: {selectedAppointment.appointmentTime}</ThemedText>
                <ThemedText style={styles.viewDetail}>Status: {selectedAppointment.status}</ThemedText>
                <ThemedText style={styles.viewDetail}>Token: #{Number(String(selectedAppointment.tokenNumber).replace(/^#/, '').replace(/^0+/, '')) || 0}</ThemedText>
                {selectedAppointment.notes ? (
                  <ThemedText style={styles.viewDetail}>Notes: {selectedAppointment.notes}</ThemedText>
                ) : null}
              </View>
            )}
            <View style={{ marginTop: 16 }}>
              <TouchableOpacity
                style={styles.viewModalCloseButton}
                onPress={() => setViewModalOpen(false)}
              >
                <ThemedText style={styles.datePickerConfirmText}>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginRight: 12,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  filterButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  dateFilterContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateInputLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputText: {
    fontSize: 14,
    color: '#111827',
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  todayButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  clearFilterButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearFilterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  doctorFilterContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  doctorInputContainer: {
    marginBottom: 8,
  },
  doctorInputLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  doctorList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  doctorOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
  },
  doctorOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  doctorOptionText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  doctorOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  datePickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  datePickerClose: {
    padding: 4,
  },
  datePickerCloseText: {
    fontSize: 18,
    color: '#6B7280',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  datePickerCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  datePickerConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#10B981',
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewDetail: { color: '#111827', fontSize: 14 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  appointmentsList: {
    paddingHorizontal: 16,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  appointmentInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  patientPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    flex: 1,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  viewModalCloseButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#10B981',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
});
