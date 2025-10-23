import { AdminSidebar } from '@/components/AdminSidebar';
import { ThemedText } from '@/components/themed-text';
import { getCurrentUser } from '@/lib/firebase/auth';
import { getDocuments } from '@/lib/firebase/firestore';
import { useRouter } from 'expo-router';
import { BarChart3, Calendar, Clock, Download, PieChart, TrendingUp, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
          
          // Load doctors
          const doctorsResult = await getDocuments('doctors');
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

  // Calculate statistics
  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.appointmentDate === today);
    
    return {
      totalAppointments: appointments.length,
      todayAppointments: todayAppointments.length,
      completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
      pendingAppointments: appointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed').length,
      totalDoctors: doctors.length,
      activeDoctors: doctors.filter(doc => doc.status === 'In').length,
    };
  };

  const stats = getStats();

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
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={handleDownload}
          disabled={loading}
        >
          <Download size={16} color="#FFFFFF" />
          <ThemedText style={styles.downloadButtonText}>Download</ThemedText>
        </TouchableOpacity>
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
              onPress={() => {
                const options = ['today', 'thisWeek', 'thisMonth'];
                const labels = ['Today', 'This Week', 'This Month'];
                const currentIndex = options.indexOf(timeRange);
                const nextIndex = (currentIndex + 1) % options.length;
                setTimeRange(options[nextIndex] as any);
              }}
            >
              <ThemedText style={styles.pickerText}>
                {timeRange === 'today' ? 'Today' : timeRange === 'thisWeek' ? 'This Week' : 'This Month'}
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
              <View>
                <View style={styles.sectionHeader}>
                  <Calendar size={20} color="#059669" />
                  <ThemedText style={styles.sectionTitle}>Appointment Trends</ThemedText>
                </View>
                <View style={styles.chartPlaceholder}>
                  <BarChart3 size={48} color="#6B7280" />
                  <ThemedText style={styles.chartTitle}>Appointment Trends Chart</ThemedText>
                  <ThemedText style={styles.chartSubtitle}>
                    Visual representation of appointment patterns over time
                  </ThemedText>
                </View>
              </View>
            )}

            {activeTab === 'queue' && (
              <View>
                <View style={styles.sectionHeader}>
                  <Users size={20} color="#059669" />
                  <ThemedText style={styles.sectionTitle}>Queue Analytics</ThemedText>
                </View>
                <View style={styles.chartPlaceholder}>
                  <PieChart size={48} color="#6B7280" />
                  <ThemedText style={styles.chartTitle}>Queue Distribution</ThemedText>
                  <ThemedText style={styles.chartSubtitle}>
                    Current queue status and wait times
                  </ThemedText>
                </View>
              </View>
            )}

            {activeTab === 'doctor' && (
              <View>
                <View style={styles.sectionHeader}>
                  <TrendingUp size={20} color="#059669" />
                  <ThemedText style={styles.sectionTitle}>Doctor Performance</ThemedText>
                </View>
                <View style={styles.chartPlaceholder}>
                  <BarChart3 size={48} color="#6B7280" />
                  <ThemedText style={styles.chartTitle}>Doctor Performance Metrics</ThemedText>
                  <ThemedText style={styles.chartSubtitle}>
                    Individual doctor statistics and performance
                  </ThemedText>
                </View>
              </View>
            )}
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
});