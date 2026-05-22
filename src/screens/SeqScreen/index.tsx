import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CountdownBar from '../../components/CountdownBar';
import GameTopBar from '../../components/GameTopBar';
import ResultBox from '../../components/ResultBox';
import { useBests } from '../../hooks/useBests';
import { useCountdown } from '../../hooks/useCountdown';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors, GameColors } from '../../theme';
import { haptics } from '../../utils/haptics';
import { s } from './styles';

type Phase = 'settings' | 'memorize' | 'input' | 'result';
type Props = NativeStackScreenProps<RootStackParamList, 'Seq'>;

const COLOR = GameColors.seq;
const LEN_PRESETS = [3, 4, 5, 6, 8, 10];
const TIME_PRESETS = [5, 10, 15, 20, 30];

export default function SeqScreen({ navigation }: Props) {
  const { bests, updateBest } = useBests();
  const { secondsLeft, animWidth, start, stop } = useCountdown();

  const [phase, setPhase] = useState<Phase>('settings');
  const [seqLen, setSeqLen] = useState(4);
  const [customTime, setCustomTime] = useState<number | null>(null);
  const [autoGrow, setAutoGrow] = useState(true);
  const [round, setRound] = useState(0);
  const [curSeq, setCurSeq] = useState<number[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [inputState, setInputState] = useState<'default' | 'ok' | 'no'>('default');
  const [lastOk, setLastOk] = useState(false);
  const highlightRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [highlightIdx, setHighlightIdx] = useState<number>(-1);

  const effectiveTime = customTime !== null ? customTime : seqLen + 2;

  const stopHighlight = useCallback(() => {
    if (highlightRef.current) clearInterval(highlightRef.current);
    highlightRef.current = null;
    setHighlightIdx(-1);
  }, []);

  const startGame = useCallback((len = seqLen) => {
    stop(); stopHighlight();
    const seq = Array.from({ length: len }, () => Math.floor(Math.random() * 10));
    setCurSeq(seq); setInputVal(''); setInputState('default');
    setRound(r => r + 1); setPhase('memorize');
    let hi = 0;
    const interval = Math.max(400, Math.floor(effectiveTime * 900 / len));
    highlightRef.current = setInterval(() => {
      setHighlightIdx(hi % len); haptics.selection(); hi++;
    }, interval);
    start(effectiveTime, () => { stopHighlight(); setPhase('input'); });
  }, [seqLen, effectiveTime, start, stop, stopHighlight]);

  useEffect(() => () => { stop(); stopHighlight(); }, [stop, stopHighlight]);

  const handleCheck = useCallback(() => {
    const val = inputVal.replace(/\D/g, '');
    const ok = curSeq.join('') === val;
    setInputState(ok ? 'ok' : 'no'); setLastOk(ok);
    if (ok) { updateBest('seq', curSeq.length); haptics.success(); } else haptics.error();
    setTimeout(() => setPhase('result'), 800);
  }, [inputVal, curSeq, updateBest]);

  const bestLabel = bests.seq !== null ? `${bests.seq} číslic` : '—';
  const pct = lastOk ? 100 : 0;

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <GameTopBar title="🔢 Sekvence čísel" color={COLOR} round={round} best={bestLabel}
        onBack={() => { stop(); stopHighlight(); navigation.goBack(); }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {phase === 'settings' && (
            <View style={s.panel}>
              <Text style={s.plabel}>Sekvence — <Text style={{ color: COLOR }}>číselná paměť</Text></Text>
              <Text style={[s.sublabel, { marginBottom: 10 }]}>Počet číslic</Text>
              <View style={s.lenRow}>
                <View style={s.stepper}>
                  <TouchableOpacity style={s.stepBtn} onPress={() => setSeqLen(l => Math.max(2, l - 1))}>
                    <Text style={s.stepTxt}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.stepVal}>{seqLen}</Text>
                  <TouchableOpacity style={s.stepBtn} onPress={() => setSeqLen(l => Math.min(15, l + 1))}>
                    <Text style={s.stepTxt}>+</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.presets}>
                  {LEN_PRESETS.map(v => (
                    <TouchableOpacity key={v}
                      style={[s.preset, seqLen === v && { backgroundColor: Colors.surface, borderColor: COLOR }]}
                      onPress={() => setSeqLen(v)}>
                      <Text style={[s.presetTxt, seqLen === v && { color: COLOR }]}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <Text style={[s.sublabel, { marginBottom: 10, marginTop: 16 }]}>Čas na zapamatování</Text>
              <View style={s.lenRow}>
                <View style={s.stepper}>
                  <TouchableOpacity style={s.stepBtn} onPress={() => setCustomTime(t => Math.max(3, (t ?? seqLen + 2) - 5))}>
                    <Text style={s.stepTxt}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.stepVal}>{customTime !== null ? `${customTime}s` : 'auto'}</Text>
                  <TouchableOpacity style={s.stepBtn} onPress={() => setCustomTime(t => Math.min(60, (t ?? seqLen + 2) + 5))}>
                    <Text style={s.stepTxt}>+</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.presets}>
                  <TouchableOpacity style={[s.preset, customTime === null && { backgroundColor: Colors.surface, borderColor: COLOR }]}
                    onPress={() => setCustomTime(null)}>
                    <Text style={[s.presetTxt, customTime === null && { color: COLOR }]}>auto</Text>
                  </TouchableOpacity>
                  {TIME_PRESETS.map(v => (
                    <TouchableOpacity key={v}
                      style={[s.preset, customTime === v && { backgroundColor: Colors.surface, borderColor: COLOR }]}
                      onPress={() => setCustomTime(v)}>
                      <Text style={[s.presetTxt, customTime === v && { color: COLOR }]}>{v}s</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <Text style={s.hint}>Auto = čas se přizpůsobí počtu číslic</Text>
              <View style={s.switchRow}>
                <Switch value={autoGrow} onValueChange={setAutoGrow}
                  trackColor={{ false: Colors.border, true: COLOR }} thumbColor="#fff" />
                <Text style={s.switchLabel}>Automaticky přidávat číslici po správném kole</Text>
              </View>
              <TouchableOpacity style={[s.btn, { backgroundColor: COLOR }]} onPress={() => startGame(seqLen)}>
                <Text style={s.btnTxt}>Začít ({seqLen} číslic) →</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'memorize' && (
            <View style={s.panel}>
              <Text style={s.plabel}>Zapamatuj si — <Text style={{ color: COLOR }}>sekvenci</Text></Text>
              <View style={s.seqRow}>
                {curSeq.map((n, i) => (
                  <View key={i} style={[s.seqNum, i === highlightIdx && { backgroundColor: COLOR, borderColor: COLOR }]}>
                    <Text style={[s.seqNumTxt, i === highlightIdx && { color: '#fff' }]}>{n}</Text>
                  </View>
                ))}
              </View>
              <CountdownBar secondsLeft={secondsLeft} animWidth={animWidth} color={COLOR} />
            </View>
          )}

          {phase === 'input' && (
            <View style={s.panel}>
              <Text style={s.plabel}>Zadej — <Text style={{ color: COLOR }}>sekvenci ve správném pořadí</Text></Text>
              <TextInput
                style={[s.bigInput,
                  inputState === 'ok' && { borderColor: Colors.accent3, backgroundColor: Colors.green },
                  inputState === 'no' && { borderColor: Colors.accent, backgroundColor: Colors.red },
                ]}
                value={inputVal} onChangeText={setInputVal}
                placeholder="zadej čísla..." placeholderTextColor={Colors.muted}
                keyboardType="number-pad" autoCorrect={false} maxLength={seqLen}
                onSubmitEditing={handleCheck} autoFocus
              />
              <Text style={s.seqHint}>Zadej {seqLen} číslic bez mezer</Text>
              <View style={s.btnRow}>
                <TouchableOpacity style={s.btnS} onPress={() => setInputVal('')}>
                  <Text style={s.btnSTxt}>Vymazat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btn, { backgroundColor: COLOR, flex: 1 }]} onPress={handleCheck}>
                  <Text style={s.btnTxt}>Potvrdit →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {phase === 'result' && (
            <View style={s.panel}>
              <ResultBox
                big={lastOk ? '✓' : '✗'}
                sub={lastOk ? `🎉 Správně! Zvládl/a jsi ${curSeq.length} číslic!` : '❌ Špatně, zkus znovu!'}
                pct={pct} color={COLOR}
                actions={
                  lastOk && autoGrow
                    ? [{ label: `Zkusit ${curSeq.length + 1} číslic →`, onPress: () => { setSeqLen(l => l + 1); startGame(curSeq.length + 1); }, primary: true }]
                    : [
                        { label: 'Nastavení', onPress: () => setPhase('settings') },
                        { label: lastOk ? 'Hrát znovu →' : 'Zkusit znovu →', onPress: () => startGame(seqLen), primary: true },
                      ]
                }
                extra={
                  <View style={s.seqCompare}>
                    <Text style={s.seqCompareTxt}>
                      Správná: <Text style={{ color: Colors.ink, fontFamily: 'JetBrainsMono_700Bold' }}>{curSeq.join(' · ')}</Text>
                    </Text>
                    <Text style={s.seqCompareTxt}>
                      Tvoje:{'    '}<Text style={{ color: Colors.ink, fontFamily: 'JetBrainsMono_700Bold' }}>{inputVal ? inputVal.split('').join(' · ') : '—'}</Text>
                    </Text>
                  </View>
                }
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
