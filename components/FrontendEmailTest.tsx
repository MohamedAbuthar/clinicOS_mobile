import { sendOTPWithEmailJS, sendOTPWithSimpleService } from '@/lib/services/frontendEmailService';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Test component for frontend-only email services
export const FrontendEmailTest = () => {
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

  const testSimpleService = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setIsLoading(true);
    addResult('Testing Simple Service...');
    
    try {
      const result = await sendOTPWithSimpleService(email);
      if (result.success) {
        addResult(`✅ Simple Service: ${result.message}`);
        if (result.otp) {
          addResult(`📧 OTP: ${result.otp}`);
        }
      } else {
        addResult(`❌ Simple Service: ${result.message}`);
      }
    } catch (error: any) {
      addResult(`❌ Simple Service Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const showEmailJSSetup = () => {
    Alert.alert(
      'EmailJS Setup',
      'To use EmailJS:\n\n1. Go to https://www.emailjs.com/\n2. Sign up for free account\n3. Create a service (Gmail, Outlook, etc.)\n4. Create an email template\n5. Update EMAILJS_CONFIG in frontendEmailService.ts\n\nSee the code comments for details.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Frontend Email Service Test</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ Frontend-Only Solution</Text>
        <Text style={styles.infoText}>
          This uses EmailJS (no backend required) or a simple service for testing.
          Check the console logs for OTP codes.
        </Text>
      </View>
      
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
          style={[styles.button, styles.simpleButton, isLoading && styles.disabledButton]}
          onPress={testSimpleService}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Simple Service</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.utilityContainer}>
        <TouchableOpacity
          style={[styles.utilityButton, styles.setupButton]}
          onPress={showEmailJSSetup}
        >
          <Text style={styles.utilityButtonText}>EmailJS Setup Guide</Text>
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

      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>💡 How It Works:</Text>
        <Text style={styles.helpText}>1. EmailJS sends real emails (requires setup)</Text>
        <Text style={styles.helpText}>2. Simple Service generates OTP for testing</Text>
        <Text style={styles.helpText}>3. Check console logs for OTP codes</Text>
        <Text style={styles.helpText}>4. No backend server required!</Text>
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
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
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
  simpleButton: {
    backgroundColor: '#28a745',
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
  setupButton: {
    backgroundColor: '#6c757d',
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
    marginBottom: 20,
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
  helpContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#856404',
  },
  helpText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 5,
  },
});
