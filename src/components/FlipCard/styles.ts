import { StyleSheet } from 'react-native';
import { Colors } from '../../theme';

export const s = StyleSheet.create({
  face: {
    position: 'absolute',
    backfaceVisibility: 'hidden',
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  front: { backgroundColor: Colors.surface },
  back: { backgroundColor: Colors.card },
  matched: {
    backgroundColor: Colors.green,
    borderColor: Colors.greenBorder,
  },
  question: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 18,
    color: Colors.muted,
  },
  emoji: { textAlign: 'center' },
});
