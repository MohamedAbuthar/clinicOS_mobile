import { validateApiConfig } from '@/lib/config/api';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Component to help with API setup
export const APISetupGuide = () => {
  const [testUrl, setTestUrl] = useState('');

  const handleTestConnection = async () => {
    if (!testUrl) {
      Alert.alert('Error', 'Please enter a URL to test');
      return;
    }

    try {
      const response = await fetch(`${testUrl}/api/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com', otp: '123456' }),
      });

      const contentType = response.headers.get('content-type');
      
      if (response.ok && contentType && contentType.includes('application/json')) {
        Alert.alert('Success', 'API endpoint is working! You can use this URL in your config.');
      } else {
        const text = await response.text();
        Alert.alert('Error', `API returned: ${response.status} - ${text.substring(0, 100)}...`);
      }
    } catch (error: any) {
      Alert.alert('Error', `Connection failed: ${error.message}`);
    }
  };

  const checkCurrentConfig = () => {
    const validation = validateApiConfig();
    Alert.alert('Config Status', validation.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Setup Guide</Text>
      
      <Text style={styles.instruction}>
        1. Deploy your web app to Vercel/Netlify
      </Text>
      <Text style={styles.instruction}>
        2. Get your app URL (e.g., https://your-app.vercel.app)
      </Text>
      <Text style={styles.instruction}>
        3. Update lib/config/api.ts with your URL
      </Text>
      
      <View style={styles.testContainer}>
        <Text style={styles.label}>Test API URL:</Text>
        <TextInput
          style={styles.input}
          value={testUrl}
          onChangeText={setTestUrl}
          placeholder="https://your-app.vercel.app"
          keyboardType="url"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleTestConnection}>
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.checkButton} onPress={checkCurrentConfig}>
        <Text style={styles.checkButtonText}>Check Current Config</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Make sure your web app has the /api/otp/send endpoint working!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    margin: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#495057',
  },
  instruction: {
    fontSize: 14,
    marginBottom: 8,
    color: '#6c757d',
  },
  testContainer: {
    marginTop: 20,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#495057',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  checkButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 15,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  note: {
    fontSize: 12,
    color: '#dc3545',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
