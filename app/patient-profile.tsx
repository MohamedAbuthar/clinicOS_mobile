import PatientLayout from '@/components/PatientLayout';
import { ThemedText } from '@/components/themed-text';
import { useBackendPatientAuth } from '@/lib/contexts/BackendPatientAuthContext';
import { PatientProfile } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/config';
import {
    addFamilyMember,
    deleteFamilyMember,
    getFamilyMembers,
    updateFamilyMember,
    updatePatientProfile
} from '@/lib/firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardTypeOptions,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

// SVG Icons
const PlusIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EditIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrashIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6H5H21" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface InfoFieldProps {
  label: string;
  value: string;
  editable: boolean;
  onChangeText?: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, editable, onChangeText, keyboardType = 'default', multiline = false }) => (
  <View style={styles.infoItem}>
    <ThemedText style={styles.infoLabel}>{label}</ThemedText>
    <TextInput
      style={[styles.infoInput, !editable && styles.disabledInput, multiline && styles.multilineInput]}
      value={value}
      editable={editable}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor="#9CA3AF"
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
    />
  </View>
);

interface FamilyMemberData extends Partial<PatientProfile> {
  relationship?: string;
}

function PatientProfileContent() {
  const { patient, refreshPatient } = useBackendPatientAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Family member states
  const [familyMembers, setFamilyMembers] = useState<PatientProfile[]>([]);
  const [isFamilyLoading, setIsFamilyLoading] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<PatientProfile | null>(null);
  const [memberFormData, setMemberFormData] = useState<FamilyMemberData>({
    name: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    email: '',
    relationship: '',
  });

  useEffect(() => {
    if (patient) {
      setFormData(patient);
      setIsLoading(false);
      loadFamilyMembers();
    }
  }, [patient]);

  const loadFamilyMembers = useCallback(async () => {
    if (!patient) return;
    
    setIsFamilyLoading(true);
    try {
      const familyId = patient.familyId || patient.id;
      const result = await getFamilyMembers(familyId);
      
      if (result.success && result.data) {
        // Filter out the current patient
        const members = (result.data as PatientProfile[]).filter(m => m.id !== patient.id);
        setFamilyMembers(members);
        } else {
        setFamilyMembers([]);
        }
      } catch (error) {
      console.error('Error loading family members:', error);
      setFamilyMembers([]);
      } finally {
      setIsFamilyLoading(false);
    }
  }, [patient]);

  const handleFormChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberFormChange = (field: keyof FamilyMemberData, value: string) => {
    setMemberFormData(prev => ({ ...prev, [field]: value }));
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

  const handleAddMemberClick = () => {
    setMemberFormData({
      name: '',
      dateOfBirth: '',
      gender: 'male',
      phone: '',
      email: '',
      relationship: '',
    });
    setShowAddMemberModal(true);
  };

  const handleEditMemberClick = (member: PatientProfile) => {
    setSelectedMember(member);
    setMemberFormData({
      name: member.name,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      phone: member.phone || '',
      email: member.email || '',
      relationship: (member as any).relationship || '',
    });
    setShowEditMemberModal(true);
  };

  const handleDeleteMemberClick = (member: PatientProfile) => {
    setSelectedMember(member);
    setShowDeleteConfirmModal(true);
  };

  const handleSaveMember = async () => {
    if (!patient) return;
    
    if (!memberFormData.name || !memberFormData.dateOfBirth || !memberFormData.gender) {
      Alert.alert('Validation Error', 'Please fill in all required fields (Name, Date of Birth, Gender).');
      return;
    }

    setIsSaving(true);
    try {
      const familyId = patient.familyId || patient.id;
      
      // If patient doesn't have familyId set yet, update it
      if (!patient.familyId) {
        await updateDoc(doc(db, 'patients', patient.id), {
          familyId: patient.id
        });
      }

      const result = await addFamilyMember(familyId, memberFormData);
      
      if (result.success) {
        Alert.alert('Success', 'Family member added successfully.');
        setShowAddMemberModal(false);
        await loadFamilyMembers();
      } else {
        Alert.alert('Error', result.error || 'Failed to add family member.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!selectedMember) return;

    if (!memberFormData.name || !memberFormData.dateOfBirth || !memberFormData.gender) {
      Alert.alert('Validation Error', 'Please fill in all required fields (Name, Date of Birth, Gender).');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateFamilyMember(selectedMember.id, memberFormData);
      
      if (result.success) {
        Alert.alert('Success', 'Family member updated successfully.');
        setShowEditMemberModal(false);
        await loadFamilyMembers();
      } else {
        Alert.alert('Error', result.error || 'Failed to update family member.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMember) return;

    setIsSaving(true);
    try {
      const result = await deleteFamilyMember(selectedMember.id);
      
      if (result.success) {
        Alert.alert('Success', 'Family member deleted successfully.');
        setShowDeleteConfirmModal(false);
        await loadFamilyMembers();
      } else {
        Alert.alert('Error', result.error || 'Failed to delete family member.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
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
          {/* Profile Header */}
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

          {/* Personal Information */}
          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
            <InfoField label="Full Name" value={profileData.name || ''} editable={isEditing} onChangeText={(v) => handleFormChange('name', v)} />
            <InfoField label="Date of Birth (YYYY-MM-DD)" value={profileData.dateOfBirth || ''} editable={isEditing} onChangeText={(v) => handleFormChange('dateOfBirth', v)} />
            <InfoField label="Gender" value={profileData.gender || ''} editable={isEditing} onChangeText={(v) => handleFormChange('gender', v)} />
          </View>

          {/* Contact Information */}
          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionTitle}>Contact Information</ThemedText>
            <InfoField label="Phone Number" value={profileData.phone || ''} editable={isEditing} onChangeText={(v) => handleFormChange('phone', v)} keyboardType="phone-pad" />
            <InfoField label="Email Address" value={profileData.email || ''} editable={false} />
            <InfoField label="Address" value={profileData.address || ''} editable={isEditing} onChangeText={(v) => handleFormChange('address', v)} multiline />
            <InfoField label="Emergency Contact Name" value={profileData.emergencyContactName || ''} editable={isEditing} onChangeText={(v) => handleFormChange('emergencyContactName', v)} />
            <InfoField label="Emergency Contact Phone" value={profileData.emergencyContact || ''} editable={isEditing} onChangeText={(v) => handleFormChange('emergencyContact', v)} keyboardType="phone-pad" />
          </View>

          {/* Medical Information */}
          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionTitle}>Medical Information</ThemedText>
            <InfoField label="Blood Group" value={profileData.bloodGroup || ''} editable={isEditing} onChangeText={(v) => handleFormChange('bloodGroup', v)} />
            <InfoField label="Height (cm)" value={String(profileData.height || '')} editable={isEditing} onChangeText={(v) => handleFormChange('height', Number(v))} keyboardType="numeric" />
            <InfoField label="Weight (kg)" value={String(profileData.weight || '')} editable={isEditing} onChangeText={(v) => handleFormChange('weight', Number(v))} keyboardType="numeric" />
            <InfoField label="BMI" value={calculateBmi(profileData.height, profileData.weight)} editable={false} />
            <InfoField label="Known Allergies" value={profileData.allergies || ''} editable={isEditing} onChangeText={(v) => handleFormChange('allergies', v)} multiline />
            <InfoField label="Chronic Conditions" value={profileData.chronicConditions || ''} editable={isEditing} onChangeText={(v) => handleFormChange('chronicConditions', v)} multiline />
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

          {/* Family Members Section */}
          <View style={styles.sectionCard}>
            <View style={styles.familyHeader}>
              <ThemedText style={styles.sectionTitle}>Family Members</ThemedText>
              <TouchableOpacity style={styles.addMemberButton} onPress={handleAddMemberClick}>
                <PlusIcon />
                <ThemedText style={styles.addMemberButtonText}>Add Member</ThemedText>
              </TouchableOpacity>
            </View>

            {isFamilyLoading ? (
              <View style={styles.familyLoadingContainer}>
                <ActivityIndicator size="small" color="#14B8A6" />
                <ThemedText style={styles.familyLoadingText}>Loading family members...</ThemedText>
              </View>
            ) : familyMembers.length === 0 ? (
              <View style={styles.emptyFamilyContainer}>
                <UserIcon />
                <ThemedText style={styles.emptyFamilyText}>No family members added yet</ThemedText>
              </View>
            ) : (
              familyMembers.map((member) => (
                <View key={member.id} style={styles.familyMemberCard}>
                  <View style={styles.familyMemberInfo}>
                    <View style={styles.familyMemberAvatar}>
                      <ThemedText style={styles.familyMemberAvatarText}>{getInitials(member.name)}</ThemedText>
                    </View>
                    <View style={styles.familyMemberDetails}>
                      <ThemedText style={styles.familyMemberName}>{member.name}</ThemedText>
                      <ThemedText style={styles.familyMemberMeta}>
                        {(member as any).relationship || 'Family Member'} • {member.gender} • {member.dateOfBirth}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.familyMemberActions}>
                    <TouchableOpacity style={styles.familyActionButton} onPress={() => handleEditMemberClick(member)}>
                      <EditIcon />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.familyActionButton} onPress={() => handleDeleteMemberClick(member)}>
                      <TrashIcon />
                  </TouchableOpacity>
                </View>
            </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add Member Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddMemberModal}
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Add Family Member</ThemedText>
            <ScrollView showsVerticalScrollIndicator={false}>
              <InfoField label="Full Name *" value={memberFormData.name || ''} editable={true} onChangeText={(v) => handleMemberFormChange('name', v)} />
              <InfoField label="Relationship" value={memberFormData.relationship || ''} editable={true} onChangeText={(v) => handleMemberFormChange('relationship', v)} />
              <InfoField label="Date of Birth (YYYY-MM-DD) *" value={memberFormData.dateOfBirth || ''} editable={true} onChangeText={(v) => handleMemberFormChange('dateOfBirth', v)} />
              <InfoField label="Gender (male/female/other) *" value={memberFormData.gender || ''} editable={true} onChangeText={(v) => handleMemberFormChange('gender', v)} />
              <InfoField label="Phone Number" value={memberFormData.phone || ''} editable={true} onChangeText={(v) => handleMemberFormChange('phone', v)} keyboardType="phone-pad" />
              <InfoField label="Email Address" value={memberFormData.email || ''} editable={true} onChangeText={(v) => handleMemberFormChange('email', v)} keyboardType="email-address" />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowAddMemberModal(false)}>
                <ThemedText style={styles.modalCancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveButton} onPress={handleSaveMember} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <ThemedText style={styles.modalSaveButtonText}>Add Member</ThemedText>}
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditMemberModal}
        onRequestClose={() => setShowEditMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Edit Family Member</ThemedText>
            <ScrollView showsVerticalScrollIndicator={false}>
              <InfoField label="Full Name *" value={memberFormData.name || ''} editable={true} onChangeText={(v) => handleMemberFormChange('name', v)} />
              <InfoField label="Relationship" value={memberFormData.relationship || ''} editable={true} onChangeText={(v) => handleMemberFormChange('relationship', v)} />
              <InfoField label="Date of Birth (YYYY-MM-DD) *" value={memberFormData.dateOfBirth || ''} editable={true} onChangeText={(v) => handleMemberFormChange('dateOfBirth', v)} />
              <InfoField label="Gender (male/female/other) *" value={memberFormData.gender || ''} editable={true} onChangeText={(v) => handleMemberFormChange('gender', v)} />
              <InfoField label="Phone Number" value={memberFormData.phone || ''} editable={true} onChangeText={(v) => handleMemberFormChange('phone', v)} keyboardType="phone-pad" />
              <InfoField label="Email Address" value={memberFormData.email || ''} editable={true} onChangeText={(v) => handleMemberFormChange('email', v)} keyboardType="email-address" />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowEditMemberModal(false)}>
                <ThemedText style={styles.modalCancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveButton} onPress={handleUpdateMember} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <ThemedText style={styles.modalSaveButtonText}>Update Member</ThemedText>}
              </TouchableOpacity>
            </View>
                  </View>
                  </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteConfirmModal}
        onRequestClose={() => setShowDeleteConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <ThemedText style={styles.deleteModalTitle}>Delete Family Member</ThemedText>
            <ThemedText style={styles.deleteModalMessage}>
              Are you sure you want to delete {selectedMember?.name}? This action cannot be undone.
            </ThemedText>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowDeleteConfirmModal(false)}>
                <ThemedText style={styles.modalCancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleConfirmDelete} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
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
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  familyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#14B8A6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addMemberButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  familyLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  familyLoadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyFamilyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyFamilyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  familyMemberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  familyMemberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  familyMemberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyMemberAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  familyMemberDetails: {
    flex: 1,
  },
  familyMemberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  familyMemberMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  familyMemberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  familyActionButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#14B8A6',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 24,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
