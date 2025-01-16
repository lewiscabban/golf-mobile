import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './src/navigation/Navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Navigation />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
