import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, Alert, FlatList, 
  TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { useNavigation, NavigationProp, useRoute } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { supabase } from '../supabase/supabaseClient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchCourseNumHoles, fetchCoursePar } from '../utils/scoresUtils';

type ProfileStackParamList = {
  AddPlayers: { ClubID: number; CourseID: number };
  PlayRound: { RoundID: number };
};

type DashboardTabParamList = {
  Dashboard: { screen: string; params: { RoundID: number } };
};

type Players = {
  id: number;
  username: string
};

type NavigationProps = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList>,
  BottomTabNavigationProp<DashboardTabParamList>
>;

const AddPlayersScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute();
  const { ClubID, CourseID } = route.params as { ClubID: number; CourseID: number };
  const [userId, setUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Players[]>([]);
  const [coursePars, setCoursePars] = useState<Record<number, number | null>>([]);
  const [numHoles, setNumHoles] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user ID:', error);
      } else {
        setUserId(data.user?.id || null);
      }
    };

    const fetchPar = async () => {
      let parMap: Record<number, number | null> = []
      parMap = await fetchCoursePar(CourseID.toString());
      const holeCount = Object.keys(parMap).length;
      setNumHoles(holeCount)
      setCoursePars(parMap)
    }

    fetchUserId();
    fetchPar();
  }, []);

  useEffect(() => {
    fetchFriends();
    getCurrentUser();
  }, [userId]);

  const fetchFriends = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return;

    const { data: friendsData, error } = await supabase
      .from('friendships')
      .select('id, sender_id, receiver_id')
      .or(`sender_id.eq.${userData.user.id},receiver_id.eq.${userData.user.id}`)
      .eq('status', 'accepted');

    if (error) return;

    const friendIds = friendsData.map((f) =>
      f.sender_id === userData.user.id ? f.receiver_id : f.sender_id
    );

    const { data: friendProfiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', friendIds);

    setFriends(friendProfiles || []);
  };

  const getCurrentUser = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', userData.user.id)
        .single();
      
      if (!error && profileData) {
        setSelectedPlayers([{ id: profileData.id, username: profileData.username }]);
      }
    }
  };

  const handleSearch = (text: string) => {
    setPlayerName(text);
    if (!text.trim()) {
      setSearchResults([]);
      setDropdownVisible(false);
      return;
    }
    const filtered = friends.filter((friend) =>
      friend.username.toLowerCase().includes(text.toLowerCase())
    );
    setSearchResults(filtered.slice(0, 10));
    setDropdownVisible(true);
  };

  const addPlayer = (player: any) => {
    if (!selectedPlayers.find((p) => p.id === player.id)) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
    setPlayerName('');
    setSearchResults([]);
    setDropdownVisible(false);
  };

  const removePlayer = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter((player) => player.id !== playerId));
  };

  const handleAddRound = async () => {
    setLoading(true);

    try {
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .insert([{ course_id: CourseID }])
        .select('*')
        .single();

      if (roundError || !roundData) {
        console.error('Error inserting round:', roundError);
        Alert.alert('Error', 'Failed to create a new round. Please try again.');
        return;
      }

      const scoresToInsert = selectedPlayers.flatMap((player) =>
        Array.from({ length: numHoles }, (_, i) => i + 1)
          .map((hole) => ({
            round_id: roundData.id,
            player: player.id,
            hole: hole,
            par: coursePars[hole]
          }))
      );

      const { error: scoresError } = await supabase.from('scores').insert(scoresToInsert);
      if (scoresError) {
        console.error('Error inserting scores:', scoresError);
        Alert.alert('Error', 'Failed to initialize scores for the round.');
        return;
      }

      navigation.navigate('Dashboard', {
        screen: 'PlayRound',
        params: { RoundID: roundData.id  },
      });
    } catch (err) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => { setDropdownVisible(false); Keyboard.dismiss(); }}>
      <View style={styles.container}>
        <Text style={styles.title}>Add Players</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Search Friends"
            value={playerName}
            onChangeText={handleSearch}
            onFocus={() => setDropdownVisible(true)}
          />
          {isDropdownVisible && searchResults.length > 0 && (
            <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            style={styles.dropdownContainer}
            renderItem={({ item }) => (
              <View style={styles.addPlayerItemContainer}>
                <TouchableOpacity onPress={() => addPlayer(item)} style={styles.addPlayerButton}>
                  <View style={styles.addPlayerContent}>
                    <Text style={styles.dropdownItem}>{item.username}</Text>
                    <Icon name="add" size={24} color="#4CAF50" />
                  </View>
                </TouchableOpacity>
              </View>
            )}
            keyboardShouldPersistTaps="handled"
          />          
          
          )}
        </View>
        <FlatList
          data={selectedPlayers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.playerItemContainer}>
              <Text style={styles.playerItem}>{item.username}</Text>

              {String(item.id) !== userId && (
                <TouchableOpacity onPress={() => removePlayer(item.id)}>
                  <Icon name="delete" size={24} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          )}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddRound} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Go to Play Round</Text>}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderColor: '#4CAF50',
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '100%',
    color: '#000000',
  },
  inputWrapper: {
    position: 'relative'
  },
  dropdownContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 200,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 16,
    color: '#000000',
  },
  playerItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: 4,
    height: 50,
  },
  addPlayerItemContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  addPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  playerItem: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  addPlayerButton: {
    width: '100%',
    padding: 10,
  },
  removeButton: {
    color: 'red',
    fontWeight: 'bold',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddPlayersScreen;
