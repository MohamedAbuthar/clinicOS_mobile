import { AddDoctorDialog } from '@/components/AddDoctorDialog';
import { AdminSidebar } from '@/components/AdminSidebar';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { EditDoctorDialog } from '@/components/EditDoctorDialog';
import { PaginationComponent } from '@/components/PaginationComponent';
import { ThemedText } from '@/components/themed-text';
import { ViewDoctorDialog } from '@/components/ViewDoctorDialog';
import { getCurrentUser } from '@/lib/firebase/auth';
import { createDocument, deleteDoctor, getAllDoctors, getAppointmentsByDoctorAndDate, getDocuments, updateDoctor } from '@/lib/firebase/firestore';
import { useRouter } from 'expo-router';
import { Clock, Edit, Eye, Trash2, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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

const Stethoscope = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 4H8C8.55228 4 9 4.44772 9 5V7C9 7.55228 8.55228 8 8 8H6C5.44772 8 5 7.55228 5 7V5C5 4.44772 5.44772 4 6 4Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 8V10C6 12.2091 7.79086 14 10 14H14C16.2091 14 18 12.2091 18 10V8"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 14V18C12 19.1046 12.8954 20 14 20H16C17.1046 20 18 19.1046 18 18V16"
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

// Helper function to calculate doctor statistics
const calculateDoctorStats = async (doctorId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const appointmentsResult = await getAppointmentsByDoctorAndDate(doctorId, today);
    
    if (appointmentsResult.success && appointmentsResult.data) {
      const appointments = appointmentsResult.data;
      const total = appointments.length;
      const done = appointments.filter((apt: any) => apt.status === 'completed').length;
      const waiting = appointments.filter((apt: any) => 
        apt.status === 'scheduled' || apt.status === 'confirmed' || apt.status === 'checked_in'
      ).length;
      
      return { total, done, waiting };
    }
  } catch (error) {
    console.error('Error calculating doctor stats:', error);
  }
  
  return { total: 0, done: 0, waiting: 0 };
};

// Helper function to transform doctor data
const transformDoctorData = async (doctors: any[]) => {
  // Fetch all assistants from multiple collections (same as AddDoctorDialog)
  const collectionsToTry = [
    'assistants',
    'staff',
    'employees',
    'personnel',
    'team',
    'workers',
    'members'
  ];
  
  const usersResult = await getDocuments('users');
  let allAssistants: any[] = [];
  
  // Fetch from all collections
  for (const collectionName of collectionsToTry) {
    try {
      const result = await getDocuments(collectionName);
      if (result.success && result.data && result.data.length > 0) {
        allAssistants = [...allAssistants, ...result.data];
      }
    } catch (error) {
      console.log(`Error fetching ${collectionName}:`, error);
    }
  }
  
  // Remove duplicates
  const uniqueAssistants = allAssistants.filter((assistant, index, self) => 
    index === self.findIndex(a => a.id === assistant.id)
  );
  
  console.log(`Found ${uniqueAssistants.length} unique assistants from all collections`);
  
  let assistantsMap = new Map();
  if (uniqueAssistants.length > 0) {
    console.log('Building assistants map from', uniqueAssistants.length, 'assistants');
    // Create a map of assistant document IDs to their names
    uniqueAssistants.forEach((assistant: any) => {
      console.log(`\n🔍 Processing assistant ${assistant.id}:`, JSON.stringify(assistant, null, 2));
      
      // Try multiple ways to get the assistant name
      let assistantName = '';
      
      // Use same name extraction strategies as AddDoctorDialog, but with proper undefined checks
      const nameStrategies = [
        () => assistant.name,
        () => assistant.user?.name,
        () => assistant.fullName,
        () => assistant.displayName,
        () => {
          const first = assistant.firstName;
          const last = assistant.lastName;
          if (first && last) return `${first} ${last}`;
          if (first) return first;
          if (last) return last;
          return null;
        },
        () => assistant.firstName,
        () => {
          const first = assistant.user?.firstName;
          const last = assistant.user?.lastName;
          if (first && last) return `${first} ${last}`;
          if (first) return first;
          if (last) return last;
          return null;
        },
        () => assistant.user?.firstName,
        () => assistant.profile?.name,
        () => {
          const first = assistant.profile?.firstName;
          const last = assistant.profile?.lastName;
          if (first && last) return `${first} ${last}`;
          if (first) return first;
          if (last) return last;
          return null;
        },
        () => assistant.profile?.firstName,
        () => assistant.data?.name,
        () => {
          const first = assistant.data?.firstName;
          const last = assistant.data?.lastName;
          if (first && last) return `${first} ${last}`;
          if (first) return first;
          if (last) return last;
          return null;
        },
        () => assistant.data?.firstName,
        () => assistant.details?.name,
        () => {
          const first = assistant.details?.firstName;
          const last = assistant.details?.lastName;
          if (first && last) return `${first} ${last}`;
          if (first) return first;
          if (last) return last;
          return null;
        },
        () => assistant.details?.firstName,
        () => assistant.info?.name,
        () => {
          const first = assistant.info?.firstName;
          const last = assistant.info?.lastName;
          if (first && last) return `${first} ${last}`;
          if (first) return first;
          if (last) return last;
          return null;
        },
        () => assistant.info?.firstName
      ];
      
      for (let i = 0; i < nameStrategies.length; i++) {
        try {
          const name = nameStrategies[i]();
          if (name && typeof name === 'string' && name !== 'undefined' && name !== 'null' && name.trim() !== '') {
            assistantName = name.trim();
            console.log(`✅ Found name using strategy ${i + 1}: "${assistantName}"`);
            break;
          }
        } catch (error) {
          // Continue to next strategy
        }
      }
      
      // Fallback: Look up user by userId
      if (!assistantName && assistant.userId && usersResult.success && usersResult.data) {
        const user: any = usersResult.data.find((u: any) => u.id === assistant.userId);
        if (user?.name) {
          assistantName = user.name;
          console.log(`✅ Found name via userId lookup: "${assistantName}"`);
        }
      }
      
      // Also check if assistantId is actually a userId in users collection
      if (!assistantName && usersResult.success && usersResult.data) {
        const user: any = usersResult.data.find((u: any) => u.id === assistant.id);
        if (user?.name) {
          assistantName = user.name;
          console.log(`✅ Found name via direct userId lookup: "${assistantName}"`);
        }
      }
      
      // Only store if we have a valid name (not undefined, null, or empty)
      if (assistantName && 
          assistant.id && 
          assistantName !== 'undefined' && 
          assistantName !== 'null' && 
          !assistantName.includes('undefined') &&
          assistantName.trim() !== '') {
        assistantsMap.set(assistant.id, assistantName);
        console.log(`✅ Mapped assistant ${assistant.id} -> ${assistantName}`);
      } else {
        console.log(`❌ Could not map assistant ${assistant.id} - no valid name found. Got: "${assistantName}"`);
      }
    });
    console.log('Final assistants map:', Array.from(assistantsMap.entries()));
  }
  
  const transformedDoctors = await Promise.all(
    doctors.map(async (doctor: any, index: number) => {
      const stats = await calculateDoctorStats(doctor.id);
      
      // Get assigned assistant names
      const assignedAssistantIds = doctor.assignedAssistants || [];
      const assignedAssistantNames: string[] = [];
      
      console.log(`\n=== Doctor ${doctor.id} (${doctor.user?.name || 'Unknown'}) ===`);
      console.log(`Assigned Assistant IDs:`, assignedAssistantIds);
      console.log(`Assistants map size:`, assistantsMap.size);
      console.log(`Total assistants found:`, uniqueAssistants.length);
      
      if (assignedAssistantIds.length > 0) {
        for (const assistantId of assignedAssistantIds) {
          let assistantName = assistantsMap.get(assistantId);
          
          // Try to find in all assistants
          if (!assistantName && uniqueAssistants.length > 0) {
            const assistant: any = uniqueAssistants.find((a: any) => a.id === assistantId);
            if (assistant) {
              // Use same name extraction strategies as AddDoctorDialog, but with proper undefined checks
              const nameStrategies = [
                () => assistant.name,
                () => assistant.user?.name,
                () => assistant.fullName,
                () => assistant.displayName,
                () => {
                  const first = assistant.firstName;
                  const last = assistant.lastName;
                  if (first && last) return `${first} ${last}`;
                  if (first) return first;
                  if (last) return last;
                  return null;
                },
                () => assistant.firstName,
                () => {
                  const first = assistant.user?.firstName;
                  const last = assistant.user?.lastName;
                  if (first && last) return `${first} ${last}`;
                  if (first) return first;
                  if (last) return last;
                  return null;
                },
                () => assistant.user?.firstName,
                () => assistant.profile?.name,
                () => {
                  const first = assistant.profile?.firstName;
                  const last = assistant.profile?.lastName;
                  if (first && last) return `${first} ${last}`;
                  if (first) return first;
                  if (last) return last;
                  return null;
                },
                () => assistant.profile?.firstName,
                () => assistant.data?.name,
                () => {
                  const first = assistant.data?.firstName;
                  const last = assistant.data?.lastName;
                  if (first && last) return `${first} ${last}`;
                  if (first) return first;
                  if (last) return last;
                  return null;
                },
                () => assistant.data?.firstName,
                () => assistant.details?.name,
                () => {
                  const first = assistant.details?.firstName;
                  const last = assistant.details?.lastName;
                  if (first && last) return `${first} ${last}`;
                  if (first) return first;
                  if (last) return last;
                  return null;
                },
                () => assistant.details?.firstName,
                () => assistant.info?.name,
                () => {
                  const first = assistant.info?.firstName;
                  const last = assistant.info?.lastName;
                  if (first && last) return `${first} ${last}`;
                  if (first) return first;
                  if (last) return last;
                  return null;
                },
                () => assistant.info?.firstName
              ];
              
              for (const strategy of nameStrategies) {
                try {
                  const name = strategy();
                  if (name && typeof name === 'string' && name !== 'undefined' && name !== 'null' && name.trim() !== '') {
                    assistantName = name.trim();
                    break;
                  }
                } catch (error) {
                  // Continue to next strategy
                }
              }
              
              // Only add if we have a valid name
              if (assistantName && 
                  assistantName !== 'undefined' && 
                  assistantName !== 'null' && 
                  !assistantName.includes('undefined') &&
                  assistantName.trim() !== '') {
                assistantsMap.set(assistantId, assistantName);
                assignedAssistantNames.push(assistantName);
                console.log(`✅ Found assistant ${assistantId}: ${assistantName}`);
              } else {
                // If still no name, try to get from user collection via userId
                if (assistant.userId && usersResult.success && usersResult.data) {
                  const user: any = usersResult.data.find((u: any) => u.id === assistant.userId);
                  if (user?.name && user.name.trim() !== '') {
                    assistantName = user.name.trim();
                    assistantsMap.set(assistantId, assistantName);
                    assignedAssistantNames.push(assistantName);
                    console.log(`✅ Found assistant ${assistantId} via user lookup: ${assistantName}`);
                  }
                }
                // Also try looking up by the assistantId itself in users (in case assistantId is actually a userId)
                if (!assistantName && usersResult.success && usersResult.data) {
                  const user: any = usersResult.data.find((u: any) => u.id === assistantId);
                  if (user?.name && user.name.trim() !== '') {
                    assistantName = user.name.trim();
                    assistantsMap.set(assistantId, assistantName);
                    assignedAssistantNames.push(assistantName);
                    console.log(`✅ Found assistant ${assistantId} as userId in users: ${assistantName}`);
                  }
                }
                if (!assistantName || assistantName.includes('undefined')) {
                  console.log(`❌ Could not find valid name for assistant ${assistantId}`);
                }
              }
            } else {
              // Assistant not found in any collection - try users collection directly
              if (usersResult.success && usersResult.data) {
                const user: any = usersResult.data.find((u: any) => u.id === assistantId);
                if (user?.name && user.name.trim() !== '') {
                  assistantName = user.name.trim();
                  assistantsMap.set(assistantId, assistantName);
                  assignedAssistantNames.push(assistantName);
                  console.log(`✅ Found assistant ${assistantId} directly in users: ${assistantName}`);
                } else {
                  console.log(`❌ Assistant with ID ${assistantId} not found in any collection or users`);
                }
              } else {
                console.log(`❌ Assistant with ID ${assistantId} not found in any collection`);
              }
            }
          } else if (assistantName && 
                     assistantName !== 'undefined' && 
                     assistantName !== 'null' && 
                     !assistantName.includes('undefined') &&
                     assistantName.trim() !== '') {
            assignedAssistantNames.push(assistantName);
            console.log(`✅ Found assistant ${assistantId} from map: ${assistantName}`);
          } else if (assistantName) {
            console.log(`❌ Skipping invalid assistant name from map for ${assistantId}: "${assistantName}"`);
          }
        }
      }
      
      console.log(`Final assistant names for doctor ${doctor.id}:`, assignedAssistantNames);
      
      return {
        id: doctor.id,
        name: doctor.user?.name || 'Unknown Doctor',
        specialty: doctor.specialty || 'General Medicine',
        status: doctor.status === 'In' ? 'In' : 'Out',
        consultationDuration: doctor.consultationDuration || 20,
        assignedAssistants: doctor.assignedAssistants || [],
        assignedAssistantNames: assignedAssistantNames,
        initials: doctor.user?.name ? doctor.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '...',
        bgColor: index % 2 === 0 ? 'bg-teal-600' : 'bg-teal-700',
        statusColor: doctor.status === 'In' ? 'bg-emerald-500' : 'bg-gray-400',
        stats: stats,
        slotDuration: `${doctor.consultationDuration || 20} min slots`,
        assistants: assignedAssistantNames.length > 0 ? assignedAssistantNames.join(', ') : 'No assistants assigned',
        online: doctor.isActive,
        phone: doctor.user?.phone || 'N/A',
        email: doctor.user?.email || 'N/A',
        schedule: doctor.schedule || (doctor.morningStartTime && doctor.eveningEndTime ? 
          `Morning: ${doctor.morningStartTime} - ${doctor.morningEndTime || '12:00'}, Evening: ${doctor.eveningStartTime || '17:00'} - ${doctor.eveningEndTime}` : 
          'Mon-Fri, 9:00 AM - 5:00 PM'),
        room: doctor.room || 'Room 101',
        startTime: doctor.startTime || '09:00',
        endTime: doctor.endTime || '17:00',
        morningStartTime: doctor.morningStartTime || '09:00',
        morningEndTime: doctor.morningEndTime || '12:00',
        eveningStartTime: doctor.eveningStartTime || '17:00',
        eveningEndTime: doctor.eveningEndTime || '20:00'
      };
    })
  );
  
  return transformedDoctors;
};

export default function AdminDoctors() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // Load doctors data
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          
          const doctorsResult = await getAllDoctors();
          console.log('Admin Doctors - Doctors Result:', doctorsResult);
          if (doctorsResult.success && doctorsResult.data) {
            // Transform the data to match web app format
            const transformedDoctors = await transformDoctorData(doctorsResult.data);
            setDoctors(transformedDoctors);
          } else {
            console.log('Admin Doctors - Failed to load doctors, using fallback data');
            // Fallback data matching your web app
            const fallbackDoctors = [
              {
                id: '1',
                name: 'haseeb...',
                specialty: 'dev',
                status: 'Out',
                consultationDuration: 20,
                assignedAssistants: [],
                initials: 'H',
                bgColor: 'bg-teal-600',
                statusColor: 'bg-gray-400',
                stats: { total: 0, done: 0, waiting: 0 },
                slotDuration: '20 min slots',
                assistants: 'No assistants assigned',
                online: false,
                phone: 'N/A',
                email: 'N/A',
                schedule: 'Mon-Fri, 9:00 AM - 5:00 PM',
                room: 'Room 101'
              },
              {
                id: '2',
                name: 'test',
                specialty: 'sdfgh',
                status: 'In',
                consultationDuration: 20,
                assignedAssistants: [],
                initials: 'T',
                bgColor: 'bg-teal-700',
                statusColor: 'bg-emerald-500',
                stats: { total: 0, done: 0, waiting: 0 },
                slotDuration: '20 min slots',
                assistants: 'No assistants assigned',
                online: true,
                phone: 'N/A',
                email: 'N/A',
                schedule: 'Mon-Fri, 9:00 AM - 5:00 PM',
                room: 'Room 101'
              },
              {
                id: '3',
                name: 'mydeen',
                specialty: 'dev',
                status: 'Out',
                consultationDuration: 20,
                assignedAssistants: [],
                initials: 'M',
                bgColor: 'bg-teal-600',
                statusColor: 'bg-gray-400',
                stats: { total: 0, done: 0, waiting: 0 },
                slotDuration: '20 min slots',
                assistants: 'No assistants assigned',
                online: false,
                phone: 'N/A',
                email: 'N/A',
                schedule: 'Mon-Fri, 9:00 AM - 5:00 PM',
                room: 'Room 101'
              }
            ];
            setDoctors(fallbackDoctors);
          }
        } else {
          router.push('/auth-login');
        }
      } catch (error) {
        console.error('Error loading doctors:', error);
        Alert.alert('Error', 'Failed to load doctors data');
      }
    };

    loadDoctors();
  }, [router]);

  const handleLogout = () => {
    router.push('/auth-login');
  };

  const handleNavigate = (path: string) => {
    router.push(path as any);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleAddDoctor = async (doctorData: any) => {
    setIsLoading(true);
    try {
      // First create user document
      const userDoc = {
        name: doctorData.name,
        email: doctorData.email,
        phone: doctorData.phone,
        role: 'doctor',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userResult = await createDocument('users', userDoc);
      
      if (!userResult.success) {
        Alert.alert('Error', 'Failed to create user account. Please try again.');
        return;
      }

      // Then create doctor document with userId reference
      // Handle both 'assistants' and 'assignedAssistants' field names for compatibility
      const assistants = doctorData.assistants || doctorData.assignedAssistants || [];
      
      console.log('Creating doctor with assistants:', assistants);
      console.log('Doctor data received:', doctorData);
      
      const doctorDoc = {
        userId: userResult.id, // Reference to the user document
        specialty: doctorData.specialty,
        consultationDuration: parseInt(doctorData.slotDuration) || 20,
        rating: 0,
        availability: {},
        isActive: true,
        status: doctorData.status || 'Out',
        room: doctorData.room || null,
        startTime: doctorData.startTime || '09:00',
        endTime: doctorData.endTime || '17:00',
        morningStartTime: doctorData.morningStartTime || '09:00',
        morningEndTime: doctorData.morningEndTime || '12:00',
        eveningStartTime: doctorData.eveningStartTime || '17:00',
        eveningEndTime: doctorData.eveningEndTime || '20:00',
        schedule: doctorData.schedule || `${doctorData.morningStartTime || '09:00'} - ${doctorData.eveningEndTime || '20:00'}`,
        assignedAssistants: assistants,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log('Doctor document to create:', doctorDoc);

      const doctorResult = await createDocument('doctors', doctorDoc);
      
      if (doctorResult.success) {
        Alert.alert('Success', 'Doctor added successfully!');
        setIsAddDialogOpen(false);
        // Reload doctors
        const doctorsResult = await getAllDoctors();
        if (doctorsResult.success && doctorsResult.data) {
          const transformedDoctors = await transformDoctorData(doctorsResult.data);
          setDoctors(transformedDoctors);
        }
      } else {
        Alert.alert('Error', 'Failed to add doctor. Please try again.');
      }
    } catch (error) {
      console.error('Error adding doctor:', error);
      Alert.alert('Error', 'Failed to add doctor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDoctor = (doctor: any) => {
    setSelectedDoctor(doctor);
    setIsViewDialogOpen(true);
  };

  const handleEditDoctor = (doctor: any) => {
    setSelectedDoctor(doctor);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDoctor = (doctor: any) => {
    setSelectedDoctor(doctor);
    setIsDeleteDialogOpen(true);
  };

  const handleEditDoctorSubmit = async (doctorData: any) => {
    if (!selectedDoctor) return;
    
    setIsLoading(true);
    try {
      // Handle both 'assistants' and 'assignedAssistants' field names for compatibility
      const assistants = doctorData.assistants || doctorData.assignedAssistants;
      
      // Prepare update data with all fields
      const updateData: any = {
        specialty: doctorData.specialty,
        slotDuration: doctorData.slotDuration,
        status: doctorData.status || 'Out',
        room: doctorData.room || null,
        startTime: doctorData.startTime || '09:00',
        endTime: doctorData.endTime || '17:00',
        morningStartTime: doctorData.morningStartTime || '09:00',
        morningEndTime: doctorData.morningEndTime || '12:00',
        eveningStartTime: doctorData.eveningStartTime || '17:00',
        eveningEndTime: doctorData.eveningEndTime || '20:00',
      };

      // Include assistants if provided
      if (assistants !== undefined) {
        updateData.assignedAssistants = assistants;
        console.log('Updating doctor with assistants:', assistants);
      }

      // Include name, email, phone if they exist (for user document update)
      if (doctorData.name) updateData.name = doctorData.name;
      if (doctorData.email) updateData.email = doctorData.email;
      if (doctorData.phone) updateData.phone = doctorData.phone;

      const result = await updateDoctor(selectedDoctor.id, updateData);
      
      if (result.success) {
        Alert.alert('Success', 'Doctor updated successfully!');
        setIsEditDialogOpen(false);
        setSelectedDoctor(null);
        // Reload doctors
        const doctorsResult = await getAllDoctors();
        if (doctorsResult.success && doctorsResult.data) {
          const transformedDoctors = await transformDoctorData(doctorsResult.data);
          setDoctors(transformedDoctors);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to update doctor. Please try again.');
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      Alert.alert('Error', 'Failed to update doctor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDoctor) return;
    
    setIsLoading(true);
    try {
      const result = await deleteDoctor(selectedDoctor.id);
      
      if (result.success) {
        Alert.alert('Success', 'Doctor deleted successfully!');
        setIsDeleteDialogOpen(false);
        setSelectedDoctor(null);
        // Reload doctors
        const doctorsResult = await getAllDoctors();
        if (doctorsResult.success && doctorsResult.data) {
          const transformedDoctors = await transformDoctorData(doctorsResult.data);
          setDoctors(transformedDoctors);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to delete doctor. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      Alert.alert('Error', 'Failed to delete doctor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeAllDialogs = () => {
    setIsViewDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedDoctor(null);
  };

  // Get paginated doctors
  const getPaginatedDoctors = (doctors: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return doctors.slice(startIndex, endIndex);
  };

  // Get total pages
  const getTotalPages = (doctors: any[]) => {
    return Math.ceil(doctors.length / itemsPerPage);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle double page navigation
  const handleDoublePageChange = (direction: 'prev' | 'next') => {
    const totalPages = getTotalPages(doctors);
    if (direction === 'prev') {
      const newPage = Math.max(1, currentPage - 2);
      setCurrentPage(newPage);
    } else {
      const newPage = Math.min(totalPages, currentPage + 2);
      setCurrentPage(newPage);
    }
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
            <ThemedText style={styles.title}>Doctors</ThemedText>
            <ThemedText style={styles.subtitle}>Manage doctor profiles and schedules</ThemedText>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsAddDialogOpen(true)}
          disabled={isLoading}
        >
          <UserPlus />
          <ThemedText style={styles.addButtonText}>Add Doctor</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        currentPath="/admin-doctors"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userName="Admin User"
        userRole="Administrator"
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Doctor Cards */}
          <View style={styles.doctorsGrid}>
            {getPaginatedDoctors(doctors).map((doctor) => (
              <View key={doctor.id} style={styles.doctorCard}>
                <View style={styles.doctorHeader}>
                  <View style={styles.doctorAvatarContainer}>
                    <View style={[styles.doctorAvatar, { backgroundColor: doctor.bgColor === 'bg-teal-600' ? '#0D9488' : '#0F766E' }]}>
                      <ThemedText style={styles.doctorInitials}>
                        {doctor.initials}
                      </ThemedText>
                    </View>
                    {doctor.online && (
                      <View style={styles.onlineIndicator} />
                    )}
                  </View>
                  <View style={styles.doctorInfo}>
                    <ThemedText style={styles.doctorName}>
                      {doctor.name}
                    </ThemedText>
                    <ThemedText style={styles.doctorSpecialty}>
                      {doctor.specialty}
                    </ThemedText>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: doctor.statusColor === 'bg-emerald-500' ? '#10B981' : '#6B7280' }]}>
                    <ThemedText style={styles.statusText}>{doctor.status}</ThemedText>
                  </View>
                </View>
                
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statNumber}>{doctor.stats.total}</ThemedText>
                    <ThemedText style={styles.statLabel}>Total</ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={[styles.statNumber, { color: '#059669' }]}>{doctor.stats.done}</ThemedText>
                    <ThemedText style={styles.statLabel}>Done</ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={[styles.statNumber, { color: '#0891B2' }]}>{doctor.stats.waiting}</ThemedText>
                    <ThemedText style={styles.statLabel}>Waiting</ThemedText>
                  </View>
                </View>
                
                <View style={styles.doctorDetails}>
                  <View style={styles.detailRow}>
                    <Clock size={16} color="#6B7280" />
                    <ThemedText style={styles.detailText}>
                      {doctor.slotDuration}
                    </ThemedText>
                  </View>
                  <View style={styles.assistantsContainer}>
                    <Users size={16} color="#6B7280" />
                    <ThemedText style={styles.assistantsLabel}>Assigned Assistants:</ThemedText>
                  </View>
                  {doctor.assignedAssistantNames && doctor.assignedAssistantNames.length > 0 ? (
                    <View style={styles.assistantsTagContainer}>
                      {doctor.assignedAssistantNames.map((assistantName: string, index: number) => (
                        <View key={index} style={styles.assistantTag}>
                          <ThemedText style={styles.assistantTagText}>{assistantName}</ThemedText>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <ThemedText style={styles.noAssistantsText}>No assistants assigned</ThemedText>
                  )}
                </View>
                
                <View style={styles.doctorActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleViewDoctor(doctor)}
                  >
                    <Eye size={16} color="#059669" />
                    <ThemedText style={styles.actionText}>View</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditDoctor(doctor)}
                  >
                    <Edit size={16} color="#6B7280" />
                    <ThemedText style={styles.actionText}>Edit</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteDoctor(doctor)}
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
            totalPages={getTotalPages(doctors)}
            totalItems={doctors.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onDoublePageChange={handleDoublePageChange}
          />
        </View>
      </ScrollView>

      {/* Add Doctor Dialog */}
      <AddDoctorDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddDoctor}
        isLoading={isLoading}
      />

      {/* View Doctor Dialog */}
      <ViewDoctorDialog
        isOpen={isViewDialogOpen}
        onClose={closeAllDialogs}
        doctor={selectedDoctor}
        onEdit={() => {
          setIsViewDialogOpen(false);
          setIsEditDialogOpen(true);
        }}
        onDelete={() => {
          setIsViewDialogOpen(false);
          setIsDeleteDialogOpen(true);
        }}
      />

      {/* Edit Doctor Dialog */}
      <EditDoctorDialog
        isOpen={isEditDialogOpen}
        onClose={closeAllDialogs}
        doctor={selectedDoctor}
        onSubmit={handleEditDoctorSubmit}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeAllDialogs}
        onConfirm={handleDeleteConfirm}
        title="Delete Doctor"
        message="Are you sure you want to delete this doctor? This will permanently remove the doctor and all associated data."
        itemName={selectedDoctor?.name}
        isLoading={isLoading}
      />
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
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
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
    flex: 1,
  },
  content: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  doctorsGrid: {
    paddingHorizontal: 16,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  doctorAvatarContainer: {
    position: 'relative',
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: '#10B981',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  doctorSpecialty: {
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  doctorDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  assistantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assistantsLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  assistantsTagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 6,
  },
  assistantTag: {
    backgroundColor: '#E5F7F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  assistantTagText: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '500',
  },
  noAssistantsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  doctorActions: {
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
