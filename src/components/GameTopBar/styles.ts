import { StyleSheet } from 'react-native';
import { Colors } from '../../theme';

export const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  backTxt: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 13,
    color: Colors.ink,
  },
  name: {
    flex: 1,
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: Colors.ink,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    alignItems: 'flex-end',
  },
  statVal: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 15,
  },
  statLbl: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 0.8,
  },
});
