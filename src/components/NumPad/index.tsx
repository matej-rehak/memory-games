import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { haptics } from '../../utils/haptics';
import { s } from './styles';

interface Props {
  onPress: (val: string) => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫'];

export default function NumPad({ onPress }: Props) {
  return (
    <View style={s.grid}>
      {KEYS.map(k => (
        <TouchableOpacity
          key={k}
          style={[s.key, k === '⌫' && s.del]}
          onPress={() => { haptics.selection(); onPress(k); }}
        >
          <Text style={[s.txt, k === '⌫' && s.delTxt]}>{k}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
