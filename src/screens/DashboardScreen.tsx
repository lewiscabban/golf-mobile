import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../supabase/supabaseClient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RoundsRow } from '../types/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';  // Import SafeAreaView

type DashboardStackParamList = {
  ProfileStack: { screen: string; params: { RoundID: number } };
  Friends: undefined; // Define the FriendRequests screen
};

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();
  const [rounds, setRounds] = useState<RoundsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch rounds from Supabase
  const fetchRounds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rounds')
      .select('*');

    if (error) {
      console.error('Error fetching rounds:', error);
      Alert.alert('Error', 'Failed to fetch rounds. Please try again.');
    } else {
      setRounds(data || []);
    }
    setLoading(false);
    setRefreshing(false); // Stop refreshing
  };

  // Use effect to fetch rounds when component mounts
  useEffect(() => {
    fetchRounds();
  }, []);

  // Handle refresh when user pulls down on the list
  const handleRefresh = async () => {
    setRefreshing(true); // Start refreshing
    await fetchRounds(); // Refetch data
  };

  const renderRound = ({ item }: { item: RoundsRow }) => (
    <TouchableOpacity
      style={styles.roundItem}
      onPress={() => handleNavigateToPlayRound(item.id)}
    >
      <Text style={styles.roundText}>Round ID: {item.id}</Text>
      <Text style={styles.roundText}>Course ID: {item.course_id}</Text>
      <Text style={styles.roundText}>Player Name: {item.created_at}</Text>
    </TouchableOpacity>
  );

  const handleNavigateToPlayRound = (roundID: number) => {
    navigation.navigate('ProfileStack', {
      screen: 'PlayRound',
      params: { RoundID: roundID },
    });
  };

  const navigateToFriendRequests = () => {
    navigation.navigate('Friends');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your Dashboard!</Text>
      <Text style={styles.subtitle}>Track your golf scores and manage your account here.</Text>

      {/* Button in the top-right */}
      <TouchableOpacity onPress={navigateToFriendRequests} style={styles.friendRequestButton}>
        <Text style={styles.friendRequestButtonText}>Friend Requests</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={rounds}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRound}
          contentContainerStyle={styles.list}
          onRefresh={handleRefresh} // Enable pull-to-refresh
          refreshing={refreshing} // Show the refreshing indicator
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  list: {
    paddingBottom: 16,
  },
  roundItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  roundText: {
    fontSize: 16,
    fontWeight: '500',
  },
  friendRequestButton: {
    top: 16,
    right: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    elevation: 5,
  },
  friendRequestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
