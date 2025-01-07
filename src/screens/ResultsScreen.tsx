import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../types/navigation';  // Import navigation types

type ResultsScreenNavigationProp = StackNavigationProp<
  RootTabParamList,
  'Results'
>;

const ResultsScreen = () => {
  const navigation = useNavigation<ResultsScreenNavigationProp>();

  const handleBackToDashboard = () => {
    navigation.reset({
      index: 0, // Resets the stack to the first screen in the stack
      routes: [{ name: 'Dashboard' }], // Navigate to the Dashboard tab
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Round Results</Text>
      {/* Display the round results here */}
      <Text>Your results will be displayed here.</Text>

      {/* Back to Dashboard Button */}
      <TouchableOpacity style={styles.button} onPress={handleBackToDashboard}>
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4CAF50', // Green or any color you like
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ResultsScreen;
