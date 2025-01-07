import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type ProfileStackParamList = {
  AddPlayers: undefined;
  PlayRound: undefined;
};

const AddPlayersScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Players</Text>
      <Text style={styles.text}>Here you can add players for a golf round.</Text>
      <Button title="Go to Play Round" onPress={() => navigation.navigate('PlayRound')} />
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
  text: {
    fontSize: 16,
    marginBottom: 16,
  },
});

export default AddPlayersScreen;
