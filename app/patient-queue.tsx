import PatientLayout from '@/components/PatientLayout';
import { ThemedText } from '@/components/themed-text';
import { useBackendPatientAuth } from '@/lib/contexts/BackendPatientAuthContext';
import {
  getAppointmentsByDoctorAndDate,
  getAppointmentsByPatient,
  getDoctorById,
  getPatientProfile
} from '@/lib/firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Helper Functions & Interfaces ---

interface QueueItem {
  id: string;
  patientId: string;
  tokenNumber: string;
  name: string;
  status: 'Waiting' | 'Checked In' | 'Completed';
  appointmentTime: string;
  isCurrentUser: boolean;
}

const formatTime = (timeString: string) => {
  if (!timeString) return 'N/A';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// --- UI Components ---

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.statCard}>
    <ThemedText style={styles.statValue}>{value}</ThemedText>
    <ThemedText style={styles.statLabel}>{label}</ThemedText>
  </View>
);

const QueueItemCard = ({ item, index }: { item: QueueItem; index: number }) => {
  const statusColor = item.status === 'Checked In' ? '#10B981' : '#8B5CF6';
  const containerStyle = item.isCurrentUser ? [styles.queueItem, styles.currentUserItem] : styles.queueItem;

  return (
    <View style={containerStyle}>
      <View style={styles.queuePosition}>
        <ThemedText style={styles.queuePositionText}>{index + 1}</ThemedText>
      </View>
      <View style={styles.queueDetails}>
        <View style={styles.queueItemHeader}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.queueItemName}>{item.name}</ThemedText>
          </View>
          <ThemedText style={[styles.queueItemToken, { color: statusColor }]}>#{Number(String(item.tokenNumber).replace(/^#/, '').replace(/^0+/, '')) || 0}</ThemedText>
        </View>
        <View style={styles.queueItemFooter}>
          <ThemedText style={styles.queueItemTime}>{formatTime(item.appointmentTime)}</ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <ThemedText style={[styles.statusText, { color: statusColor }]}>{item.status}</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
};

// --- Main Component ---

function PatientQueueContent() {
  const { patient } = useBackendPatientAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [doctorName, setDoctorName] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);

  const fetchQueueData = async () => {
    if (!patient) {
      setIsLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const patientAppointmentsResult = await getAppointmentsByPatient(patient.id);

      if (!patientAppointmentsResult.success || !patientAppointmentsResult.data) {
        setQueue([]);
        return;
      }

      const todayAppointment = patientAppointmentsResult.data.find(
        (apt: any) => apt.appointmentDate === today && apt.status !== 'completed'
      );

      if (!todayAppointment) {
        setQueue([]);
        return;
      }

      // Decide which doctor to show: selected filter or patient's appointment doctor
      // @ts-ignore
      const doctorId = selectedDoctor || todayAppointment.doctorId;

      const [doctorResult, doctorQueueResult] = await Promise.all([
        getDoctorById(doctorId),
        getAppointmentsByDoctorAndDate(doctorId, today)
      ]);

      if (doctorResult.success && doctorResult.data) {
        // @ts-ignore
        setDoctorName(doctorResult.data.user?.name || `Dr. ${doctorResult.data.name}` || '');
      }

      if (doctorQueueResult.success && doctorQueueResult.data) {
        // Sort by numeric token (001 -> 1). Fallback to createdAt when token missing.
        // @ts-ignore
        const sorted = [...doctorQueueResult.data]
          // @ts-ignore
          .filter(apt => apt.status !== 'completed')
          // @ts-ignore
          .sort((a: any, b: any) => {
            const ta = parseInt((a.tokenNumber || '').toString(), 10);
            const tb = parseInt((b.tokenNumber || '').toString(), 10);
            const aValid = Number.isFinite(ta);
            const bValid = Number.isFinite(tb);
            if (aValid && bValid) return ta - tb;
            if (aValid) return -1;
            if (bValid) return 1;
            const ca = a.createdAt?.seconds || a.createdAt || 0;
            const cb = b.createdAt?.seconds || b.createdAt || 0;
            return ca - cb;
          });

        const queueWithPatientNames = await Promise.all(
          sorted.map(async (apt: any, idx: number) => {
            // Prefer the appointment's stored patientName (matches web), fallback to profile lookup
            let name: string = apt.patientName;
            if (!name) {
              const patientProfileResult = await getPatientProfile(apt.patientId);
              name = (patientProfileResult.success && patientProfileResult.data)
                // @ts-ignore
                ? patientProfileResult.data.name
                : 'Unknown Patient';
            }

            return {
              id: apt.id,
              patientId: apt.patientId,
              // Display sequential order to avoid duplicates in UI
              tokenNumber: String(idx + 1),
              name,
              status: (apt.checkedInAt ? 'Checked In' : 'Waiting') as 'Waiting' | 'Checked In' | 'Completed',
              appointmentTime: apt.appointmentTime,
              isCurrentUser: !!(patient && patient.id) && String(apt.patientId) === String(patient.id),
            };
          })
        );
        setQueue(queueWithPatientNames);
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching queue data:', error);
      Alert.alert('Error', 'Could not load queue data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Load doctors list based on patient's appointments
    const fetchPatientDoctors = async () => {
      if (!patient?.id) return;

      try {
        const appointmentsRes = await getAppointmentsByPatient(patient.id);
        if (appointmentsRes.success && appointmentsRes.data) {
          // Extract unique doctor IDs
          const uniqueDoctorIds = Array.from(new Set(appointmentsRes.data.map((apt: any) => apt.doctorId).filter(Boolean)));

          // Fetch details for each doctor
          const doctorDetails = await Promise.all(
            uniqueDoctorIds.map(async (id) => {
              // @ts-ignore
              const docRes = await getDoctorById(id);
              if (docRes.success && docRes.data) {
                // @ts-ignore
                return { id: docRes.data.id, name: docRes.data.user?.name || docRes.data.name || 'Unknown Doctor' };
              }
              return null;
            })
          );

          // Filter out nulls and set state
          const validDoctors = doctorDetails.filter(Boolean);
          setDoctors(validDoctors);

          // Auto-select first doctor if none selected
          if (validDoctors.length > 0) {
            // @ts-ignore
            setSelectedDoctor(validDoctors[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching patient doctors:', error);
      }
    };

    fetchPatientDoctors();
  }, [patient?.id]);

  useEffect(() => {
    fetchQueueData();
  }, [patient, selectedDoctor]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchQueueData();
  };

  const { currentUserStatus, queueOrder } = useMemo(() => {
    const currentUserItem = queue.find(item => item.isCurrentUser);
    const checkedInQueue = queue.filter(item => item.status === 'Checked In');

    if (!currentUserItem) {
      return { currentUserStatus: null, queueOrder: [] };
    }

    const position = checkedInQueue.findIndex(item => item.patientId === currentUserItem.patientId) + 1;

    return {
      currentUserStatus: {
        position: position > 0 ? position : 'Waiting',
        token: currentUserItem.tokenNumber,
        waitingTime: position > 0 ? (position - 1) * 15 : 'N/A', // Estimate 15 mins per patient
      },
      queueOrder: queue.map(item => `#${item.tokenNumber}`),
    };
  }, [queue]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
        <ThemedText>Loading Queue...</ThemedText>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#14B8A6" />}
      >
        {/* Doctor Filter - select dropdown like web */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeaderRow}>
            <ThemedText style={styles.filterLabel}>Doctor</ThemedText>
          </View>
          <View style={styles.selectContainer}>
            <TouchableOpacity
              style={styles.select}
              onPress={() => setShowDoctorPicker(!showDoctorPicker)}
            >
              <ThemedText style={[styles.selectText, !selectedDoctor && styles.placeholderText]}>
                {selectedDoctor ? (doctors.find(d => d.id === selectedDoctor)?.name || 'Unknown Doctor') : 'Choose a doctor'}
              </ThemedText>
              <ThemedText style={styles.selectChevron}>▾</ThemedText>
            </TouchableOpacity>
            {showDoctorPicker && (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownList}>
                  {doctors.map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      style={[styles.dropdownItem, selectedDoctor === d.id && styles.dropdownItemSelected]}
                      onPress={() => { setSelectedDoctor(d.id); setShowDoctorPicker(false); }}
                    >
                      <ThemedText style={[styles.dropdownItemText, selectedDoctor === d.id && styles.dropdownItemTextSelected]}>
                        {d.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Queue Status</ThemedText>
          <ThemedText style={styles.subtitle}>
            Live queue for {doctorName}. Last updated: {lastUpdated}
          </ThemedText>
        </View>

        {currentUserStatus ? (
          <>
            <View style={styles.statsContainer}>
              <StatCard label="Position in Queue" value={currentUserStatus.position} />
              <StatCard label="Your Token" value={`#${Number(String(currentUserStatus.token).replace(/^#/, '').replace(/^0+/, '')) || 0}`} />
              <StatCard label="Est. Wait Time" value={`${currentUserStatus.waitingTime} min`} />
            </View>

            <View style={styles.queueListContainer}>
              <View style={styles.queueListHeader}>
                <ThemedText style={styles.queueListTitle}>Today's Queue ({queue.length})</ThemedText>
                <ThemedText style={styles.queueOrderText}>
                  Order: {queueOrder.slice(0, 5).join(' → ')}{queueOrder.length > 5 ? '...' : ''}
                </ThemedText>
              </View>
              {queue.map((item, index) => (
                <QueueItemCard key={item.id} item={item} index={index} />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyTitle}>No Active Queue</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              You do not have an active appointment in the queue for today.
            </ThemedText>
            <TouchableOpacity style={styles.bookButton} onPress={() => { /* Navigate to booking */ }}>
              <ThemedText style={styles.bookButtonText}>Book an Appointment</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function PatientQueuePage() {
  return (
    <PatientLayout>
      <PatientQueueContent />
    </PatientLayout>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  header: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  filterSection: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  filterHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  filterLabel: { color: '#374151', fontSize: 14, fontWeight: '500' },
  doctorChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipSelected: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  chipText: { fontSize: 12, color: '#374151' },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '500' },
  selectContainer: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, backgroundColor: '#FFFFFF' },
  select: { paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectText: { fontSize: 14, color: '#111827', flex: 1 },
  placeholderText: { color: '#9CA3AF' },
  selectChevron: { color: '#6B7280', fontSize: 16, marginLeft: 8 },
  dropdown: { position: 'absolute', top: '100%', left: 20, right: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderTopWidth: 0, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, zIndex: 1000, maxHeight: 200 },
  dropdownList: { maxHeight: 200 },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownItemSelected: { backgroundColor: '#F0FDF4' },
  dropdownItemText: { fontSize: 14, color: '#111827' },
  dropdownItemTextSelected: { color: '#059669', fontWeight: '500' },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#E0F2F1',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingVertical: 16,
  },
  statCard: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: '#047857' },
  statLabel: { fontSize: 12, color: '#065F46', marginTop: 2 },
  queueListContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  queueListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  queueListTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  queueOrderText: { fontSize: 12, color: '#4B5563' },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currentUserItem: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  queuePosition: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  queuePositionText: { color: '#FFFFFF', fontWeight: '700' },
  queueDetails: { flex: 1 },
  queueItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  queueItemName: { fontSize: 16, fontWeight: '500', color: '#111827' },
  youBadge: { marginLeft: 6, backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  youBadgeText: { color: '#1D4ED8', fontSize: 12, fontWeight: '600' },
  queueItemToken: { fontSize: 16, fontWeight: '700' },
  queueItemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  queueItemTime: { fontSize: 12, color: '#6B7280' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '500' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  emptySubtitle: { textAlign: 'center', color: '#6B7280', marginBottom: 16 },
  bookButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: { color: '#FFFFFF', fontWeight: '600' },
});
