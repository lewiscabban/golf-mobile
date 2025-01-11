import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput } from 'react-native';
import Modal from 'react-native-modal';

type HoleModalProps = {
  visible: boolean;
  holeNumber: number | null;
  onClose: () => void;
  onSave: (holeNumber: number, newScore: number) => void; // Add onSave prop
};

const HoleModal: React.FC<HoleModalProps> = ({ visible, holeNumber, onClose, onSave }) => {
  const [score, setScore] = useState<string>('');

  const handleSave = () => {
    if (holeNumber !== null && score) {
      onSave(holeNumber, parseInt(score, 10));
      setScore(''); // Reset score input
    }
  };

  return (
    <Modal
      isVisible={visible}
      swipeDirection={['down']}
      onSwipeComplete={onClose}
      onBackdropPress={onClose}
      backdropColor="rgba(0, 0, 0, 0.5)"
      backdropOpacity={0.7}
      style={styles.modal}
    >
      <View style={styles.content}>
        <Text style={styles.text}>
          {holeNumber ? `Enter Score for Hole ${holeNumber}` : 'No hole selected'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Score"
          keyboardType="numeric"
          value={score}
          onChangeText={setScore}
        />
        <View style={styles.buttonRow}>
          <Button title="Cancel" onPress={onClose} color="#888" />
          <Button title="Save" onPress={handleSave} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  content: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    height: '70%',
    width: '100%',
    alignSelf: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: '80%',
    marginBottom: 20,
    fontSize: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
});

export default HoleModal;
