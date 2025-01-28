import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../supabase/supabaseClient';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
  
    // Authenticate the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
  
    if (authError) {
      Alert.alert('Login Failed', authError.message);
      return;
    }
  
    // Get the authenticated user's details
    const user = authData?.user;
    if (!user) {
      Alert.alert('Login Failed', 'No user found.');
      return;
    }
  
    // Check if the user is marked for deletion
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('to_be_deleted')
      .eq('id', user.id)
      .single();
  
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      Alert.alert('Login Failed', 'Unable to fetch user profile.');
      return;
    }
  
    if (profileData?.to_be_deleted) {
      Alert.alert(
        'Account Locked',
        'Your account has been marked for deletion. Please contact support if you believe this is an error.'
      );
  
      // Log the user out immediately
      await supabase.auth.signOut();
      return;
    }
  
    // Proceed if the account is not marked for deletion
    Alert.alert('Login Successful', 'Welcome back!');
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
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
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 16,
  },
});

export default LoginScreen;
