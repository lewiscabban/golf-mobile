import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import { supabase } from '../supabase/supabaseClient';
import { Ionicons } from '@expo/vector-icons';

type AddFriendModalProps = {
  visible: boolean;
  onClose: () => void;
  onAddFriend: (friendId: string) => void;
};

const AddFriendModal: React.FC<AddFriendModalProps> = ({
  visible,
  onClose,
  onAddFriend,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get the current user ID on component mount
    const fetchCurrentUserId = async () => {
      const { data: user, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user ID:', error);
      } else if (user) {
        setCurrentUserId(user.user.id);
      }
    };

    fetchCurrentUserId();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery || !currentUserId) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', `%${searchQuery}%`)
      .neq('id', currentUserId); // Exclude current user by ID

    if (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users.');
    } else {
      setSearchResults(data || []);
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
        <Text style={styles.text}>Search for Friends</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.resultRow}>
              <Text style={styles.resultText}>{item.username}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => onAddFriend(item.id)}
              >
                <Ionicons name="person-add" size={20} color="#FFF" />
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  resultText: {
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#007AFF',
    marginTop: 20,
    fontSize: 18,
  },
});

export default AddFriendModal;
