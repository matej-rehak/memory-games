import { StyleSheet } from 'react-native';
import { Colors, GameColors, R } from '../../theme';

export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 60 },
  panel: {
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 20,
    padding: 24,
    borderTopWidth: 3,
    borderTopColor: GameColors.pairs,
  },
  plabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Colors.muted,
    marginBottom: 16,
  },
  sizeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  sizeBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    alignItems: 'center',
  },
  sizeTxt: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: Colors.ink2 },
  sizeSub: { fontFamily: 'Outfit_300Light', fontSize: 11, color: Colors.muted, marginTop: 2 },
  btn: { paddingVertical: 13, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center' },
  btnTxt: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#fff' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  infoItem: { alignItems: 'center', flex: 1 },
  infoVal: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 18, color: Colors.ink },
  infoLbl: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    color: Colors.muted,
    textTransform: 'uppercase',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
