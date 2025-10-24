import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { ThemedText } from './themed-text';

// Custom SVG Icons
const LayoutGrid = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3H10V10H3V3Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 3H21V10H14V3Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 14H10V21H3V14Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 14H21V21H14V14Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Calendar = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Activity = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 12H18L15 21L9 3L6 12H2"
      stroke="currentColor"
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
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 8V10C6 12.2091 7.79086 14 10 14H14C16.2091 14 18 12.2091 18 10V8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 14V18C12 19.1046 12.8954 20 14 20H16C17.1046 20 18 19.1046 18 18V16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UserPlus = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M8.5 7C8.5 9.20914 6.70914 11 4.5 11C2.29086 11 0.5 9.20914 0.5 7C0.5 4.79086 2.29086 3 4.5 3C6.70914 3 8.5 4.79086 8.5 7ZM20 8V14M17 11H23"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ClipboardList = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 14H15M9 18H15M9 10H15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BarChart3 = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3V21H21M18 9L13 14L9 10L3 16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Settings = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77251 19.9887C9.5799 19.7201 9.31074 19.5176 9 19.41C8.69838 19.2769 8.36381 19.2372 8.03941 19.296C7.71502 19.3548 7.41568 19.5095 7.18 19.74L7.12 19.8C6.93425 19.986 6.71368 20.1335 6.47088 20.2341C6.22808 20.3348 5.96783 20.3866 5.705 20.3866C5.44217 20.3866 5.18192 20.3348 4.93912 20.2341C4.69632 20.1335 4.47575 19.986 4.29 19.8C4.10405 19.6143 3.95653 19.3937 3.85588 19.1509C3.75523 18.9081 3.70343 18.6478 3.70343 18.385C3.70343 18.1222 3.75523 17.8619 3.85588 17.6191C3.95653 17.3763 4.10405 17.1557 4.29 16.97L4.35 16.91C4.58054 16.6743 4.73519 16.375 4.794 16.0506C4.85282 15.7262 4.81312 15.3916 4.68 15.09C4.55324 14.7942 4.34276 14.542 4.07447 14.3643C3.80618 14.1866 3.49179 14.0913 3.17 14.09H3C2.46957 14.09 1.96086 13.8793 1.58579 13.5042C1.21071 13.1291 1 12.6204 1 12.09C1 11.5596 1.21071 11.0509 1.58579 10.6758C1.96086 10.3007 2.46957 10.09 3 10.09H3.09C3.42099 10.0927 3.74266 9.98551 4.01125 9.7929C4.27984 9.60029 4.48234 9.33113 4.59 9.02C4.72312 8.71838 4.76282 8.38381 4.704 8.05941C4.64519 7.73502 4.49054 7.43568 4.26 7.2L4.2 7.14C4.01405 6.95425 3.86653 6.73368 3.76588 6.49088C3.66523 6.24808 3.61343 5.98783 3.61343 5.725C3.61343 5.46217 3.66523 5.20192 3.76588 4.95912C3.86653 4.71632 4.01405 4.49575 4.2 4.31L4.26 4.25C4.49575 4.01946 4.79508 3.86481 5.11947 3.806C5.44387 3.74718 5.77844 3.78688 6.08 3.92C6.37577 4.04676 6.62802 4.25724 6.80569 4.52553C6.98337 4.79382 7.07872 5.10821 7.08 5.43V5.5C7.08 6.03043 7.29071 6.53914 7.66579 6.91421C8.04086 7.28929 8.54957 7.5 9.08 7.5C9.61043 7.5 10.1191 7.28929 10.4942 6.91421C10.8693 6.53914 11.08 6.03043 11.08 5.5V5.41C11.0813 5.08821 11.1766 4.77382 11.3543 4.50553C11.532 4.23724 11.7842 4.02676 12.08 3.9C12.3816 3.76688 12.7162 3.72718 13.0406 3.786C13.365 3.84481 13.6643 3.99946 13.9 4.23L13.96 4.29C14.1457 4.47575 14.2932 4.69632 14.3939 4.93912C14.4945 5.18192 14.5463 5.44217 14.5463 5.705C14.5463 5.96783 14.4945 6.22808 14.3939 6.47088C14.2932 6.71368 14.1457 6.93425 13.96 7.12L13.9 7.18C13.6695 7.41568 13.5148 7.71502 13.456 8.03941C13.3972 8.36381 13.4369 8.69838 13.57 9Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LogOut = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12L16 7M21 12H9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  userName?: string;
  userRole?: string;
}

const SIDEBAR_WIDTH = 280;

export function AdminSidebar({ 
  isOpen, 
  onClose, 
  currentPath, 
  onNavigate, 
  onLogout, 
  userName = 'Admin User',
  userRole = 'Administrator'
}: AdminSidebarProps) {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const [isSidebarVisible, setIsSidebarVisible] = useState(isOpen);

  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/admin-dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/admin-appointments' },
    { icon: Activity, label: 'Queues', path: '/admin-queues' },
    { icon: Stethoscope, label: 'Doctors', path: '/admin-doctors' },
    { icon: UserPlus, label: 'Assistants', path: '/admin-assistants' },
    { icon: ClipboardList, label: 'Schedule', path: '/admin-schedule' },
    { icon: BarChart3, label: 'Reports', path: '/admin-reports' },
    { icon: Settings, label: 'Settings', path: '/admin-settings' },
  ];

  useEffect(() => {
    if (isOpen) {
      setIsSidebarVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsSidebarVisible(false);
      });
    }
  }, [isOpen, slideAnim]);

  if (!isSidebarVisible) return null;

  return (
    <View style={styles.overlayContainer}>
      {/* Backdrop */}
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      />
      
      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Activity />
            </View>
            <View>
              <ThemedText style={styles.logoText}>ClinicOS</ThemedText>
              <ThemedText style={styles.logoSubtext}>Admin Portal</ThemedText>
            </View>
          </View>
        </View>

        {/* Navigation Menu */}
        <View style={styles.navigation}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, isActive && styles.activeMenuItem]}
                onPress={() => {
                  onNavigate(item.path);
                  onClose();
                }}
              >
                <Icon />
                <ThemedText style={[styles.menuText, isActive && styles.activeMenuText]}>
                  {item.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* User Profile */}
        <View style={styles.userProfile}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <ThemedText style={styles.userInitial}>
                {userName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <View style={styles.userDetails}>
              <ThemedText style={styles.userName}>{userName}</ThemedText>
              <ThemedText style={styles.userRole}>{userRole}</ThemedText>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <LogOut />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#14B8A6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  logoSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  navigation: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 4,
  },
  activeMenuItem: {
    backgroundColor: '#14B8A6',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeMenuText: {
    color: '#FFFFFF',
  },
  userProfile: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDFA',
    borderRadius: 16,
    padding: 14,
  },
  userAvatar: {
    width: 44,
    height: 44,
    backgroundColor: '#14B8A6',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  logoutButton: {
    padding: 8,
  },
});
