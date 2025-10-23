import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  iconBgColor?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export function StatCard({ title, value, icon: Icon, iconBgColor = 'bg-blue-50', variant = 'primary' }: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { iconColor: '#2563EB', bgColor: '#EFF6FF' };
      case 'secondary':
        return { iconColor: '#6B7280', bgColor: '#F9FAFB' };
      case 'success':
        return { iconColor: '#059669', bgColor: '#ECFDF5' };
      case 'warning':
        return { iconColor: '#D97706', bgColor: '#FFFBEB' };
      case 'danger':
        return { iconColor: '#DC2626', bgColor: '#FEF2F2' };
      default:
        return { iconColor: '#2563EB', bgColor: '#EFF6FF' };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: variantStyles.bgColor }]}>
          <Icon width={24} height={24} color={variantStyles.iconColor} />
        </View>
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.value}>{value}</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
});
