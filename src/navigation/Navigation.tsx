import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from '../supabase/supabaseClient';
import HomeScreen from '../screens/HomeScreen';
import AppTabs from './AppTabs'; // BottomTabNavigator for logged-in users
import { Session } from '@supabase/supabase-js';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

const Stack = createNativeStackNavigator();

const LoggedOutNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false, headerBackTitle: 'Home' }} />
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerBackTitle: 'Home' }} />
    <Stack.Screen name="Signup" component={SignupScreen} options={{ headerBackTitle: 'Home' }} />
  </Stack.Navigator>
);

const LoggedInNavigator = () => <AppTabs />;

export default function Navigation() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      {session ? <LoggedInNavigator /> : <LoggedOutNavigator />}
    </NavigationContainer>
  );
}
