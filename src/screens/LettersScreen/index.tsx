import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CzechKeyboard from '../../components/CzechKeyboard';
import GameTopBar from '../../components/GameTopBar';
import ResultBox from '../../components/ResultBox';
import { LBLANK_PCT, LWORDS } from '../../data/words';
import { useBests } from '../../hooks/useBests';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors, GameColors } from '../../theme';
import { haptics } from '../../utils/haptics';
import { s } from './styles';

type Diff = 'easy' | 'medium' | 'hard';
type Phase = 'settings' | 'playing' | 'result';
type KeyState = 'default' | 'ok' | 'no';
type Props = NativeStackScreenProps<RootStackParamList, 'Letters'>;

const COLOR = GameColors.letters;
const TOTAL_OPTS = [5, 8, 10, 15];
const DIFF_OPTS = [
  { value: 'easy' as Diff, label: 'Lehká', sub: '~30% chybí' },
  { value: 'medium' as Diff, label: 'Střední', sub: '~45% chybí' },
  { value: 'hard' as Diff, label: 'Těžká', sub: '~60% chybí' },
];

function makeBlanks(word: string, diff: Diff): number[] {
  const chars = [...word];
  const n = Math.max(1, Math.round(chars.length * LBLANK_PCT[diff]));
  return chars.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, n).sort((a, b) => a - b);
}

export default function LettersScreen({ navigation }: Props) {
  const { bests, updateBest } = useBests();

  const [phase, setPhase] = useState<Phase>('settings');
  const [diff, setDiff] = useState<Diff>('easy');
  const [totalWords, setTotalWords] = useState(10);
  const [round, setRound] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [wordIdx, setWordIdx] = useState(0);
  const [blanks, setBlanks] = useState<number[]>([]);
  const [filled, setFilled] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});
  const [showResult, setShowResult] = useState(false);

  const startGame = useCallback(() => {
    const pool = [...LWORDS[diff]].sort(() => Math.random() - 0.5);
    const w = pool.slice(0, Math.min(totalWords, pool.length));
    const bl = makeBlanks(w[0], diff);
    setWords(w); setWordIdx(0); setBlanks(bl);
    setFilled(new Array([...w[0]].length).fill(''));
    setScore(0); setKeyStates({}); setShowResult(false);
    setRound(r => r + 1); setPhase('playing');
  }, [diff, totalWords]);

  const loadWord = useCallback((w: string, d: Diff) => {
    const bl = makeBlanks(w, d);
    setBlanks(bl); setFilled(new Array([...w].length).fill(''));
    setKeyStates({}); setShowResult(false);
  }, []);

  const handleKey = useCallback((c: string) => {
    haptics.selection();
    setBlanks(bl => {
      setFilled(prev => {
        const nextBlank = bl.find(i => prev[i] === '');
        if (nextBlank === undefined) return prev;
        const next = [...prev]; next[nextBlank] = c; return next;
      });
      return bl;
    });
  }, []);

  const handleDelete = useCallback(() => {
    setBlanks(bl => {
      setFilled(prev => {
        for (let k = bl.length - 1; k >= 0; k--) {
          if (prev[bl[k]] !== '') {
            const next = [...prev]; next[bl[k]] = ''; return next;
          }
        }
        return prev;
      });
      return bl;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (words.length === 0) return;
    const word = [...words[wordIdx]];
    let allOk = true;
    const newKeyStates: Record<string, KeyState> = { ...keyStates };
    blanks.forEach(i => {
      const ok = filled[i].toLowerCase() === word[i];
      newKeyStates[filled[i].toUpperCase()] = ok ? 'ok' : 'no';
      if (!ok) allOk = false;
    });
    setKeyStates(newKeyStates); setShowResult(true);
    if (allOk) haptics.success(); else haptics.error();
    const newScore = allOk ? score + 1 : score;
    if (allOk) setScore(newScore);
    setTimeout(() => {
      const nextIdx = wordIdx + 1;
      if (nextIdx >= words.length) {
        updateBest('letters', Math.round(newScore / words.length * 100));
        setPhase('result'); return;
      }
      setWordIdx(nextIdx); loadWord(words[nextIdx], diff);
    }, allOk ? 600 : 1800);
  }, [words, wordIdx, blanks, filled, keyStates, score, diff, loadWord, updateBest]);

  const handleSkip = useCallback(() => {
    const nextIdx = wordIdx + 1;
    if (nextIdx >= words.length) {
      updateBest('letters', Math.round(score / words.length * 100));
      setPhase('result'); return;
    }
    setWordIdx(nextIdx); loadWord(words[nextIdx], diff);
  }, [wordIdx, words, score, diff, loadWord, updateBest]);

  const bestLabel = bests.letters !== null ? `${bests.letters}%` : '—';
  const pct = words.length > 0 ? Math.round(score / words.length * 100) : 0;
  const currentWord = words[wordIdx] ?? '';
  const chars = [...currentWord];
  const blankSet = new Set(blanks);

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <GameTopBar title="🔤 Chybějící písmeno" color={COLOR} round={round} best={bestLabel}
        onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {phase === 'settings' && (
          <View style={s.panel}>
            <Text style={s.plabel}>Nastavení — <Text style={{ color: COLOR }}>Obtížnost</Text></Text>
            <View style={s.diffRow}>
              {DIFF_OPTS.map(o => (
                <TouchableOpacity key={o.value}
                  style={[s.diffBtn, diff === o.value && { backgroundColor: COLOR, borderColor: COLOR }]}
                  onPress={() => setDiff(o.value)}>
                  <Text style={[s.diffTxt, diff === o.value && { color: '#fff' }]}>{o.label}</Text>
                  <Text style={[s.diffSub, diff === o.value && { color: 'rgba(255,255,255,0.8)' }]}>{o.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[s.sublabel, { marginBottom: 10 }]}>Počet slov</Text>
            <View style={s.totalsRow}>
              {TOTAL_OPTS.map(v => (
                <TouchableOpacity key={v}
                  style={[s.totalBtn, totalWords === v && { backgroundColor: Colors.surface, borderColor: COLOR }]}
                  onPress={() => setTotalWords(v)}>
                  <Text style={[s.totalTxt, totalWords === v && { color: COLOR }]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[s.btn, { backgroundColor: COLOR }]} onPress={startGame}>
              <Text style={s.btnTxt}>Začít →</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'playing' && currentWord !== '' && (
          <View style={s.panel}>
            <View style={s.scoreRow}>
              <View style={s.scoreItem}><Text style={[s.scoreVal, { color: COLOR }]}>{wordIdx + 1}/{words.length}</Text><Text style={s.scoreLbl}>SLOVO</Text></View>
              <View style={s.scoreItem}><Text style={[s.scoreVal, { color: COLOR }]}>{score}</Text><Text style={s.scoreLbl}>SPRÁVNĚ</Text></View>
              <View style={s.scoreItem}><Text style={[s.scoreVal, { color: COLOR }]}>{blanks.length}</Text><Text style={s.scoreLbl}>CHYBÍ</Text></View>
            </View>
            <Text style={s.plabel}>Doplň — <Text style={{ color: COLOR }}>chybějící písmena</Text></Text>
            <View style={s.wordRow}>
              {chars.map((c, i) => {
                if (!blankSet.has(i)) {
                  return <View key={i} style={[s.lchar, s.lcharShown]}><Text style={s.lcharTxt}>{c}</Text></View>;
                }
                const val = filled[i];
                const isOk = showResult && val.toLowerCase() === c;
                const isNo = showResult && val !== '' && !isOk;
                return (
                  <View key={i} style={[s.lchar, val ? s.lcharFilled : s.lcharBlank, isOk && s.lcharOk, isNo && s.lcharNo]}>
                    <Text style={[s.lcharTxt, !val && { fontSize: 12, color: Colors.muted }, isOk && { color: Colors.greenText }, isNo && { color: Colors.redText }]}>
                      {val || '?'}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={s.wordHint}>
              {showResult
                ? (blanks.every(i => filled[i].toLowerCase() === chars[i]) ? '✓ Správně!' : `Správně: ${currentWord}`)
                : `${blanks.filter(i => filled[i] === '').length} písmen zbývá`}
            </Text>
            <CzechKeyboard keyStates={keyStates} onKey={handleKey} onDelete={handleDelete} />
            {!showResult && (
              <View style={s.btnRow}>
                <TouchableOpacity style={s.btnS} onPress={handleSkip}><Text style={s.btnSTxt}>Přeskočit</Text></TouchableOpacity>
                <TouchableOpacity style={[s.btn, { backgroundColor: COLOR, flex: 1 }]} onPress={handleConfirm}>
                  <Text style={s.btnTxt}>Potvrdit →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {phase === 'result' && (
          <View style={s.panel}>
            <ResultBox
              big={`${score}/${words.length}`}
              sub={`${pct}% správně · ${pct === 100 ? '🎉 Perfektní!' : pct >= 70 ? '👍 Dobrá práce!' : '💪 Zkus znovu!'}`}
              pct={pct} color={COLOR}
              actions={[
                { label: 'Nastavení', onPress: () => setPhase('settings') },
                { label: 'Hrát znovu →', onPress: startGame, primary: true },
              ]}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
