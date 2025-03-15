import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { supabase } from '../supabase/supabaseClient';
import { FriendshipsRow, ProfilesRow } from '../types/supabase';
import Ionicons from 'react-native-vector-icons/Ionicons';

type ProfileModalProps = {
  visible: boolean;
  playerId: string;
  onClose: () => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ visible, playerId: playerId, onClose }) => {
  const [profile, setProfile] = useState<{
    first_name: string;
    full_name: string | null;
    id: string;
    last_name: string;
    updated_at: string | null;
    username: string;
  } | null>(null);
  const [friendship, setFriendship] = useState<FriendshipsRow | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchFriendship = async () => {
    console.log("playerId: ", playerId)
    console.log("profileId: ", userId)
    const { data: friendshipData, error } = await supabase
      .from('friendships')
      .select('*')
      .or(
        `and(receiver_id.eq.${playerId},sender_id.eq.${userId}),and(receiver_id.eq.${userId},sender_id.eq.${playerId})`
      )
      .single();
    console.log(friendshipData)
    setFriendship(friendshipData);
  };

  const addFriend = async (friendId: string) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error fetching user:", userError);
      Alert.alert("Error", "Failed to get user data.");
      return;
    }

    const user = userData?.user;
    if (!user) {
      console.error("No authenticated user found");
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    const { error } = await supabase
      .from("friendships")
      .insert({ sender_id: user.id, receiver_id: friendId, status: "pending" });

    if (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Error", "Failed to send friend request.");
    } else {
      await fetchFriendship();
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user ID:', error);
      } else {
        setUserId(data.user?.id || null);
      }
    };
    fetchUserId();
  }, []);

  // Fetch usernames for each sender_id
  useEffect(() => {
      const fetchProfile = async () => {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', playerId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          Alert.alert('Error', 'Failed to fetch profile.');
        } else {
          setProfile(profileData);
        }
      };

      fetchProfile();
  }, [playerId]);

  // Fetch usernames for each sender_id
  useEffect(() => {
      

      if (userId) {
        fetchFriendship();
      }
  }, [userId]);

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
      <View style={styles.usernameRow}>
        <Text style={styles.text}>{profile?.username}</Text>

        {!friendship && playerId !== userId && userId && (
          <TouchableOpacity style={styles.addButton} onPress={() => addFriend(playerId)}>
            <Ionicons name="person-add" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
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
    height: '15%',
    width: '100%',
    alignSelf: 'center',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 10, // Adds spacing between text and icon
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


export default ProfileModal;
