import PatientSidebar from '@/components/PatientSidebar';
import { ThemedText } from '@/components/themed-text';
import { registerPatient } from '@/lib/firebase/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

// Custom SVG Components
const Menu = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12H21M3 6H21M3 18H21"
      stroke="#6B7280"
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

const Check = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function PatientRegister() {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data state
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    bloodGroup: '',
    height: '',
    weight: '',
    allergies: '',
    chronicConditions: '',
  });

  // Registration options
  const [registrationOptions] = useState({
    bloodGroups: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    genders: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  });

  // Get email from URL params
  useEffect(() => {
    if (emailParam && typeof emailParam === 'string') {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }
  }, [emailParam]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.dateOfBirth || !formData.gender) {
        setError('Please fill all personal info fields');
        return;
      }
    }
    if (step === 2) {
      if (!formData.phone || !formData.email || !formData.address) {
        setError('Please fill all contact info fields');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async () => {
    // Validate Step 3 fields
    if (!formData.bloodGroup || !formData.height || !formData.weight) {
      setError('Please fill all medical info fields');
      return;
    }

    if (!formData.email) {
      setError('Email is required for registration');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Build patient data
      const patientData: any = {
        name: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'male' | 'female' | 'other',
        isActive: true,
      };

      // Add optional fields if they have values
      if (formData.address && formData.address.trim()) {
        patientData.address = formData.address.trim();
      }
      if (formData.bloodGroup) {
        patientData.bloodGroup = formData.bloodGroup;
      }
      if (formData.height && parseFloat(formData.height)) {
        patientData.height = parseFloat(formData.height);
      }
      if (formData.weight && parseFloat(formData.weight)) {
        patientData.weight = parseFloat(formData.weight);
      }
      if (formData.allergies && formData.allergies.trim()) {
        patientData.allergies = formData.allergies.trim();
      }
      if (formData.chronicConditions && formData.chronicConditions.trim()) {
        patientData.chronicConditions = formData.chronicConditions.trim();
      }

      const response = await registerPatient(
        formData.email,
        formData.email, // Using email as password
        patientData
      );
      
      if (response.success && response.patient) {
        console.log('✅ Registration successful!');
        console.log('📝 Patient data:', response.patient);
        
        // Registration successful, redirect to login
        console.log('✅ Patient registration successful');
        console.log('🔄 Redirecting to login...');
        
        // Redirect to login page with email pre-filled
        router.replace(`/patient-auth?email=${encodeURIComponent(formData.email)}`);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.message?.includes('email-already-in-use') || error.message?.includes('already in use')) {
        setError('This email is already registered. Please login instead or use a different email.');
      } else if (error.message?.includes('invalid-email')) {
        setError('Invalid email format. Please check your email address.');
      } else if (error.message?.includes('weak-password')) {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/patient-auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <Menu />
          </TouchableOpacity>
          <View>
            <ThemedText style={styles.title}>Patient Registration</ThemedText>
            <ThemedText style={styles.subtitle}>Complete your registration</ThemedText>
          </View>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
          <ArrowLeft />
          <ThemedText style={styles.backText}>Back to Login</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <PatientSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <UserPlus />
            </View>
          </View>
          
          <ThemedText style={styles.cardTitle}>Patient Registration</ThemedText>
          <ThemedText style={styles.cardSubtitle}>
            Complete your registration in 3 simple steps
          </ThemedText>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            {['Personal Info', 'Contact Info', 'Medical Info'].map((label, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={[
                  styles.stepCircle,
                  step === index + 1 ? styles.stepCircleActive : 
                  step > index + 1 ? styles.stepCircleCompleted : styles.stepCircleInactive
                ]}>
                  {step > index + 1 ? <Check /> : <ThemedText style={styles.stepNumber}>{index + 1}</ThemedText>}
                </View>
                <ThemedText style={styles.stepLabel}>{label}</ThemedText>
              </View>
            ))}
          </View>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Full Name</ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.fullName}
                  onChangeText={(value) => handleChange('fullName', value)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Date of Birth</ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.dateOfBirth}
                  onChangeText={(value) => handleChange('dateOfBirth', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Gender</ThemedText>
                <View style={styles.genderContainer}>
                  {registrationOptions.genders.map((gender) => (
                    <TouchableOpacity
                      key={gender.value}
                      style={[
                        styles.genderOption,
                        formData.gender === gender.value && styles.genderOptionSelected
                      ]}
                      onPress={() => handleChange('gender', gender.value)}
                    >
                      <ThemedText style={[
                        styles.genderText,
                        formData.gender === gender.value && styles.genderTextSelected
                      ]}>
                        {gender.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <ThemedText style={styles.nextButtonText}>Next</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Contact Info */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Phone</ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(value) => handleChange('phone', value)}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={formData.email}
                  placeholder="Email verified via OTP"
                  placeholderTextColor="#9CA3AF"
                  editable={false}
                />
                <ThemedText style={styles.verifiedText}>✓ Email verified</ThemedText>
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Address</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.address}
                  onChangeText={(value) => handleChange('address', value)}
                  placeholder="Enter your address"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.stepButtons}>
                <TouchableOpacity style={styles.backButtonStep} onPress={handleBack}>
                  <ThemedText style={styles.backButtonText}>Back</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <ThemedText style={styles.nextButtonText}>Next</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 3: Medical Info */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Blood Group</ThemedText>
                <View style={styles.bloodGroupContainer}>
                  {registrationOptions.bloodGroups.map((bloodGroup) => (
                    <TouchableOpacity
                      key={bloodGroup}
                      style={[
                        styles.bloodGroupOption,
                        formData.bloodGroup === bloodGroup && styles.bloodGroupOptionSelected
                      ]}
                      onPress={() => handleChange('bloodGroup', bloodGroup)}
                    >
                      <ThemedText style={[
                        styles.bloodGroupText,
                        formData.bloodGroup === bloodGroup && styles.bloodGroupTextSelected
                      ]}>
                        {bloodGroup}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.rowContainer}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <ThemedText style={styles.label}>Height (cm)</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={formData.height}
                    onChangeText={(value) => handleChange('height', value)}
                    placeholder="170"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <ThemedText style={styles.label}>Weight (kg)</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={formData.weight}
                    onChangeText={(value) => handleChange('weight', value)}
                    placeholder="70"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>
                  Allergies <ThemedText style={styles.optionalText}>(Optional)</ThemedText>
                </ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.allergies}
                  onChangeText={(value) => handleChange('allergies', value)}
                  placeholder="Any known allergies..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>
                  Chronic Conditions <ThemedText style={styles.optionalText}>(Optional)</ThemedText>
                </ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.chronicConditions}
                  onChangeText={(value) => handleChange('chronicConditions', value)}
                  placeholder="Any chronic medical conditions..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.stepButtons}>
                <TouchableOpacity style={styles.backButtonStep} onPress={handleBack}>
                  <ThemedText style={styles.backButtonText}>Back</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.submitButton, isLoading && styles.disabledButton]} 
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  <ThemedText style={styles.submitButtonText}>
                    {isLoading ? 'Registering...' : 'Register'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
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
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#14B8A6',
  },
  stepCircleCompleted: {
    backgroundColor: '#10B981',
  },
  stepCircleInactive: {
    backgroundColor: '#D1D5DB',
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stepLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  stepContent: {
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  disabledInput: {
    backgroundColor: '#F9FAFB',
    color: '#9CA3AF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: '#14B8A6',
    borderColor: '#14B8A6',
  },
  genderText: {
    fontSize: 16,
    color: '#6B7280',
  },
  genderTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bloodGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodGroupOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    minWidth: 60,
  },
  bloodGroupOptionSelected: {
    backgroundColor: '#14B8A6',
    borderColor: '#14B8A6',
  },
  bloodGroupText: {
    fontSize: 14,
    color: '#6B7280',
  },
  bloodGroupTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  optionalText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  verifiedText: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
  },
  nextButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  stepButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  backButtonStep: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    flex: 0.45,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    flex: 0.45,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
});