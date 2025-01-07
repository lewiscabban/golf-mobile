import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import HoleModal from '../components/HoleModal';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Import this

import { RootStackParamList } from '../types/navigation'; // Import navigation types

type PlayRoundScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PlayRound'
>; // Define the navigation prop type for PlayRoundScreen

const PlayRoundScreen = () => {
  const navigation = useNavigation<PlayRoundScreenNavigationProp>(); // Apply the navigation type
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleButtonPress = (index: number) => {
    setSelectedIndex(index);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedIndex(null);
  };

  const handleFinish = () => {
    navigation.navigate('Results'); // Now navigation should work correctly
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Play Round</Text>

      {/* Scrollable list of buttons */}
      <ScrollView contentContainerStyle={styles.scrollView}>
        {Array.from({ length: 18 }, (_, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => handleButtonPress(index + 1)}
          >
            <Text style={styles.buttonText}>Hole {index + 1}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Hole Modal */}
      <HoleModal
        visible={modalVisible}
        holeNumber={selectedIndex}
        onClose={handleCloseModal}
      />

      {/* Finish Button */}
      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>Finish Round</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Keeps the content at the top (so buttons can scroll)
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    marginVertical: 6,
    width: '100%',
    alignItems: 'center',
    borderRadius: 6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',  // Centers the buttons in case there are fewer than 18 buttons
    width: '100%',
  },
  finishButton: {
    backgroundColor: '#FF5733',  // Red or any color you like for the finish button
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginTop: 20,
    marginBottom: 20,  // Adds space between the button and the bottom edge
    // position: 'absolute',  // Position it at the bottom of the screen
    bottom: 20,  // Adjust the distance from the bottom edge
    left: '10%',
    right: '10%',
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PlayRoundScreen;
