import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient';

type RootStackParamList = {
  Crew: undefined;
};

const CreateCrewScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [crewName, setCrewName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateCrew = async () => {
    if (!crewName.trim()) {
      Alert.alert('Crew name is required');
      return;
    }

    setLoading(true);

    try {
      // Get current user ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.id) throw new Error('Could not get current user');

      const leaderId = user.id;

      // Insert into crews table
      const { data, error } = await supabase.from('crews').insert([
        {
          crew_name: crewName.trim(),
          leader: leaderId,
        },
      ]).select().single();

      if (error) throw error;

      // Update user's profile with the new crew ID
      await supabase.from('profiles')
        .update({ crew: data.id })
        .eq('id', leaderId);

      Alert.alert('Crew created!', 'You are now the leader of your crew.');
      navigation.navigate('Crew');

    } catch (error) {
      console.error('Create crew error:', error);
      Alert.alert('Error', 'Could not create crew. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Crew</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter crew name"
        value={crewName}
        onChangeText={setCrewName}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreateCrew}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CreateCrewScreen;
