import React from 'react';
import { View, Text, Alert, Button } from 'react-native';
import { supabase } from '../supabase/supabaseClient';

const SettingsScreen = () => {

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout Failed', error.message);
    } else {
      Alert.alert('Logged Out', 'You have been logged out successfully.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings Screen</Text>

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default SettingsScreen;
