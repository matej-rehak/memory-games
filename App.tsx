import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
  useFonts as useJBFonts,
} from '@expo-google-fonts/jetbrains-mono';
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_900Black,
  useFonts as useOutfitFonts,
} from '@expo-google-fonts/outfit';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/theme';

export default function App() {
  const [outfitLoaded] = useOutfitFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_900Black,
  });
  const [jbLoaded] = useJBFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  if (!outfitLoaded || !jbLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
