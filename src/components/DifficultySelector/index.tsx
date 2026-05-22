import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { s } from './styles';

type Diff = 'easy' | 'medium' | 'hard';

interface Option {
  value: Diff;
  label: string;
  sub: string;
}

interface Props {
  value: Diff;
  options: Option[];
  color: string;
  onChange: (d: Diff) => void;
}

export default function DifficultySelector({ value, options, color, onChange }: Props) {
  return (
    <View style={s.row}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[s.btn, active && { backgroundColor: color, borderColor: color }]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[s.label, active && s.labelOn]}>{opt.label}</Text>
            <Text style={[s.sub, active && s.subOn]}>{opt.sub}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
