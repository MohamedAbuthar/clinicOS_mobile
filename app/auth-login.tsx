import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'expo-router';
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

const ClinicFlowLogo = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12C3 12 5.5 6 12 6C18.5 6 21 12 21 12M12 12V20M12 12L8 8M12 12L16 8"
      stroke="#0D9488"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckCircle = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
      stroke="#10B981"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AlertCircle = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
      stroke="#EF4444"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Loader2 = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronDown = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9L12 15L18 9"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function AuthLogin() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'doctor' | 'assistant'>('admin');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/admin-dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (activeTab === 'login') {
      try {
        const result = await login(email, password);
        if (result.success) {
          setSuccessMessage('Login successful! Redirecting...');
          // The useEffect will handle redirection
        } else {
          setError(result.message || 'Invalid email or password');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    } else {
      // Signup logic remains for now, but focus is on login alignment
      setError('Signup is not aligned with the new flow yet.');
      setLoading(false);
    }
  };

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
            {/* Success Message */}
            {successMessage && (
              <View style={styles.successContainer}>
                <CheckCircle />
                <ThemedText style={styles.successText}>{successMessage}</ThemedText>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle />
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            )}

            {/* Logo and Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <ClinicFlowLogo />
                <ThemedText style={styles.logoText}>ClinicFlow</ThemedText>
              </View>
              <ThemedText style={styles.title}>Welcome</ThemedText>
              <ThemedText style={styles.subtitle}>
                Sign in to your staff account or create a new one
              </ThemedText>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                onPress={() => {
                  setActiveTab('login');
                  setIsRoleDropdownOpen(false);
                }}
              >
                <ThemedText style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                  Login
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
                onPress={() => {
                  setActiveTab('signup');
                  setIsRoleDropdownOpen(false);
                }}
              >
                <ThemedText style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>
                  Sign Up
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Full Name Field - Only for Sign Up */}
              {activeTab === 'signup' && (
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Full Name</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="John Doe"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}

              {/* Email Field */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Phone Field - Only for Sign Up */}
              {activeTab === 'signup' && (
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Phone Number</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+1234567890"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              {/* Role Field - Only for Sign Up */}
              {activeTab === 'signup' && (
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Role</ThemedText>
                  <View style={styles.selectWrapper}>
                    <TouchableOpacity
                      style={styles.selectContainer}
                      onPress={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    >
                      <ThemedText style={styles.selectText}>
                        {role === 'admin' ? 'Administrator' : role === 'doctor' ? 'Doctor' : 'Assistant'}
                      </ThemedText>
                      <ChevronDown />
                    </TouchableOpacity>
                    {isRoleDropdownOpen && (
                      <View style={styles.selectOptions}>
                        <TouchableOpacity
                          style={[styles.selectOption, role === 'admin' && styles.selectedOption]}
                          onPress={() => {
                            setRole('admin');
                            setIsRoleDropdownOpen(false);
                          }}
                        >
                          <ThemedText style={[styles.selectOptionText, role === 'admin' && styles.selectedOptionText]}>
                            Administrator
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.selectOption, role === 'doctor' && styles.selectedOption]}
                          onPress={() => {
                            setRole('doctor');
                            setIsRoleDropdownOpen(false);
                          }}
                        >
                          <ThemedText style={[styles.selectOptionText, role === 'doctor' && styles.selectedOptionText]}>
                            Doctor
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.selectOption, role === 'assistant' && styles.selectedOption]}
                          onPress={() => {
                            setRole('assistant');
                            setIsRoleDropdownOpen(false);
                          }}
                        >
                          <ThemedText style={[styles.selectOptionText, role === 'assistant' && styles.selectedOptionText]}>
                            Assistant
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Password Field */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Loader2 />
                    <ThemedText style={styles.submitButtonText}>
                      {activeTab === 'login' ? 'Signing In...' : 'Creating Account...'}
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText style={styles.submitButtonText}>
                    {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                  </ThemedText>
                )}
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
    backgroundColor: '#F3F4F6',
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
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#065F46',
    marginLeft: 8,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    marginLeft: 8,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6B7280',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#111827',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  selectWrapper: {
    position: 'relative',
  },
  selectContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#111827',
  },
  selectOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedOption: {
    backgroundColor: '#F0FDF4',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#111827',
  },
  selectedOptionText: {
    color: '#14B8A6',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});