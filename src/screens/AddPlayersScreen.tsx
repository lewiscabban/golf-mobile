import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert, FlatList, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation, NavigationProp, useRoute } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient';
import { TeeRow } from '../types/supabase';

type ProfileStackParamList = {
  AddPlayers: { ClubID: number; CourseID: number };
  PlayRound: { RoundID: number };
};

const AddPlayersScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const route = useRoute();
  const { ClubID, CourseID } = route.params as { ClubID: number; CourseID: number };

  const [friends, setFriends] = useState<any[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const [tees, setTees] = useState<TeeRow[]>([]);
  const [selectedTee, setSelectedTee] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFriends();
    fetchTees();
    getCurrentUser();
  }, []);

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

  const fetchTees = async () => {
    const { data, error } = await supabase.from('tees').select('*').eq('CourseID', CourseID);
    if (!error) setTees(data || []);
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
      return;
    }
    const filtered = friends.filter((friend) =>
      friend.username.toLowerCase().includes(text.toLowerCase())
    );
    setSearchResults(filtered.slice(0, 10));
  };

  const addPlayer = (player: any) => {
    if (!selectedPlayers.find((p) => p.id === player.id)) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
    setPlayerName('');
    setSearchResults([]);
  };

  const removePlayer = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter((player) => player.id !== playerId));
  };

  const handleAddRound = async () => {
    if (selectedTee === undefined) {
      Alert.alert('Validation Error', 'Please select a tee.');
      return;
    }

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

      const tee = tees.find((t) => t.TeeID === selectedTee);
      if (!tee) {
        Alert.alert('Error', 'Selected tee data not found.');
        return;
      }

      const scoresToInsert = selectedPlayers.flatMap((player) =>
        Array.from({ length: 18 }, (_, i) => i + 1)
          .filter((hole) => (tee as Record<string, any>)[`Length${hole}`] !== null)
          .map((hole) => ({
            round_id: roundData.id,
            tee_id: selectedTee,
            player: player.id,
            hole,
          }))
      );

      const { error: scoresError } = await supabase.from('scores').insert(scoresToInsert);
      if (scoresError) {
        console.error('Error inserting scores:', scoresError);
        Alert.alert('Error', 'Failed to initialize scores for the round.');
        return;
      }

      navigation.navigate('PlayRound', { RoundID: roundData.id });
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Players</Text>
      <TextInput
        style={styles.input}
        placeholder="Search Friends"
        value={playerName}
        onChangeText={handleSearch}
      />
      {searchResults.length > 0 && (
        <View style={styles.dropdownContainer}>
          {searchResults.map((friend) => (
            <TouchableOpacity key={friend.id} onPress={() => addPlayer(friend)}>
              <Text style={styles.dropdownItem}>{friend.username}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <FlatList
        data={selectedPlayers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.playerItemContainer}>
            <Text style={styles.playerItem}>{item.username}</Text>
            <TouchableOpacity onPress={() => removePlayer(item.id)}>
              <Text style={styles.removeButton}>X</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Dropdown
        data={tees.map((tee) => ({ label: tee.TeeName, value: tee.TeeID.toString() }))}
        labelField="label"
        valueField="value"
        value={selectedTee?.toString()}
        onChange={(item) => setSelectedTee(Number(item.value))}
        placeholder="Select a tee"
        style={styles.dropdown}
      />
      <Button title={loading ? 'Adding Round...' : 'Go to Play Round'} onPress={handleAddRound} disabled={loading || selectedTee === undefined} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 8 },
  dropdownContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff' },
  dropdownItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  playerItemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
  playerItem: { fontSize: 16 },
  removeButton: { color: 'red', fontWeight: 'bold', marginLeft: 10 },
  dropdown: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginTop: 8 },
});

export default AddPlayersScreen;
