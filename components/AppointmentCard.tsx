import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { ThemedText } from './themed-text';

const Calendar = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
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

const ChevronRight = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18L15 12L9 6"
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

interface AppointmentCardProps {
  appointment: Appointment;
  onViewDetails?: (appointment: Appointment) => void;
}

export function AppointmentCard({ appointment, onViewDetails }: AppointmentCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'confirmed':
        return '#059669';
      case 'completed':
        return '#2563EB';
      case 'cancelled':
        return '#DC2626';
      case 'no_show':
        return '#D97706';
      default:
        return '#6B7280';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onViewDetails?.(appointment)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.doctorInfo}>
          <ThemedText style={styles.doctorName}>{appointment.doctorName}</ThemedText>
          <ThemedText style={styles.doctorSpecialty}>{appointment.doctorSpecialty}</ThemedText>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
            <ThemedText style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
              {appointment.status.replace('_', ' ').toUpperCase()}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Calendar />
          <ThemedText style={styles.detailText}>{formatDate(appointment.appointmentDate)}</ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Clock />
          <ThemedText style={styles.detailText}>{appointment.appointmentTime}</ThemedText>
        </View>
        {appointment.tokenNumber && (
          <View style={styles.detailItem}>
            <User />
            <ThemedText style={styles.detailText}>
              #{Number(String(appointment.tokenNumber).replace(/^#/, '').replace(/^0+/, '')) || 0}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.viewDetailsText}>View Details</ThemedText>
        <ChevronRight />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusContainer: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '500',
  },
});
