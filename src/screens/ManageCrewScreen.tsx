import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient';

type RootStackParamList = {
  Crew: undefined;
};

const ManageCrewScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [crewId, setCrewId] = useState<number | null>(null);
  const [crewName, setCrewName] = useState('');
  const [originalCrewName, setOriginalCrewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCrew = async () => {
      setLoading(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.id) {
        console.error('Error getting user:', userError);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('crew')
        .eq('id', user.id)
        .single();

      if (profileError || !profile.crew) {
        console.error('Error getting crew ID:', profileError);
        return;
      }

      const { data: crew, error: crewError } = await supabase
        .from('crews')
        .select('*')
        .eq('id', profile.crew)
        .single();

      if (crewError) {
        console.error('Error fetching crew:', crewError);
        return;
      }

      setCrewId(crew.id);
      setCrewName(crew.crew_name);
      setOriginalCrewName(crew.crew_name);
      setLoading(false);
    };

    fetchCrew();
  }, []);

  const handleSave = async () => {
    if (!crewId || crewName.trim() === '') {
      Alert.alert('Crew name cannot be empty');
      return;
    }

    if (crewName.trim() === originalCrewName) {
      Alert.alert('No changes to save');
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('crews')
      .update({ crew_name: crewName.trim() })
      .eq('id', crewId);

    setSaving(false);

    if (error) {
      Alert.alert('Error', 'Failed to update crew name.');
    } else {
      Alert.alert('Success', 'Crew name updated.');
      setOriginalCrewName(crewName.trim());
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Crew?',
      'Are you sure you want to delete your crew? This action cannot be undone and will remove all members from the crew.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!crewId) return;

            // Remove crew_id from all profiles
            await supabase.from('profiles').update({ crew: null }).eq('crew', crewId);

            // Delete crew from crews table
            const { error } = await supabase.from('crews').delete().eq('id', crewId);

            if (error) {
              Alert.alert('Error', 'Failed to delete crew.');
            } else {
              Alert.alert('Crew deleted');
              navigation.navigate('Crew');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Your Crew</Text>

      <TextInput
        style={styles.input}
        value={crewName}
        onChangeText={setCrewName}
        placeholder="Crew name"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Changes</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>Delete Crew</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
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
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  deleteButton: {
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    width: '100%',
    alignItems: 'center',
  },
  deleteText: { color: 'red', fontWeight: '600', fontSize: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ManageCrewScreen;
