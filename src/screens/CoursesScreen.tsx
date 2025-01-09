import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, NavigationProp, useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient'; // Adjust the path to your Supabase client
import { CourseRow } from '../types/supabase';

type ProfileStackParamList = {
  Courses: { club: { ClubID: number; ClubName: string } };
  AddPlayers: { ClubID: number; CourseID: number };
};

const CoursesScreen = () => {
  const route = useRoute<RouteProp<ProfileStackParamList, 'Courses'>>();
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const { club } = route.params;

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch courses from Supabase for the selected club
    const fetchCourses = async () => {
      setLoading(true);
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('*')
        .eq('ClubID', club.ClubID); // Filter by the selected club's ID

      if (error) {
        console.error('Error fetching courses:', error);
      } else {
        setCourses(coursesData || []);
      }
      setLoading(false);
    };

    fetchCourses();
  }, [club.ClubID]);

  const renderItem = ({ item }: { item: CourseRow }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        navigation.navigate('AddPlayers', {
          ClubID: club.ClubID,
          CourseID: item.CourseID,
        });
      }}
    >
      <Text style={styles.itemText}>{item.CourseName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Courses at {club.ClubName}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.CourseID.toString()}
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

export default CoursesScreen;
