import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient';

type RootStackParamList = {
  JoinCrew: undefined;
  CreateCrew: undefined;
  ManageCrew: undefined;
};

const CrewScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [crewId, setCrewId] = useState<string | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error fetching user:', userError);
        setCrewId(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('crew')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setCrewId(null);
      } else {
        setCrewId(profile.crew); // could be null or a string
      }
    };

    fetchProfile();
  }, []);

  if (crewId === undefined) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (crewId === null) {
    // User has no crew
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You're not in a crew yet</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('JoinCrew')}
          >
            <Text style={[styles.buttonText, styles.primaryText]}>Join a Crew</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('CreateCrew')}
          >
            <Text style={styles.secondaryText}>Create a Crew</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // User is in a crew
  return (
    <View style={styles.container}>
      <Text style={styles.title}>You're part of a crew 🎉</Text>
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={() => navigation.navigate('ManageCrew')}
      >
        <Text style={[styles.buttonText, styles.primaryText]}>Manage Your Crew</Text>
      </TouchableOpacity>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  secondaryText: {
    color: '#4CAF50',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CrewScreen;
