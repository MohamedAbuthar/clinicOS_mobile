import { ThemedText } from '@/components/themed-text';
import { BarChart3 } from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

export interface AppointmentData {
  day: string;
  total: number;
  completed: number;
  cancelled: number;
}

export interface AppointmentTrendsChartProps {
  data: AppointmentData[];
}

const { width } = Dimensions.get('window');

const AppointmentTrendsChart: React.FC<AppointmentTrendsChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BarChart3 size={20} color="#059669" />
          <ThemedText style={styles.title}>Appointment Trends</ThemedText>
        </View>
        <View style={styles.emptyState}>
          <BarChart3 size={48} color="#D1D5DB" />
          <ThemedText style={styles.emptyText}>No appointment data available</ThemedText>
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.total, d.completed, d.cancelled)), 1);
  const chartHeight = 180;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BarChart3 size={20} color="#059669" />
        <ThemedText style={styles.title}>Appointment Trends</ThemedText>
      </View>
      <ThemedText style={styles.subtitle}>Total, completed, and cancelled appointments</ThemedText>

      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisContainer}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <ThemedText key={ratio} style={styles.yAxisLabel}>
              {Math.round(maxValue * (1 - ratio))}
            </ThemedText>
          ))}
        </View>

        {/* Chart area */}
        <View style={styles.chartArea}>
          <View style={styles.chart}>
            {data.map((item, index) => {
              const barWidth = Math.max(20, (width - 120) / data.length);
              return (
                <View key={index} style={[styles.barGroup, { width: barWidth }]}>
                  {/* Total bar */}
                  <View style={styles.singleBarContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: (item.total / maxValue) * chartHeight || 2,
                          backgroundColor: '#14b8a6',
                        },
                      ]}
                    />
                    {item.total > 0 && (
                      <ThemedText style={styles.barValue}>{item.total}</ThemedText>
                    )}
                  </View>

                  {/* Completed bar */}
                  <View style={styles.singleBarContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: (item.completed / maxValue) * chartHeight || 2,
                          backgroundColor: '#22c55e',
                        },
                      ]}
                    />
                    {item.completed > 0 && (
                      <ThemedText style={styles.barValue}>{item.completed}</ThemedText>
                    )}
                  </View>

                  {/* Cancelled bar */}
                  <View style={styles.singleBarContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: (item.cancelled / maxValue) * chartHeight || 2,
                          backgroundColor: '#ef4444',
                        },
                      ]}
                    />
                    {item.cancelled > 0 && (
                      <ThemedText style={styles.barValue}>{item.cancelled}</ThemedText>
                    )}
                  </View>

                  {/* Day label */}
                  <ThemedText style={styles.dayLabel} numberOfLines={1}>
                    {item.day}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#14b8a6' }]} />
          <ThemedText style={styles.legendText}>Total</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#22c55e' }]} />
          <ThemedText style={styles.legendText}>Completed</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
          <ThemedText style={styles.legendText}>Cancelled</ThemedText>
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
  chartContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    minHeight: 220,
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
    flex: 1,
    overflow: 'hidden',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 200,
    paddingHorizontal: 4,
  },
  barGroup: {
    alignItems: 'center',
    marginHorizontal: 2,
  },
  singleBarContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  bar: {
    width: 10,
    borderRadius: 2,
    minHeight: 2,
  },
  barValue: {
    fontSize: 9,
    color: '#1F2937',
    fontWeight: '600',
    marginTop: 2,
  },
  dayLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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

export default AppointmentTrendsChart;
