import { AdminSidebar } from '@/components/AdminSidebar';
import { ThemedText } from '@/components/themed-text';
import { getCurrentUser, signOut } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/config';
import { getDocument } from '@/lib/firebase/firestore';
import { useRouter } from 'expo-router';
import { collection, getDocs, limit, orderBy, query, Timestamp } from 'firebase/firestore';
import { AlertCircle, RefreshCw, Shield, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
          // Load user profile from Firestore
          const userResult = await getDocument('users', currentUser.uid);
          if (userResult.success && userResult.data) {
            setUser(userResult.data);
          } else {
            // Fallback to Firebase user if Firestore data not found
            setUser({
              name: currentUser.displayName || 'Admin User',
              email: currentUser.email || '',
              role: 'admin'
            });
          }
          
          // Load real audit logs from Firestore
          try {
            const q = query(
              collection(db, 'auditLogs'),
              orderBy('timestamp', 'desc'),
              limit(20)
            );
            
            const snapshot = await getDocs(q);
            const logs = snapshot.docs.map(doc => {
              const data = doc.data();
              
              // Convert Firestore Timestamp to readable string
              let timestampString = 'Unknown';
              if (data.timestamp) {
                try {
                  const timestamp = data.timestamp instanceof Timestamp 
                    ? data.timestamp.toDate() 
                    : new Date(data.timestamp);
                  timestampString = timestamp.toLocaleString();
                } catch (e) {
                  console.error('Error converting timestamp:', e);
                }
              }
              
              return {
                id: doc.id,
                action: data.action || 'Unknown action',
                user: data.user || data.userId || 'Unknown user',
                timestamp: timestampString,
                details: data.details || '',
              };
            });
            
            setAuditLogs(logs);
          } catch (auditError) {
            console.error('Error loading audit logs:', auditError);
            // Set empty array if audit logs fail to load
            setAuditLogs([]);
          }
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

  const handleLogout = async () => {
    await signOut();
    router.push('/auth-login');
  };
  
  const handleNavigate = (path: string) => router.push(path as any);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh user data from Firestore
      const currentUser = getCurrentUser();
      if (currentUser) {
        const userResult = await getDocument('users', currentUser.uid);
        if (userResult.success && userResult.data) {
          setUser(userResult.data);
        }
        
        // Refresh audit logs
        const q = query(
          collection(db, 'auditLogs'),
          orderBy('timestamp', 'desc'),
          limit(20)
        );
        
        const snapshot = await getDocs(q);
        const logs = snapshot.docs.map(doc => {
          const data = doc.data();
          
          let timestampString = 'Unknown';
          if (data.timestamp) {
            try {
              const timestamp = data.timestamp instanceof Timestamp 
                ? data.timestamp.toDate() 
                : new Date(data.timestamp);
              timestampString = timestamp.toLocaleString();
            } catch (e) {
              console.error('Error converting timestamp:', e);
            }
          }
          
          return {
            id: doc.id,
            action: data.action || 'Unknown action',
            user: data.user || data.userId || 'Unknown user',
            timestamp: timestampString,
            details: data.details || '',
          };
        });
        
        setAuditLogs(logs);
      }
      setSuccessMessage('Settings refreshed successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to refresh settings');
      setTimeout(() => setError(null), 3000);
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