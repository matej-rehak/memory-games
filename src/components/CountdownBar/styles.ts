import { StyleSheet } from 'react-native';
import { Colors } from '../../theme';

export const s = StyleSheet.create({
  wrap: { marginTop: 20 },
  track: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
  },
  txt: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    color: Colors.muted,
    marginTop: 5,
    textAlign: 'right',
  },
});
