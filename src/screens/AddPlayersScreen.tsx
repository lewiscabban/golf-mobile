import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';

type ProfileStackParamList = {
  AddPlayers: { ClubID: number; CourseID: number };
  PlayRound: undefined;
};

const AddPlayersScreen = () => {
  // Get the navigation and route
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const route = useRoute<RouteProp<ProfileStackParamList, 'AddPlayers'>>();

  // Extract ClubID and CourseID from route params
  const { ClubID, CourseID } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Players</Text>
      <Text style={styles.text}>Here you can add players for a golf round.</Text>
      <Text style={styles.text}>Club ID: {ClubID}</Text>
      <Text style={styles.text}>Course ID: {CourseID}</Text>

      <Button title="Go to Play Round" onPress={() => navigation.navigate('PlayRound')} />
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
  text: {
    fontSize: 16,
    marginBottom: 16,
  },
});

export default AddPlayersScreen;
