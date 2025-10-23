import { sendOTPWithCustomService, sendOTPWithEmailJS, sendOTPWithSendGrid } from '@/lib/services/mobileEmailService';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Test component for mobile email services
export const MobileEmailTest = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testEmailJS = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setIsLoading(true);
    addResult('Testing EmailJS...');
    
    try {
      const result = await sendOTPWithEmailJS(email);
      if (result.success) {
        addResult(`✅ EmailJS: ${result.message}`);
        if (result.otp) {
          addResult(`📧 OTP: ${result.otp}`);
        }
      } else {
        addResult(`❌ EmailJS: ${result.message}`);
      }
    } catch (error: any) {
      addResult(`❌ EmailJS Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSendGrid = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setIsLoading(true);
    addResult('Testing SendGrid...');
    
    try {
      const result = await sendOTPWithSendGrid(email);
      if (result.success) {
        addResult(`✅ SendGrid: ${result.message}`);
        if (result.otp) {
          addResult(`📧 OTP: ${result.otp}`);
        }
      } else {
        addResult(`❌ SendGrid: ${result.message}`);
      }
    } catch (error: any) {
      addResult(`❌ SendGrid Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCustomService = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setIsLoading(true);
    addResult('Testing Custom Service...');
    
    try {
      const result = await sendOTPWithCustomService(email);
      if (result.success) {
        addResult(`✅ Custom Service: ${result.message}`);
        if (result.otp) {
          addResult(`📧 OTP: ${result.otp}`);
        }
      } else {
        addResult(`❌ Custom Service: ${result.message}`);
      }
    } catch (error: any) {
      addResult(`❌ Custom Service Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const checkEnvVars = () => {
    const envVars = [
      'EXPO_PUBLIC_EMAILJS_SERVICE_ID',
      'EXPO_PUBLIC_EMAILJS_TEMPLATE_ID', 
      'EXPO_PUBLIC_EMAILJS_USER_ID',
      'EXPO_PUBLIC_SENDGRID_API_KEY',
      'EXPO_PUBLIC_SENDGRID_FROM_EMAIL',
      'EXPO_PUBLIC_EMAIL_SERVICE_URL',
      'EXPO_PUBLIC_EMAIL_SERVICE_API_KEY'
    ];

    const results = envVars.map(varName => {
      const value = process.env[varName];
      return `${varName}: ${value ? '✅ Set' : '❌ Missing'}`;
    });

    Alert.alert('Environment Variables', results.join('\n'));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mobile Email Service Test</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.emailjsButton, isLoading && styles.disabledButton]}
          onPress={testEmailJS}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test EmailJS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.sendgridButton, isLoading && styles.disabledButton]}
          onPress={testSendGrid}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test SendGrid</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.customButton, isLoading && styles.disabledButton]}
          onPress={testCustomService}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Custom</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.utilityContainer}>
        <TouchableOpacity
          style={[styles.utilityButton, styles.envButton]}
          onPress={checkEnvVars}
        >
          <Text style={styles.utilityButtonText}>Check Env Vars</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.utilityButton, styles.clearButton]}
          onPress={clearResults}
        >
          <Text style={styles.utilityButtonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.length === 0 ? (
          <Text style={styles.noResults}>No tests run yet</Text>
        ) : (
          testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>{result}</Text>
          ))
        )}
      </View>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  emailjsButton: {
    backgroundColor: '#007bff',
  },
  sendgridButton: {
    backgroundColor: '#1a73e8',
  },
  customButton: {
    backgroundColor: '#6c757d',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  utilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  utilityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  envButton: {
    backgroundColor: '#28a745',
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
  utilityButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noResults: {
    color: '#666',
    fontStyle: 'italic',
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
    fontFamily: 'monospace',
  },
});
