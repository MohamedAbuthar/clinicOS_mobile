import PatientLayout from '@/components/PatientLayout';
import { ThemedText } from '@/components/themed-text';
import { useBackendPatientAuth } from '@/lib/contexts/BackendPatientAuthContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

// Type definitions
interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  appointmentDate: any;
  appointmentTime: string;
  status: string;
  tokenNumber: string;
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

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


// Patient Stats Card Component
const PatientStatsCard = ({ title, value, subtitle, icon: Icon, variant = 'default' }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType;
  variant?: 'primary' | 'default';
}) => (
  <View style={[styles.statsCard, variant === 'primary' && styles.primaryStatsCard]}>
    <View style={[styles.statsIcon, variant === 'primary' && styles.primaryStatsIcon]}>
      <Icon />
    </View>
    <View style={styles.statsContent}>
      <ThemedText style={[styles.statsValue, variant === 'primary' && styles.primaryStatsValue]}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.statsTitle, variant === 'primary' && styles.primaryStatsTitle]}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.statsSubtitle, variant === 'primary' && styles.primaryStatsSubtitle]}>
        {subtitle}
      </ThemedText>
    </View>
  </View>
);

// Dashboard Section Component
const DashboardSection = ({ title, action, children }: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <View style={styles.dashboardSection}>
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {action}
    </View>
    {children}
  </View>
);

// Appointment Card Component
const AppointmentCard = ({ appointment, onViewDetails }: {
  appointment: any;
  onViewDetails: (appointment: any) => void;
}) => (
  <TouchableOpacity
    style={styles.appointmentCard}
    onPress={() => onViewDetails(appointment)}
  >
    <View style={styles.appointmentHeader}>
      <View style={styles.appointmentInfo}>
        <ThemedText style={styles.appointmentDoctor}>{appointment.doctorName}</ThemedText>
        <ThemedText style={styles.appointmentSpecialty}>{appointment.doctorSpecialty}</ThemedText>
      </View>
      <View style={styles.appointmentStatus}>
        <ThemedText style={styles.appointmentDate}>{appointment.appointmentDate}</ThemedText>
        <ThemedText style={styles.appointmentTime}>{appointment.appointmentTime}</ThemedText>
      </View>
    </View>
    <View style={styles.appointmentFooter}>
      <ThemedText style={styles.appointmentToken}>Token: #{Number(String(appointment.tokenNumber).replace(/^#/, '').replace(/^0+/, '')) || 0}</ThemedText>
      <ChevronRight />
    </View>
  </TouchableOpacity>
);

// Recent Visit Card Component
const RecentVisitCard = ({ visit, onViewReport }: {
  visit: any;
  onViewReport: (visit: any) => void;
}) => (
  <TouchableOpacity
    style={styles.visitCard}
    onPress={() => onViewReport(visit)}
  >
    <View style={styles.visitHeader}>
      <ThemedText style={styles.visitDoctor}>{visit.doctor}</ThemedText>
      <ThemedText style={styles.visitDate}>{visit.date}</ThemedText>
    </View>
    <ThemedText style={styles.visitReason}>{visit.reason}</ThemedText>
    <View style={styles.visitFooter}>
      <ThemedText style={styles.visitAction}>View Report</ThemedText>
      <ChevronRight />
    </View>
  </TouchableOpacity>
);

function PatientDashboardContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useBackendPatientAuth();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasRedirected, setHasRedirected] = useState(false);


  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Check if patient is authenticated
        if (isAuthenticated) {
          console.log('✅ Patient authenticated, loading dashboard data');
          
          // For now, we'll show empty data since we don't have patient ID from OTP auth
          // In a real implementation, you'd need to store patient info after OTP verification
          const stats: any = {
            totalAppointments: 0,
            upcomingAppointments: 0,
            completedAppointments: 0,
            cancelledAppointments: 0,
            recentVisits: []
          };

          setDashboardStats(stats);
          setUpcomingAppointments([]);
          setRecentVisits([]);
        } else {
          // No patient authenticated, redirect to login
          console.log('❌ No patient authenticated, redirecting to login');
          router.push('/patient-auth');
        }
      } catch (error: any) {
        console.error('Error loading dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    // Only load data if authentication is not loading
    if (!authLoading) {
      loadDashboardData();
    }
  }, [isAuthenticated, authLoading]);

  // Redirect to login if not authenticated - with debouncing
  useEffect(() => {
    console.log('🔍 Dashboard auth check:', { 
      isAuthenticated, 
      authLoading
    });
    
    // Only redirect if auth is fully loaded and user is definitely not authenticated
    if (!authLoading && !isAuthenticated && !hasRedirected) {
      console.log('❌ Not authenticated after loading, redirecting to login');
      setHasRedirected(true);
      // Use a longer timeout to prevent rapid redirects
      const timer = setTimeout(() => {
        router.replace('/patient-auth');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading, router, hasRedirected]);
  

  const handleBookNew = () => {
    router.push('/patient-book');
  };

  const handleViewAppointmentDetails = (appointment: any) => {
    router.push(`/patient-appointments?id=${appointment.id}`);
  };

  const handleViewReport = (visit: any) => {
    router.push(`/patient-medicalrecords?id=${visit.id}`);
  };

  // Show loading while checking authentication or loading data
  if (authLoading || isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>
            {authLoading ? 'Checking authentication...' : 'Loading dashboard...'}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Redirecting to login...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const defaultStats = {
    nextAppointment: dashboardStats?.nextAppointment ? {
      date: dashboardStats.nextAppointment.appointmentDate,
      time: dashboardStats.nextAppointment.appointmentTime
    } : {
      date: 'No upcoming',
      time: 'appointments'
    },
    totalVisits: {
      count: dashboardStats?.completedAppointments || 0,
      period: 'Total visits'
    },
    pendingReports: {
      count: 0,
      status: 'No pending reports'
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <PatientStatsCard
            title="Next Appointment"
            value={defaultStats.nextAppointment.date}
            subtitle={defaultStats.nextAppointment.time}
            icon={Calendar}
            variant="primary"
          />
          <PatientStatsCard
            title="Total Visits"
            value={defaultStats.totalVisits.count}
            subtitle={defaultStats.totalVisits.period}
            icon={User}
          />
        </View>

        {/* Upcoming Appointments Section */}
        <DashboardSection
          title="Upcoming Appointments"
          action={
            <TouchableOpacity
              style={styles.bookButton}
              onPress={handleBookNew}
            >
              <Plus />
              <ThemedText style={styles.bookButtonText}>Book New</ThemedText>
            </TouchableOpacity>
          }
        >
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
              <ThemedText style={styles.emptyText}>
                No upcoming appointments
              </ThemedText>
            )}
          </View>
        </DashboardSection>

        {/* Recent Visits Section */}
        <DashboardSection title="Recent Visits">
          <View style={styles.visitsContainer}>
            {recentVisits.length > 0 ? (
              recentVisits.map((visit) => (
                <RecentVisitCard
                  key={visit.id}
                  visit={visit}
                  onViewReport={handleViewReport}
                />
              ))
            ) : (
              <ThemedText style={styles.emptyText}>
                No recent visits
              </ThemedText>
            )}
          </View>
        </DashboardSection>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function PatientDashboard() {
  return (
    <PatientLayout>
      <PatientDashboardContent />
    </PatientLayout>
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
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 70,
  },
  primaryStatsCard: {
    backgroundColor: '#14B8A6',
  },
  statsIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  primaryStatsIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsContent: {
    flex: 1,
    justifyContent: 'center',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 20,
  },
  primaryStatsValue: {
    color: '#FFFFFF',
  },
  statsTitle: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 12,
  },
  primaryStatsTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsSubtitle: {
    fontSize: 8,
    color: '#9CA3AF',
    marginTop: 1,
    lineHeight: 10,
  },
  primaryStatsSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  dashboardSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  bookButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  appointmentsContainer: {
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  appointmentSpecialty: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  appointmentStatus: {
    alignItems: 'flex-end',
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  appointmentTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentToken: {
    fontSize: 12,
    color: '#14B8A6',
    fontWeight: '500',
  },
  visitsContainer: {
    gap: 12,
  },
  visitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitDoctor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  visitDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  visitReason: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  visitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visitAction: {
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    paddingVertical: 32,
  },
});