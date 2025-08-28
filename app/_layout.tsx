import '../global.css';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { loadFonts } from '../utils/fonts';
import * as Linking from 'expo-linking';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

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
      if (url) {
        console.log('App opened from deep link:', url);
      }
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

  return <Slot />;
}
