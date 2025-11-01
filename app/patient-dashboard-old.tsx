import { ThemedText } from '@/components/themed-text';
import { getCurrentUser, signOutUser } from '@/lib/firebase/auth';
import { getAppointmentsByPatient } from '@/lib/firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

// Custom SVG Components
const Calendar = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
      stroke="#14B8A6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const User = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronRight = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18L15 12L9 6"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Plus = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5V19M5 12H19"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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
      d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FileText = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 2V8H20M16 13H8M16 17H8M10 9H8"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  tokenNumber?: string;
}

interface RecentVisit {
  id: string;
  doctor: string;
  reason: string;
  date: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patientName] = useState('Ramesh');
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    nextAppointment: {
      date: 'Dec 15, 2024',
      time: '10:30 AM',
    },
    totalVisits: {
      count: 8,
      period: 'Total visits',
    },
    pendingReports: {
      count: 0,
      status: 'No pending reports',
    },
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([
    {
      id: '1',
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialty: 'Cardiology',
      appointmentDate: '2024-12-15',
      appointmentTime: '10:30 AM',
      status: 'scheduled',
      tokenNumber: '15',
    },
    {
      id: '2',
      doctorName: 'Dr. Michael Chen',
      doctorSpecialty: 'Dermatology',
      appointmentDate: '2024-12-20',
      appointmentTime: '2:00 PM',
      status: 'confirmed',
      tokenNumber: '8',
    },
  ]);
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([
    {
      id: '1',
      doctor: 'Dr. Emily Davis',
      reason: 'Regular checkup completed',
      date: '2024-11-28',
    },
    {
      id: '2',
      doctor: 'Dr. John Smith',
      reason: 'Blood test results review',
      date: '2024-11-15',
    },
    {
      id: '3',
      doctor: 'Dr. Sarah Johnson',
      reason: 'Cardiology consultation',
      date: '2024-11-01',
    },
  ]);

  // Load user data and appointments on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Load appointments for this patient
          const appointmentsResult = await getAppointmentsByPatient(currentUser.uid);
          if (appointmentsResult.success) {
            setAppointments(appointmentsResult.data);
            // Convert to the format expected by the UI
            const formattedAppointments = appointmentsResult.data.map((apt: any) => ({
              id: apt.id,
              doctorName: apt.doctorName || 'Dr. Unknown',
              doctorSpecialty: apt.specialty || 'General',
              appointmentDate: apt.appointmentDate ? new Date(apt.appointmentDate.seconds * 1000).toISOString().split('T')[0] : '2024-12-15',
              appointmentTime: apt.appointmentTime || '10:30 AM',
              status: apt.status || 'scheduled',
              tokenNumber: apt.tokenNumber || '1',
            }));
            setUpcomingAppointments(formattedAppointments);
          }
        } else {
          // No user logged in, redirect to login
          router.push('/patient-auth');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const result = await signOutUser();
      if (result.success) {
        router.push('/patient-login');
      } else {
        Alert.alert('Error', 'Failed to logout');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleBookNew = () => {
    console.log('Book new appointment');
    // Navigation logic here
  };

  const handleViewAppointmentDetails = (appointment: Appointment) => {
    console.log('View appointment details:', appointment.id);
    // Navigation logic here
  };

  const handleViewReport = (visit: RecentVisit) => {
    console.log('View report for visit:', visit.id);
    // Navigation logic here
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
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
            <ThemedText style={styles.title}>
              Welcome back, {patientName}!
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Manage your appointments and health records
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Sidebar */}
      <PatientSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        currentPath="/patient-dashboard"
        onNavigate={handleNavigate}
        userName={patientName}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <StatCard
              title="Next Appointment"
              value={dashboardStats.nextAppointment.date}
              icon={Calendar}
              variant="primary"
            />
            <StatCard
              title="Total Visits"
              value={dashboardStats.totalVisits.count}
              icon={User}
              variant="secondary"
            />
            <StatCard
              title="Pending Reports"
              value={dashboardStats.pendingReports.count}
              icon={ChevronRight}
              variant="secondary"
            />
          </View>

          {/* Upcoming Appointments Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Upcoming Appointments</ThemedText>
              <TouchableOpacity style={styles.bookButton} onPress={handleBookNew}>
                <Plus />
                <ThemedText style={styles.bookButtonText}>Book New</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.appointmentsContainer}>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onViewDetails={handleViewAppointmentDetails}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <ThemedText style={styles.emptyStateText}>No upcoming appointments</ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Recent Visits Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Recent Visits</ThemedText>
            <View style={styles.visitsContainer}>
              {recentVisits.length > 0 ? (
                recentVisits.map((visit) => (
                  <TouchableOpacity
                    key={visit.id}
                    style={styles.visitCard}
                    onPress={() => handleViewReport(visit)}
                  >
                    <View style={styles.visitHeader}>
                      <View style={styles.visitInfo}>
                        <ThemedText style={styles.visitDoctor}>{visit.doctor}</ThemedText>
                        <ThemedText style={styles.visitReason}>{visit.reason}</ThemedText>
                      </View>
                      <View style={styles.visitDateContainer}>
                        <Clock />
                        <ThemedText style={styles.visitDate}>{formatDate(visit.date)}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.visitFooter}>
                      <View style={styles.reportContainer}>
                        <FileText />
                        <ThemedText style={styles.reportText}>View Report</ThemedText>
                      </View>
                      <ChevronRight />
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <ThemedText style={styles.emptyStateText}>No recent visits</ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  appointmentsContainer: {
    gap: 12,
  },
  visitsContainer: {
    gap: 12,
  },
  visitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  visitInfo: {
    flex: 1,
  },
  visitDoctor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  visitReason: {
    fontSize: 14,
    color: '#6B7280',
  },
  visitDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  visitDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  visitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  reportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportText: {
    fontSize: 14,
    color: '#14B8A6',
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
  },
});
