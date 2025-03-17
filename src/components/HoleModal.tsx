import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Modal from 'react-native-modal';

type HoleModalProps = {
  visible: boolean;
  holeNumber: number | null;
  onClose: () => void;
  onSave: (holeNumber: number, newScore: number) => void;
};

const HoleModal: React.FC<HoleModalProps> = ({ visible, holeNumber, onClose, onSave }) => {
  const [score, setScore] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleScorePress = (value: number | string) => {
    if (value === "+") {
      setShowCustomInput(true);
    } else {
      setScore(value.toString());
      setShowCustomInput(false);
    }
  };

  const handleSave = () => {
    if (holeNumber !== null && score) {
      onSave(holeNumber, parseInt(score, 10));
      setScore(null);
      setShowCustomInput(false);
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

        {/* 3x3 Grid */}
        {!showCustomInput && (
          <View style={styles.grid}>
            <View style={styles.gridRow}>
              {[1, 2, 3].map((num) => (
                <TouchableOpacity key={num} style={styles.gridButton} onPress={() => handleScorePress(num)}>
                  <Text style={styles.gridButtonText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.gridRow}>
              {[4, 5, 6].map((num) => (
                <TouchableOpacity key={num} style={styles.gridButton} onPress={() => handleScorePress(num)}>
                  <Text style={styles.gridButtonText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.gridRow}>
              {[7, 8, "+"].map((num) => (
                <TouchableOpacity key={num} style={styles.gridButton} onPress={() => handleScorePress(num)}>
                  <Text style={styles.gridButtonText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Custom Input Field */}
        {showCustomInput && (
          <TextInput
            style={styles.input}
            placeholder="Enter Custom Score"
            keyboardType="numeric"
            value={score ?? ""}
            onChangeText={setScore}
          />
        )}

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText} >Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} disabled={!score}>
            <Text style={styles.saveText} >Save</Text>
          </TouchableOpacity>
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
  cancelText: {
    fontSize: 18,
    padding: 20,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  saveText: {
    fontSize: 18,
    padding: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    flex: 1,
    textAlign: 'center',
  },
  grid: {
    flexDirection: "column",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  gridButton: {
    width: 60,
    height: 60,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderRadius: 10,
  },
  gridButtonText: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: '80%',
    marginBottom: 20,
    fontSize: 18,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
});

export default HoleModal;
