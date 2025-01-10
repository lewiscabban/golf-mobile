import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert } from 'react-native';
import { useNavigation, NavigationProp, useRoute } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient';

type ProfileStackParamList = {
  AddPlayers: { ClubID: number; CourseID: number };
  PlayRound: { RoundID: number };
};

const AddPlayersScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const route = useRoute();
  const { ClubID, CourseID } = route.params as { ClubID: number; CourseID: number };

  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddRound = async () => {
    if (!playerName.trim()) {
      Alert.alert('Validation Error', 'Please enter a player name.');
      return;
    }

    setLoading(true);

    try {
      // Insert a new round into the "rounds" table
      const { data, error } = await supabase
        .from('rounds')
        .insert([{ course_id: CourseID }])
        .select('*')
        .single();

      if (error) {
        console.error('Error inserting round:', error);
        Alert.alert('Error', 'Failed to create a new round. Please try again.');
      } else {
        console.log('Inserted round:', data);
        // Navigate to the PlayRound page and pass the RoundID
        navigation.navigate('PlayRound', { RoundID: data.id });
      }
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
      <Text style={styles.text}>Enter the player's name for the golf round.</Text>
      <TextInput
        style={styles.input}
        placeholder="Player Name"
        value={playerName}
        onChangeText={setPlayerName}
      />
      <Button
        title={loading ? 'Adding Round...' : 'Go to Play Round'}
        onPress={handleAddRound}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
});

export default AddPlayersScreen;
