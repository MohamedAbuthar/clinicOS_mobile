import { ThemedText } from '@/components/themed-text';
import { Clock, TrendingUp, Users } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export interface DoctorPerformanceCardProps {
  doctorName: string;
  patientsServed: number;
  avgConsultTime: string;
  onTimeRate: string;
}

const DoctorPerformanceCard: React.FC<DoctorPerformanceCardProps> = ({
  doctorName,
  patientsServed,
  avgConsultTime,
  onTimeRate,
}) => {
  const onTimeRateValue = parseFloat(onTimeRate);
  const rateColor = onTimeRateValue >= 90 ? '#22c55e' : '#f59e0b';

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={[styles.iconContainer, { backgroundColor: '#ECFDF5' }]}>
          <Users size={24} color="#059669" />
        </View>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>{doctorName}</ThemedText>
          <ThemedText style={styles.subtitle}>Weekly Performance</ThemedText>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: '#EFF6FF' }]}>
            <Users size={18} color="#3B82F6" />
          </View>
          <View style={styles.statContent}>
            <ThemedText style={styles.statLabel}>Patients Served</ThemedText>
            <ThemedText style={styles.statValue}>{patientsServed}</ThemedText>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: '#ECFDF5' }]}>
            <Clock size={18} color="#10B981" />
          </View>
          <View style={styles.statContent}>
            <ThemedText style={styles.statLabel}>Avg Consult Time</ThemedText>
            <ThemedText style={styles.statValue}>{avgConsultTime}</ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.statCard, styles.lastStatCard]}>
        <View style={[styles.statIconBg, { backgroundColor: rateColor === '#22c55e' ? '#ECFDF5' : '#FFF7ED' }]}>
          <TrendingUp size={18} color={rateColor} />
        </View>
        <View style={styles.statContent}>
          <ThemedText style={styles.statLabel}>On-Time Rate</ThemedText>
          <ThemedText style={[styles.statValue, { color: rateColor }]}>
            {onTimeRate}
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lastStatCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
});

export default DoctorPerformanceCard;
