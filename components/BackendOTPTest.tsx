import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { validateBackendConfig } from '../lib/config/backendConfig';
import { sendOTPEmail, verifyOTPEmail } from '../lib/services/emailOTPService';

export default function BackendOTPTest() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [result, setResult] = useState('');

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      const config = validateBackendConfig();
      console.log('Backend config:', config);

      const response = await sendOTPEmail(email);
      console.log('Send OTP response:', response);

      if (response.success) {
        setIsOtpSent(true);
        setResult(`✅ OTP sent successfully! ${response.message}`);
        Alert.alert('Success', 'OTP sent successfully!');
      } else {
        setResult(`❌ Failed to send OTP: ${response.message}`);
        Alert.alert('Error', response.message);
      }
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
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
    setResult('');

    try {
      const response = await verifyOTPEmail(email, otp);
      console.log('Verify OTP response:', response);

      if (response.success) {
        setResult(`✅ OTP verified successfully! ${response.message}`);
        Alert.alert('Success', 'OTP verified successfully!');
      } else {
        setResult(`❌ OTP verification failed: ${response.message}`);
        Alert.alert('Error', response.message);
      }
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend OTP Test</Text>
      
      <View style={styles.section}>
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
          <View style={styles.section}>
            <Text style={styles.label}>OTP Code</Text>
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
        </>
      )}

      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
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
  button: {
    backgroundColor: '#14B8A6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  resultContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
  },
});
