import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
};

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Golf Score Card</Text>

      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={() => navigation.navigate('Signup')}
      >
        <Text style={styles.buttonText}>Signup</Text>
      </TouchableOpacity>
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
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
