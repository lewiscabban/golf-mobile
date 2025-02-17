import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient';

type Clubs = {
  ClubID: string,
  ClubName: String
}

type ProfileStackParamList = {
  Profile: undefined;
  Courses: { club: Clubs };
};

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const [data, setData] = useState<Clubs[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData('');
  }, []);

  const fetchData = async (query: string) => {
    setLoading(true);
    let supabaseQuery = supabase.from('clubs').select('ClubID::text, ClubName');
    
    if (query.trim()) {
      supabaseQuery = supabaseQuery.ilike('ClubName', `%${query}%`);
    }
    
    const { data: clubs, error } = await supabaseQuery;

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      setData(clubs || []);
    }
    setLoading(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    fetchData(text);
  };

  const renderItem = ({ item }: { item: Clubs }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('Courses', { club: item })}
    >
      <Text style={styles.itemText}>{item.ClubName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clubs</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Clubs"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.ClubID}
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
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
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
