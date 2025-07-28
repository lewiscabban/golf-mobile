import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const JoinCrewScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Crew</Text>
      <Text style={styles.text}>This is where you’ll join a crew using a code or search.</Text>
      {/* You can add a TextInput for crew code and a join button here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  text: { fontSize: 16, textAlign: 'center' },
});

export default JoinCrewScreen;
