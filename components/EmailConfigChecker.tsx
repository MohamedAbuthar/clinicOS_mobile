import { getAvailableEmailServices, getEmailConfigStatus } from '@/lib/config/emailConfig';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Component to check email configuration status
export const EmailConfigChecker = () => {
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkConfig();
  }, []);

  const checkConfig = () => {
    setIsLoading(true);
    const status = getEmailConfigStatus();
    const services = getAvailableEmailServices();
    setConfigStatus({ ...status, availableServices: services });
    setIsLoading(false);
  };

  const showDetailedInfo = () => {
    const details = [
      `EmailJS Service ID: ${process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID ? '✅ Set' : '❌ Missing'}`,
      `EmailJS Template ID: ${process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID ? '✅ Set' : '❌ Missing'}`,
      `EmailJS User ID: ${process.env.EXPO_PUBLIC_EMAILJS_USER_ID ? '✅ Set' : '❌ Missing'}`,
      `SendGrid API Key: ${process.env.EXPO_PUBLIC_SENDGRID_API_KEY ? '✅ Set' : '❌ Missing'}`,
      `SendGrid From Email: ${process.env.EXPO_PUBLIC_SENDGRID_FROM_EMAIL ? '✅ Set' : '❌ Missing'}`,
      `Custom Service URL: ${process.env.EXPO_PUBLIC_EMAIL_SERVICE_URL ? '✅ Set' : '❌ Missing'}`,
      `Custom Service API Key: ${process.env.EXPO_PUBLIC_EMAIL_SERVICE_API_KEY ? '✅ Set' : '❌ Missing'}`,
    ];
    
    Alert.alert('Configuration Details', details.join('\n'));
  };

  const showSetupInstructions = () => {
    Alert.alert(
      'Setup Instructions',
      '1. Create .env file in your app root\n2. Add email service credentials\n3. Restart your development server\n\nSee EMAIL_SETUP_GUIDE.md for detailed instructions.',
      [
        { text: 'OK' },
        { text: 'Check Details', onPress: showDetailedInfo }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Checking configuration...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Email Configuration Status</Text>
      
      <View style={[
        styles.statusCard,
        configStatus?.hasConfig ? styles.successCard : styles.errorCard
      ]}>
        <Text style={[
          styles.statusText,
          configStatus?.hasConfig ? styles.successText : styles.errorText
        ]}>
          {configStatus?.hasConfig ? '✅ Configured' : '❌ Not Configured'}
        </Text>
        
        <Text style={styles.messageText}>
          {configStatus?.message}
        </Text>
        
        {configStatus?.availableServices && configStatus.availableServices.length > 0 && (
          <View style={styles.servicesContainer}>
            <Text style={styles.servicesTitle}>Available Services:</Text>
            {configStatus.availableServices.map((service: string, index: number) => (
              <Text key={index} style={styles.serviceText}>• {service}</Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={checkConfig}
        >
          <Text style={styles.buttonText}>Refresh Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={showDetailedInfo}
        >
          <Text style={styles.buttonText}>Show Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.helpButton]}
          onPress={showSetupInstructions}
        >
          <Text style={styles.buttonText}>Setup Help</Text>
        </TouchableOpacity>
      </View>

      {!configStatus?.hasConfig && (
        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>Quick Setup:</Text>
          <Text style={styles.helpText}>1. Create .env file in app root</Text>
          <Text style={styles.helpText}>2. Add email service credentials</Text>
          <Text style={styles.helpText}>3. Restart development server</Text>
          <Text style={styles.helpText}>4. Test with MobileEmailTest component</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  statusCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
  },
  successCard: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  errorCard: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  successText: {
    color: '#155724',
  },
  errorText: {
    color: '#721c24',
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  servicesContainer: {
    marginTop: 10,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  serviceText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  infoButton: {
    backgroundColor: '#6c757d',
  },
  helpButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  helpContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
