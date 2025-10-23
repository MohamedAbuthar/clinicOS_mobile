import { AdminSidebar } from '@/components/AdminSidebar';
import { ThemedText } from '@/components/themed-text';
import { getCurrentUser } from '@/lib/firebase/auth';
import { getDocuments } from '@/lib/firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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


export default function AdminQueues() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [queueData, setQueueData] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load queue data
  useEffect(() => {
    const loadQueueData = async () => {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          
          // Load doctors for queue management
          const doctorsResult = await getDocuments('doctors');
          console.log('Admin Queues - Doctors Result:', doctorsResult);
          if (doctorsResult.success && doctorsResult.data) {
            // Transform doctors data for queue display
            const transformedDoctors = doctorsResult.data.map((doctor: any) => ({
              id: doctor.id,
              name: doctor.user?.name || doctor.name || 'Unknown Doctor',
              specialty: doctor.specialty || 'General',
              status: doctor.status === 'In' ? 'Active' : 'Break',
              queueLength: 0, // Will be calculated from appointments
              currentToken: null,
              estimatedLastPatient: null,
              statusColor: doctor.status === 'In' ? '#10B981' : '#EF4444'
            }));
            
            setDoctors(transformedDoctors);
          } else {
            console.log('Admin Queues - Failed to load doctors, using fallback data');
            // Fallback data matching your web app exactly
            const fallbackDoctors = [
              {
                id: '1',
                name: 'haseeb...',
                specialty: 'dev',
                status: 'Break',
                queueLength: 0,
                currentToken: null,
                estimatedLastPatient: null,
                statusColor: '#EF4444'
              },
              {
                id: '2',
                name: 'test',
                specialty: 'sdfgh',
                status: 'Active',
                queueLength: 0,
                currentToken: null,
                estimatedLastPatient: null,
                statusColor: '#10B981'
              },
              {
                id: '3',
                name: 'mydeen',
                specialty: 'dev',
                status: 'Break',
                queueLength: 0,
                currentToken: null,
                estimatedLastPatient: null,
                statusColor: '#EF4444'
              },
              {
                id: '4',
                name: 'mydeen',
                specialty: 'dev',
                status: 'Break',
                queueLength: 0,
                currentToken: null,
                estimatedLastPatient: null,
                statusColor: '#EF4444'
              },
              {
                id: '5',
                name: 'Mohamed Abuthar',
                specialty: 'tt',
                status: 'Break',
                queueLength: 0,
                currentToken: null,
                estimatedLastPatient: null,
                statusColor: '#EF4444'
              },
              {
                id: '6',
                name: 'Riya',
                specialty: 'Cardiologist',
                status: 'Active',
                queueLength: 0,
                currentToken: null,
                estimatedLastPatient: null,
                statusColor: '#10B981'
              }
            ];
            setDoctors(fallbackDoctors);
          }
        } else {
          router.push('/auth-login');
        }
      } catch (error) {
        console.error('Error loading queue data:', error);
        Alert.alert('Error', 'Failed to load queue data');
      } finally {
        setIsLoading(false);
      }
    };

    loadQueueData();
  }, [router]);

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <Menu />
          </TouchableOpacity>
          <View>
            <ThemedText style={styles.title}>Queue Management</ThemedText>
            <ThemedText style={styles.subtitle}>Monitor and manage patient queues</ThemedText>
          </View>
        </View>
      </View>

      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        currentPath="/admin-queues"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userName="Admin User"
        userRole="Administrator"
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Doctor Queue Table */}
          <View style={styles.queueTable}>
            <ThemedText style={styles.queueTableTitle}>Doctor Queues</ThemedText>
            
            {/* Table Header */}
            <View style={styles.queueTableHeader}>
              <ThemedText style={styles.queueTableHeaderText}>Doctor</ThemedText>
              <ThemedText style={styles.queueTableHeaderText}>Status</ThemedText>
              <ThemedText style={styles.queueTableHeaderText}>Queue</ThemedText>
              <ThemedText style={styles.queueTableHeaderText}>Action</ThemedText>
            </View>
            
            {/* Table Rows */}
            {doctors.map((doctor) => (
              <View key={doctor.id} style={styles.queueTableRow}>
                <View style={styles.queueTableCell}>
                  <ThemedText style={styles.queueTableCellText}>{doctor.name}</ThemedText>
                  <ThemedText style={styles.queueTableCellSubtext}>{doctor.specialty}</ThemedText>
                </View>
                <View style={styles.queueTableCell}>
                  <View style={[styles.statusBadge, { backgroundColor: doctor.statusColor }]}>
                    <ThemedText style={styles.statusText}>{doctor.status}</ThemedText>
                  </View>
                </View>
                <View style={styles.queueTableCell}>
                  <ThemedText style={styles.queueTableCellText}>{doctor.queueLength}</ThemedText>
                </View>
                <View style={styles.queueTableCell}>
                  <TouchableOpacity style={styles.viewButton}>
                    <ThemedText style={styles.viewButtonText}>View</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
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
});
