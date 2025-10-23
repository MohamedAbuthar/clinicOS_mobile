import { login, sendOTP } from '@/lib/firebase/patientAuth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Complete OTP test component - tests both email sending and navigation
export const CompleteOTPTest = () => {
  const router = useRouter();
  const [email, setEmail] = useState('mohamedsabeer6142@gmail.com');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setIsLoading(true);
    addResult(`Sending OTP to ${email}...`);
    
    try {
      const result = await sendOTP(email);
      if (result.success) {
        setIsOtpSent(true);
        addResult(`✅ ${result.message}`);
        if (result.otp) {
          addResult(`📧 OTP Code: ${result.otp}`);
        }
        Alert.alert('Success', result.message);
      } else {
        addResult(`❌ ${result.message}`);
        Alert.alert('Error', result.message);
      }
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setIsLoading(true);
    addResult(`Verifying OTP: ${otp}...`);
    
    try {
      const result = await login(email, otp);
      if (result.success) {
        addResult(`✅ Login successful!`);
        addResult(`👤 Patient: ${result.isNewUser ? 'New' : 'Existing'}`);
        addResult(`🆔 Patient ID: ${result.patient?.id || 'N/A'}`);
        addResult(`🔑 Token: ${result.token || 'N/A'}`);
        
        // Test navigation
        addResult(`🧭 Testing navigation...`);
        try {
          if (result.isNewUser) {
            addResult(`📝 Redirecting to registration...`);
            await router.replace(`/patient-register?email=${encodeURIComponent(email)}`);
            addResult(`✅ Registration navigation successful`);
          } else {
            addResult(`📊 Redirecting to dashboard...`);
            await router.replace('/patient-dashboard');
            addResult(`✅ Dashboard navigation successful`);
          }
        } catch (navError) {
          addResult(`❌ Navigation error: ${navError}`);
          Alert.alert('Navigation Error', `Login successful but navigation failed: ${navError}`);
        }
        
        Alert.alert('Success', 'OTP verified and navigation successful!');
        setIsOtpSent(false);
        setEmail('');
        setOtp('');
      } else {
        addResult(`❌ Login failed: ${result.message}`);
        Alert.alert('Error', result.message);
      }
    } catch (error: any) {
      addResult(`❌ Login error: ${error.message}`);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testNavigation = async () => {
    addResult(`🧭 Testing direct navigation...`);
    try {
      await router.replace('/patient-dashboard');
      addResult(`✅ Direct navigation successful`);
    } catch (navError) {
      addResult(`❌ Direct navigation error: ${navError}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Complete OTP Test</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🎯 Complete OTP Flow Test</Text>
        <Text style={styles.infoText}>
          This tests the complete OTP flow: email sending, OTP verification, and navigation.
          It should work exactly like your web application.
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
          editable={!isOtpSent}
        />
      </View>

      {!isOtpSent ? (
        <TouchableOpacity
          style={[styles.button, styles.sendButton, isLoading && styles.disabledButton]}
          onPress={handleSendOTP}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Sending...' : 'Send OTP'}
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter OTP</Text>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter 6-digit OTP"
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.verifyButton, isLoading && styles.disabledButton]}
            onPress={handleVerifyOTP}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Verifying...' : 'Verify OTP & Test Navigation'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => {
              setIsOtpSent(false);
              setOtp('');
            }}
          >
            <Text style={styles.backButtonText}>Back to Email</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={[styles.button, styles.navButton]}
        onPress={testNavigation}
      >
        <Text style={styles.buttonText}>Test Direct Navigation</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.clearButton]}
        onPress={clearResults}
      >
        <Text style={styles.buttonText}>Clear Results</Text>
      </TouchableOpacity>

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
    marginBottom: 15,
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
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
  },
  verifyButton: {
    backgroundColor: '#28a745',
  },
  navButton: {
    backgroundColor: '#6c757d',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  backButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 20,
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
