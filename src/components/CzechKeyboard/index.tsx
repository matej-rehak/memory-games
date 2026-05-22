import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { s } from './styles';

const ROWS = [
  'AÁBCČDĎ',
  'EÉĚFGHIÍJ',
  'KLMNŇOÓ',
  'PQRŘSŠTŤ',
  'UÚŮVWXYÝZŽ',
];

type KeyState = 'default' | 'ok' | 'no';

interface Props {
  keyStates: Record<string, KeyState>;
  onKey: (char: string) => void;
  onDelete: () => void;
}

export default function CzechKeyboard({ keyStates, onKey, onDelete }: Props) {
  return (
    <View style={s.wrap}>
      {ROWS.map((row, ri) => (
        <View key={ri} style={s.row}>
          {row.split('').map(c => {
            const state = keyStates[c] ?? 'default';
            return (
              <TouchableOpacity
                key={c}
                style={[s.key, state === 'ok' && s.ok, state === 'no' && s.no]}
                onPress={() => onKey(c.toLowerCase())}
                disabled={state !== 'default'}
              >
                <Text style={[s.keyTxt, state === 'ok' && s.okTxt, state === 'no' && s.noTxt]}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
      <View style={[s.row, { justifyContent: 'center' }]}>
        <TouchableOpacity style={[s.key, s.del]} onPress={onDelete}>
          <Text style={[s.keyTxt, s.delTxt]}>⌫</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
