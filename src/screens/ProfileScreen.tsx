import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type ProfileStackParamList = {
  Profile: undefined;
  Courses: undefined;
};

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Button title="Go to Courses" onPress={() => navigation.navigate('Courses')} />
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

export default ProfileScreen;
