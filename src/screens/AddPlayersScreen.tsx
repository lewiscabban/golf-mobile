import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown'; // Import Dropdown component
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

  const [playerName, setPlayerName] = useState('');
  const [tees, setTees] = useState<TeeRow[]>([]);
  const [selectedTee, setSelectedTee] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTees = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('tees')
          .select('*')
          .eq('CourseID', CourseID);

        if (error) {
          console.error('Error fetching tees:', error);
          Alert.alert('Error', 'Failed to load tees.');
        } else {
          setTees(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTees();
  }, [CourseID]);

  const handleAddRound = async () => {
    if (!playerName.trim()) {
      Alert.alert('Validation Error', 'Please enter a player name.');
      return;
    }

    if (selectedTee === undefined) {
      Alert.alert('Validation Error', 'Please select a tee.');
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData?.session?.user) {
        console.error('Error fetching user session:', sessionError);
        Alert.alert('Error', 'Unable to retrieve user information. Please log in again.');
        return;
      }

      const userId = sessionData.session.user.id;

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

      const scoresToInsert = Array.from({ length: 18 }, (_, i) => ({
        round_id: roundData.id,
        hole: i + 1,
        player: userId,
        tee_id: selectedTee,
      }));

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
      <Text style={styles.text}>Enter the player's name for the golf round.</Text>

      {/* Form Container with TextInput and Dropdown */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Player Name"
          value={playerName}
          onChangeText={setPlayerName}
        />

        {/* Dropdown for Tee Selection */}
        <Dropdown
          data={tees.map((tee) => ({
            label: tee.TeeName || '',
            value: tee.TeeID.toString(),
          }))}
          labelField="label"
          valueField="value"
          value={selectedTee?.toString()}
          onChange={(item) => setSelectedTee(Number(item.value))}
          placeholder="Select a tee"
          style={styles.dropdown}
        />
      </View>

      <Button
        title={loading ? 'Adding Round...' : 'Go to Play Round'}
        onPress={handleAddRound}
        disabled={loading || selectedTee === undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
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
  formContainer: {
    width: '100%',
    marginBottom: 16, // Space between form and button
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8, // Space between input and dropdown
  },
  dropdown: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
});

export default AddPlayersScreen;
