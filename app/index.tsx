import { ThemedText } from '@/components/themed-text';
import { useDoctors } from '@/lib/hooks/useDoctors';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

// SVG Icons matching web app
const StarIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
      fill="#14B8A6"
    />
  </Svg>
);

const HeartIcon = () => (
  <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z"
      stroke="#14B8A6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UserIcon = () => (
  <Svg width={80} height={80} viewBox="0 0 24 24" fill="#14B8A6">
    <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </Svg>
);

// Treatment Icons
const FeverIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="#EF4444">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1s1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 1.38-.56 2.63-1.46 3.54L12 12.54l-3.54-3.54C7.56 8.63 7 7.38 7 6c0-2.76 2.24-5 5-5z" />
  </Svg>
);

const CoughIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="#EAB308">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </Svg>
);

const HeadacheIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="#EF4444">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </Svg>
);

const ToothacheIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="#FFFFFF">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </Svg>
);

const AllergiesIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="#EC4899">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </Svg>
);

const SkinIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="#EAB308">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

// Contact Icons
const PhoneIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="#6B7280">
    <Path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </Svg>
);

const EmailIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="#6B7280">
    <Path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </Svg>
);

const LocationIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="#6B7280">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </Svg>
);

export default function MainDashboard() {
  const router = useRouter();
  const { doctors, loading, error } = useDoctors();
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);

  const handleLogin = () => {
    router.push('/auth-login');
  };

  const handleBookAppointment = () => {
    router.push('/patient-auth');
  };

  // Always show all doctors
  useEffect(() => {
    if (loading || !doctors.length) return;
    setFilteredDoctors(doctors);
    console.log('Main dashboard - showing all doctors:', doctors.length);
    console.log('Doctor data sample:', doctors[0]); // Log first doctor to see structure
  }, [doctors, loading]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <StarIcon />
            </View>
            <View>
              <ThemedText style={styles.logoTitle}>HealthCare Clinic</ThemedText>
              <ThemedText style={styles.logoSubtitle}>Your Health, Our Priority</ThemedText>
            </View>
          </View>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <ThemedText style={styles.loginButtonText}>Admin login</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <HeartIcon />
          </View>
          <ThemedText style={styles.heroTitle}>
            Compassionate Care for{'\n'}Every Patient
          </ThemedText>
          <ThemedText style={styles.heroDescription}>
            We provide compassionate, personalized care for every patient. Your health is our top priority.
          </ThemedText>
          <TouchableOpacity style={styles.bookButton} onPress={handleBookAppointment}>
            <ThemedText style={styles.bookButtonText}>Book Appointment Now</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Our Doctors Section */}
        <View style={styles.doctorsSection}>
          <ThemedText style={styles.sectionTitle}>Our Doctors</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Meet our experienced healthcare professionals dedicated to your wellbeing.
          </ThemedText>
          {!loading && (
            <ThemedText style={styles.doctorCount}>
              Showing all {filteredDoctors.length} doctors
            </ThemedText>
          )}

          {/* Doctor Cards */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#14B8A6" />
              <ThemedText style={styles.loadingText}>Loading doctors...</ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorIcon}>⚠️</ThemedText>
              <ThemedText style={styles.errorText}>Failed to load doctors</ThemedText>
              <ThemedText style={styles.errorSubtext}>{error}</ThemedText>
            </View>
          ) : filteredDoctors.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyIcon}>👨‍⚕️</ThemedText>
              <ThemedText style={styles.emptyText}>
                No doctors available at the moment. Please try again later.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.doctorGrid}>
              {filteredDoctors.map((doctor: any) => {
                // Debug: Log the entire doctor object to see what fields are available
                console.log('=== DOCTOR DEBUG ===');
                console.log('Doctor ID:', doctor.id);
                console.log('Doctor full object keys:', Object.keys(doctor));
                console.log('doctor.user:', doctor.user);
                console.log('doctor.user?.name:', doctor.user?.name);
                console.log('doctor.name:', doctor.name);
                console.log('doctor.specialty:', doctor.specialty);
                console.log('doctor.userId:', doctor.userId);

                // Get doctor name from ALL possible sources
                const doctorName =
                  doctor.user?.name ||        // From user object
                  doctor.name ||              // Direct name field
                  doctor.doctorName ||        // Alternative field name
                  doctor.userName ||          // Another alternative
                  (doctor.specialty ? `${doctor.specialty} Specialist` : 'Doctor'); // Fallback to specialty

                const displayName = doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`;

                console.log('Final doctorName:', doctorName);
                console.log('Final displayName:', displayName);
                console.log('==================');

                return (
                  <View key={doctor.id} style={styles.doctorCard}>
                    <View style={styles.doctorImageContainer}>
                      <View style={styles.doctorAvatar}>
                        <UserIcon />
                      </View>
                    </View>
                    <View style={styles.doctorInfo}>
                      <ThemedText style={styles.doctorName}>
                        {displayName}
                      </ThemedText>
                      <ThemedText style={styles.doctorSpecialty}>
                        {doctor.specialty || 'General Medicine'}
                      </ThemedText>
                      <ThemedText style={styles.doctorDescription}>
                        {`Dr. ${doctorName} specializes in ${doctor.specialty || 'general medicine'} with ${doctor.consultationDuration || 30} minute consultations.`}
                      </ThemedText>
                      <View style={styles.doctorMeta}>
                        <View
                          style={[
                            styles.statusBadge,
                            doctor.status === 'In' && styles.statusAvailable,
                            doctor.status === 'Break' && styles.statusBreak,
                            doctor.status === 'Out' && styles.statusOffline,
                          ]}
                        >
                          <ThemedText style={styles.statusText}>
                            {doctor.status === 'In' ? 'Available' : doctor.status === 'Break' ? 'On Break' : 'Offline'}
                          </ThemedText>
                        </View>
                        {doctor.consultationDuration && (
                          <ThemedText style={styles.durationText}>
                            {doctor.consultationDuration} min sessions
                          </ThemedText>
                        )}
                      </View>
                      <TouchableOpacity style={styles.doctorBookButton} onPress={handleBookAppointment}>
                        <ThemedText style={styles.doctorBookButtonText}>Book Appointment</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* What We Treat Section */}
        <View style={styles.treatmentSection}>
          <ThemedText style={styles.sectionTitle}>What We Treat</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Comprehensive healthcare services for a wide range of conditions
          </ThemedText>

          <View style={styles.treatmentGrid}>
            {/* Fever */}
            <View style={styles.treatmentCard}>
              <View style={styles.treatmentIconContainer}>
                <FeverIcon />
              </View>
              <View style={styles.treatmentContent}>
                <ThemedText style={styles.treatmentTitle}>Fever</ThemedText>
                <ThemedText style={styles.treatmentDescription}>
                  We diagnose and treat your fever with personalized care and modern testing to identify the root cause.
                </ThemedText>
              </View>
            </View>

            {/* Cough & Cold */}
            <View style={styles.treatmentCard}>
              <View style={styles.treatmentIconContainer}>
                <CoughIcon />
              </View>
              <View style={styles.treatmentContent}>
                <ThemedText style={styles.treatmentTitle}>Cough & Cold</ThemedText>
                <ThemedText style={styles.treatmentDescription}>
                  Our specialists provide effective treatment for respiratory symptoms with evidence-based approaches.
                </ThemedText>
              </View>
            </View>

            {/* Headache */}
            <View style={styles.treatmentCard}>
              <View style={styles.treatmentIconContainer}>
                <HeadacheIcon />
              </View>
              <View style={styles.treatmentContent}>
                <ThemedText style={styles.treatmentTitle}>Headache</ThemedText>
                <ThemedText style={styles.treatmentDescription}>
                  Comprehensive headache management including diagnosis, treatment, and prevention strategies.
                </ThemedText>
              </View>
            </View>

            {/* Toothache */}
            <View style={styles.treatmentCard}>
              <View style={styles.treatmentIconContainer}>
                <ToothacheIcon />
              </View>
              <View style={styles.treatmentContent}>
                <ThemedText style={styles.treatmentTitle}>Toothache</ThemedText>
                <ThemedText style={styles.treatmentDescription}>
                  Expert dental care and pain management to address your dental concerns with immediate relief.
                </ThemedText>
              </View>
            </View>

            {/* Allergies */}
            <View style={styles.treatmentCard}>
              <View style={styles.treatmentIconContainer}>
                <AllergiesIcon />
              </View>
              <View style={styles.treatmentContent}>
                <ThemedText style={styles.treatmentTitle}>Allergies</ThemedText>
                <ThemedText style={styles.treatmentDescription}>
                  Specialized allergy testing and treatment plans tailored to your specific needs and triggers.
                </ThemedText>
              </View>
            </View>

            {/* Skin Issues */}
            <View style={styles.treatmentCard}>
              <View style={styles.treatmentIconContainer}>
                <SkinIcon />
              </View>
              <View style={styles.treatmentContent}>
                <ThemedText style={styles.treatmentTitle}>Skin Issues</ThemedText>
                <ThemedText style={styles.treatmentDescription}>
                  Professional dermatological care for various skin conditions with advanced treatment options.
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerSection}>
            <ThemedText style={styles.footerTitle}>HealthCare Clinic</ThemedText>
            <ThemedText style={styles.footerText}>
              Providing quality healthcare services with compassion and excellence since 2010.
            </ThemedText>
          </View>

          <View style={styles.footerSection}>
            <ThemedText style={styles.footerTitle}>Contact Us</ThemedText>
            <View style={styles.contactItem}>
              <PhoneIcon />
              <ThemedText style={styles.contactText}>+1 (555) 123-4567</ThemedText>
            </View>
            <View style={styles.contactItem}>
              <EmailIcon />
              <ThemedText style={styles.contactText}>info@healthcareclinic.com</ThemedText>
            </View>
            <View style={styles.contactItem}>
              <LocationIcon />
              <ThemedText style={styles.contactText}>123 Medical Plaza, Health City, HC 12345</ThemedText>
            </View>
          </View>

          <View style={styles.footerSection}>
            <ThemedText style={styles.footerTitle}>Hours</ThemedText>
            <ThemedText style={styles.footerText}>Monday - Friday: 8:00 AM - 8:00 PM</ThemedText>
            <ThemedText style={styles.footerText}>Saturday: 9:00 AM - 5:00 PM</ThemedText>
            <ThemedText style={styles.footerText}>Sunday: Closed</ThemedText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#DBEAFE', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoIcon: { width: 32, height: 32, backgroundColor: '#CCFBF1', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  logoTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  logoSubtitle: { fontSize: 12, color: '#6B7280' },
  loginButton: { backgroundColor: '#14B8A6', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },

  // Hero Section
  heroSection: { backgroundColor: '#F0FDFA', paddingHorizontal: 20, paddingVertical: 60, alignItems: 'center' },
  heroIconContainer: { marginBottom: 24 },
  heroTitle: { fontSize: 36, fontWeight: '700', color: '#1F2937', textAlign: 'center', marginBottom: 20, lineHeight: 44 },
  heroDescription: { fontSize: 18, color: '#4B5563', textAlign: 'center', lineHeight: 28, marginBottom: 32, paddingHorizontal: 20 },
  bookButton: { backgroundColor: '#14B8A6', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  bookButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '500' },

  // Doctors Section
  doctorsSection: { paddingHorizontal: 16, paddingVertical: 60, backgroundColor: '#FFFFFF' },
  sectionTitle: { fontSize: 32, fontWeight: '700', color: '#1F2937', textAlign: 'center', marginBottom: 12 },
  sectionSubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 8 },
  doctorCount: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 32 },

  loadingContainer: { alignItems: 'center', paddingVertical: 48 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },

  errorContainer: { alignItems: 'center', paddingVertical: 48 },
  errorIcon: { fontSize: 32, marginBottom: 8 },
  errorText: { fontSize: 16, color: '#6B7280', marginBottom: 4 },
  errorSubtext: { fontSize: 14, color: '#9CA3AF' },

  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center', paddingHorizontal: 20 },

  doctorGrid: { gap: 20 },
  doctorCard: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  doctorImageContainer: { height: 200, backgroundColor: '#CCFBF1', justifyContent: 'center', alignItems: 'center' },
  doctorAvatar: { width: 100, height: 100, backgroundColor: '#99F6E4', borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  doctorInfo: { padding: 24 },
  doctorName: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  doctorSpecialty: { fontSize: 16, fontWeight: '500', color: '#2563EB', marginBottom: 12 },
  doctorDescription: { fontSize: 14, color: '#6B7280', lineHeight: 22, marginBottom: 16 },
  doctorMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#F3F4F6' },
  statusAvailable: { backgroundColor: '#D1FAE5' },
  statusBreak: { backgroundColor: '#FEF3C7' },
  statusOffline: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 12, fontWeight: '500', color: '#1F2937' },
  durationText: { fontSize: 12, color: '#9CA3AF' },
  doctorBookButton: { backgroundColor: '#14B8A6', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  doctorBookButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },

  // Treatment Section
  treatmentSection: { paddingHorizontal: 16, paddingVertical: 60, backgroundColor: '#F9FAFB' },
  treatmentGrid: { gap: 16, marginTop: 24 },
  treatmentCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, flexDirection: 'row', gap: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  treatmentIconContainer: { width: 48, height: 48, backgroundColor: '#DBEAFE', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  treatmentContent: { flex: 1 },
  treatmentTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 6 },
  treatmentDescription: { fontSize: 13, color: '#6B7280', lineHeight: 20 },

  // Footer
  footer: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 40, borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 24 },
  footerSection: { gap: 8 },
  footerTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  footerText: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactText: { fontSize: 13, color: '#6B7280' },
});
