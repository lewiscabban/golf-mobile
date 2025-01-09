import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient'; // Adjust the path to your supabase client
import { ClubRow } from '../types/supabase';

type ProfileStackParamList = {
  Profile: undefined;
  Courses: { club: ClubRow }; // Accept a club as a parameter
};

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const [data, setData] = useState<ClubRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from Supabase
    const fetchData = async () => {
      setLoading(true);
      const { data: clubs, error } = await supabase.from('clubs').select('*');

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setData(clubs || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const renderItem = ({ item }: { item: ClubRow }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('Courses', { club: item })} // Pass the selected club
    >
      <Text style={styles.itemText}>{item.ClubName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clubs</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.ClubID.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 16,
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;
