import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useBackendPatientAuth } from '../lib/contexts/BackendPatientAuthContext';

export default function AuthDebug() {
  const { isAuthenticated, patientToken, isLoading, logout } = useBackendPatientAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth Debug</Text>
      <Text style={styles.text}>Loading: {isLoading ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Token: {patientToken ? 'Present' : 'None'}</Text>
      {patientToken && (
        <Text style={styles.tokenText}>Token: {patientToken.substring(0, 20)}...</Text>
      )}
      {isAuthenticated && (
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    marginBottom: 5,
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
});
