import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { ThemedText } from './themed-text';

// Custom SVG Components
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

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  currentToken: number | null;
  queueLength: number;
  estimatedLastPatient: string | null;
  status: 'Active' | 'Break';
}

interface QueueTableProps {
  doctors: Doctor[];
  onViewQueue: (doctor: Doctor) => void;
}

export function QueueTable({ doctors, onViewQueue }: QueueTableProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Queue Management</ThemedText>
      <View style={styles.queueContainer}>
        {doctors.map((doctor) => (
          <TouchableOpacity
            key={doctor.id}
            style={styles.queueCard}
            onPress={() => onViewQueue(doctor)}
          >
            <View style={styles.queueHeader}>
              <View style={styles.doctorInfo}>
                <ThemedText style={styles.doctorName}>{doctor.name}</ThemedText>
                <ThemedText style={styles.doctorSpecialty}>{doctor.specialty}</ThemedText>
              </View>
              <View style={[styles.statusBadge, doctor.status === 'Active' ? styles.activeStatus : styles.breakStatus]}>
                <ThemedText style={[styles.statusText, doctor.status === 'Active' ? styles.activeStatusText : styles.breakStatusText]}>
                  {doctor.status}
                </ThemedText>
              </View>
            </View>
            <View style={styles.queueDetails}>
              <View style={styles.queueItem}>
                <ThemedText style={styles.queueLabel}>Current Token:</ThemedText>
                <ThemedText style={styles.queueValue}>
                  {doctor.currentToken ? `#${doctor.currentToken}` : 'None'}
                </ThemedText>
              </View>
              <View style={styles.queueItem}>
                <ThemedText style={styles.queueLabel}>Queue Length:</ThemedText>
                <ThemedText style={styles.queueValue}>{doctor.queueLength}</ThemedText>
              </View>
              <View style={styles.queueItem}>
                <ThemedText style={styles.queueLabel}>Est. Last Patient:</ThemedText>
                <ThemedText style={styles.queueValue}>
                  {doctor.estimatedLastPatient || 'N/A'}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  queueContainer: {
    gap: 8,
  },
  queueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeStatus: {
    backgroundColor: '#D1FAE5',
  },
  breakStatus: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  activeStatusText: {
    color: '#059669',
  },
  breakStatusText: {
    color: '#D97706',
  },
  queueDetails: {
    gap: 4,
  },
  queueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  queueValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
});
