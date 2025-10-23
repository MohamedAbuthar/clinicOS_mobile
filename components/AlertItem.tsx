import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface Alert {
  id: string;
  message: string;
  timestamp: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AlertItemProps {
  alert: Alert;
}

export function AlertItem({ alert }: AlertItemProps) {
  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'success':
        return styles.successAlert;
      case 'info':
        return styles.infoAlert;
      case 'warning':
        return styles.warningAlert;
      case 'error':
        return styles.errorAlert;
      default:
        return styles.infoAlert;
    }
  };

  const getIconText = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'info':
        return 'i';
      case 'warning':
        return '!';
      case 'error':
        return '✕';
      default:
        return 'i';
    }
  };

  return (
    <View style={[styles.alertItem, getAlertStyle(alert.type)]}>
      <View style={[styles.alertIcon, getAlertStyle(alert.type)]}>
        <ThemedText style={styles.alertIconText}>
          {getIconText(alert.type)}
        </ThemedText>
      </View>
      <View style={styles.alertContent}>
        <ThemedText style={styles.alertMessage}>{alert.message}</ThemedText>
        <ThemedText style={styles.alertTimestamp}>{alert.timestamp}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  alertIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  successAlert: {
    backgroundColor: '#D1FAE5',
  },
  infoAlert: {
    backgroundColor: '#EFF6FF',
  },
  warningAlert: {
    backgroundColor: '#FEF3C7',
  },
  errorAlert: {
    backgroundColor: '#FEE2E2',
  },
  alertIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 12,
    color: '#111827',
    marginBottom: 2,
  },
  alertTimestamp: {
    fontSize: 10,
    color: '#6B7280',
  },
});
