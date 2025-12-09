import { AdminSidebar } from '@/components/AdminSidebar';
import EmergencyAppointmentModal from '@/components/EmergencyAppointmentModal';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAppointmentsByDoctorAndDate, getDocuments } from '@/lib/firebase/firestore';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

// Custom SVG Components
const Calendar = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
      stroke="#2563EB"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Users = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
      stroke="#D97706"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Stethoscope = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 8C6 5.79086 7.79086 4 10 4C12.2091 4 14 5.79086 14 8C14 8.55228 13.5523 9 13 9H11C10.4477 9 10 8.55228 10 8C10 7.44772 10.4477 7 11 7H13C13.5523 7 14 6.55228 14 6C14 4.89543 13.1046 4 12 4C10.8954 4 10 4.89543 10 6V8C10 8.55228 9.55228 9 9 9H7C6.44772 9 6 8.55228 6 8Z"
      stroke="#059669"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 8V12C6 13.1046 6.89543 14 8 14H16C17.1046 14 18 13.1046 18 12V8"
      stroke="#059669"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UserX = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M8.5 7C8.5 9.20914 6.70914 11 4.5 11C2.29086 11 0.5 9.20914 0.5 7C0.5 4.79086 2.29086 3 4.5 3C6.70914 3 8.5 4.79086 8.5 7ZM23 21L16 14M16 14L23 7M16 14H23"
      stroke="#DC2626"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AlertCircle = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
      stroke="#EF4444"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Loader2 = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
      stroke="#6B7280"
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
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Stat Card Component
const StatCard = ({ title, value, icon, iconBgColor }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBgColor: string;
}) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: iconBgColor }]}>
      {icon}
    </View>
    <View style={styles.statContent}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statTitle}>{title}</ThemedText>
    </View>
  </View>
);

// Queue Table Component
const QueueTable = ({ doctors, onViewQueue }: {
  doctors: any[];
  onViewQueue: (doctor: any) => void;
}) => (
  <View style={styles.queueTable}>
    <ThemedText style={styles.queueTableTitle}>Doctor Queues</ThemedText>
    <View style={styles.queueTableHeader}>
      <ThemedText style={styles.queueTableHeaderText}>Doctor</ThemedText>
      <ThemedText style={styles.queueTableHeaderText}>Status</ThemedText>
      <ThemedText style={styles.queueTableHeaderText}>Queue</ThemedText>
      <ThemedText style={styles.queueTableHeaderText}>Action</ThemedText>
    </View>
    {doctors.map((doctor) => (
      <View key={doctor.id} style={styles.queueTableRow}>
        <View style={styles.queueTableCell}>
          <ThemedText style={styles.queueTableCellText}>{doctor.name}</ThemedText>
          <ThemedText style={styles.queueTableCellSubtext}>{doctor.specialty}</ThemedText>
        </View>
        <View style={styles.queueTableCell}>
          <View style={[styles.statusBadge, doctor.status === 'Active' ? styles.activeBadge : styles.inactiveBadge]}>
            <ThemedText style={[styles.statusText, doctor.status === 'Active' ? styles.activeText : styles.inactiveText]}>
              {doctor.status}
            </ThemedText>
          </View>
        </View>
        <View style={styles.queueTableCell}>
          <ThemedText style={styles.queueTableCellText}>{doctor.queueLength}</ThemedText>
        </View>
        <View style={styles.queueTableCell}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => onViewQueue(doctor)}
          >
            <ThemedText style={styles.viewButtonText}>View</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    ))}
  </View>
);

// Alert Item Component
const AlertItem = ({ alert }: { alert: any }) => (
  <View style={styles.alertItem}>
    <View style={[styles.alertIcon, alert.type === 'success' ? styles.successAlert : styles.infoAlert]}>
      <ThemedText style={styles.alertIconText}>!</ThemedText>
    </View>
    <View style={styles.alertContent}>
      <ThemedText style={styles.alertMessage}>{alert.message}</ThemedText>
      <ThemedText style={styles.alertTimestamp}>{alert.timestamp}</ThemedText>
    </View>
  </View>
);

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    appointmentsToday: 0,
    patientsWaiting: 0,
    doctorsActive: 0,
    noShows: 0,
  });
  const [doctors, setDoctors] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Navigation handlers
  const handleNavigate = (path: string) => {
    setSidebarOpen(false);
    router.push(path as any);
  };

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (!authLoading && !isAuthenticated) {
          router.replace('/auth-login');
          return;
        }

        if (user) {

          console.log('Admin Dashboard - User:', user, 'Role:', user.role);

          // Load appointments for today
          const appointmentsResult = await getDocuments('appointments', [
            where('appointmentDate', '==', new Date().toISOString().split('T')[0])
          ]);

          // Load doctors
          const doctorsResult = await getDocuments('doctors');

          // Load assistants (needed for assistant role filtering)
          const assistantsResult = await getDocuments('assistants');

          console.log('Admin Dashboard - Appointments Result:', appointmentsResult);
          console.log('Admin Dashboard - Doctors Result:', doctorsResult);

          // Use data if available, otherwise use fallback
          let appointments = (appointmentsResult.success && appointmentsResult.data) ? appointmentsResult.data : [];
          const doctorsData = (doctorsResult.success && doctorsResult.data) ? doctorsResult.data : [];
          const assistantsData = (assistantsResult.success && assistantsResult.data) ? assistantsResult.data : [];

          // Apply role-based filtering to doctors
          let filteredDoctors = doctorsData;
          if (user.role === 'doctor') {
            // Doctor sees only themselves
            filteredDoctors = doctorsData.filter((doctor: any) => doctor.userId === user.id);
            console.log('Doctor role - Filtered doctors:', filteredDoctors);
          } else if (user.role === 'assistant') {
            // Assistant sees only their assigned doctors
            const assistant = assistantsData.find((a: any) => a.userId === user.id);
            if (assistant && (assistant as any).assignedDoctors) {
              filteredDoctors = doctorsData.filter((doctor: any) =>
                (assistant as any).assignedDoctors.includes(doctor.id)
              );
              console.log('Assistant role - Assigned doctors:', (assistant as any).assignedDoctors);
              console.log('Assistant role - Filtered doctors:', filteredDoctors);
            } else {
              filteredDoctors = []; // No assigned doctors
              console.log('Assistant role - No assigned doctors found');
            }
          }
          // Admin sees all doctors (no filtering)

          // Apply role-based filtering to appointments
          if (user.role === 'doctor') {
            // Doctor sees only their own appointments
            const doctorRecord = doctorsData.find((d: any) => d.userId === user.id);
            if (doctorRecord) {
              appointments = appointments.filter((apt: any) => apt.doctorId === doctorRecord.id);
            } else {
              appointments = [];
            }
          } else if (user.role === 'assistant') {
            // Assistant sees appointments for their assigned doctors
            const assistant = assistantsData.find((a: any) => a.userId === user.id);
            if (assistant && (assistant as any).assignedDoctors) {
              appointments = appointments.filter((apt: any) =>
                (assistant as any).assignedDoctors.includes(apt.doctorId)
              );
            } else {
              appointments = []; // No assigned doctors
            }
          }
          // Admin sees all appointments (no filtering)

          if (appointments.length >= 0 && filteredDoctors.length >= 0) {

            // Calculate dashboard metrics
            const appointmentsToday = appointments.length;
            const patientsWaiting = appointments.filter((apt: any) =>
              apt.status === 'scheduled' || apt.status === 'confirmed'
            ).length;
            const doctorsActive = filteredDoctors.filter((doctor: any) =>
              doctor.status === 'In'
            ).length;
            const noShows = appointments.filter((apt: any) =>
              apt.status === 'no_show'
            ).length;

            setDashboardData({
              appointmentsToday,
              patientsWaiting,
              doctorsActive,
              noShows,
            });

            // Calculate queue length for each doctor
            const today = new Date().toISOString().split('T')[0];
            const transformedDoctors = await Promise.all(
              filteredDoctors.map(async (doctor: any) => {
                // Get appointments for this doctor for today
                let queueLength = 0;
                try {
                  const doctorAppointmentsResult = await getAppointmentsByDoctorAndDate(doctor.id, today);
                  if (doctorAppointmentsResult.success && doctorAppointmentsResult.data) {
                    // Filter out completed and cancelled appointments
                    const queueAppointments = doctorAppointmentsResult.data.filter((apt: any) =>
                      apt.status !== 'completed' && apt.status !== 'cancelled'
                    );
                    queueLength = queueAppointments.length;
                  }
                } catch (error) {
                  console.error(`Error fetching queue for doctor ${doctor.id}:`, error);
                }

                return {
                  id: doctor.id,
                  name: doctor.user?.name || doctor.name || 'Unknown Doctor',
                  specialty: doctor.specialty || 'General',
                  currentToken: null,
                  queueLength: queueLength,
                  estimatedLastPatient: null,
                  status: doctor.status === 'In' ? 'Active' : 'Break'
                };
              })
            );

            // If no doctors data, use fallback data matching web app
            if (transformedDoctors.length === 0 || transformedDoctors.every(d => d.name === 'Unknown Doctor')) {
              const fallbackDoctors = [
                {
                  id: '1',
                  name: 'haseeb...',
                  specialty: 'dev',
                  currentToken: null,
                  queueLength: 0,
                  estimatedLastPatient: null,
                  status: 'Break'
                },
                {
                  id: '2',
                  name: 'test',
                  specialty: 'sdfgh',
                  currentToken: null,
                  queueLength: 0,
                  estimatedLastPatient: null,
                  status: 'Active'
                },
                {
                  id: '3',
                  name: 'mydeen',
                  specialty: 'dev',
                  currentToken: null,
                  queueLength: 0,
                  estimatedLastPatient: null,
                  status: 'Break'
                },
                {
                  id: '4',
                  name: 'mydeen',
                  specialty: 'dev',
                  currentToken: null,
                  queueLength: 0,
                  estimatedLastPatient: null,
                  status: 'Break'
                },
                {
                  id: '5',
                  name: 'Mohamed Abuthar',
                  specialty: 'tt',
                  currentToken: null,
                  queueLength: 0,
                  estimatedLastPatient: null,
                  status: 'Break'
                },
                {
                  id: '6',
                  name: 'Riya',
                  specialty: 'Cardiologist',
                  currentToken: null,
                  queueLength: 0,
                  estimatedLastPatient: null,
                  status: 'Active'
                }
              ];
              setDoctors(fallbackDoctors);
            } else {
              setDoctors(transformedDoctors);
            }

            // Generate sample alerts
            setAlerts([
              {
                id: '1',
                message: "System initialized successfully",
                timestamp: 'Just now',
                type: 'success'
              },
              {
                id: '2',
                message: `Loaded ${appointmentsToday} appointments for today`,
                timestamp: 'Just now',
                type: 'info'
              }
            ]);
          }
        } else {
          // No user logged in, redirect to login
          router.push('/auth-login');
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, isAuthenticated, authLoading, router]);


  const handleViewQueue = (doctor: any) => {
    // Navigate to queue details
    router.push(`/admin-queues?doctorId=${doctor.id}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Loader2 />
          <ThemedText style={styles.loadingText}>Loading dashboard...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <Menu />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>Dashboard</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Quick overview of today clinic operations</ThemedText>
          </View>

          {/* Emergency Button - Only for doctor, admin, assistant */}
          {user && (user.role === 'doctor' || user.role === 'admin' || user.role === 'assistant') && (
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => setShowEmergencyModal(true)}
            >
              <AlertCircle />
              <ThemedText style={styles.emergencyButtonText}>Emergency</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Appointments Today"
            value={dashboardData.appointmentsToday}
            icon={<Calendar />}
            iconBgColor="#DBEAFE"
          />
          <StatCard
            title="Patients Waiting"
            value={dashboardData.patientsWaiting}
            icon={<Users />}
            iconBgColor="#FEF3C7"
          />
          <StatCard
            title="Doctors Active"
            value={dashboardData.doctorsActive}
            icon={<Stethoscope />}
            iconBgColor="#D1FAE5"
          />
          <StatCard
            title="No-shows / Skipped"
            value={dashboardData.noShows}
            icon={<UserX />}
            iconBgColor="#FEE2E2"
          />
        </View>

        {/* Queue Table */}
        <View style={styles.queueSection}>
          <QueueTable doctors={doctors} onViewQueue={handleViewQueue} />
        </View>

        {/* Recent Alerts */}
        <View style={styles.alertsSection}>
          <ThemedText style={styles.alertsTitle}>Recent Alerts</ThemedText>
          <View style={styles.alertsContainer}>
            {alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </View>
        </View>
      </ScrollView>

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath="/admin-dashboard"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userName={user?.name || 'Admin User'}
        userRole={user?.role || 'Administrator'}
      />

      <EmergencyAppointmentModal
        visible={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        doctors={doctors}
        onAppointmentCreated={() => {
          // Ideally refresh dashboard data
          setShowEmergencyModal(false);
        }}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: '#DC2626',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  queueSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  queueTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  queueTableTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  queueTableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  queueTableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  queueTableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  queueTableCell: {
    flex: 1,
    justifyContent: 'center',
  },
  queueTableCellText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  queueTableCellSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeText: {
    color: '#059669',
  },
  inactiveText: {
    color: '#DC2626',
  },
  viewButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  alertsSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  alertsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  alertIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  successAlert: {
    backgroundColor: '#D1FAE5',
  },
  infoAlert: {
    backgroundColor: '#DBEAFE',
  },
  alertIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 2,
  },
  alertTimestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
});