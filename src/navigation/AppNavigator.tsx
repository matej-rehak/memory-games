import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { GameId } from '../theme';
import HubScreen from '../screens/HubScreen';
import WordsScreen from '../screens/WordsScreen';
import SeqScreen from '../screens/SeqScreen';
import PairsScreen from '../screens/PairsScreen';
import NumsScreen from '../screens/NumsScreen';
import LettersScreen from '../screens/LettersScreen';
import SchulteScreen from '../screens/SchulteScreen';

export type RootStackParamList = {
  Hub: undefined;
  Words: undefined;
  Seq: undefined;
  Pairs: undefined;
  Nums: undefined;
  Letters: undefined;
  Schulte: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Hub" component={HubScreen} />
        <Stack.Screen name="Words" component={WordsScreen} />
        <Stack.Screen name="Seq" component={SeqScreen} />
        <Stack.Screen name="Pairs" component={PairsScreen} />
        <Stack.Screen name="Nums" component={NumsScreen} />
        <Stack.Screen name="Letters" component={LettersScreen} />
        <Stack.Screen name="Schulte" component={SchulteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
