import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { s } from './styles';

function stars(pct: number) {
  if (pct === 100) return '⭐⭐⭐';
  if (pct >= 70) return '⭐⭐';
  return '⭐';
}

interface Action {
  label: string;
  onPress: () => void;
  primary?: boolean;
}

interface Props {
  big: string;
  sub: string;
  pct: number;
  color: string;
  actions: Action[];
  extra?: React.ReactNode;
}

export default function ResultBox({ big, sub, pct, color, actions, extra }: Props) {
  return (
    <>
      <View style={s.box}>
        <Text style={[s.big, { color }]}>{big}</Text>
        <Text style={s.sub}>{sub}</Text>
        <Text style={s.stars}>{stars(pct)}</Text>
      </View>
      {extra}
      <View style={s.row}>
        {actions.map((a, i) => (
          <TouchableOpacity
            key={i}
            style={[s.btn, a.primary && { backgroundColor: color }]}
            onPress={a.onPress}
          >
            <Text style={[s.btnTxt, a.primary && s.btnTxtP]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}
