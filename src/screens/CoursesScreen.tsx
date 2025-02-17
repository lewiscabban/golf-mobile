import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, NavigationProp, useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient'; // Adjust the path to your Supabase client
import Icon from 'react-native-vector-icons/MaterialIcons';

type Courses = {
  CourseID: string,
  CourseName: String,
  ClubID: string,
  ClubName: String,
  NumHoles: number,
}

type ProfileStackParamList = {
  Courses: { club: { ClubID: string; ClubName: string } };
  AddPlayers: { ClubID: string; CourseID: string };
};

const CoursesScreen = () => {
  const route = useRoute<RouteProp<ProfileStackParamList, 'Courses'>>();
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const { club } = route.params;

  const [courses, setCourses] = useState<Courses[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch courses from Supabase for the selected club
    const fetchCourses = async () => {
      setLoading(true);
      console.log("club: " + club.ClubID)
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('ClubID::text, ClubName, CourseID::text, CourseName, NumHoles')
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

  const renderItem = ({ item }: { item: Courses }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        navigation.navigate('AddPlayers', {
          ClubID: club.ClubID,
          CourseID: item.CourseID,
        });
      }}
    >
      <View style={styles.itemRow}>
        <Text style={styles.courseName}>{item.CourseName}</Text>
  
        <View style={styles.rightSection}>
          <View style={styles.infoContainer}>
            <Text style={styles.parText}>Par N/A</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.NumHoles} Holes</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </View>
      </View>
    </TouchableOpacity>
  );
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Course at {club.ClubName}</Text>
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
    backgroundColor: '#f9fafb', // Light background color
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
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b3b98', // A deep blue/purple color for contrast
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContainer: {
    alignItems: 'flex-start', // Left-align Par & Holes
    marginRight: 8, // Space before the arrow icon
  },
  parText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4, // Space between Par and Holes
    textAlign: 'left',
  },
  badge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

export default CoursesScreen;
