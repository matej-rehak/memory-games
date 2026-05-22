import { StyleSheet } from 'react-native';
import { Colors } from '../../theme';

export const s = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 18,
    maxWidth: 340,
    alignSelf: 'center',
    width: '100%',
  },
  key: {
    width: '18%',
    aspectRatio: 1.4,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  del: {
    backgroundColor: Colors.red,
    borderColor: Colors.redBorder,
  },
  txt: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 16,
    color: Colors.ink,
  },
  delTxt: { color: Colors.redText },
});
