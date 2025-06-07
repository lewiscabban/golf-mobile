import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import PlayScreen from '../screens/PlayScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CoursesScreen from '../screens/CoursesScreen';
import AddPlayersScreen from '../screens/AddPlayersScreen';
import PlayRoundScreen from '../screens/PlayRoundScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ResultsScreen from '../screens/ResultsScreen';
import FriendsScreen from '../screens/FriendsScreen';
import { StackNavigationProp } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const PlayStack = createNativeStackNavigator();
const DashboardStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

// Define the types for your navigation stack
type PlayStackParamList = {
  PlayRound: undefined;
  Dashboard: undefined;
};

// Get the typed navigation prop
type NavigationProp = StackNavigationProp<PlayStackParamList, "PlayRound">;

const PlayStackScreen = () => {
  return (
    <PlayStack.Navigator
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerShadowVisible: false,
        contentStyle:{ backgroundColor: '#fff'}
      }}
    >
      <PlayStack.Screen name="Play" component={PlayScreen} />
      <PlayStack.Screen name="Courses" component={CoursesScreen} />
      <PlayStack.Screen name="AddPlayers" component={AddPlayersScreen} />
      <PlayStack.Screen name="Results" component={ResultsScreen} />
    </PlayStack.Navigator>
  );
};

const DashboardStackScreen = () => {
    return (
      <DashboardStack.Navigator
        screenOptions={{
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: false,
          contentStyle:{ backgroundColor: '#fff'}
        }}
      >
        <DashboardStack.Screen name="Dashboard" component={DashboardScreen} />
        <DashboardStack.Screen name="Friends" component={FriendsScreen} />
        <DashboardStack.Screen
          name="PlayRound"
          component={PlayRoundScreen}
          options={({ navigation }) => ({
            title: 'Play Round',
            headerLeft: () => (
              <Ionicons
                name="arrow-back"
                size={24}
                color="#000"
                style={{ marginLeft: 10 }}
                onPress={() => navigation.reset({
                  index: 0,
                  routes: [{ name: 'Dashboard' }],
                })}
              />
            ),
          })}
        />
      </DashboardStack.Navigator>
    );
};  

const SettingsStackScreen = () => {
    return (
      <SettingsStack.Navigator
        screenOptions={{
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: false,
          contentStyle:{ backgroundColor: '#fff'}
        }}
      >
        <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      </SettingsStack.Navigator>
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
          } else if (route.name === 'PlayStack') {
            iconName = 'golf';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: true,
        tabBarStyle: {borderTopWidth: 0},
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#888',
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="PlayStack"
        component={PlayStackScreen}
        options={{ headerShown: false, title: 'Play' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'PlayStack' }],
            });
          },
        })}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default AppTabs;
