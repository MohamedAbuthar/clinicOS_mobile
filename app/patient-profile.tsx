import PatientLayout from '@/components/PatientLayout';
import { ThemedText } from '@/components/themed-text';
import { useBackendPatientAuth } from '@/lib/contexts/BackendPatientAuthContext';
import { PatientProfile } from '@/lib/firebase/auth';
import { updatePatientProfile } from '@/lib/firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardTypeOptions, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface InfoFieldProps {
  label: string;
  value: string;
  editable: boolean;
  onChangeText?: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, editable, onChangeText, keyboardType = 'default' }) => (
  <View style={styles.infoItem}>
    <ThemedText style={styles.infoLabel}>{label}</ThemedText>
    <TextInput
      style={[styles.infoInput, !editable && styles.disabledInput]}
      value={value}
      editable={editable}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor="#9CA3AF"
    />
  </View>
);

function PatientProfileContent() {
  const { patient, refreshPatient } = useBackendPatientAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData(patient);
      setIsLoading(false);
    }
  }, [patient]);

  const handleFormChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!patient) return;
    setIsSaving(true);
    try {
      const result = await updatePatientProfile(patient.id, formData);
      if (result.success) {
        await refreshPatient();
        Alert.alert('Success', 'Profile updated successfully.');
        setIsEditing(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (patient) setFormData(patient);
    setIsEditing(false);
  };

  const calculateBmi = (height: number | undefined, weight: number | undefined): string => {
    if (!height || !weight) return 'N/A';
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    if (isNaN(bmi) || !isFinite(bmi)) return 'N/A';
    return bmi.toFixed(1);
  };

  const getInitials = (name: string = '') => name.split(' ').map(n => n[0]).join('').toUpperCase();

  if (isLoading || !patient) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  const profileData = isEditing ? formData : patient;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.profileHeaderCard}>
            <View style={styles.avatarContainer}>
              <ThemedText style={styles.avatarText}>{getInitials(profileData.name)}</ThemedText>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>{profileData.name}</ThemedText>
              <ThemedText style={styles.patientId}>Patient ID: {profileData.id}</ThemedText>
              {!isEditing && (
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                  <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
            <InfoField label="Full Name" value={profileData.name || ''} editable={isEditing} onChangeText={(v) => handleFormChange('name', v)} />
            <InfoField label="Date of Birth (YYYY-MM-DD)" value={profileData.dateOfBirth || ''} editable={isEditing} onChangeText={(v) => handleFormChange('dateOfBirth', v)} />
            <InfoField label="Gender" value={profileData.gender || ''} editable={isEditing} onChangeText={(v) => handleFormChange('gender', v)} />
          </View>

          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionTitle}>Contact Information</ThemedText>
            <InfoField label="Phone Number" value={profileData.phone || ''} editable={isEditing} onChangeText={(v) => handleFormChange('phone', v)} keyboardType="phone-pad" />
            <InfoField label="Email Address" value={profileData.email || ''} editable={false} />
            <InfoField label="Address" value={profileData.address || ''} editable={isEditing} onChangeText={(v) => handleFormChange('address', v)} />
          </View>

          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionTitle}>Medical Information</ThemedText>
            <InfoField label="Blood Group" value={profileData.bloodGroup || ''} editable={isEditing} onChangeText={(v) => handleFormChange('bloodGroup', v)} />
            <InfoField label="Height (cm)" value={String(profileData.height || '')} editable={isEditing} onChangeText={(v) => handleFormChange('height', Number(v))} keyboardType="numeric" />
            <InfoField label="Weight (kg)" value={String(profileData.weight || '')} editable={isEditing} onChangeText={(v) => handleFormChange('weight', Number(v))} keyboardType="numeric" />
            <InfoField label="BMI" value={calculateBmi(profileData.height, profileData.weight)} editable={false} />
            <InfoField label="Known Allergies" value={profileData.allergies || ''} editable={isEditing} onChangeText={(v) => handleFormChange('allergies', v)} />
            <InfoField label="Chronic Conditions" value={profileData.chronicConditions || ''} editable={isEditing} onChangeText={(v) => handleFormChange('chronicConditions', v)} />
          </View>

          {isEditing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function PatientProfilePage() {
  return (
    <PatientLayout>
      <PatientProfileContent />
    </PatientLayout>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6B7280',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  patientId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  infoInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#14B8A6',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
