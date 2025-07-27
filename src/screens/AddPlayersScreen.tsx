import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Alert, FlatList,
  TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { supabase } from '../supabase/supabaseClient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchCoursePar } from '../utils/scoresUtils';

type ProfileStackParamList = {
  AddPlayers: { ClubID: number; CourseID: number };
  PlayRound: { RoundID: number };
};

type DashboardTabParamList = {
  Dashboard: { screen: string; params: { RoundID: number } };
};

type Players = {
  id: number;
  username: string;
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
  const [friends, setFriends] = useState<Players[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [searchResults, setSearchResults] = useState<Players[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Players[]>([]);
  const [coursePars, setCoursePars] = useState<Record<number, number | null>>([]);
  const [numHoles, setNumHoles] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [selectedGuests, setSelectedGuests] = useState<Players[]>([]);
  const [allGuests, setAllGuests] = useState<Players[]>([]);
  const [guestSearchResults, setGuestSearchResults] = useState<Players[]>([]);
  const [isGuestDropdownVisible, setIsGuestDropdownVisible] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error) {
        setUserId(data.user?.id || null);
      }
    };

    const fetchPar = async () => {
      const parMap = await fetchCoursePar(CourseID.toString());
      setNumHoles(Object.keys(parMap).length);
      setCoursePars(parMap);
    };

    fetchUserId();
    fetchPar();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFriends();
      fetchGuests();
      getCurrentUser();
    }
  }, [userId]);

  const fetchFriends = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    const { data: friendsData } = await supabase
      .from('friendships')
      .select('id, sender_id, receiver_id')
      .or(`sender_id.eq.${userData.user.id},receiver_id.eq.${userData.user.id}`)
      .eq('status', 'accepted');

    const friendIds = friendsData?.map((f) =>
      f.sender_id === userData.user.id ? f.receiver_id : f.sender_id
    ) || [];

    const { data: friendProfiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', friendIds);

    setFriends(friendProfiles || []);
  };

  const fetchGuests = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('guests')
      .select('id, username')
      .eq('profile', userId);

    if (!error && data) {
      setAllGuests(data);
    }
  };

  const getCurrentUser = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', userData.user.id)
        .single();

      if (profileData) {
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

  const handleGuestSearch = (text: string) => {
    setGuestName(text);
    if (!text.trim()) {
      setGuestSearchResults([]);
      setIsGuestDropdownVisible(false);
      return;
    }
    const filtered = allGuests.filter((guest) =>
      guest.username.toLowerCase().includes(text.toLowerCase())
    );
    setGuestSearchResults(filtered.slice(0, 10));
    setIsGuestDropdownVisible(true);
  };

  const addPlayer = (player: Players) => {
    if (!selectedPlayers.find((p) => p.id === player.id)) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
    setPlayerName('');
    setSearchResults([]);
    setDropdownVisible(false);
  };

  const removePlayer = (playerId: number) => {
    setSelectedPlayers((prev) => prev.filter((p) => p.id !== playerId));
    setSelectedGuests((prev) => prev.filter((g) => g.id !== playerId));
  };

  const handleAddGuest = async () => {
    const trimmedName = guestName.trim();
    if (!trimmedName || !userId) return;

    if (selectedGuests.some((g) => g.username.toLowerCase() === trimmedName.toLowerCase())) {
      setGuestName('');
      setShowGuestInput(false);
      return;
    }

    const existing = allGuests.find((g) => g.username.toLowerCase() === trimmedName.toLowerCase());
    if (existing) {
      if (!selectedGuests.find((g) => g.id === existing.id)) {
        setSelectedGuests((prev) => [...prev, existing]);
      }
      setGuestName('');
      setShowGuestInput(false);
      setIsGuestDropdownVisible(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('guests')
        .insert({ profile: userId, username: trimmedName })
        .select()
        .single();

      if (!error && data) {
        const newGuest = { id: data.id, username: data.username };
        setSelectedGuests((prev) => [...prev, newGuest]);
        setAllGuests((prev) => [...prev, newGuest]);
        setGuestName('');
        setShowGuestInput(false);
        setIsGuestDropdownVisible(false);
      } else {
        Alert.alert('Error', 'Failed to add guest.');
      }
    } catch (err) {
      console.error('Add guest error:', err);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  const handleAddRound = async () => {
    setLoading(true);
    try {
      const { data: roundData, error } = await supabase
        .from('rounds')
        .insert([{ course_id: CourseID }])
        .select()
        .single();

      if (error || !roundData) throw error;

      const scores = [
        ...selectedPlayers.flatMap((p) =>
          Array.from({ length: numHoles }, (_, i) => ({
            round_id: roundData.id,
            player: p.id,
            hole: i + 1,
            par: coursePars[i + 1],
          }))
        ),
        ...selectedGuests.flatMap((g) =>
          Array.from({ length: numHoles }, (_, i) => ({
            round_id: roundData.id,
            guest: g.id,
            hole: i + 1,
            par: coursePars[i + 1],
          }))
        ),
      ];

      const { error: scoresError } = await supabase.from('scores').insert(scores);
      if (scoresError) throw scoresError;

      navigation.navigate('Dashboard', {
        screen: 'PlayRound',
        params: { RoundID: roundData.id },
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not create round.');
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
              keyExtractor={(item) => `player-${item.id}`}
              style={styles.dropdownContainer}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => addPlayer(item)} style={styles.addPlayerButton}>
                  <View style={styles.addPlayerContent}>
                    <Text style={styles.dropdownItem}>{item.username}</Text>
                    <Icon name="add" size={24} color="#4CAF50" />
                  </View>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          )}

          <TouchableOpacity onPress={() => setShowGuestInput(true)} style={styles.addGuestButton}>
            <Text style={styles.addGuestText}>+ Add Guest</Text>
          </TouchableOpacity>

          {showGuestInput && (
            <View style={styles.guestInputContainer}>
              <TextInput
                style={styles.guestInput}
                placeholder="Enter guest name"
                value={guestName}
                onChangeText={handleGuestSearch}
                onFocus={() => setIsGuestDropdownVisible(true)}
              />
              <TouchableOpacity onPress={handleAddGuest} style={styles.addGuestSubmitButton}>
                <Text style={styles.addGuestSubmitText}>Add</Text>
              </TouchableOpacity>

              {isGuestDropdownVisible && guestSearchResults.length > 0 && (
                <FlatList
                  data={guestSearchResults}
                  keyExtractor={(item) => `guest-${item.id}`}
                  style={styles.dropdownContainer}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        if (!selectedGuests.find((g) => g.id === item.id)) {
                          setSelectedGuests((prev) => [...prev, item]);
                        }
                        setGuestName('');
                        setIsGuestDropdownVisible(false);
                        setShowGuestInput(false);
                      }}
                      style={styles.addPlayerButton}
                    >
                      <View style={styles.addPlayerContent}>
                        <Text style={styles.dropdownItem}>{item.username}</Text>
                        <Icon name="add" size={24} color="#4CAF50" />
                      </View>
                    </TouchableOpacity>
                  )}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>
          )}
        </View>

        <FlatList
          data={[...selectedPlayers, ...selectedGuests]}
          keyExtractor={(item) =>
            selectedGuests.some((g) => g.id === item.id) ? `guest-${item.id}` : `player-${item.id}`
          }
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
  // styles unchanged for brevity — keep using your existing ones
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { height: 50, borderBottomWidth: 1, borderColor: '#4CAF50', paddingHorizontal: 10, marginBottom: 10, width: '100%', color: '#000' },
  inputWrapper: { position: 'relative' },
  dropdownContainer: {
    position: 'absolute', top: 50, left: 0, right: 0,
    backgroundColor: '#fff', borderRadius: 8, maxHeight: 200,
    elevation: 5, zIndex: 1000
  },
  dropdownItem: { padding: 16, color: '#000' },
  addPlayerButton: { width: '100%', padding: 10 },
  addPlayerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  addGuestButton: { paddingVertical: 8, alignItems: 'flex-start', marginTop: 5 },
  addGuestText: { fontSize: 16, color: '#4CAF50', fontWeight: 'bold' },
  guestInputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, width: '100%' },
  guestInput: { flex: 1, borderBottomWidth: 1, borderColor: '#4CAF50', paddingHorizontal: 10, height: 50, color: '#000' },
  addGuestSubmitButton: { marginLeft: 10, backgroundColor: '#4CAF50', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 5 },
  addGuestSubmitText: { color: '#fff', fontWeight: 'bold' },
  playerItemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4, height: 50 },
  playerItem: { fontSize: 16, fontWeight: '600', color: '#4CAF50' },
  button: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default AddPlayersScreen;
