import { AdminSidebar } from '@/components/AdminSidebar';
import { ThemedText } from '@/components/themed-text';
import { getCurrentUser, signOutUser } from '@/lib/firebase/auth';
import { getDocuments } from '@/lib/firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';
import { Shield, User, RefreshCw, AlertCircle, Settings as SettingsIcon, Bell, Database, Users } from 'lucide-react-native';

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

export default function AdminSettings() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          
          // Load audit logs (simulated)
          const mockAuditLogs = [
            {
              id: '1',
              action: 'User Login',
              user: 'Admin User',
              timestamp: new Date().toISOString(),
              details: 'Successful login from mobile app',
            },
            {
              id: '2',
              action: 'Doctor Added',
              user: 'Admin User',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              details: 'Added new doctor: Dr. John Smith',
            },
            {
              id: '3',
              action: 'Appointment Created',
              user: 'Admin User',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              details: 'Created appointment for patient: Jane Doe',
            },
          ];
          setAuditLogs(mockAuditLogs);
        } else {
          router.push('/auth-login');
        }
      } catch (error) {
        console.error('Error loading settings data:', error);
        setError('Failed to load settings data');
      }
    };

    loadData();
  }, [router]);

  const handleLogout = () => {
    signOutUser();
    router.push('/auth-login');
  };
  
  const handleNavigate = (path: string) => router.push(path as any);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Settings refreshed successfully');
    } catch (error) {
      setError('Failed to refresh settings');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSystemAction = (action: string) => {
    Alert.alert('System Action', `${action} feature will be implemented soon`);
  };

  const SettingItem = ({ icon: Icon, title, subtitle, onPress, color = '#6B7280' }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.settingContent}>
        <ThemedText style={styles.settingTitle}>{title}</ThemedText>
        <ThemedText style={styles.settingSubtitle}>{subtitle}</ThemedText>
      </View>
      <ThemedText style={styles.settingArrow}>›</ThemedText>
    </TouchableOpacity>
  );

  const AuditLogItem = ({ log }: any) => (
    <View style={styles.auditLogItem}>
      <View style={styles.auditLogHeader}>
        <ThemedText style={styles.auditLogAction}>{log.action}</ThemedText>
        <ThemedText style={styles.auditLogTime}>
          {new Date(log.timestamp).toLocaleString()}
        </ThemedText>
      </View>
      <ThemedText style={styles.auditLogUser}>by {log.user}</ThemedText>
      <ThemedText style={styles.auditLogDetails}>{log.details}</ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <Menu />
          </TouchableOpacity>
          <View>
            <ThemedText style={styles.title}>Settings</ThemedText>
            <ThemedText style={styles.subtitle}>System settings and user management</ThemedText>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <ThemedText style={styles.refreshButtonText}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        currentPath="/admin-settings"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userName="Admin User"
        userRole="Administrator"
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Success Message */}
          {successMessage && (
            <View style={styles.successMessage}>
              <ThemedText style={styles.successText}>{successMessage}</ThemedText>
            </View>
          )}

          {/* Error Message */}
          {error && (
            <View style={styles.errorMessage}>
              <AlertCircle size={16} color="#DC2626" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          {/* User Profile Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color="#059669" />
              <ThemedText style={styles.sectionTitle}>Your Profile</ThemedText>
            </View>
            
            <View style={styles.profileInfo}>
              <View style={styles.profileItem}>
                <ThemedText style={styles.profileLabel}>Name</ThemedText>
                <ThemedText style={styles.profileValue}>{user?.name || 'N/A'}</ThemedText>
              </View>
              <View style={styles.profileItem}>
                <ThemedText style={styles.profileLabel}>Email</ThemedText>
                <ThemedText style={styles.profileValue}>{user?.email || 'N/A'}</ThemedText>
              </View>
              <View style={styles.profileItem}>
                <ThemedText style={styles.profileLabel}>Role</ThemedText>
                <View style={styles.roleContainer}>
                  <Shield size={16} color="#059669" />
                  <ThemedText style={styles.roleValue}>
                    {user?.role || 'N/A'}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* System Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SettingsIcon size={20} color="#059669" />
              <ThemedText style={styles.sectionTitle}>System Settings</ThemedText>
            </View>
            
            <View style={styles.settingsList}>
              <SettingItem
                icon={Bell}
                title="Notifications"
                subtitle="Manage notification preferences"
                color="#3B82F6"
                onPress={() => handleSystemAction('Notifications')}
              />
              <SettingItem
                icon={Database}
                title="Database"
                subtitle="Backup and restore data"
                color="#10B981"
                onPress={() => handleSystemAction('Database')}
              />
              <SettingItem
                icon={Users}
                title="User Management"
                subtitle="Manage user accounts and permissions"
                color="#F59E0B"
                onPress={() => handleSystemAction('User Management')}
              />
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertCircle size={20} color="#059669" />
              <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
            </View>
            <ThemedText style={styles.sectionSubtitle}>
              System audit logs and user activities
            </ThemedText>
            
            <View style={styles.auditLogsList}>
              {auditLogs.map((log) => (
                <AuditLogItem key={log.id} log={log} />
              ))}
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
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    marginTop: 4,
  },
  refreshButtonText: {
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
  successMessage: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: '500',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  section: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  profileInfo: {
    gap: 16,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  profileValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleValue: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  settingsList: {
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingArrow: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  auditLogsList: {
    gap: 12,
  },
  auditLogItem: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  auditLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  auditLogAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  auditLogTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  auditLogUser: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 4,
  },
  auditLogDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
});