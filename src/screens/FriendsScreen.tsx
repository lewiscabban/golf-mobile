import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { supabase } from "../supabase/supabaseClient";
import FriendRequestsModal from "../components/FriendRequestsModal";
import AddFriendModal from "../components/AddFriendModal";

const FriendsScreen = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addFriendModalVisible, setAddFriendModalVisible] = useState(false);
  const [friendRequestsModalVisible, setFriendRequestsModalVisible] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);

  // Fetch current friends
  const fetchFriends = async () => {
    setLoading(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error fetching user:", userError);
      Alert.alert("Error", "Failed to get user data.");
      setLoading(false);
      return;
    }

    const user = userData?.user;
    if (!user) {
      console.error("No authenticated user found");
      Alert.alert("Error", "User not authenticated.");
      setLoading(false);
      return;
    }

    const { data: friendsData, error } = await supabase
      .from("friendships")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .neq("sender_id", user.id) // Adjust as needed
      .neq("receiver_id", user.id); // Optional additional filtering

    if (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Error", "Failed to fetch friends.");
    } else {
      setFriends(friendsData || []);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike("username", `%${searchQuery}%`);

    if (error) {
      console.error("Error searching users:", error);
      Alert.alert("Error", "Failed to search users.");
    } else {
      setSearchResults(data || []);
    }
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

  const renderFriend = ({ item }: { item: any }) => (
    <Text style={styles.friendText}>Friend ID: {item.friend_id}</Text>
  );

  const renderSearchResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => addFriend(item.id)}
    >
      <Text style={styles.searchResultText}>{item.username}</Text>
    </TouchableOpacity>
  );

  const renderFriendRequest = ({ item }: { item: any }) => (
    <Text style={styles.friendRequestText}>Request from: {item.sender_id}</Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Friends</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.friend_id.toString()}
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

      {/* Add Friend Modal */}
      {/* Add Friend Modal */}<AddFriendModal
  visible={addFriendModalVisible}
  onClose={() => setAddFriendModalVisible(false)}
  onSearch={handleSearch}
  searchResults={searchResults}
  onAddFriend={addFriend}
/>

<FriendRequestsModal
  visible={friendRequestsModalVisible}
  onClose={() => setFriendRequestsModalVisible(false)}
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
  friendText: { fontSize: 16, marginBottom: 8 },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    height: '70%',
    width: '100%',
    alignSelf: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: '80%',
    marginBottom: 20,
    fontSize: 18,
  },
  searchResultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  searchResultText: { fontSize: 16 },
  friendRequestText: { fontSize: 16, marginBottom: 8 },
  closeModal: { color: "#007AFF", textAlign: "center", marginTop: 16 },
});

export default FriendsScreen;
