import AuthDebug from '@/components/AuthDebug';
import { ThemedText } from '@/components/themed-text';
import { useBackendPatientAuth } from '@/lib/contexts/BackendPatientAuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

// Custom SVG Components
const ArrowLeft = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19L5 12L12 5"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Users = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Mail = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 6L12 13L2 6"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Lock = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function PatientLogin() {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams();
  const { sendOTP, resendOTP, login, isAuthenticated, isLoading: authLoading } = useBackendPatientAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds (matching web app)
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasRedirected, setHasRedirected] = useState(false);

  // Set email from URL parameter if provided
  useEffect(() => {
    if (emailParam && typeof emailParam === 'string') {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Redirect if already authenticated - only once
  useEffect(() => {
    if (!authLoading && isAuthenticated && !hasRedirected) {
      console.log('✅ Already authenticated, redirecting to dashboard');
      setHasRedirected(true);
      // Use a small delay to ensure state is fully updated
      const timer = setTimeout(() => {
        router.replace('/patient-dashboard');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router, hasRedirected, authLoading]);

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleSendOTP = async () => {
    if (!email || !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await sendOTP(email);
      if (result.success) {
        setIsOtpSent(true);
        setTimeLeft(180); // Reset timer to 3 minutes (matching web app)
        setIsTimerActive(true);
        setOtp('');
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, otp);
      console.log('Login result:', result); // Debug log
      
      if (result.success) {
        if (result.patient && result.token) {
          // Existing patient - logged in successfully
          console.log('✅ Existing patient logged in successfully');
          console.log('Token stored:', result.token);
          
          // Wait a bit to ensure token is stored
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Redirect to dashboard for existing users
          console.log('Redirecting to dashboard...');
          router.push('/patient-dashboard');
        } else if (result.isNewUser) {
          // New patient - needs to complete registration
          console.log('📝 New patient - redirecting to registration');
          router.push(`/patient-register?email=${encodeURIComponent(email)}`);
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        console.log('❌ Login failed:', result.message);
        setError(result.message);
      }
    } catch (error: any) {
      console.log('❌ Login error:', error);
      setError(error.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email || !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await resendOTP(email);
      if (result.success) {
        setTimeLeft(180); // Reset timer to 3 minutes (matching web app)
        setIsTimerActive(true);
        setOtp('');
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleOtpChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 6) {
      setOtp(numericValue);
      // Clear error when user starts typing
      if (error) setError('');
    }
  };

  const isTimerExpired = isTimerActive && timeLeft === 0;

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Debug Component */}
          <AuthDebug />
          
          {/* Back to Home Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBackToHome}>
            <ArrowLeft />
            <ThemedText style={styles.backText}>Back to Home</ThemedText>
          </TouchableOpacity>

          <View style={styles.card}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Users />
              </View>
            </View>

            {/* Title */}
            <ThemedText style={styles.title}>Patient Login</ThemedText>
            
            {/* Subtitle */}
            <ThemedText style={styles.subtitle}>
              {isOtpSent ? 'Enter the OTP sent to your email' : 'Enter your email address to receive OTP'}
            </ThemedText>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email Address</ThemedText>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <Mail />
                </View>
                <TextInput
                  style={[styles.input, isOtpSent && styles.disabledInput]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError('');
                  }}
                  placeholder="Enter your email address"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isOtpSent}
                />
              </View>
            </View>

            {/* Send OTP Button */}
            {!isOtpSent && (
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.disabledButton]}
                onPress={handleSendOTP}
                disabled={isLoading}
              >
                <ThemedText style={styles.primaryButtonText}>
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </ThemedText>
              </TouchableOpacity>
            )}

            {/* OTP Input - Show only after OTP is sent */}
            {isOtpSent && (
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.otpHeader}>
                    <ThemedText style={styles.label}>Enter OTP</ThemedText>
                    <ThemedText style={[styles.timer, isTimerExpired && styles.timerExpired]}>
                      {formatTime(timeLeft)}
                    </ThemedText>
                  </View>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Lock />
                    </View>
                    <TextInput
                      style={[styles.input, isTimerExpired && styles.disabledInput]}
                      value={otp}
                      onChangeText={handleOtpChange}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      maxLength={6}
                      editable={!isTimerExpired}
                      autoFocus={true}
                    />
                  </View>
                  {isTimerExpired && (
                    <ThemedText style={styles.expiredText}>
                      OTP has expired. Please request a new one.
                    </ThemedText>
                  )}
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (isTimerExpired || isLoading || otp.length !== 6) && styles.disabledButton
                  ]}
                  onPress={handleVerifyOTP}
                  disabled={isTimerExpired || isLoading || otp.length !== 6}
                >
                  <ThemedText style={styles.primaryButtonText}>
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </ThemedText>
                </TouchableOpacity>

                {/* Resend OTP */}
                <View style={styles.resendContainer}>
                  {isTimerExpired ? (
                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={handleResendOTP}
                      disabled={isLoading}
                    >
                      <ThemedText style={[styles.resendText, isLoading && styles.disabledText]}>
                        {isLoading ? 'Resending...' : 'Resend OTP'}
                      </ThemedText>
                    </TouchableOpacity>
                  ) : (
                    <ThemedText style={styles.timerText}>
                      Didn't receive OTP? <ThemedText style={styles.timerSubText}>({formatTime(timeLeft)})</ThemedText>
                    </ThemedText>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBackground: {
    backgroundColor: '#14B8A6',
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 12,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingLeft: 48,
    paddingRight: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledInput: {
    backgroundColor: '#F9FAFB',
    color: '#9CA3AF',
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timer: {
    fontSize: 14,
    fontWeight: '500',
    color: '#14B8A6',
  },
  timerExpired: {
    color: '#DC2626',
  },
  expiredText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 8,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendButton: {
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#14B8A6',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  timerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  timerSubText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#14B8A6',
  },
});