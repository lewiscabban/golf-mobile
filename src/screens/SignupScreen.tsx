import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '../supabase/supabaseClient';
import { CommonActions, NavigationProp, useNavigation } from '@react-navigation/native';


type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
};

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleSignup = async () => {
    if (!email || !password || !firstName || !lastName || !username) {
      Alert.alert('Signup Failed', 'Please fill out all fields.');
      return;
    }

    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          username: username,
        },
      },
    });

    setLoading(false);
    if (signUpError) {
      console.error('Signup Error:', signUpError);
      Alert.alert('Signup Failed', signUpError.message);
      return;
    }

    Alert.alert('Signup Successful', 'Your account has been created!');
  };

  const handleSignIn = async () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }, { name: 'Login' }],
      })
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create an Account</Text>
        <TouchableOpacity style={styles.authButton}>
          <FontAwesome name="google" size={20} color="#EA4335" />
          <Text style={styles.authText}>Sign up with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.authButton}>
          <FontAwesome name="apple" size={20} color="#000" />
          <Text style={styles.authText}>Sign up with Apple</Text>
        </TouchableOpacity>
        <Text style={styles.orText}>Or continue with Email</Text>
        <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
        <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.loginButton} onPress={handleSignup} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing up...' : 'Sign Up'}</Text>
        </TouchableOpacity>
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Have an account?</Text>
          <TouchableOpacity onPress={handleSignIn} disabled={loading}>
            <Text style={styles.signupLink}> Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  button: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SignupScreen;
