import { AddAssistantDialog } from '@/components/AddAssistantDialog';
import { AdminSidebar } from '@/components/AdminSidebar';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { EditAssistantDialog } from '@/components/EditAssistantDialog';
import { PaginationComponent } from '@/components/PaginationComponent';
import { ThemedText } from '@/components/themed-text';
import { getCurrentUser } from '@/lib/firebase/auth';
import { createDocument, deleteDocument, getAllDoctors, getDocument, getDocuments, updateDocument } from '@/lib/firebase/firestore';
import { useRouter } from 'expo-router';
import { Edit, Trash2, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

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
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 8V14M17 11H23"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function AdminAssistants() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [assistants, setAssistants] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(6);

  // Load assistants data
  useEffect(() => {
    const loadAssistants = async () => {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          
          // Load assistants collection to get assigned doctors
          const assistantsResult = await getDocuments('assistants');
          console.log('Admin Assistants - Assistants Collection Result:', assistantsResult);
          
          // Load users collection to get user details
          const usersResult = await getDocuments('users');
          console.log('Admin Assistants - Users Collection Result:', usersResult);
          
          if (assistantsResult.success && assistantsResult.data && usersResult.success && usersResult.data) {
            const assistantUsers = usersResult.data.filter((user: any) => user.role === 'assistant');
            
            // Transform the data and fetch assigned doctor names
            const transformedAssistants = await Promise.all(
              assistantUsers.map(async (assistantUser: any) => {
                // Find the corresponding assistant document
                const assistantDoc: any = assistantsResult.data.find((a: any) => a.userId === assistantUser.id);
                const assignedDoctorIds = assistantDoc?.assignedDoctors || [];
                
                // Fetch doctor names for assigned doctors
                const assignedDoctorNames: string[] = [];
                if (assignedDoctorIds.length > 0) {
                  for (const doctorId of assignedDoctorIds) {
                    try {
                      const doctorResult = await getDocument('doctors', doctorId);
                      if (doctorResult.success && doctorResult.data) {
                        const doctorData: any = doctorResult.data;
                        // Get the user details for the doctor
                        if (doctorData.userId) {
                          const doctorUserResult = await getDocument('users', doctorData.userId);
                          if (doctorUserResult.success && doctorUserResult.data) {
                            const doctorUserData: any = doctorUserResult.data;
                            assignedDoctorNames.push(doctorUserData.name || 'Dr. Unknown');
                          }
                        }
                      }
                    } catch (err) {
                      console.error(`Failed to fetch doctor ${doctorId}:`, err);
                    }
                  }
                }
                
                return {
                  id: assistantUser.id,
                  assistantId: assistantDoc?.id,
                  name: assistantUser.name || 'Unknown Assistant',
                  email: assistantUser.email || 'N/A',
                  phone: assistantUser.phone || 'N/A',
                  role: assistantUser.role,
                  assignedDoctors: assignedDoctorIds,
                  assignedDoctorNames: assignedDoctorNames,
                  initials: assistantUser.name ? assistantUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '...',
                  isActive: assistantUser.isActive !== false,
                  status: assistantUser.isActive !== false ? 'Active' : 'Inactive',
                  statusColor: assistantUser.isActive !== false ? '#10B981' : '#DC2626'
                };
              })
            );
            
            setAssistants(transformedAssistants);
          } else {
            console.log('Admin Assistants - Failed to load assistants from database');
            setAssistants([]);
          }
          
          // Load doctors for the dialog
          const doctorsResult = await getAllDoctors();
          if (doctorsResult.success && doctorsResult.data) {
            const formattedDoctors = doctorsResult.data.map((doc: any) => ({
              id: doc.id,
              name: doc.user?.name || 'Dr. Unknown',
              specialty: doc.specialty || 'General Medicine',
            }));
            setDoctors(formattedDoctors);
          }
        } else {
          router.push('/auth-login');
        }
      } catch (error) {
        console.error('Error loading assistants:', error);
        Alert.alert('Error', 'Failed to load assistants data');
      }
    };

    loadAssistants();
  }, [router]);

  const handleLogout = () => router.push('/auth-login');
  const handleNavigate = (path: string) => router.push(path as any);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleAddAssistant = async (assistantData: any) => {
    setIsLoading(true);
    try {
      // Create user document
      const userDoc = {
        name: assistantData.name,
        email: assistantData.email,
        phone: assistantData.phone,
        role: 'assistant',
        isActive: assistantData.status === 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userResult = await createDocument('users', userDoc);
      
      if (!userResult.success) {
        Alert.alert('Error', 'Failed to create assistant account. Please try again.');
        return;
      }

      // Create assistant document with userId reference
      const assistantDoc = {
        userId: userResult.id, // Reference to the user document
        assignedDoctors: assistantData.assignedDoctors || [],
        isActive: assistantData.status === 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const assistantResult = await createDocument('assistants', assistantDoc);
      
      if (assistantResult.success) {
        Alert.alert('Success', 'Assistant added successfully!');
        setIsAddDialogOpen(false);
        // Reload assistants
        const assistantsResult = await getDocuments('assistants');
        const usersResult = await getDocuments('users');
        if (assistantsResult.success && assistantsResult.data && usersResult.success && usersResult.data) {
          const assistantUsers = usersResult.data.filter((user: any) => user.role === 'assistant');
          
          const transformedAssistants = await Promise.all(
            assistantUsers.map(async (assistantUser: any) => {
              const assistantDoc: any = assistantsResult.data.find((a: any) => a.userId === assistantUser.id);
              const assignedDoctorIds = assistantDoc?.assignedDoctors || [];
              
              const assignedDoctorNames: string[] = [];
              if (assignedDoctorIds.length > 0) {
                for (const doctorId of assignedDoctorIds) {
                  try {
                    const doctorResult = await getDocument('doctors', doctorId);
                    if (doctorResult.success && doctorResult.data) {
                      const doctorData: any = doctorResult.data;
                      if (doctorData.userId) {
                        const doctorUserResult = await getDocument('users', doctorData.userId);
                        if (doctorUserResult.success && doctorUserResult.data) {
                          const doctorUserData: any = doctorUserResult.data;
                          assignedDoctorNames.push(doctorUserData.name || 'Dr. Unknown');
                        }
                      }
                    }
                  } catch (err) {
                    console.error(`Failed to fetch doctor ${doctorId}:`, err);
                  }
                }
              }
              
              return {
                id: assistantUser.id,
                assistantId: assistantDoc?.id,
                name: assistantUser.name || 'Unknown Assistant',
                email: assistantUser.email || 'N/A',
                phone: assistantUser.phone || 'N/A',
                role: assistantUser.role,
                assignedDoctors: assignedDoctorIds,
                assignedDoctorNames: assignedDoctorNames,
                initials: assistantUser.name ? assistantUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '...',
                isActive: assistantUser.isActive !== false,
                status: assistantUser.isActive !== false ? 'Active' : 'Inactive',
                statusColor: assistantUser.isActive !== false ? '#10B981' : '#DC2626'
              };
            })
          );
          
          setAssistants(transformedAssistants);
        }
      } else {
        Alert.alert('Error', 'Failed to add assistant. Please try again.');
      }
    } catch (error) {
      console.error('Error adding assistant:', error);
      Alert.alert('Error', 'Failed to add assistant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get paginated assistants
  const getPaginatedAssistants = (assistants: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return assistants.slice(startIndex, endIndex);
  };

  // Get total pages
  const getTotalPages = (assistants: any[]) => {
    return Math.ceil(assistants.length / itemsPerPage);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle double page navigation
  const handleDoublePageChange = (direction: 'prev' | 'next') => {
    const totalPages = getTotalPages(assistants);
    if (direction === 'prev') {
      const newPage = Math.max(1, currentPage - 2);
      setCurrentPage(newPage);
    } else {
      const newPage = Math.min(totalPages, currentPage + 2);
      setCurrentPage(newPage);
    }
  };

  const handleEditAssistant = (assistant: any) => {
    setSelectedAssistant(assistant);
    setIsEditDialogOpen(true);
  };

  const handleDeleteAssistant = (assistant: any) => {
    setSelectedAssistant(assistant);
    setIsDeleteDialogOpen(true);
  };

  const handleEditAssistantSubmit = async (assistantData: any) => {
    if (!selectedAssistant) return;
    
    setIsLoading(true);
    try {
      // Update user document
      const userUpdateData = {
        name: assistantData.name,
        email: assistantData.email,
        phone: assistantData.phone,
        isActive: assistantData.status === 'active',
        updatedAt: new Date(),
      };

      const userResult = await updateDocument('users', selectedAssistant.id, userUpdateData);
      
      if (userResult.success) {
        Alert.alert('Success', 'Assistant updated successfully!');
        setIsEditDialogOpen(false);
        setSelectedAssistant(null);
        // Reload assistants
        const assistantsResult = await getDocuments('assistants');
        const usersResult = await getDocuments('users');
        if (assistantsResult.success && assistantsResult.data && usersResult.success && usersResult.data) {
          const assistantUsers = usersResult.data.filter((user: any) => user.role === 'assistant');
          
          const transformedAssistants = await Promise.all(
            assistantUsers.map(async (assistantUser: any) => {
              const assistantDoc: any = assistantsResult.data.find((a: any) => a.userId === assistantUser.id);
              const assignedDoctorIds = assistantDoc?.assignedDoctors || [];
              
              const assignedDoctorNames: string[] = [];
              if (assignedDoctorIds.length > 0) {
                for (const doctorId of assignedDoctorIds) {
                  try {
                    const doctorResult = await getDocument('doctors', doctorId);
                    if (doctorResult.success && doctorResult.data) {
                      const doctorData: any = doctorResult.data;
                      if (doctorData.userId) {
                        const doctorUserResult = await getDocument('users', doctorData.userId);
                        if (doctorUserResult.success && doctorUserResult.data) {
                          const doctorUserData: any = doctorUserResult.data;
                          assignedDoctorNames.push(doctorUserData.name || 'Dr. Unknown');
                        }
                      }
                    }
                  } catch (err) {
                    console.error(`Failed to fetch doctor ${doctorId}:`, err);
                  }
                }
              }
              
              return {
                id: assistantUser.id,
                assistantId: assistantDoc?.id,
                name: assistantUser.name || 'Unknown Assistant',
                email: assistantUser.email || 'N/A',
                phone: assistantUser.phone || 'N/A',
                role: assistantUser.role,
                assignedDoctors: assignedDoctorIds,
                assignedDoctorNames: assignedDoctorNames,
                initials: assistantUser.name ? assistantUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '...',
                isActive: assistantUser.isActive !== false,
                status: assistantUser.isActive !== false ? 'Active' : 'Inactive',
                statusColor: assistantUser.isActive !== false ? '#10B981' : '#DC2626'
              };
            })
          );
          
          setAssistants(transformedAssistants);
        }
      } else {
        Alert.alert('Error', userResult.error || 'Failed to update assistant. Please try again.');
      }
    } catch (error) {
      console.error('Error updating assistant:', error);
      Alert.alert('Error', 'Failed to update assistant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAssistant) return;
    
    setIsLoading(true);
    try {
      const result = await deleteDocument('users', selectedAssistant.id);
      
      if (result.success) {
        Alert.alert('Success', 'Assistant deleted successfully!');
        setIsDeleteDialogOpen(false);
        setSelectedAssistant(null);
        // Reload assistants
        const assistantsResult = await getDocuments('assistants');
        const usersResult = await getDocuments('users');
        if (assistantsResult.success && assistantsResult.data && usersResult.success && usersResult.data) {
          const assistantUsers = usersResult.data.filter((user: any) => user.role === 'assistant');
          
          const transformedAssistants = await Promise.all(
            assistantUsers.map(async (assistantUser: any) => {
              const assistantDoc: any = assistantsResult.data.find((a: any) => a.userId === assistantUser.id);
              const assignedDoctorIds = assistantDoc?.assignedDoctors || [];
              
              const assignedDoctorNames: string[] = [];
              if (assignedDoctorIds.length > 0) {
                for (const doctorId of assignedDoctorIds) {
                  try {
                    const doctorResult = await getDocument('doctors', doctorId);
                    if (doctorResult.success && doctorResult.data) {
                      const doctorData: any = doctorResult.data;
                      if (doctorData.userId) {
                        const doctorUserResult = await getDocument('users', doctorData.userId);
                        if (doctorUserResult.success && doctorUserResult.data) {
                          const doctorUserData: any = doctorUserResult.data;
                          assignedDoctorNames.push(doctorUserData.name || 'Dr. Unknown');
                        }
                      }
                    }
                  } catch (err) {
                    console.error(`Failed to fetch doctor ${doctorId}:`, err);
                  }
                }
              }
              
              return {
                id: assistantUser.id,
                assistantId: assistantDoc?.id,
                name: assistantUser.name || 'Unknown Assistant',
                email: assistantUser.email || 'N/A',
                phone: assistantUser.phone || 'N/A',
                role: assistantUser.role,
                assignedDoctors: assignedDoctorIds,
                assignedDoctorNames: assignedDoctorNames,
                initials: assistantUser.name ? assistantUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '...',
                isActive: assistantUser.isActive !== false,
                status: assistantUser.isActive !== false ? 'Active' : 'Inactive',
                statusColor: assistantUser.isActive !== false ? '#10B981' : '#DC2626'
              };
            })
          );
          
          setAssistants(transformedAssistants);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to delete assistant. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting assistant:', error);
      Alert.alert('Error', 'Failed to delete assistant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeAllDialogs = () => {
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedAssistant(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <Menu />
          </TouchableOpacity>
          <View>
            <ThemedText style={styles.title}>Assistants</ThemedText>
            <ThemedText style={styles.subtitle}>Manage assistant staff</ThemedText>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsAddDialogOpen(true)}
          disabled={isLoading}
        >
          <UserPlus />
          <ThemedText style={styles.addButtonText}>Add Assistant</ThemedText>
        </TouchableOpacity>
      </View>

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        currentPath="/admin-assistants"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userName="Admin User"
        userRole="Administrator"
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Assistant Cards */}
          <View style={styles.assistantsList}>
            {getPaginatedAssistants(assistants).map((assistant) => (
              <View key={assistant.id} style={styles.assistantCard}>
                <View style={styles.assistantHeader}>
                  <View style={styles.assistantAvatar}>
                    <ThemedText style={styles.assistantInitials}>
                      {assistant.initials}
                    </ThemedText>
                  </View>
                  <View style={styles.assistantInfo}>
                    <ThemedText style={styles.assistantName}>
                      {assistant.name}
                    </ThemedText>
                    <ThemedText style={styles.assistantEmail}>
                      {assistant.email}
                    </ThemedText>
                    <ThemedText style={styles.assistantPhone}>
                      {assistant.phone}
                    </ThemedText>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: assistant.statusColor }]}>
                    <ThemedText style={styles.statusText}>{assistant.status}</ThemedText>
                  </View>
                </View>
                
                <View style={styles.assistantDetails}>
                  <View style={styles.assignedDoctorsContainer}>
                    <Users size={16} color="#6B7280" />
                    <ThemedText style={styles.assignedDoctorsLabel}>Assigned Doctors:</ThemedText>
                  </View>
                  {assistant.assignedDoctorNames && assistant.assignedDoctorNames.length > 0 ? (
                    <View style={styles.doctorsTagContainer}>
                      {assistant.assignedDoctorNames.map((doctorName: string, index: number) => (
                        <View key={index} style={styles.doctorTag}>
                          <ThemedText style={styles.doctorTagText}>{doctorName}</ThemedText>
                        </View>
                      ))}
                  </View>
                  ) : (
                    <ThemedText style={styles.noDoctorsText}>None</ThemedText>
                  )}
                </View>
                
                <View style={styles.assistantActions}>
                  {/* <TouchableOpacity style={[styles.actionButton, { backgroundColor: assistant.statusColor }]}>
                    <ThemedText style={styles.actionText}>{assistant.status}</ThemedText>
                  </TouchableOpacity> */}
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditAssistant(assistant)}
                  >
                    <Edit size={16} color="#6B7280" />
                    <ThemedText style={styles.actionText}>Edit</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteAssistant(assistant)}
                  >
                    <Trash2 size={16} color="#DC2626" />
                    <ThemedText style={styles.actionText}>Delete</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Pagination Controls */}
          <PaginationComponent
            currentPage={currentPage}
            totalPages={getTotalPages(assistants)}
            totalItems={assistants.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onDoublePageChange={handleDoublePageChange}
          />
        </View>
      </ScrollView>

      {/* Add Assistant Dialog */}
      <AddAssistantDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddAssistant}
        doctors={doctors}
        isLoading={isLoading}
      />

      {/* Edit Assistant Dialog */}
      <EditAssistantDialog
        isOpen={isEditDialogOpen}
        onClose={closeAllDialogs}
        assistant={selectedAssistant}
        onSubmit={handleEditAssistantSubmit}
        doctors={doctors}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeAllDialogs}
        onConfirm={handleDeleteConfirm}
        title="Delete Assistant"
        message="Are you sure you want to delete this assistant? This will permanently remove the assistant and all associated data."
        itemName={selectedAssistant?.name}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB' 
  },
  headerLeft: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    flex: 1, 
    marginRight: 12 
  },
  menuButton: { 
    padding: 8, 
    marginRight: 12 
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#111827', 
    marginBottom: 2 
  },
  subtitle: { 
    fontSize: 12, 
    color: '#6B7280' 
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    marginTop: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: { 
    flex: 1 
  },
  content: { 
    padding: 20 
  },
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 64 
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: '#111827', 
    marginTop: 16, 
    marginBottom: 8 
  },
  emptySubtitle: { 
    fontSize: 16, 
    color: '#6B7280', 
    textAlign: 'center' 
  },
  assistantsList: {
    paddingHorizontal: 16,
  },
  assistantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  assistantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assistantInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  assistantInfo: {
    flex: 1,
  },
  assistantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  assistantEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  assistantPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  assistantDetails: {
    marginBottom: 16,
  },
  assignedDoctorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignedDoctorsLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  doctorsTagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 6,
  },
  doctorTag: {
    backgroundColor: '#E5F7F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  doctorTagText: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '500',
  },
  noDoctorsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  assistantActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
});
