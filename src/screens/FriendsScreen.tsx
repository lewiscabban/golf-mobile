import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../supabase/supabaseClient';
import { useNavigation } from '@react-navigation/native';

const FriendRequestsScreen = () => {
  const navigation = useNavigation();
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch friend requests
  const fetchFriendRequests = async () => {
    setLoading(true);

    // Get the authenticated user
    const { data, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      Alert.alert('Error', 'Failed to get user data.');
      setLoading(false);
      return;
    }

    // Ensure the user is not null
    const user = data?.user;
    if (!user) {
      console.error('No authenticated user found');
      Alert.alert('Error', 'User not authenticated.');
      setLoading(false);
      return;
    }

    // Fetch friend requests for the logged-in user
    const { data: requests, error } = await supabase
      .from('friend_requests')
      .select('*, sender_id, receiver_id')
      .eq('receiver_id', user.id)  // Safely access user.id here
      .eq('status', 'pending');  // Fetch only pending requests

    if (error) {
      console.error('Error fetching friend requests:', error);
      Alert.alert('Error', 'Failed to fetch friend requests. Please try again.');
    } else {
      setFriendRequests(requests || []);
    }

    setLoading(false);
    setRefreshing(false); // Stop refreshing
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  // Handle refresh when user pulls down on the list
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFriendRequests(); // Refetch friend requests
  };

  // Accept friend request
  const acceptRequest = async (requestId: number, senderId: string) => {
    const { data, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      Alert.alert('Error', 'Failed to get user data.');
      return;
    }
  
    const user = data?.user;
    if (!user) {
      console.error('No authenticated user found');
      Alert.alert('Error', 'User not authenticated.');
      return;
    }
  
    // At this point, we know `user` is not null, and we can safely access `user.id`
    const userId = user.id;
  
    // Update friend request status to 'accepted'
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);
  
    if (updateError) {
      console.error('Error accepting friend request:', updateError);
      Alert.alert('Error', 'Failed to accept friend request.');
      return;
    }
  
    // Create a new entry in the friends table
    const { error: insertError } = await supabase
      .from('friends')
      .upsert([
        { user_id: userId, friend_id: senderId },
        { user_id: senderId, friend_id: userId },
      ]);
  
    if (insertError) {
      console.error('Error adding to friends list:', insertError);
      Alert.alert('Error', 'Failed to add friend.');
      return;
    }
  
    Alert.alert('Success', 'Friend request accepted!');
    fetchFriendRequests(); // Refresh the friend requests list
  };

  // Reject friend request
  const rejectRequest = async (requestId: number) => {
    // Delete the friend request
    const { error } = await supabase
      .from('friend_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', 'Failed to reject friend request.');
      return;
    }

    Alert.alert('Success', 'Friend request rejected!');
    fetchFriendRequests(); // Refresh the friend requests list
  };

  const renderRequest = ({ item }: { item: any }) => (
    <View style={styles.requestItem}>
      <Text style={styles.requestText}>
        Friend request from User ID: {item.sender_id}
      </Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => acceptRequest(item.id, item.sender_id)}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => rejectRequest(item.id)}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friend Requests</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={friendRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRequest}
          contentContainerStyle={styles.list}
          onRefresh={handleRefresh} // Enable pull-to-refresh
          refreshing={refreshing} // Show the refreshing indicator
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 16,
  },
  requestItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  requestText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
  },
  rejectButton: {
    backgroundColor: '#F44336',
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FriendRequestsScreen;
