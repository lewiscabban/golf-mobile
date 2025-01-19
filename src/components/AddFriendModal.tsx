import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';

type AddFriendModalProps = {
  visible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  searchResults: { id: string; username: string }[];
  onAddFriend: (friendId: string) => void;
};

const AddFriendModal: React.FC<AddFriendModalProps> = ({ visible, onClose, onSearch, searchResults, onAddFriend }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    onSearch(searchQuery);
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
        <Text style={styles.text}>Search for Friends</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter username"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => onAddFriend(item.id)}
            >
              <Text style={styles.resultText}>{item.username}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
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
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    height: '70%',
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
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  resultText: {
    fontSize: 18,
  },
  closeText: {
    color: '#007AFF',
    marginTop: 20,
    fontSize: 18,
  },
});

export default AddFriendModal;
