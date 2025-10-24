import { useBackendPatientAuth } from '@/lib/contexts/BackendPatientAuthContext';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import PatientSidebar from './PatientSidebar';
import { ThemedText } from './themed-text';

// Menu Icon Component
const Menu = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12H21M3 6H21M3 18H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface PatientLayoutProps {
  children: React.ReactNode;
}

// Function to get page title and subtitle based on route
const getPageInfo = (pathname: string) => {
  const pageMap: Record<string, { title: string; subtitle: string }> = {
    '/patient-dashboard': { title: 'Dashboard', subtitle: 'Overview of your health information' },
    '/patient-appointments': { title: 'My Appointments', subtitle: 'View and manage your appointments' },
    '/patient-book': { title: 'Book Appointment', subtitle: 'Schedule a new appointment' },
    '/patient-queue': { title: 'Queue Status', subtitle: 'Check your position in the queue' },
    '/patient-profile': { title: 'My Profile', subtitle: 'Manage your personal information' },
  };

  return pageMap[pathname] || { title: 'Patient Portal', subtitle: 'Welcome back!' };
};

export default function PatientLayout({ children }: PatientLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading, logout } = useBackendPatientAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const pageInfo = getPageInfo(pathname || '');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      router.replace('/patient-login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/patient-login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        {/* You can add a loading spinner here */}
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        {/* You can add a loading spinner here */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <PatientSidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
      />
      
      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={toggleSidebar}
          >
            <Menu />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>{pageInfo.title}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>{pageInfo.subtitle}</ThemedText>
          </View>
        </View>
        
        {/* Page Content */}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
});
