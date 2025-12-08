import { AdminSidebar } from '@/components/AdminSidebar';
import AppointmentTrendsChart, { AppointmentData } from '@/components/charts/AppointmentTrendsChart';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getCurrentUser } from '@/lib/firebase/auth';
import { getDocument, getDocuments } from '@/lib/firebase/firestore';
import { useRouter } from 'expo-router';
import { AlertCircle, Calendar, Clock, TrendingUp, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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

type TimeRange = 'today' | 'thisWeek' | 'thisMonth';

export default function AdminReports() {
  const router = useRouter();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('thisWeek');
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [assistants, setAssistants] = useState<any[]>([]);
  const [queueData, setQueueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentUser = getCurrentUser();
        if (currentUser) {
          // Load user profile from Firestore to get role
          const userResult = await getDocument('users', currentUser.uid);
          if (userResult.success && userResult.data) {
            const userData = userResult.data as any;
            setUser(userData);
          } else {
            // Fallback to Firebase user if Firestore data not found
            setUser({
              name: currentUser.displayName || 'Admin User',
              email: currentUser.email || '',
              role: 'admin'
            });
          }
          
          // Load appointments
          const appointmentsResult = await getDocuments('appointments');
          if (appointmentsResult.success && appointmentsResult.data) {
            setAppointments(appointmentsResult.data);
          }
          
          // Load assistants (for assistant role filtering)
          const assistantsResult = await getDocuments('assistants');
          if (assistantsResult.success && assistantsResult.data) {
            setAssistants(assistantsResult.data);
          }
          
          // Load queue data for wait time stats
          const queueResult = await getDocuments('queue');
          if (queueResult.success && queueResult.data) {
            setQueueData(queueResult.data);
          }
        } else {
          router.push('/auth-login');
        }
      } catch (error) {
        console.error('Error loading reports data:', error);
        setError('Failed to load reports data');
        Alert.alert('Error', 'Failed to load reports data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      // Wait a moment for auth state to clear before navigating
      setTimeout(() => {
        router.replace('/auth-login');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  const handleNavigate = (path: string) => router.push(path as any);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Filter data based on user role (matching web version)
  const getFilteredAppointments = () => {
    if (!user) return appointments;
    
    if (user.role === 'doctor') {
      // Doctor sees only their own appointments
      return appointments.filter(apt => apt.doctorId === user.id || apt.doctorId === user.uid);
    } else if (user.role === 'assistant') {
      // Assistant sees appointments for their assigned doctors
      const assistant = assistants.find(a => a.userId === user.id || a.userId === user.uid);
      if (assistant && assistant.assignedDoctors) {
        return appointments.filter(apt => assistant.assignedDoctors.includes(apt.doctorId));
      }
      return []; // No assigned doctors
    }
    
    // Admin sees all appointments
    return appointments;
  };

  // Get date range based on time range selection
  const getDateRange = (range: TimeRange) => {
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
  const filterAppointmentsByDateRange = (appointments: any[], range: TimeRange) => {
    const { start, end } = getDateRange(range);
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate >= start && appointmentDate <= end;
    });
  };

  // Filter appointments based on selected time range and user role
  const filteredAppointments = filterAppointmentsByDateRange(getFilteredAppointments(), timeRange);

  // Calculate queue stats for average wait time
  const calculateQueueStats = () => {
    if (!queueData || queueData.length === 0) {
      return { avgWaitTime: '0 min' };
    }

    const filteredQueue = queueData.filter((item: any) => {
      if (!item.createdAt || !item.servedAt) return false;
      const createdDate = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
      const { start, end } = getDateRange(timeRange);
      return createdDate >= start && createdDate <= end;
    });

    if (filteredQueue.length === 0) {
      return { avgWaitTime: '0 min' };
    }

    const waitTimes = filteredQueue
      .map((item: any) => {
        const created = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        const served = item.servedAt.toDate ? item.servedAt.toDate() : new Date(item.servedAt);
        return Math.max(0, Math.round((served.getTime() - created.getTime()) / (1000 * 60))); // minutes
      })
      .filter((time: number) => !isNaN(time) && time >= 0);

    if (waitTimes.length === 0) {
      return { avgWaitTime: '0 min' };
    }

    const avgWait = Math.round(waitTimes.reduce((a: number, b: number) => a + b, 0) / waitTimes.length);
    return { avgWaitTime: `${avgWait} min` };
  };

  const queueStats = calculateQueueStats();

  // Calculate statistics based on filtered data (matching web version)
  const totalAppointments = filteredAppointments.length;
  const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed').length;
  const noShowAppointments = filteredAppointments.filter(apt => apt.status === 'no_show').length;
  const noShowRate = totalAppointments > 0 ? ((noShowAppointments / totalAppointments) * 100).toFixed(1) : '0.0';

  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
  ];

  const handleTimeRangeSelect = (range: TimeRange) => {
    setTimeRange(range);
    setShowTimeRangeDropdown(false);
  };

  const getTimeRangeLabel = () => {
    return timeRangeOptions.find(opt => opt.value === timeRange)?.label || 'This Week';
  };

  // Generate appointment chart data based on time range (matching web version)
  const generateAppointmentChartData = (): AppointmentData[] => {
    const { start, end } = getDateRange(timeRange);
    const data: AppointmentData[] = [];
    
    if (timeRange === 'today') {
      // For today, show hourly data (9 AM to 5 PM)
      for (let hour = 9; hour <= 17; hour++) {
        const hourStart = new Date(start);
        hourStart.setHours(hour, 0, 0, 0);
        const hourEnd = new Date(start);
        hourEnd.setHours(hour + 1, 0, 0, 0);
        
        const hourAppointments = filteredAppointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          // Check if appointment date matches today
          if (aptDate.toDateString() !== start.toDateString()) {
            return false;
          }
          
          // If appointmentTime exists, use it; otherwise use appointment date hour
          if (apt.appointmentTime) {
            const aptHour = parseInt(apt.appointmentTime.split(':')[0]);
            return aptHour === hour;
          }
          
          return aptDate.getHours() === hour;
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
        const dayStart = new Date(current);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(current);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayAppointments = filteredAppointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= dayStart && aptDate <= dayEnd;
        });
        
        const dayLabel = timeRange === 'thisMonth' 
          ? `${current.getDate()}/${current.getMonth() + 1}` // Show day/month for month view
          : days[current.getDay()]; // Show day name for week view
        
        data.push({
          day: dayLabel,
          total: dayAppointments.length,
          completed: dayAppointments.filter(apt => apt.status === 'completed').length,
          cancelled: dayAppointments.filter(apt => apt.status === 'cancelled').length,
        });
        
        current.setDate(current.getDate() + 1);
      }
    }
    
    return data;
  };

  const appointmentChartData = generateAppointmentChartData();

  const StatCard = ({ title, value, icon: Icon, iconBgColor }: any) => {
    const bgColorMap: { [key: string]: string } = {
      'bg-cyan-50': '#ECFEFF',
      'bg-yellow-50': '#FEFCE8',
      'bg-green-50': '#F0FDF4',
      'bg-red-50': '#FEF2F2',
    };
    const iconColorMap: { [key: string]: string } = {
      'bg-cyan-50': '#06B6D4',
      'bg-yellow-50': '#EAB308',
      'bg-green-50': '#22C55E',
      'bg-red-50': '#EF4444',
    };
    
    const bgColor = bgColorMap[iconBgColor] || '#ECFEFF';
    const iconColor = iconColorMap[iconBgColor] || '#06B6D4';
    
    return (
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: bgColor }]}>
          <Icon size={20} color={iconColor} />
        </View>
        <View style={styles.statContent}>
          <ThemedText style={styles.statValue}>{value}</ThemedText>
          <ThemedText style={styles.statTitle}>{title}</ThemedText>
        </View>
      </View>
    );
  };

  // Stats data matching web version
  const statsData = [
    {
      title: 'Total Appointments',
      value: totalAppointments.toString(),
      icon: Calendar,
      iconBgColor: 'bg-cyan-50',
    },
    {
      title: 'Avg Wait Time',
      value: queueStats?.avgWaitTime || '0 min',
      icon: Clock,
      iconBgColor: 'bg-yellow-50',
    },
    {
      title: 'Patients Served',
      value: completedAppointments.toString(),
      icon: Users,
      iconBgColor: 'bg-green-50',
    },
    {
      title: 'No-Show Rate',
      value: `${noShowRate}%`,
      icon: TrendingUp,
      iconBgColor: 'bg-red-50',
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <ThemedText style={styles.loadingText}>Loading reports...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <Menu />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <ThemedText style={styles.title}>
              {user?.role === 'doctor' 
                ? 'Your Reports' 
                : user?.role === 'assistant'
                ? 'Assigned Doctors Reports'
                : 'Reports'
              }
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {user?.role === 'doctor' 
                ? 'Analytics and insights for your practice' 
                : user?.role === 'assistant'
                ? 'Analytics and insights for your assigned doctors'
                : 'Analytics and insights for clinic operations'
              }
            </ThemedText>
            {/* User context indicator */}
            {user && (
              <View style={styles.roleBadge}>
                <ThemedText style={styles.roleBadgeText}>
                  {user.role === 'doctor' && '👨‍⚕️ Doctor View'}
                  {user.role === 'assistant' && '👩‍💼 Assistant View'}
                  {user.role === 'admin' && '👨‍💼 Admin View'}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
        {/* Time Range Selector in Header */}
        <TouchableOpacity 
          style={styles.headerTimeRangeButton}
          onPress={() => setShowTimeRangeDropdown(true)}
        >
          <ThemedText style={styles.headerTimeRangeText}>
            {getTimeRangeLabel()}
          </ThemedText>
          <ThemedText style={styles.headerTimeRangeArrow}>▼</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        currentPath="/admin-reports"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userName={user?.name || 'Admin User'}
        userRole={user?.role || 'Administrator'}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color="#DC2626" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          {/* Statistics Cards */}
          <View style={styles.section}>
            <View style={styles.statsGrid}>
              {statsData.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </View>
          </View>

          {/* Appointment Trends Chart */}
          <View style={styles.section}>
            <AppointmentTrendsChart data={appointmentChartData} />
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
          <View 
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
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
                onPress={() => handleTimeRangeSelect(option.value as TimeRange)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
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
  headerTextContainer: {
    flex: 1,
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
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#CCFBF1',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#065F46',
  },
  headerTimeRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
    marginTop: 4,
  },
  headerTimeRangeText: {
    fontSize: 14,
    color: '#1F2937',
    marginRight: 6,
  },
  headerTimeRangeArrow: {
    fontSize: 10,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#991B1B',
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
});