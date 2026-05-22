import { StyleSheet } from 'react-native';
import { Colors } from '../../theme';

export const s = StyleSheet.create({
  box: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  big: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: -2,
  },
  sub: {
    fontFamily: 'Outfit_300Light',
    fontSize: 14,
    color: Colors.ink2,
    marginTop: 8,
    textAlign: 'center',
  },
  stars: {
    fontSize: 28,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  btnTxt: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: Colors.ink,
  },
  btnTxtP: { color: '#fff' },
});
