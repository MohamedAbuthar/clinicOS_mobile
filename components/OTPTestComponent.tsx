import { login, sendOTP } from '@/lib/firebase/patientAuth';
import { testApiEndpoint, testApiHealth } from '@/lib/utils/apiTest';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { APISetupGuide } from './APISetupGuide';

// Test component for OTP functionality
// This can be used to test the OTP system independently
export const OTPTestComponent = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendOTP(email);
      if (result.success) {
        setIsOtpSent(true);
        Alert.alert('Success', 'OTP sent successfully! Check your email.');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error: any) {
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
    try {
      const result = await login(email, otp);
      if (result.success) {
        Alert.alert('Success', 'OTP verified successfully!');
        setIsOtpSent(false);
        setEmail('');
        setOtp('');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestApi = async () => {
    setIsTestingApi(true);
    try {
      const result = await testApiEndpoint();
      Alert.alert(
        result.success ? 'API Test Success' : 'API Test Failed',
        result.message,
        result.details ? [{ text: 'View Details', onPress: () => console.log('API Test Details:', result.details) }] : undefined
      );
    } catch (error: any) {
      Alert.alert('API Test Error', error.message);
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleTestHealth = async () => {
    setIsTestingApi(true);
    try {
      const result = await testApiHealth();
      Alert.alert(
        result.success ? 'Health Check Passed' : 'Health Check Failed',
        result.message
      );
    } catch (error: any) {
      Alert.alert('Health Check Error', error.message);
    } finally {
      setIsTestingApi(false);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <APISetupGuide />
      
      <View style={styles.container}>
        <Text style={styles.title}>OTP Test Component</Text>
        
        {/* API Testing Buttons */}
        <View style={styles.testButtonsContainer}>
          <TouchableOpacity
            style={[styles.testButton, isTestingApi && styles.disabledButton]}
            onPress={handleTestApi}
            disabled={isTestingApi}
          >
            <Text style={styles.testButtonText}>
              {isTestingApi ? 'Testing...' : 'Test API Endpoint'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, isTestingApi && styles.disabledButton]}
            onPress={handleTestHealth}
            disabled={isTestingApi}
          >
            <Text style={styles.testButtonText}>
              {isTestingApi ? 'Testing...' : 'Test Health Check'}
            </Text>
          </TouchableOpacity>
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
          style={[styles.button, isLoading && styles.disabledButton]}
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
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleVerifyOTP}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setIsOtpSent(false);
              setOtp('');
            }}
          >
            <Text style={styles.secondaryButtonText}>Back to Email</Text>
          </TouchableOpacity>
        </>
      )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
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
    backgroundColor: '#14B8A6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  secondaryButtonText: {
    color: '#14B8A6',
    fontSize: 16,
    fontWeight: '500',
  },
  testButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  testButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
