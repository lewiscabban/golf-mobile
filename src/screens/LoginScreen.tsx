import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../supabase/supabaseClient';
import { FontAwesome } from '@expo/vector-icons';
import { CommonActions, NavigationProp, useNavigation } from '@react-navigation/native';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import { findNodeHandle, UIManager } from 'react-native';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
};

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Refs for input fields
  const emailRef = React.useRef<TextInput>(null);
  const passwordRef = React.useRef<TextInput>(null);
  const scrollRef = React.useRef<ScrollView>(null);

  const handleLogin = async () => {
    setEmailError(!email);
    setPasswordError(!password);

    if (!email || !password) {
      return;
    }

    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (authError) {
      Alert.alert('Login Failed', 'Username or password incorrect');
      return;
    }

    const user = authData?.user;
    if (!user) {
      Alert.alert('Login Failed', 'Username or password incorrect');
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('to_be_deleted')
      .eq('id', user.id)
      .single();
  
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return;
    }
  
    if (profileData?.to_be_deleted) {
      Alert.alert('Account Locked', 'Your account has been marked for deletion.');
      await supabase.auth.signOut();
      return;
    }
  };

  const handleCreateAccount = async () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }, { name: 'Signup' }],
      })
    );
  };

  // Function to scroll to the next input
  const scrollToInput = (ref: React.RefObject<TextInput>) => {
    const nodeHandle = findNodeHandle(ref.current);
    const scrollHandle = findNodeHandle(scrollRef.current);

    if (nodeHandle && scrollHandle && ref.current && scrollRef.current) {
      UIManager.measureLayout(
        nodeHandle,
        scrollHandle,
        () => {}, // Empty error callback
        (x: number, y: number) => {
          scrollRef.current?.scrollTo({ y: y - 20, animated: true });
        }
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.card}>
              <Text style={styles.title}>Sign in to your account</Text>

              <TouchableOpacity style={styles.authButton}>
                <FontAwesome name="google" size={20} color="#EA4335" />
                <Text style={styles.authText}>Sign in with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.authButton}>
                <FontAwesome name="apple" size={20} color="#000" />
                <Text style={styles.authText}>Sign in with Apple</Text>
              </TouchableOpacity>

              <Text style={styles.orText}>Or continue with Email</Text>

              <TextInput
                ref={emailRef}
                style={[styles.input, emailError && styles.inputError]}
                placeholder="Email address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError(false);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => {
                  scrollToInput(passwordRef)
                  passwordRef.current?.focus()
                }}
              />
              {emailError && <Text style={styles.errorText}>Please enter your email</Text>}

              <TextInput
                ref={passwordRef}
                style={[styles.input, passwordError && styles.inputError]}
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError(false);
                }}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              {passwordError && <Text style={styles.errorText}>Please enter your password</Text>}

              <TouchableOpacity onPress={() => console.log('Forgot password clicked!')}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Not a member?</Text>
                <TouchableOpacity onPress={handleCreateAccount} disabled={loading}>
                  <Text style={styles.signupLink}>Create an account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#28a745',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10,
  },
  authText: {
    marginLeft: 10,
    fontSize: 16,
  },
  orText: {
    marginVertical: 10,
    color: '#666',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  forgotText: {
    color: '#007bff',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    color: '#666',
    marginRight: 5,
  },
  signupLink: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default LoginScreen;
