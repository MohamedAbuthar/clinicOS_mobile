import { AddAssistantDialog } from '@/components/AddAssistantDialog';
import { AdminSidebar } from '@/components/AdminSidebar';
import { ThemedText } from '@/components/themed-text';
import { getCurrentUser } from '@/lib/firebase/auth';
import { getAllDoctors, getDocuments } from '@/lib/firebase/firestore';
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
  const [isLoading, setIsLoading] = useState(false);
  const [assistants, setAssistants] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // Load assistants data
  useEffect(() => {
    const loadAssistants = async () => {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          
          // Load assistants from users collection (role: assistant)
          const usersResult = await getDocuments('users');
          console.log('Admin Assistants - Users Result:', usersResult);
          if (usersResult.success && usersResult.data) {
            const assistantUsers = usersResult.data.filter((user: any) => user.role === 'assistant');
            // Transform the data to match web app format
            const transformedAssistants = assistantUsers.map((assistant: any) => ({
              id: assistant.id,
              name: assistant.name || 'Unknown Assistant',
              email: assistant.email || 'N/A',
              phone: assistant.phone || 'N/A',
              role: assistant.role,
              assignedDoctors: [], // Will be populated from doctor assignments
              initials: assistant.name ? assistant.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '...',
              isActive: assistant.isActive !== false,
              status: assistant.isActive !== false ? 'Active' : 'Inactive',
              statusColor: assistant.isActive !== false ? '#10B981' : '#6B7280'
            }));
            setAssistants(transformedAssistants);
          } else {
            console.log('Admin Assistants - Failed to load assistants, using fallback data');
            // Fallback data matching your web app
            const fallbackAssistants = [
              {
                id: '1',
                name: 'thalha..',
                email: 'test12@gmail.com',
                phone: '0987654321',
                role: 'assistant',
                assignedDoctors: ['Mohamed Abuthar'],
                initials: 'T',
                isActive: true,
                status: 'Active',
                statusColor: '#10B981'
              },
              {
                id: '2',
                name: 'dani',
                email: 'dani@gmail.com',
                phone: '1234567890',
                role: 'assistant',
                assignedDoctors: ['haseeb...', 'Riya'],
                initials: 'D',
                isActive: true,
                status: 'Active',
                statusColor: '#10B981'
              },
              {
                id: '3',
                name: 'Mohamed Abutharlkjuhygf',
                email: 'master20@gmail.com',
                phone: '+918012222817',
                role: 'assistant',
                assignedDoctors: [],
                initials: 'MA',
                isActive: true,
                status: 'Active',
                statusColor: '#10B981'
              }
            ];
            setAssistants(fallbackAssistants);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Adding assistant:', assistantData);
      setIsAddDialogOpen(false);
      // Here you would typically call your API to create the assistant
    } catch (error) {
      console.error('Error adding assistant:', error);
    } finally {
      setIsLoading(false);
    }
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
            {assistants.map((assistant) => (
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
                  <View style={styles.detailRow}>
                    <Users size={16} color="#6B7280" />
                    <ThemedText style={styles.detailText}>
                      Assigned Doctors: {assistant.assignedDoctors.length > 0 ? assistant.assignedDoctors.join(', ') : 'None'}
                    </ThemedText>
                  </View>
                </View>
                
                <View style={styles.assistantActions}>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: assistant.statusColor }]}>
                    <ThemedText style={styles.actionText}>{assistant.status}</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Edit size={16} color="#6B7280" />
                    <ThemedText style={styles.actionText}>Edit</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Trash2 size={16} color="#DC2626" />
                    <ThemedText style={styles.actionText}>Delete</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
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
