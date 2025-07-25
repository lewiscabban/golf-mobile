import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { supabase } from '../supabase/supabaseClient';
import Ionicons from 'react-native-vector-icons/Ionicons';

type FriendRequestsModalProps = {
  visible: boolean;
  onClose: () => void;
  handleDeletePress: (friendshipId: number) => void
  friendRequests: { id: string; sender_id: string }[];
};

const FriendRequestsModal: React.FC<FriendRequestsModalProps> = ({ visible, onClose, handleDeletePress, friendRequests }) => {
  const [friendRequestsWithUsernames, setFriendRequestsWithUsernames] = useState<
    { id: string; sender_id: string; username: string }[]
  >([]);

  // Fetch usernames for each sender_id
  useEffect(() => {
    const fetchUsernames = async () => {
      const senderIds = friendRequests.map((request) => request.sender_id);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', senderIds);

      if (error) {
        console.error('Error fetching usernames:', error);
        return;
      }

      // Map the friend requests to include usernames
      const enrichedRequests = friendRequests.map((request) => {
        const senderProfile = data?.find((profile) => profile.id === request.sender_id);
        return {
          ...request,
          username: senderProfile?.username || 'Unknown User',
        };
      });

      setFriendRequestsWithUsernames(enrichedRequests);
    };

    if (friendRequests.length > 0) {
      fetchUsernames();
    }
  }, [friendRequests]);

  const handleAcceptRequest = async (requestId: string) => {
    // Update the database to accept the request
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId);
    console.log(requestId)
    if (error) {
      Alert.alert('Error', 'Failed to accept the friend request.');
      console.error('Error accepting friend request:', error);
      return;
    }

    // Remove the accepted request from the UI
    setFriendRequestsWithUsernames((prev) => prev.filter((req) => req.id !== requestId));

    Alert.alert('Success', 'Friend request accepted!');
  };

  const handleDeleteRequest = async (friendshipId: string) => {
    handleDeletePress(Number(friendshipId))
    setFriendRequestsWithUsernames((prevRequests) =>
      prevRequests.filter((request) => request.id !== friendshipId)
    );
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
        <Text style={styles.text}>Friend Requests</Text>
        <FlatList
          data={friendRequestsWithUsernames}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.requestItem}>
              <Text style={styles.requestText}>Request from: {item.username}</Text>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptRequest(item.id)}
              >
                {/* <Text style={styles.acceptButtonText}>Accept</Text> */}
                <Ionicons name="checkmark" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteRequest(item.id)}>
                <Ionicons name="trash" size={24} color="white" />
              </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestText: {
    fontSize: 18,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  closeText: {
    color: '#4CAF50',
    marginTop: 20,
    fontSize: 18,
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FriendRequestsModal;
