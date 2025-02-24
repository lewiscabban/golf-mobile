import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CoursesScreen from '../screens/CoursesScreen';
import AddPlayersScreen from '../screens/AddPlayersScreen';
import PlayRoundScreen from '../screens/PlayRoundScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ResultsScreen from '../screens/ResultsScreen';
import FriendsScreen from '../screens/FriendsScreen';
import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

// Define the types for your navigation stack
type ProfileStackParamList = {
  PlayRound: undefined;
  Dashboard: undefined;
};

// Get the typed navigation prop
type NavigationProp = StackNavigationProp<ProfileStackParamList, "PlayRound">;

const ProfileStackScreen = () => {
    return (
      <ProfileStack.Navigator screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
        <ProfileStack.Screen name="Profile" component={ProfileScreen} />
        <ProfileStack.Screen name="Courses" component={CoursesScreen} />
        <ProfileStack.Screen name="AddPlayers" component={AddPlayersScreen} />
        <ProfileStack.Screen name="Results" component={ResultsScreen} />
      </ProfileStack.Navigator>
    );
};  

const DasthoardStackScreen = () => {
    return (
      <ProfileStack.Navigator screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
        <ProfileStack.Screen name="Dashboard" component={DashboardScreen} />
        <ProfileStack.Screen name="Friends" component={FriendsScreen} />
        <ProfileStack.Screen
          name="PlayRound"
          component={PlayRoundScreen}
          // options={{
          //   headerLeft: () => {
          //     const navigation = useNavigation<NavigationProp>();
          //     return (
          //       <Button title="Back" onPress={() => navigation.navigate("Dashboard")} />
          //     );
          //   },
          // }}
        />
      </ProfileStack.Navigator>
    );
};  
  
const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';

          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'ProfileStack') {
            iconName = 'person';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DasthoardStackScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStackScreen}
        options={{ headerShown: false, title: 'Profile' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default AppTabs;
