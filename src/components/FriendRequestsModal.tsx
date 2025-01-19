import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';

type FriendRequestsModalProps = {
  visible: boolean;
  onClose: () => void;
  friendRequests: { id: string; sender_id: string }[];
};

const FriendRequestsModal: React.FC<FriendRequestsModalProps> = ({ visible, onClose, friendRequests }) => {
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
        <Text style={styles.text}>Friend Requests</Text>
        <FlatList
          data={friendRequests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.requestItem}>
              <Text style={styles.requestText}>Request from: {item.sender_id}</Text>
            </View>
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
  requestItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  requestText: {
    fontSize: 18,
  },
  closeText: {
    color: '#007AFF',
    marginTop: 20,
    fontSize: 18,
  },
});

export default FriendRequestsModal;
