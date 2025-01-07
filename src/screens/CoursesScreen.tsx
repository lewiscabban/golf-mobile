import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type ProfileStackParamList = {
  Courses: undefined;
  AddPlayers: undefined;
};

const CoursesScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Courses</Text>
      <Button title="Go to Add Players" onPress={() => navigation.navigate('AddPlayers')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default CoursesScreen;
