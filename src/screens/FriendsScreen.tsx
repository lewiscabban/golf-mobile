import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../supabase/supabaseClient";
import AddFriendModal from "../components/AddFriendModal";
import FriendRequestsModal from "../components/FriendRequestsModal";
import Ionicons from "react-native-vector-icons/Ionicons";

const FriendsScreen = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [addFriendModalVisible, setAddFriendModalVisible] = useState(false);
  const [friendRequestsModalVisible, setFriendRequestsModalVisible] = useState(false);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);

  const fetchFriends = async () => {
    setFriendsLoading(true);

    // Get the current user's data
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error fetching user:", userError);
      Alert.alert("Error", "Failed to get user data.");
      setFriendsLoading(false);
      return;
    }

    const user = userData?.user;
    if (!user) {
      console.error("No authenticated user found");
      Alert.alert("Error", "User not authenticated.");
      setFriendsLoading(false);
      return;
    }

    // Fetch friendships where the user is the sender or receiver and the status is accepted
    const { data: friendsData, error } = await supabase
      .from("friendships")
      .select("id, sender_id, receiver_id")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq("status", "accepted");

    if (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Error", "Failed to fetch friends.");
      setFriendsLoading(false);
      return;
    }

    // Determine the friend ID and fetch only their username
    const friendIds = friendsData.map((friendship) =>
      friendship.sender_id === user.id ? friendship.receiver_id : friendship.sender_id
    );

    const { data: friendProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", friendIds);

    if (profileError) {
      console.error("Error fetching friend profiles:", profileError);
      Alert.alert("Error", "Failed to fetch friend profiles.");
      setFriendsLoading(false);
      return;
    }

    // Map to a simpler structure for rendering
    const formattedFriends = friendsData.map((friendship) => {
      const friendId =
        friendship.sender_id === user.id ? friendship.receiver_id : friendship.sender_id;
      const friendProfile = friendProfiles.find((profile) => profile.id === friendId);
      return {
        id: friendship.id,
        friend_id: friendId,
        friend_username: friendProfile?.username,
      };
    });

    setFriends(formattedFriends);
    setFriendsLoading(false);
  };

  useEffect(() => {
    fetchFriends();
  }, []);

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
      Alert.alert("Success", "Friend request sent!");
      setAddFriendModalVisible(false);
    }
  };

  const fetchFriendRequests = async () => {
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

    const { data: requests, error } = await supabase
      .from("friendships")
      .select("id, sender_id")
      .eq("receiver_id", user.id)
      .eq("status", "pending");

    if (error) {
      console.error("Error fetching friend requests:", error);
      Alert.alert("Error", "Failed to fetch friend requests.");
    } else {
      setFriendRequests(requests || []);
    }
  };

  const deleteFriend = async (friendshipId: number) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);

      if (error) {
        console.error("Error deleting friendship:", error);
        Alert.alert("Error", "Failed to delete friendship.");
      } else {
        Alert.alert("Success", "Friendship deleted.");
        fetchFriends(); // Refresh the friends list
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const handleDeletePress = (friendshipId: number) => {
    Alert.alert(
      "Delete Friend",
      "Are you sure you want to delete this friend?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteFriend(friendshipId),
        },
      ]
    );
  };

  const renderFriend = ({ item }: { item: any }) => (
    <View style={styles.friendItem}>
      <Text style={styles.friendText}>{item.friend_username}</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePress(item.id)}>
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Friends</Text>
      {friendsLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFriend}
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => setAddFriendModalVisible(true)}
      >
        <Text style={styles.buttonText}>Add Friend</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          fetchFriendRequests();
          setFriendRequestsModalVisible(true);
        }}
      >
        <Text style={styles.buttonText}>Friend Requests</Text>
      </TouchableOpacity>

      <AddFriendModal
        visible={addFriendModalVisible}
        onClose={() => {
          setAddFriendModalVisible(false);
          fetchFriends();
        }}
        onAddFriend={addFriend}
      />

      <FriendRequestsModal
        visible={friendRequestsModalVisible}
        onClose={() => {
          setFriendRequestsModalVisible(false);
          fetchFriends();
        }}
        friendRequests={friendRequests}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  friendItem: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  deleteButton: {
    padding: 8,
  },
  friendText: { fontSize: 16 },
});

export default FriendsScreen;
