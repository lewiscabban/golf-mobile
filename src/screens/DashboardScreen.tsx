import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../supabase/supabaseClient';

const DashboardScreen = () => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout Failed', error.message);
    } else {
      Alert.alert('Logged Out', 'You have been logged out successfully.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your Dashboard!</Text>
      <Text style={styles.subtitle}>Track your golf scores and manage your account here.</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
});

export default DashboardScreen;
