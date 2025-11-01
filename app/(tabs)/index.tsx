import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

// Custom SVG Components matching the web app exactly
const ClinicFlowLogo = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12C3 12 5.5 6 12 6C18.5 6 21 12 21 12M12 12V20M12 12L8 8M12 12L16 8"
      stroke="#14B8A6"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke="#14B8A6" strokeWidth="2" />
    <Path d="M8 2V6M16 2V6M3 10H21" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const QueueIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="7" r="4" stroke="#14B8A6" strokeWidth="2" />
    <Path
      d="M3 21C3 17.134 6.13401 14 10 14C11.0535 14 12.0543 14.2115 12.9621 14.5939"
      stroke="#14B8A6"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Circle cx="17" cy="10" r="3" stroke="#14B8A6" strokeWidth="2" />
    <Path
      d="M13 19C13 16.7909 14.7909 15 17 15C19.2091 15 21 16.7909 21 19"
      stroke="#14B8A6"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const DocumentIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 2H15L19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6L9 2Z"
      stroke="#14B8A6"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Path
      d="M9 2V6H5M9 13H15M9 17H15M9 9H15"
      stroke="#14B8A6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AnalyticsIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12C3 12 5.5 6 12 6C18.5 6 21 12 21 12M12 12V20M12 12L8 8M12 12L16 8"
      stroke="#14B8A6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function HomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth-login');
  };

  const handleSignIn = () => {
    router.push('/auth-login');
  };

  const handlePatientPortal = () => {
    router.push('/patient-auth');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <ClinicFlowLogo />
            <ThemedText style={styles.logoText}>ClinicFlow</ThemedText>
          </View>
          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <ThemedText style={styles.signInText}>Sign In</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <ThemedText style={styles.heroTitle}>Modern Healthcare Management</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Streamline your clinic operations with our comprehensive management
            system. Handle appointments, queues, patient records, and more in
            one place.
          </ThemedText>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
              <ThemedText style={styles.primaryButtonText}>Get Started</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePatientPortal}>
              <ThemedText style={styles.secondaryButtonText}>Patient Portal</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          {/* Appointments Card */}
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <CalendarIcon />
            </View>
            <ThemedText style={styles.featureTitle}>Appointments</ThemedText>
            <ThemedText style={styles.featureDescription}>
              Manage appointments efficiently with automated scheduling
            </ThemedText>
          </View>

          {/* Queue Management Card */}
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <QueueIcon />
            </View>
            <ThemedText style={styles.featureTitle}>Queue Management</ThemedText>
            <ThemedText style={styles.featureDescription}>
              Smart queue system to reduce wait times and improve flow
            </ThemedText>
          </View>

          {/* Medical Records Card */}
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <DocumentIcon />
            </View>
            <ThemedText style={styles.featureTitle}>Medical Records</ThemedText>
            <ThemedText style={styles.featureDescription}>
              Secure digital records accessible anytime, anywhere
            </ThemedText>
          </View>

          {/* Real-time Analytics Card */}
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <AnalyticsIcon />
            </View>
            <ThemedText style={styles.featureTitle}>Real-time Analytics</ThemedText>
            <ThemedText style={styles.featureDescription}>
              Track performance metrics and optimize operations
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray background matching web app
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  signInButton: {
    backgroundColor: '#14B8A6', // teal-600 matching web app
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 64,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '700',
    color: '#14B8A6', // teal-500 matching web app
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 48,
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#6B7280', // gray-500 matching web app
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
    paddingHorizontal: 10,
    maxWidth: 768, // max-w-3xl equivalent
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#14B8A6', // teal-600 matching web app
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 120,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300 matching web app
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 120,
  },
  secondaryButtonText: {
    color: '#6B7280', // gray-500 matching web app
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  featuresContainer: {
    paddingHorizontal: 20,
    paddingBottom: 64,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200 matching web app
  },
  featureIcon: {
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827', // gray-900 matching web app
    marginBottom: 12,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280', // gray-500 matching web app
    textAlign: 'center',
    lineHeight: 20,
  },
});