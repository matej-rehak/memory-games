import { StyleSheet } from 'react-native';
import { Colors } from '../../theme';

export const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    color: Colors.ink2,
  },
  labelOn: { color: '#fff' },
  sub: {
    fontFamily: 'Outfit_300Light',
    fontSize: 11,
    color: Colors.muted,
    marginTop: 2,
  },
  subOn: { color: 'rgba(255,255,255,0.8)' },
});
