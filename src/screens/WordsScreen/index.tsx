import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CountdownBar from '../../components/CountdownBar';
import DifficultySelector from '../../components/DifficultySelector';
import GameTopBar from '../../components/GameTopBar';
import ResultBox from '../../components/ResultBox';
import { WCNT, WSETS, WTIME } from '../../data/words';
import { useBests } from '../../hooks/useBests';
import { useCountdown } from '../../hooks/useCountdown';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors, GameColors } from '../../theme';
import { haptics } from '../../utils/haptics';
import { s } from './styles';

type Phase = 'settings' | 'memorize' | 'input' | 'result';
type Diff = 'easy' | 'medium' | 'hard';
type Props = NativeStackScreenProps<RootStackParamList, 'Words'>;

const COLOR = GameColors.words;
const DIFF_OPTS = [
  { value: 'easy' as Diff, label: 'Lehká', sub: 'základní' },
  { value: 'medium' as Diff, label: 'Střední', sub: 'pokročilá' },
  { value: 'hard' as Diff, label: 'Těžká', sub: 'smíšená' },
];
const ATTEMPT_OPTS = [1, 2, 3, 5];

function norm(str: string) {
  // eslint-disable-next-line no-misleading-character-class
  return str.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export default function WordsScreen({ navigation }: Props) {
  const { bests, updateBest } = useBests();
  const { secondsLeft, animWidth, start, stop } = useCountdown();

  const [phase, setPhase] = useState<Phase>('settings');
  const [diff, setDiff] = useState<Diff>('easy');
  const [customTime, setCustomTime] = useState<number | null>(null);
  const [customWordCount, setCustomWordCount] = useState<number | null>(null);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [round, setRound] = useState(0);
  const [curWords, setCurWords] = useState<string[]>([]);
  const [inputs, setInputs] = useState<string[]>([]);
  const [states, setStates] = useState<('default' | 'ok' | 'no')[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [strictOrder, setStrictOrder] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const effectiveTime = customTime ?? WTIME[diff];
  const effectiveWordCount = customWordCount ?? WCNT[diff];

  const startGame = useCallback(() => {
    stop();
    const pool = [...WSETS[diff]].sort(() => Math.random() - 0.5);
    const words = pool.slice(0, effectiveWordCount);
    setCurWords(words);
    setInputs(new Array(words.length).fill(''));
    setStates(new Array(words.length).fill('default'));
    setAttempt(0);
    setRound(r => r + 1);
    setPhase('memorize');
    start(effectiveTime, () => setPhase('input'));
  }, [diff, effectiveTime, effectiveWordCount, start, stop]);

  const checkAnswers = useCallback((wordList: string[], ans: string[]) => {
    if (strictOrder) {
      const used = new Set<number>();
      let cnt = 0;
      const newStates = ans.map((v, i) => {
        if (!v.trim()) return 'default' as const;
        if (norm(v) === norm(wordList[i])) { used.add(i); cnt++; return 'ok' as const; }
        return 'no' as const;
      });
      return { newStates, cnt, used };
    }
    const normWords = wordList.map(norm);
    const used = new Set<number>();
    let cnt = 0;
    const newStates = ans.map(v => {
      if (!v.trim()) return 'default' as const;
      const idx = normWords.findIndex((w, j) => w === norm(v) && !used.has(j));
      if (idx !== -1) { used.add(idx); cnt++; return 'ok' as const; }
      return 'no' as const;
    });
    return { newStates, cnt, used };
  }, [strictOrder]);

  const handleCheck = useCallback(() => {
    const { newStates, cnt, used } = checkAnswers(curWords, inputs);
    setStates(newStates);
    setAttempt(a => a + 1);
    setCorrect(cnt);
    setUsedIndices(used);
    updateBest('words', cnt);
    if (cnt === curWords.length) haptics.success();
    else if (cnt > 0) haptics.light();
    else haptics.error();
    setTimeout(() => setPhase('result'), 700);
  }, [attempt, checkAnswers, curWords, inputs, updateBest]);

  const handleRetry = useCallback(() => {
    setInputs(new Array(curWords.length).fill(''));
    setStates(new Array(curWords.length).fill('default'));
    setPhase('memorize');
    start(5, () => setPhase('input'));
  }, [curWords.length, start]);

  const bestLabel = bests.words !== null ? `${bests.words} slov` : '—';
  const attemptsLeft = maxAttempts - attempt;
  const pct = curWords.length > 0 ? Math.round((correct / curWords.length) * 100) : 0;
  const canRetry = pct < 100 && attemptsLeft > 0 && phase === 'result';

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <GameTopBar title="📝 Zapamatuj si slova" color={COLOR} round={round} best={bestLabel}
        onBack={() => { stop(); navigation.goBack(); }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {phase === 'settings' && (
            <View style={s.panel}>
              <Text style={s.plabel}>Nastavení — <Text style={{ color: COLOR }}>Obtížnost</Text></Text>
              <DifficultySelector value={diff} options={DIFF_OPTS} color={COLOR} onChange={setDiff} />
              <Text style={[s.plabel, { marginTop: 16, marginBottom: 10 }]}>Počet slov</Text>
              <View style={s.timeRow}>
                <View style={s.stepper}>
                  <TouchableOpacity style={s.stepBtn} onPress={() => setCustomWordCount(c => Math.max(3, (c ?? WCNT[diff]) - 1))}>
                    <Text style={s.stepTxt}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.timeVal}>{effectiveWordCount}</Text>
                  <TouchableOpacity style={s.stepBtn} onPress={() => setCustomWordCount(c => Math.min(20, (c ?? WCNT[diff]) + 1))}>
                    <Text style={s.stepTxt}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[s.plabel, { marginTop: 16, marginBottom: 10 }]}>Čas na zapamatování</Text>
              <View style={s.timeRow}>
                <View style={s.stepper}>
                  <TouchableOpacity style={s.stepBtn} onPress={() => setCustomTime(t => Math.max(3, (t ?? WTIME[diff]) - 1))}>
                    <Text style={s.stepTxt}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.timeVal}>{effectiveTime}s</Text>
                  <TouchableOpacity style={s.stepBtn} onPress={() => setCustomTime(t => Math.min(60, (t ?? WTIME[diff]) + 1))}>
                    <Text style={s.stepTxt}>+</Text>
                  </TouchableOpacity>
                </View>

              </View>
              <Text style={[s.plabel, { marginTop: 16, marginBottom: 10 }]}>Počet pokusů</Text>
              <View style={s.attRow}>
                {ATTEMPT_OPTS.map(v => (
                  <TouchableOpacity key={v}
                    style={[s.attBtn, maxAttempts === v && { backgroundColor: Colors.surface, borderColor: COLOR }]}
                    onPress={() => setMaxAttempts(v)}>
                    <Text style={[s.attTxt, maxAttempts === v && { color: COLOR }]}>{v}×</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[s.plabel, { marginTop: 16, marginBottom: 10 }]}>Pořadí slov</Text>
              <View style={s.attRow}>
                {([false, true] as const).map(v => (
                  <TouchableOpacity key={String(v)}
                    style={[s.attBtn, strictOrder === v && { backgroundColor: Colors.surface, borderColor: COLOR }]}
                    onPress={() => setStrictOrder(v)}>
                    <Text style={[s.attTxt, strictOrder === v && { color: COLOR }]}>{v ? 'Povinné' : 'Volné'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.hint}>Povinné — slova musí být zapsána ve správném pořadí</Text>
              <Text style={[s.hint, { marginTop: 12 }]}>Po každém neúspěšném pokusu se slova znovu zobrazí</Text>
              <TouchableOpacity style={[s.btn, { backgroundColor: COLOR, marginTop: 24 }]} onPress={startGame}>
                <Text style={s.btnTxt}>Spustit kolo →</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'memorize' && (
            <View style={s.panel}>
              <Text style={s.plabel}>Zapamatuj si — <Text style={{ color: COLOR }}>slova</Text></Text>
              <View style={s.chipGrid}>
                {curWords.map((w, i) => (
                  <View key={i} style={[s.chip, strictOrder && s.chipOrdered]}>
                    {strictOrder && <Text style={s.chipNum}>{i + 1}.</Text>}
                    <Text style={s.chipTxt}>{w}</Text>
                  </View>
                ))}
              </View>
              <CountdownBar secondsLeft={secondsLeft} animWidth={animWidth} color={COLOR} />
            </View>
          )}

          {phase === 'input' && (
            <View style={s.panel}>
              <Text style={s.plabel}>Napiš — <Text style={{ color: COLOR }}>všechna slova</Text></Text>
              {curWords.map((_, i) => (
                <View key={i} style={s.inputRow}>
                  <Text style={s.inputNum}>{i + 1}.</Text>
                  <TextInput
                    ref={el => { inputRefs.current[i] = el; }}
                    style={[s.input, states[i] === 'ok' && s.inputOk, states[i] === 'no' && s.inputNo]}
                    value={inputs[i]}
                    onChangeText={v => setInputs(prev => { const n = [...prev]; n[i] = v; return n; })}
                    placeholder="slovo..." placeholderTextColor={Colors.muted}
                    autoCorrect={false} spellCheck={false} autoCapitalize="none"
                    returnKeyType={i < curWords.length - 1 ? 'next' : 'done'}
                    onSubmitEditing={() => {
                      if (i < curWords.length - 1) inputRefs.current[i + 1]?.focus();
                      else handleCheck();
                    }}
                  />
                  <Text style={s.inputIcon}>{states[i] === 'ok' ? '✓' : states[i] === 'no' ? '✗' : ''}</Text>
                </View>
              ))}
              <View style={s.btnRow}>
                <TouchableOpacity style={s.btnS} onPress={() => {
                  setInputs(new Array(curWords.length).fill(''));
                  setStates(new Array(curWords.length).fill('default'));
                }}>
                  <Text style={s.btnSTxt}>Vymazat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btn, { backgroundColor: COLOR, flex: 1 }]} onPress={handleCheck}>
                  <Text style={s.btnTxt}>Zkontrolovat →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {phase === 'result' && (
            <View style={s.panel}>
              <ResultBox
                big={`${correct}/${curWords.length}`}
                sub={pct === 100 ? '🎉 Perfektní!' : pct >= 70 ? '👍 Dobrá práce!' : '💪 Zkus znovu!'}
                pct={pct} color={COLOR}
                actions={[
                  { label: 'Nastavení', onPress: () => setPhase('settings') },
                  canRetry
                    ? { label: `Zkusit znovu (${attemptsLeft})`, onPress: handleRetry, primary: true }
                    : { label: 'Nové kolo →', onPress: startGame, primary: true },
                ]}
                extra={
                  curWords.length > 0 && usedIndices.size < curWords.length ? (
                    <View style={s.missed}>
                      <Text style={s.missedT}>Zapomněl/a jsi{canRetry ? ' — zapamatuj si je!' : ''}</Text>
                      <View style={s.missedChips}>
                        {curWords.filter((_, i) => !usedIndices.has(i)).map((w, i) => (
                          <View key={i} style={s.missedChip}>
                            <Text style={s.missedChipTxt}>{w}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : null
                }
              />
              {maxAttempts > 1 && (
                <Text style={s.attemptInfo}>Pokus {attempt} / {maxAttempts}</Text>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
