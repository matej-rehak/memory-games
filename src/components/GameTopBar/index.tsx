import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s } from './styles';

interface Props {
  title: string;
  color: string;
  round: number;
  best: string;
  onBack: () => void;
}

export default function GameTopBar({ title, color, round, best, onBack }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.bar, { paddingTop: insets.top + 8 }]}>
      <TouchableOpacity onPress={onBack} style={s.backBtn}>
        <Text style={s.backTxt}>← Zpět</Text>
      </TouchableOpacity>
      <Text style={s.name} numberOfLines={1}>{title}</Text>
      <View style={s.stats}>
        <View style={s.stat}>
          <Text style={[s.statVal, { color }]}>{round}</Text>
          <Text style={s.statLbl}>KOLO</Text>
        </View>
        <View style={s.stat}>
          <Text style={[s.statVal, { color }]}>{best}</Text>
          <Text style={s.statLbl}>NEJLEPŠÍ</Text>
        </View>
      </View>
    </View>
  );
}
