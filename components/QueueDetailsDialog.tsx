import React from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { ThemedText } from './themed-text';

// Custom SVG Components
const X = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const User = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Clock = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 6V12L16 14"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Phone = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.271 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59531 1.99522 8.06679 2.16708 8.43376 2.48353C8.80073 2.79999 9.04207 3.23945 9.11999 3.72C9.23662 4.68007 9.47144 5.62273 9.81999 6.53C9.94454 6.88792 9.97366 7.27691 9.9039 7.65088C9.83415 8.02485 9.6682 8.36811 9.42499 8.64L8.08999 9.97C9.51355 12.4378 11.5622 14.4864 14.03 15.91L15.36 14.58C15.6319 14.3368 15.9751 14.1708 16.3491 14.1011C16.7231 14.0313 17.1121 14.0605 17.47 14.185C18.3773 14.5335 19.3199 14.7684 20.28 14.885C20.7658 14.9636 21.2094 15.2032 21.5265 15.5665C21.8437 15.9298 22.0122 16.3966 22 16.92Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  currentToken: number | null;
  queueLength: number;
  estimatedLastPatient: string | null;
  status: 'Active' | 'Break';
}

interface QueuePatient {
  id: string;
  tokenNumber: string;
  patientName: string;
  appointmentTime: string;
  phoneNumber: string;
  status: 'waiting' | 'in-progress' | 'completed';
  estimatedWaitTime?: string;
}

interface QueueDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

export function QueueDetailsDialog({ isOpen, onClose, doctor }: QueueDetailsDialogProps) {
  if (!isOpen || !doctor) return null;

  // Mock queue data
  const queuePatients: QueuePatient[] = [
    {
      id: '1',
      tokenNumber: '#12',
      patientName: 'John Smith',
      appointmentTime: '2:00 PM',
      phoneNumber: '+1 234-567-8901',
      status: 'in-progress',
    },
    {
      id: '2',
      tokenNumber: '#13',
      patientName: 'Sarah Johnson',
      appointmentTime: '2:10 PM',
      phoneNumber: '+1 234-567-8902',
      status: 'waiting',
      estimatedWaitTime: '5 min',
    },
    {
      id: '3',
      tokenNumber: '#14',
      patientName: 'Mike Wilson',
      appointmentTime: '2:20 PM',
      phoneNumber: '+1 234-567-8903',
      status: 'waiting',
      estimatedWaitTime: '15 min',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-progress':
        return (
          <View style={[styles.statusBadge, styles.inProgressBadge]}>
            <ThemedText style={styles.inProgressText}>In Progress</ThemedText>
          </View>
        );
      case 'waiting':
        return (
          <View style={[styles.statusBadge, styles.waitingBadge]}>
            <ThemedText style={styles.waitingText}>Waiting</ThemedText>
          </View>
        );
      case 'completed':
        return (
          <View style={[styles.statusBadge, styles.completedBadge]}>
            <ThemedText style={styles.completedText}>Completed</ThemedText>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.dialogTitle}>
                Queue Details - {doctor.name}
              </ThemedText>
              <ThemedText style={styles.dialogSubtitle}>{doctor.specialty}</ThemedText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Doctor Status Card */}
            <View style={styles.doctorCard}>
              <View style={styles.doctorHeader}>
                <View style={styles.doctorInfo}>
                  <View style={styles.doctorAvatar}>
                    <User />
                  </View>
                  <View>
                    <ThemedText style={styles.doctorName}>{doctor.name}</ThemedText>
                    <ThemedText style={styles.doctorSpecialty}>{doctor.specialty}</ThemedText>
                  </View>
                </View>
                <View style={styles.currentToken}>
                  <ThemedText style={styles.tokenNumber}>
                    {doctor.currentToken || '–'}
                  </ThemedText>
                  <ThemedText style={styles.tokenLabel}>Current Token</ThemedText>
                </View>
              </View>
              <View style={styles.doctorStats}>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statValue}>{doctor.queueLength}</ThemedText>
                  <ThemedText style={styles.statLabel}>Patients Waiting</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statValue}>
                    {doctor.estimatedLastPatient || '–'}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Est. Last Patient</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statValue}>{doctor.status}</ThemedText>
                  <ThemedText style={styles.statLabel}>Status</ThemedText>
                </View>
              </View>
            </View>

            {/* Queue List */}
            <View style={styles.queueSection}>
              <ThemedText style={styles.queueTitle}>Patient Queue</ThemedText>
              <View style={styles.queueList}>
                {queuePatients.map((patient) => (
                  <View key={patient.id} style={styles.patientCard}>
                    <View style={styles.patientHeader}>
                      <View style={styles.patientInfo}>
                        <View style={styles.tokenBadge}>
                          <ThemedText style={styles.tokenText}>
                            {patient.tokenNumber}
                          </ThemedText>
                        </View>
                        <View>
                          <ThemedText style={styles.patientName}>{patient.patientName}</ThemedText>
                          <View style={styles.patientDetails}>
                            <View style={styles.detailItem}>
                              <Clock />
                              <ThemedText style={styles.detailText}>{patient.appointmentTime}</ThemedText>
                            </View>
                            <View style={styles.detailItem}>
                              <Phone />
                              <ThemedText style={styles.detailText}>{patient.phoneNumber}</ThemedText>
                            </View>
                          </View>
                        </View>
                      </View>
                      <View style={styles.patientStatus}>
                        {patient.estimatedWaitTime && (
                          <ThemedText style={styles.waitTime}>
                            Est. wait: {patient.estimatedWaitTime}
                          </ThemedText>
                        )}
                        {getStatusBadge(patient.status)}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.closeAction} onPress={onClose}>
              <ThemedText style={styles.closeActionText}>Close</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.manageAction}>
              <ThemedText style={styles.manageActionText}>Manage Queue</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dialogSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  doctorCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#D1FAE5',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#6B7280',
  },
  currentToken: {
    alignItems: 'center',
  },
  tokenNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#14B8A6',
  },
  tokenLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  doctorStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  queueSection: {
    marginBottom: 20,
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  queueList: {
    gap: 8,
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tokenBadge: {
    width: 32,
    height: 32,
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#14B8A6',
  },
  patientName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  patientDetails: {
    gap: 4,
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 10,
    color: '#6B7280',
  },
  patientStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  waitTime: {
    fontSize: 10,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inProgressBadge: {
    backgroundColor: '#DBEAFE',
  },
  waitingBadge: {
    backgroundColor: '#FEF3C7',
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
  },
  inProgressText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#2563EB',
  },
  waitingText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#D97706',
  },
  completedText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#059669',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  closeAction: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  manageAction: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#14B8A6',
    borderRadius: 8,
    alignItems: 'center',
  },
  manageActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
