import { ThemedText } from '@/components/themed-text';
import { useBackendPatientAuth } from '@/lib/contexts/BackendPatientAuthContext';
import { patientSignInWithEmail, registerPatient } from '@/lib/firebase/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
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

const UserPlus = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M8.5 7C8.5 9.20914 6.70914 11 4.5 11C2.29086 11 0.5 9.20914 0.5 7C0.5 4.79086 2.29086 3 4.5 3C6.70914 3 8.5 4.79086 8.5 7ZM20 8V14M17 11H23"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Eye = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EyeOff = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65661 6.06 6.06L17.94 17.94Z"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 1L23 23"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.06 6.06C4.777 7.34158 3.87358 8.93671 3.46094 10.68C3.04831 12.4233 3.13909 14.2423 3.723 15.96C4.30691 17.6777 5.36752 19.2302 6.78 20.4C8.19249 21.5698 9.89797 22.3095 11.68 22.54C13.462 22.7705 15.2423 22.4797 16.86 21.7L6.06 6.06Z"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 9C13.6569 9 15 10.3431 15 12C15 12.3407 14.9441 12.6741 14.8361 12.9923M17.94 17.94C16.6461 19.2437 14.9265 20.0263 13.1022 20.1356C11.2779 20.245 9.45769 19.6728 8 18.5M6.06 6.06C7.36854 4.78013 9.04283 3.99846 10.8228 3.88885C12.6028 3.77924 14.3027 4.34989 15.6 5.4"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function PatientAuth() {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useBackendPatientAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [fullName, setFullName] = useState('');
  const COUNTRY_CODE = '+91';
  const [localPhoneDigits, setLocalPhoneDigits] = useState(''); // 10 digits only
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasRedirected, setHasRedirected] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await patientSignInWithEmail(email, password);
      console.log('Login result:', result);
      if (result.success) {
        router.replace('/patient-dashboard');
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (error: any) {
      setError(error?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!fullName || !email || !password || localPhoneDigits.length !== 10) {
      setError('Please fill all required fields');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const patientData: any = {
        name: fullName,
        phone: `${COUNTRY_CODE} ${localPhoneDigits}`,
        isActive: true,
      };

      const response = await registerPatient(email, password, patientData);
      if (response.success && response.patient) {
        router.replace(`/patient-auth?email=${encodeURIComponent(email)}`);
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (e: any) {
      setError(e?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (error) setError('');
  };

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
          {/* Back to Home Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBackToHome}>
            <ArrowLeft />
            <ThemedText style={styles.backText}>Back to Home</ThemedText>
          </TouchableOpacity>

          <View style={styles.card}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                {isLoginMode ? <Users /> : <UserPlus />}
              </View>
            </View>

            {/* Title */}
            <ThemedText style={styles.title}>
              {isLoginMode ? 'Patient Login' : 'Patient Signup'}
            </ThemedText>
            
            {/* Subtitle */}
            <ThemedText style={styles.subtitle}>
              {isLoginMode 
                ? 'Enter your credentials to access your account' 
                : 'Create a new account to book appointments'
              }
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
                  style={styles.input}
                  value={email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Enter your email address"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Full Name (Signup only) */}
            {!isLoginMode && (
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Full Name</ThemedText>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            )}

            {/* Phone (Signup only) with fixed country code and 10 digits - matching AddAppointmentDialog layout */}
            {!isLoginMode && (
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Phone Number</ThemedText>
                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCode}>
                    <ThemedText style={styles.countryCodeText}>{COUNTRY_CODE}</ThemedText>
                  </View>
                  <View style={styles.phoneInputBox}>
                    <TextInput
                      style={styles.phoneTextInput}
                      value={localPhoneDigits}
                      onChangeText={(text) => {
                        const digits = text.replace(/\D/g, '').slice(0, 10);
                        setLocalPhoneDigits(digits);
                        if (error) setError('');
                      }}
                      placeholder="1234567890"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={10}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Role (Signup only, fixed as Patient) */}
            {!isLoginMode && (
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Role</ThemedText>
                <View style={[styles.input, styles.readonlyField]}>
                  <ThemedText style={styles.readonlyText}>Patient</ThemedText>
                </View>
              </View>
            )}

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <Lock />
                </View>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.eyeIcon,
                    pressed && styles.eyeIconPressed
                  ]}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Pressable>
              </View>
            </View>

            {/* Login/Signup Button */}
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.disabledButton]}
              onPress={isLoginMode ? handleLogin : handleSignup}
              disabled={isLoading}
            >
              <ThemedText style={styles.primaryButtonText}>
                {isLoading ? 'Processing...' : (isLoginMode ? 'Login' : 'Sign Up')}
              </ThemedText>
            </TouchableOpacity>

            {/* Toggle between Login and Signup */}
            <View style={styles.toggleContainer}>
              <ThemedText style={styles.toggleText}>
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              </ThemedText>
              <TouchableOpacity onPress={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
                setPassword('');
              }}>
                <ThemedText style={styles.toggleLink}>
                  {isLoginMode ? 'Sign Up' : 'Login'}
                </ThemedText>
              </TouchableOpacity>
            </View>
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
    zIndex: 0,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 12,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    zIndex: 10,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  eyeIconPressed: {
    opacity: 0.7,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingLeft: 48,
    paddingRight: 52,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  readonlyField: {
    paddingLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  readonlyText: {
    color: '#111827',
    fontSize: 16,
  },
  countryCode: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    justifyContent: 'center',
    minWidth: 60,
  },
  countryCodeText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  phoneInputBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  phoneTextInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    color: '#6B7280',
    fontSize: 14,
  },
  toggleLink: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '500',
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
