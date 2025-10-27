import { AdminSidebar } from '@/components/AdminSidebar';
import AppointmentTrendsChart, { AppointmentData } from '@/components/charts/AppointmentTrendsChart';
import DoctorPerformanceCard, { DoctorPerformanceCardProps } from '@/components/charts/DoctorPerformanceCard';
import WaitTimeChart, { WaitTimeData } from '@/components/charts/WaitTimeChart';
import { ThemedText } from '@/components/themed-text';
import { getCurrentUser } from '@/lib/firebase/auth';
import { getAllDoctors, getDocuments } from '@/lib/firebase/firestore';
import { useRouter } from 'expo-router';
import { BarChart3, Calendar, Clock, TrendingUp, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

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

export default function AdminReports() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'appointments' | 'queue' | 'doctor'>('appointments');
  const [timeRange, setTimeRange] = useState<'today' | 'thisWeek' | 'thisMonth'>('thisWeek');
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          
          // Load appointments
          const appointmentsResult = await getDocuments('appointments');
          if (appointmentsResult.success && appointmentsResult.data) {
            setAppointments(appointmentsResult.data);
          }
          
          // Load doctors with user data
          const doctorsResult = await getAllDoctors();
          if (doctorsResult.success && doctorsResult.data) {
            setDoctors(doctorsResult.data);
          }
        } else {
          router.push('/auth-login');
        }
      } catch (error) {
        console.error('Error loading reports data:', error);
        Alert.alert('Error', 'Failed to load reports data');
      }
    };

    loadData();
  }, [router]);

  const handleLogout = () => router.push('/auth-login');
  const handleNavigate = (path: string) => router.push(path as any);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleDownload = () => {
    Alert.alert('Download Report', 'This feature will be implemented soon');
  };

  // Get date range based on time range selection
  const getDateRange = (range: 'today' | 'thisWeek' | 'thisMonth') => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return { start: startOfWeek, end: endOfWeek };
      case 'thisMonth':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        return { start: startOfMonth, end: endOfMonth };
      default:
        return { start: today, end: today };
    }
  };

  // Filter appointments based on selected time range
  const filterAppointmentsByDateRange = (appointments: any[], range: 'today' | 'thisWeek' | 'thisMonth') => {
    const { start, end } = getDateRange(range);
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate >= start && appointmentDate <= end;
    });
  };

  // Get filtered appointments
  const filteredAppointments = filterAppointmentsByDateRange(appointments, timeRange);

  // Calculate statistics based on filtered data
  const getStats = () => {
    const totalAppointments = filteredAppointments.length;
    const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed').length;
    const pendingAppointments = filteredAppointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed').length;
    
    return {
      totalAppointments,
      todayAppointments: timeRange === 'today' ? totalAppointments : 0,
      completedAppointments,
      pendingAppointments,
      totalDoctors: doctors.length,
      activeDoctors: doctors.filter(doc => doc.status === 'In').length,
    };
  };

  const stats = getStats();

  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
  ];

  const handleTimeRangeSelect = (range: 'today' | 'thisWeek' | 'thisMonth') => {
    setTimeRange(range);
    setShowTimeRangeDropdown(false);
  };

  // Generate appointment trends data based on time range
  const generateAppointmentData = (): AppointmentData[] => {
    const { start, end } = getDateRange(timeRange);
    const data: AppointmentData[] = [];
    
    if (timeRange === 'today') {
      // For today, show hourly data
      for (let hour = 9; hour <= 17; hour++) {
        const hourStart = new Date(start);
        hourStart.setHours(hour, 0, 0, 0);
        const hourEnd = new Date(start);
        hourEnd.setHours(hour + 1, 0, 0, 0);
        
        const hourAppointments = filteredAppointments.filter(apt => {
          const aptTime = new Date(`${apt.appointmentDate} ${apt.appointmentTime}`);
          return aptTime >= hourStart && aptTime < hourEnd;
        });
        
        data.push({
          day: `${hour}:00`,
          total: hourAppointments.length,
          completed: hourAppointments.filter(apt => apt.status === 'completed').length,
          cancelled: hourAppointments.filter(apt => apt.status === 'cancelled').length,
        });
      }
    } else {
      // For week/month, show daily data
      const current = new Date(start);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      while (current <= end) {
        const dayAppointments = filteredAppointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate.toDateString() === current.toDateString();
        });
        
        data.push({
          day: days[current.getDay()],
          total: dayAppointments.length,
          completed: dayAppointments.filter(apt => apt.status === 'completed').length,
          cancelled: dayAppointments.filter(apt => apt.status === 'cancelled').length,
        });
        
        current.setDate(current.getDate() + 1);
      }
    }
    
    return data;
  };

  const appointmentData = generateAppointmentData();

  // Wait time data (mock data for now)
  const waitTimeData: WaitTimeData[] = [
    { hour: '9AM', avgWait: 5 },
    { hour: '10AM', avgWait: 12 },
    { hour: '11AM', avgWait: 18 },
    { hour: '12PM', avgWait: 25 },
    { hour: '2PM', avgWait: 14 },
    { hour: '3PM', avgWait: 20 },
    { hour: '4PM', avgWait: 22 },
    { hour: '5PM', avgWait: 8 },
  ];

  // Doctor performance data - match web version logic
  const doctorPerformance: DoctorPerformanceCardProps[] = React.useMemo(() => {
    console.log('Generating doctor performance, doctors:', doctors.length, 'appointments:', filteredAppointments.length);
    
    return doctors
      .map(doctor => {
        // Try to get doctor name from multiple possible fields
        let doctorName = 'Unknown Doctor';
        if (doctor.user?.name) {
          doctorName = doctor.user.name;
        } else if (doctor.name) {
          doctorName = doctor.name;
        } else if (doctor.fullName) {
          doctorName = doctor.fullName;
        } else if (doctor.firstName && doctor.lastName) {
          doctorName = `${doctor.firstName} ${doctor.lastName}`;
        } else if (doctor.id) {
          doctorName = `Doctor ${doctor.id}`;
        }
        
        const doctorAppointments = filteredAppointments.filter(apt => apt.doctorId === doctor.id || apt.doctorId === doctor.userId);
        const completedAppointments = doctorAppointments.filter(apt => apt.status === 'completed');
        
        // Calculate completion rate for on-time rate
        const totalAppointments = doctorAppointments.length;
        const completionRate = totalAppointments > 0 
          ? Math.round((completedAppointments.length / totalAppointments) * 100) 
          : 94; // Default to 94% like web version
        
        return {
          doctorName,
          patientsServed: completedAppointments.length,
          avgConsultTime: `${doctor.consultationDuration || 30} min`,
          onTimeRate: `${completionRate}%`,
        };
      })
      .filter(doctor => doctor.doctorName && doctor.doctorName !== 'Unknown Doctor');
  }, [doctors, filteredAppointments]);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Icon size={20} color="#FFFFFF" />
      </View>
      <View style={styles.statContent}>
        <ThemedText style={styles.statValue}>{value}</ThemedText>
        <ThemedText style={styles.statTitle}>{title}</ThemedText>
      </View>
    </View>
  );

  const TabButton = ({ tab, label, icon: Icon }: any) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Icon size={16} color={activeTab === tab ? '#FFFFFF' : '#6B7280'} />
      <ThemedText style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <Menu />
          </TouchableOpacity>
          <View>
            <ThemedText style={styles.title}>Reports</ThemedText>
            <ThemedText style={styles.subtitle}>View clinic analytics and reports</ThemedText>
          </View>
        </View>
        {/* <TouchableOpacity 
          style={styles.downloadButton}
          onPress={handleDownload}
          disabled={loading}
        >
          <Download size={16} color="#FFFFFF" />
          <ThemedText style={styles.downloadButtonText}>Download</ThemedText>
        </TouchableOpacity> */}
      </View>

      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        currentPath="/admin-reports"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userName="Admin User"
        userRole="Administrator"
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Time Range Selector */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color="#059669" />
              <ThemedText style={styles.sectionTitle}>Time Range</ThemedText>
            </View>
            <TouchableOpacity 
              style={styles.pickerContainer}
              onPress={() => setShowTimeRangeDropdown(true)}
            >
              <ThemedText style={styles.pickerText}>
                {timeRangeOptions.find(opt => opt.value === timeRange)?.label}
              </ThemedText>
              <ThemedText style={styles.pickerArrow}>▼</ThemedText>
            </TouchableOpacity>
          </View>


          {/* Statistics Cards */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BarChart3 size={20} color="#059669" />
              <ThemedText style={styles.sectionTitle}>Overview Statistics</ThemedText>
            </View>
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Appointments"
                value={stats.totalAppointments}
                icon={Calendar}
                color="#3B82F6"
              />
              <StatCard
                title="Today's Appointments"
                value={stats.todayAppointments}
                icon={Clock}
                color="#10B981"
              />
              <StatCard
                title="Completed"
                value={stats.completedAppointments}
                icon={TrendingUp}
                color="#059669"
              />
              <StatCard
                title="Pending"
                value={stats.pendingAppointments}
                icon={Users}
                color="#F59E0B"
              />
              <StatCard
                title="Total Doctors"
                value={stats.totalDoctors}
                icon={Users}
                color="#8B5CF6"
              />
              <StatCard
                title="Active Doctors"
                value={stats.activeDoctors}
                icon={TrendingUp}
                color="#EF4444"
              />
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.section}>
            <View style={styles.tabsContainer}>
              <TabButton tab="appointments" label="Appointments" icon={Calendar} />
              <TabButton tab="queue" label="Queue" icon={Users} />
              <TabButton tab="doctor" label="Doctors" icon={TrendingUp} />
            </View>
          </View>

          {/* Tab Content */}
          <View style={styles.section}>
            {activeTab === 'appointments' && (
              <AppointmentTrendsChart data={appointmentData} />
            )}

            {activeTab === 'queue' && (
              <WaitTimeChart data={waitTimeData} />
            )}

            {activeTab === 'doctor' && (
              <View>
                {doctorPerformance.length > 0 ? (
                  <>
                    <View style={styles.sectionHeader}>
                      <TrendingUp size={20} color="#059669" />
                      <ThemedText style={styles.sectionTitle}>Doctor Performance</ThemedText>
                    </View>
                    <View style={styles.doctorCardsContainer}>
                      {doctorPerformance.map((doctor, index) => (
                        <DoctorPerformanceCard key={`doctor-${index}`} {...doctor} />
                      ))}
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyState}>
                    <Users size={48} color="#6B7280" />
                    <ThemedText style={styles.emptyStateText}>
                      No doctor performance data available for this period
                    </ThemedText>
                    {doctors.length > 0 && (
                      <ThemedText style={[styles.emptyStateText, { fontSize: 12, marginTop: 8 }]}>
                        Total doctors in system: {doctors.length}
                      </ThemedText>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Time Range Modal */}
      <Modal
        visible={showTimeRangeDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimeRangeDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimeRangeDropdown(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Time Range</ThemedText>
            </View>
            {timeRangeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  timeRange === option.value && styles.modalOptionSelected
                ]}
                onPress={() => handleTimeRangeSelect(option.value as any)}
              >
                <ThemedText style={[
                  styles.modalOptionText,
                  timeRange === option.value && styles.modalOptionTextSelected
                ]}>
                  {option.label}
                </ThemedText>
                {timeRange === option.value && (
                  <ThemedText style={styles.modalCheck}>✓</ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    marginTop: 4,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 50,
  },
  pickerText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  pickerArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#059669',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionSelected: {
    backgroundColor: '#F0FDF4',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#111827',
  },
  modalOptionTextSelected: {
    color: '#059669',
    fontWeight: '600',
  },
  modalCheck: {
    fontSize: 18,
    color: '#059669',
    fontWeight: '600',
  },
  doctorCardsContainer: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
});