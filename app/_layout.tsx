import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { BackendPatientAuthProvider } from '@/lib/contexts/BackendPatientAuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <BackendPatientAuthProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="auth-login" options={{ headerShown: false }} />
            <Stack.Screen name="patient-login" options={{ headerShown: false }} />
            <Stack.Screen name="patient-auth" options={{ headerShown: false }} />
            <Stack.Screen name="admin-dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="admin-appointments" options={{ headerShown: false }} />
            <Stack.Screen name="admin-appointment" options={{ headerShown: false }} />
            <Stack.Screen name="admin-queues" options={{ headerShown: false }} />
            <Stack.Screen name="admin-doctors" options={{ headerShown: false }} />
            <Stack.Screen name="admin-assistants" options={{ headerShown: false }} />
            <Stack.Screen name="admin-schedule" options={{ headerShown: false }} />
            <Stack.Screen name="admin-reports" options={{ headerShown: false }} />
            <Stack.Screen name="admin-settings" options={{ headerShown: false }} />
            <Stack.Screen name="patient-dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="patient-appointments" options={{ headerShown: false }} />
            <Stack.Screen name="patient-book" options={{ headerShown: false }} />
            <Stack.Screen name="patient-queue" options={{ headerShown: false }} />
            <Stack.Screen name="patient-profile" options={{ headerShown: false }} />
            <Stack.Screen name="patient-medicalrecords" options={{ headerShown: false }} />
            <Stack.Screen name="patient-register" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </BackendPatientAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
