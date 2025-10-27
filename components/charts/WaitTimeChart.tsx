import { ThemedText } from '@/components/themed-text';
import { Clock } from 'lucide-react-native';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

export interface WaitTimeData {
  hour: string;
  avgWait: number;
}

export interface WaitTimeChartProps {
  data: WaitTimeData[];
}

const { width } = Dimensions.get('window');

const WaitTimeChart: React.FC<WaitTimeChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Clock size={20} color="#059669" />
          <ThemedText style={styles.title}>Average Wait Time by Hour</ThemedText>
        </View>
        <View style={styles.emptyState}>
          <Clock size={48} color="#D1D5DB" />
          <ThemedText style={styles.emptyText}>No wait time data available</ThemedText>
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.avgWait), 1);
  const chartWidth = width - 120;
  const chartHeight = 180;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Clock size={20} color="#059669" />
        <ThemedText style={styles.title}>Average Wait Time by Hour</ThemedText>
      </View>
      <ThemedText style={styles.subtitle}>Patient waiting time throughout the day</ThemedText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.chartWrapper}>
          {/* Y-axis labels */}
          <View style={styles.yAxisContainer}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <ThemedText key={ratio} style={styles.yAxisLabel}>
                {Math.round(maxValue * (1 - ratio))}
              </ThemedText>
            ))}
          </View>

          {/* Chart area */}
          <View style={[styles.chartArea, { width: Math.max(chartWidth, data.length * 40) }]}>
            {/* Grid lines */}
            <View style={styles.gridLines}>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <View
                  key={ratio}
                  style={[
                    styles.gridLine,
                    { top: ratio * chartHeight }
                  ]}
                />
              ))}
            </View>

            {/* Data bars */}
            <View style={styles.barsContainer}>
              {data.map((item, index) => {
                const barHeight = (item.avgWait / maxValue) * chartHeight || 2;
                const barWidth = 30;
                return (
                  <View key={index} style={[styles.barGroup, { marginRight: 12 }]}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: barHeight,
                            backgroundColor: getBarColor(item.avgWait, maxValue),
                          },
                        ]}
                      />
                      <ThemedText style={styles.barValue}>{item.avgWait}</ThemedText>
                    </View>
                    <ThemedText style={styles.hourLabel}>{item.hour}</ThemedText>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Clock size={18} color="#EF4444" />
          <View style={styles.statContent}>
            <ThemedText style={styles.statLabel}>Peak Wait</ThemedText>
            <ThemedText style={styles.statValue}>
              {Math.max(...data.map(d => d.avgWait))} min
            </ThemedText>
          </View>
        </View>
        <View style={styles.statCard}>
          <Clock size={18} color="#14b8a6" />
          <View style={styles.statContent}>
            <ThemedText style={styles.statLabel}>Average</ThemedText>
            <ThemedText style={styles.statValue}>
              {Math.round(data.reduce((sum, d) => sum + d.avgWait, 0) / data.length)} min
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
};

const getBarColor = (value: number, maxValue: number): string => {
  const percentage = value / maxValue;
  if (percentage >= 0.75) return '#EF4444'; // Red for high wait
  if (percentage >= 0.5) return '#F59E0B'; // Orange for medium-high
  if (percentage >= 0.25) return '#EAB308'; // Yellow for medium
  return '#14b8a6'; // Teal for low
};

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  scrollContent: {
    paddingRight: 16,
  },
  chartWrapper: {
    flexDirection: 'row',
    height: 220,
  },
  yAxisContainer: {
    width: 30,
    justifyContent: 'space-between',
    paddingRight: 8,
    marginTop: -8,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'right',
  },
  chartArea: {
    position: 'relative',
    height: 200,
    paddingTop: 4,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
    paddingHorizontal: 4,
  },
  barGroup: {
    alignItems: 'center',
  },
  barWrapper: {
    height: 180,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 30,
    borderRadius: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  barValue: {
    fontSize: 9,
    color: '#1F2937',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  hourLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
    gap: 10,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default WaitTimeChart;