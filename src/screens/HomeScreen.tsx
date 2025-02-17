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
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Welcome to Golf Score Card</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.loginButtonText, styles.buttonText ]}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={[styles.buttonText, styles.signupText]}>Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end', // Moves content to the bottom
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    flex: 1, // Takes up all available space above the buttons
    justifyContent: 'center', // Centers the title vertically
    alignItems: 'center', // Centers the title horizontally
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#211071',
  },
  signupButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#211071',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginButtonText: {
    color: '#fff',
  },
  signupText: {
    color: '#211071',
  },
});

export default HomeScreen;
