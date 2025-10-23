import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import BackendOTPTest from '../components/BackendOTPTest';

export default function BackendOTPTestPage() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <BackendOTPTest />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
});
