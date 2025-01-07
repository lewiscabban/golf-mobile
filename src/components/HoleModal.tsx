import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';

type HoleModalProps = {
  visible: boolean;
  holeNumber: number | null;
  onClose: () => void;
};

const HoleModal: React.FC<HoleModalProps> = ({ visible, holeNumber, onClose }) => {
  return (
    <Modal
      isVisible={visible}
      swipeDirection={['down']} // Allow swiping down to close
      onSwipeComplete={onClose} // Close the modal when swiped
      onBackdropPress={onClose} // Close when tapped outside
      backdropColor="rgba(0, 0, 0, 0.5)" // Dim background color
      backdropOpacity={0.7} // Make background dimmer
      style={styles.modal} // Custom styling
    >
      <View style={styles.content}>
        <Text style={styles.text}>
          {holeNumber ? `You clicked on Hole ${holeNumber}` : 'No hole selected'}
        </Text>
        <Button title="Close" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end', // Place modal at the bottom
    margin: 0, // Full screen width/height
  },
  content: {
    backgroundColor: '#FFF',
    padding: 30, // Increased padding for more space
    borderRadius: 10,
    alignItems: 'center',
    height: '70%',  // Adjust height (you can use a fixed value like 400 for a fixed height)
    width: '100%',   // Set width to 100% of the screen
    alignSelf: 'center', // Center the modal horizontally
  },
  text: {
    fontSize: 24,  // Larger font size for better visibility
    fontWeight: 'bold',
    marginBottom: 20, // More space between text and button
  },
});

export default HoleModal;
