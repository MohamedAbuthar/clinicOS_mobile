import { login, sendOTP } from '@/lib/firebase/patientAuth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Simple OTP display component
export const SimpleOTPDisplay = () => {
  const router = useRouter();
  const [email, setEmail] = useState('mohamedsabeer6142@gmail.com');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');

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
        if (result.otp) {
          setGeneratedOTP(result.otp);
        }
        Alert.alert('Success', `OTP generated: ${result.otp || 'Check console'}`);
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
        
        // Navigate to dashboard
        try {
          if (result.isNewUser) {
            await router.push(`/patient-register?email=${encodeURIComponent(email)}`);
          } else {
            await router.push('/patient-dashboard');
          }
        } catch (navError) {
          Alert.alert('Navigation Error', `Login successful but navigation failed: ${navError}`);
        }
        
        setIsOtpSent(false);
        setEmail('');
        setOtp('');
        setGeneratedOTP('');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>OTP Test</Text>
      
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
            {isLoading ? 'Generating...' : 'Generate OTP'}
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          {/* OTP Display */}
          {generatedOTP && (
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Your OTP Code:</Text>
              <View style={styles.otpBox}>
                <Text style={styles.otpText}>{generatedOTP}</Text>
              </View>
              <Text style={styles.otpNote}>Enter this code below to verify</Text>
            </View>
          )}

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
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => {
              setIsOtpSent(false);
              setOtp('');
              setGeneratedOTP('');
            }}
          >
            <Text style={styles.backButtonText}>Back to Email</Text>
          </TouchableOpacity>
        </>
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
  otpContainer: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  otpLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1976d2',
  },
  otpBox: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196f3',
    borderRadius: 8,
    padding: 20,
    marginBottom: 10,
  },
  otpText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1976d2',
    letterSpacing: 4,
  },
  otpNote: {
    fontSize: 14,
    textAlign: 'center',
    color: '#1976d2',
    fontStyle: 'italic',
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
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6c757d',
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
});
