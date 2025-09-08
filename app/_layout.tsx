import '../global.css';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { loadFonts } from '../utils/fonts';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const loadAppFonts = async () => {
      try {
        await loadFonts();
        setFontsLoaded(true);
      } catch (error) {
        console.log('Font loading error:', error);
        setFontsLoaded(true);
      }
    };
    loadAppFonts();
  }, []);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('Deep link received:', event.url);
    });
    Linking.getInitialURL().then((url) => {
      if (url) console.log('App opened from deep link:', url);
    });
    return () => subscription?.remove();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Slot />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
