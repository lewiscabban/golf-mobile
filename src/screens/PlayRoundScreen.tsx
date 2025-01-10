import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient';
import { RoundsRow } from '../types/supabase';

type ProfileStackParamList = {
    PlayRound: { RoundID: number };
  };

const PlayRoundScreen = () => {
    const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
    const route = useRoute();
    const { RoundID } = route.params as { RoundID: number };

  const [roundData, setRoundData] = useState<RoundsRow | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the round data
    const fetchRoundData = async () => {
      setLoading(true);
        console.log(RoundID)
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('id', RoundID)
        .single();

      if (error) {
        console.error('Error fetching round data:', error);
      } else {
        setRoundData(data);
      }

      setLoading(false);
    };

    fetchRoundData();
  }, [RoundID]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Play Round</Text>
      {roundData ? (
        <View style={styles.info}>
          <Text>Club ID: {roundData?.id}</Text>
        </View>
      ) : (
        <Text>No data found for this round.</Text>
      )}
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
  info: {
    marginTop: 16,
  },
});

export default PlayRoundScreen;
