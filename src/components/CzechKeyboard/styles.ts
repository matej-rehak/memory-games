import { StyleSheet } from 'react-native';
import { Colors } from '../../theme';

export const s = StyleSheet.create({
  wrap: {
    marginTop: 12,
    gap: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  key: {
    minWidth: 30,
    height: 38,
    paddingHorizontal: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  keyTxt: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 13,
    color: Colors.ink,
  },
  ok: {
    backgroundColor: Colors.green,
    borderColor: Colors.greenBorder,
    opacity: 0.7,
  },
  okTxt: { color: Colors.greenText },
  no: {
    backgroundColor: Colors.red,
    borderColor: Colors.redBorder,
    opacity: 0.7,
  },
  noTxt: { color: Colors.redText },
  del: {
    backgroundColor: Colors.red,
    borderColor: Colors.redBorder,
    minWidth: 52,
  },
  delTxt: { color: Colors.redText },
});
