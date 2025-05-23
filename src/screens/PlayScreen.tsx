import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { searchClubsByClubName } from '../supabase/supabaseGetters'

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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    searchClubsByClubName('', setData);
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchClubsByClubName(text, setData);
  };

  const renderItem = ({ item }: { item: Clubs }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('Courses', { club: item })}
    >
      <View style={styles.itemRow}>
        <Text style={styles.itemText}>{item.ClubName}</Text>
        <Icon name="chevron-right" size={24} color="#4CAF50" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Club</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Clubs"
        placeholderTextColor="#999" // Lighter placeholder text color
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={data}
        keyExtractor={(item) => item.ClubID}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff', // Light background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    height: 50, // Adjust height to match FlatList item height
    borderBottomWidth: 1,
    borderColor: '#4CAF50', // Set border color to #4CAF50
    // borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '100%', // Ensures the input takes up the full width
    // backgroundColor: '#fff', // Set background to white
    color: '#4CAF50', // Lighter text color
  },
  list: {
    paddingBottom: 16,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1, // Ensures full width
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50', // A deep blue/purple color for contrast
  },
});

export default ProfileScreen;
