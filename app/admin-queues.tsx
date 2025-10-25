import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getAllDoctors,
  getAppointmentsByDoctorAndDate,
  getDocuments,
  updateQueueOrder
} from '@/lib/firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

// --- Interfaces ---
interface QueueItem {
  id: string; // appointmentId
  patientId: string;
  tokenNumber: string;
  name: string;
  status: 'Waiting' | 'Checked In';
  appointmentTime: string;
  queueOrder: number;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

// --- SVG Icons ---
const MenuIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M3 12H21M3 6H21M3 18H21" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const DragHandleIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5C12.5523 5 13 5.44772 13 6C13 6.55228 12.5523 7 12 7C11.4477 7 11 6.55228 11 6C11 5.44772 11.4477 5 12 5Z" fill="#9CA3AF" />
    <Path d="M12 10C12.5523 10 13 10.4477 13 11C13 11.5523 12.5523 12 12 12C11.4477 12 11 11.5523 11 11C11 10.4477 11.4477 10 12 10Z" fill="#9CA3AF" />
    <Path d="M12 15C12.5523 15 13 15.4477 13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15Z" fill="#9CA3AF" />
  </Svg>
);

// --- Main Component ---
export default function AdminQueues() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const fetchDoctors = async () => {
    if (!user) return;
    
    const doctorsResult = await getAllDoctors();
    const assistantsResult = await getDocuments('assistants');
    
    if (doctorsResult.success && doctorsResult.data) {
      let filteredDoctorsData = doctorsResult.data;
      
      // Apply role-based filtering
      if (user.role === 'doctor') {
        // Doctor sees only themselves
        filteredDoctorsData = doctorsResult.data.filter((doc: any) => doc.userId === user.id);
        console.log('Queue - Doctor role - Filtered doctors:', filteredDoctorsData);
      } else if (user.role === 'assistant') {
        // Assistant sees only their assigned doctors
        const assistantsData = assistantsResult.success ? assistantsResult.data : [];
        const assistant = assistantsData?.find((a: any) => a.userId === user.id);
        if (assistant && (assistant as any).assignedDoctors) {
          filteredDoctorsData = doctorsResult.data.filter((doc: any) => 
            (assistant as any).assignedDoctors.includes(doc.id)
          );
          console.log('Queue - Assistant role - Assigned doctors:', (assistant as any).assignedDoctors);
          console.log('Queue - Assistant role - Filtered doctors:', filteredDoctorsData);
        } else {
          filteredDoctorsData = [];
          console.log('Queue - Assistant role - No assigned doctors found');
        }
      }
      // Admin sees all doctors (no filtering)
      
      const doctorList = filteredDoctorsData.map((doc: any) => ({
        id: doc.id,
        name: doc.user?.name || `Dr. ${doc.name}` || 'Unknown Doctor',
        specialty: doc.specialty || 'General',
      }));
      
      console.log('Final doctor list:', doctorList);
      setDoctors(doctorList);
      
      if (doctorList.length === 0) {
        setIsLoading(false);
        Alert.alert('No Doctors', 'No doctors available for your role.');
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      Alert.alert('Error', 'Could not load doctors.');
    }
  };

  const fetchQueue = useCallback(async () => {
    console.log('=== FETCHING QUEUE DATA ===');
    console.log('Selected Doctor:', selectedDoctor);
    
    setIsRefreshing(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Today\'s date:', today);
      
      let appointmentsResult;
      if (selectedDoctor) {
        // If doctor is selected, get appointments for that specific doctor
        appointmentsResult = await getAppointmentsByDoctorAndDate(selectedDoctor.id, today);
      } else {
        // If no doctor selected (admin flow), get all appointments for today
        // We'll need to get appointments from all doctors
        const allAppointments = [];
        for (const doctor of doctors) {
          const doctorAppointments = await getAppointmentsByDoctorAndDate(doctor.id, today);
          if (doctorAppointments.success && doctorAppointments.data) {
            allAppointments.push(...doctorAppointments.data);
          }
        }
        appointmentsResult = { success: true, data: allAppointments };
      }
      console.log('Appointments result:', appointmentsResult);

      if (appointmentsResult.success && appointmentsResult.data) {
        console.log('Raw appointments data:', appointmentsResult.data);
        console.log('Number of appointments:', appointmentsResult.data.length);
        
        const appointmentsWithNames = await Promise.all(
          appointmentsResult.data
            // @ts-ignore
            .filter((apt: any) => {
              const isNotCompleted = apt.status !== 'completed' && apt.status !== 'cancelled';
              console.log(`Appointment ${apt.id}: status=${apt.status}, included=${isNotCompleted}`);
              return isNotCompleted;
            })
            .map(async (apt: any, index: number) => {
              console.log(`Processing appointment ${index + 1}:`, {
                id: apt.id,
                patientId: apt.patientId,
                tokenNumber: apt.tokenNumber,
                status: apt.status,
                checkedInAt: apt.checkedInAt,
                queueOrder: apt.queueOrder
              });
              
              const patientName = apt.patientName || 'Unknown Patient';
              
              console.log(`Patient for appointment ${apt.id}:`, patientName);
              
              return {
                id: apt.id,
                patientId: apt.patientId,
                tokenNumber: apt.tokenNumber || 'N/A',
                // @ts-ignore
                name: patientName,
                status: (apt.checkedInAt ? 'Checked In' : 'Waiting') as 'Waiting' | 'Checked In',
                appointmentTime: apt.appointmentTime || 'N/A',
                queueOrder: apt.queueOrder ?? 999, // Default to end of list
              };
            })
        );
        
        console.log('Appointments with names:', appointmentsWithNames);
        
        // @ts-ignore
        appointmentsWithNames.sort((a, b) => a.queueOrder - b.queueOrder);
        
        console.log('Sorted queue:', appointmentsWithNames);
        console.log('Final queue length:', appointmentsWithNames.length);
        
        setQueue(appointmentsWithNames);
      } else {
        console.log('No appointments found or error:', appointmentsResult.error);
        setQueue([]);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
      Alert.alert('Error', 'Failed to fetch queue.');
      setQueue([]);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [selectedDoctor]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth-login');
      return;
    }
    if (user) {
      fetchDoctors();
    }
  }, [user, authLoading, isAuthenticated]);

  useEffect(() => {
    console.log('Selected doctor changed:', selectedDoctor);
    if (selectedDoctor) {
      setIsLoading(true);
      fetchQueue();
    } else if (doctors.length > 0 && !selectedDoctor) {
      // For admin flow, fetch all appointments when doctors are loaded but no doctor is selected
      setIsLoading(true);
      fetchQueue();
    }
  }, [selectedDoctor, fetchQueue, doctors]);

  const handleReorder = async ({ data }: { data: QueueItem[] }) => {
    setQueue(data); // Optimistic UI update
    
    // Save the new order to Firestore
    const updates = data.map((item, index) => 
      updateQueueOrder(item.id, index + 1)
    );
    try {
      await Promise.all(updates);
      Alert.alert('Success', 'Queue order updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save new queue order.');
      fetchQueue(); // Revert on failure
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth-login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<QueueItem>) => {
    return (
      <ScaleDecorator>
        <View style={[styles.queueItem, isActive && styles.draggingItem]}>
          <TouchableOpacity
            onPressIn={drag}
            onLongPress={drag}
            style={styles.dragHandle}
            activeOpacity={0.7}
          >
            <DragHandleIcon />
          </TouchableOpacity>
          <View style={styles.itemContent}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Text style={styles.itemSubtext}>Token: #{item.tokenNumber}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'Checked In' ? '#10B981' : '#F59E0B' }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={styles.rootContainer}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          currentPath="/admin-queues" 
          onNavigate={(path) => router.push(path as any)}
          onLogout={handleLogout}
          userName={user?.name || 'Admin User'}
          userRole={user?.role || 'Administrator'}
        />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.menuButton}>
            <MenuIcon />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Queue Management</Text>
            <Text style={styles.subtitle}>Drag and drop to reorder the queue</Text>
          </View>
        </View>

        <View style={styles.doctorSelector}>
          <Text style={styles.selectorLabel}>Doctor:</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.selectorButton}>
            <Text style={[styles.selectorText, !selectedDoctor && styles.placeholderText]}>
              {selectedDoctor?.name || 'Select a Doctor'}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#14B8A6" />
            <Text style={styles.loadingText}>Loading queue...</Text>
          </View>
        ) : queue.length === 0 ? (
          <ScrollView
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={fetchQueue} tintColor="#14B8A6" />}
            contentContainerStyle={styles.emptyStateContainer}
          >
             <View style={styles.emptyState}>
               <Text style={styles.emptyTitle}>Queue is Empty</Text>
               <Text style={styles.emptySubtitle}>
                 {selectedDoctor 
                   ? `No patients in the queue for ${selectedDoctor.name} today.`
                   : 'No patients in the queue for any doctor today.'
                 }
               </Text>
             </View>
          </ScrollView>
        ) : (
          <View style={styles.listContainer}>
            <DraggableFlatList
              data={queue}
              onDragEnd={handleReorder}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={fetchQueue} tintColor="#14B8A6" />}
              contentContainerStyle={styles.listContent}
            />
          </View>
        )}

        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackdrop} 
              activeOpacity={1} 
              onPress={() => setModalVisible(false)}
            />
            <View style={styles.modalContentWrapper}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Doctor</Text>
                <ScrollView style={styles.doctorList} showsVerticalScrollIndicator={true}>
                  {doctors.map(doc => (
                    <TouchableOpacity
                      key={doc.id}
                      style={styles.doctorOption}
                      onPress={() => {
                        console.log('Doctor selected:', doc);
                        setSelectedDoctor(doc);
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.doctorOptionText}>{doc.name}</Text>
                      <Text style={styles.doctorOptionSubtext}>{doc.specialty}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  menuButton: { padding: 8, marginRight: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280' },
  doctorSelector: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  selectorLabel: { fontSize: 16, fontWeight: '500', color: '#374151' },
  selectorButton: { flex: 1, marginLeft: 10, padding: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8 },
  selectorText: { fontSize: 16, color: '#111827' },
  placeholderText: { color: '#9CA3AF', fontStyle: 'italic' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { flex: 1 },
  listContent: { paddingBottom: 20 },
  queueItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  draggingItem: { backgroundColor: '#E0F2F1', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
  dragHandle: { paddingRight: 12, paddingLeft: 4, paddingVertical: 8, marginRight: 8 },
  itemContent: { flex: 1 },
  itemText: { fontSize: 16, fontWeight: '500', color: '#1F2937' },
  itemSubtext: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '500' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 50 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  emptySubtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' },
  modalOverlay: { flex: 1 },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContentWrapper: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16 },
  doctorList: { maxHeight: 400 },
  doctorOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  doctorOptionText: { fontSize: 18, fontWeight: '500', color: '#111827' },
  doctorOptionSubtext: { fontSize: 14, color: '#6B7280', marginTop: 4 },
});
