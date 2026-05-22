import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CountdownBar from '../../components/CountdownBar';
import GameTopBar from '../../components/GameTopBar';
import NumPad from '../../components/NumPad';
import ResultBox from '../../components/ResultBox';
import { useBests } from '../../hooks/useBests';
import { useCountdown } from '../../hooks/useCountdown';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors, GameColors } from '../../theme';
import { haptics } from '../../utils/haptics';
import { CELL_SIZE, s } from './styles';

type Phase = 'settings' | 'memorize' | 'input' | 'result';
type Size = 3 | 4 | 5;
type Props = NativeStackScreenProps<RootStackParamList, 'Nums'>;

const COLOR = GameColors.nums;
const HIDE_COUNT: Record<Size, number> = { 3: 3, 4: 5, 5: 8 };
const MEM_TIME: Record<Size, number> = { 3: 8, 4: 11, 5: 15 };

export default function NumsScreen({ navigation }: Props) {
  const { bests, updateBest } = useBests();
  const { secondsLeft, animWidth, start, stop } = useCountdown();

  const [phase, setPhase] = useState<Phase>('settings');
  const [gridSize, setGridSize] = useState<Size>(3);
  const [round, setRound] = useState(0);
  const [nums, setNums] = useState<number[]>([]);
  const [hidden, setHidden] = useState<number[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [cellStates, setCellStates] = useState<('default' | 'ok' | 'no')[]>([]);
  const [correct, setCorrect] = useState(0);

  const startGame = useCallback(() => {
    stop();
    const total = gridSize * gridSize;
    const n = Array.from({ length: total }, () => Math.floor(Math.random() * 9) + 1);
    const hiddenIdx = [...Array(total).keys()]
      .sort(() => Math.random() - 0.5).slice(0, HIDE_COUNT[gridSize]).sort((a, b) => a - b);
    setNums(n); setHidden(hiddenIdx);
    setAnswers(new Array(total).fill(null)); setSelected(null);
    setCellStates(new Array(total).fill('default'));
    setRound(r => r + 1); setPhase('memorize');
    start(MEM_TIME[gridSize], () => { setSelected(hiddenIdx[0] ?? null); setPhase('input'); });
  }, [gridSize, start, stop]);

  const handlePad = useCallback((val: string) => {
    if (selected === null) return;
    haptics.selection();
    setAnswers(prev => {
      const next = [...prev];
      next[selected] = val === '⌫' ? null : parseInt(val);
      return next;
    });
    if (val !== '⌫') {
      setHidden(hiddenList => {
        const ci = hiddenList.indexOf(selected);
        if (ci < hiddenList.length - 1) setTimeout(() => setSelected(hiddenList[ci + 1]), 80);
        return hiddenList;
      });
    }
  }, [selected]);

  const handleCheck = useCallback(() => {
    let cnt = 0;
    const newStates = nums.map((n, i) => {
      if (!hidden.includes(i)) return 'default' as const;
      if (answers[i] === n) { cnt++; return 'ok' as const; }
      return 'no' as const;
    });
    setCellStates(newStates); setCorrect(cnt);
    const pct = Math.round(cnt / hidden.length * 100);
    updateBest('nums', pct);
    if (pct === 100) haptics.success(); else if (cnt > 0) haptics.light(); else haptics.error();
    setTimeout(() => setPhase('result'), 900);
  }, [nums, hidden, answers, updateBest]);

  const bestLabel = bests.nums !== null ? `${bests.nums}%` : '—';
  const pct = hidden.length > 0 ? Math.round(correct / hidden.length * 100) : 0;

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <GameTopBar title="🧮 Čísla v mřížce" color={COLOR} round={round} best={bestLabel}
        onBack={() => { stop(); navigation.goBack(); }} />
      <ScrollView contentContainerStyle={s.scroll}>

        {phase === 'settings' && (
          <View style={s.panel}>
            <Text style={s.plabel}>Mřížka — <Text style={{ color: COLOR }}>prostorová paměť</Text></Text>
            <Text style={s.desc}>Zapamatuj si čísla v mřížce. Pak doplň ta, která zmizela.</Text>
            <View style={s.sizeRow}>
              {([3, 4, 5] as Size[]).map(sz => (
                <TouchableOpacity key={sz}
                  style={[s.sizeBtn, gridSize === sz && { backgroundColor: COLOR, borderColor: COLOR }]}
                  onPress={() => setGridSize(sz)}>
                  <Text style={[s.sizeTxt, gridSize === sz && { color: '#fff' }]}>{sz}×{sz}</Text>
                  <Text style={[s.sizeSub, gridSize === sz && { color: 'rgba(255,255,255,0.8)' }]}>{HIDE_COUNT[sz]} skrytých</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[s.btn, { backgroundColor: COLOR }]} onPress={startGame}>
              <Text style={s.btnTxt}>Začít →</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'memorize' && (
          <View style={s.panel}>
            <Text style={s.plabel}>Zapamatuj si — <Text style={{ color: COLOR }}>čísla v mřížce</Text></Text>
            <View style={[s.grid, { width: gridSize * (CELL_SIZE + 7) - 7 }]}>
              {nums.map((n, i) => (
                <View key={i} style={s.cell}><Text style={s.cellTxt}>{n}</Text></View>
              ))}
            </View>
            <CountdownBar secondsLeft={secondsLeft} animWidth={animWidth} color={COLOR} />
          </View>
        )}

        {phase === 'input' && (
          <View style={s.panel}>
            <Text style={s.plabel}>Doplň — <Text style={{ color: COLOR }}>chybějící čísla</Text></Text>
            <View style={[s.grid, { width: gridSize * (CELL_SIZE + 7) - 7 }]}>
              {nums.map((n, i) => {
                const isHidden = hidden.includes(i);
                const isSel = selected === i;
                const ans = answers[i];
                return isHidden ? (
                  <TouchableOpacity key={i}
                    style={[s.cell, s.cellInp, isSel && { borderColor: COLOR, backgroundColor: 'rgba(124,58,237,0.05)' }]}
                    onPress={() => setSelected(i)}>
                    <Text style={[s.cellTxt, { color: isSel ? Colors.ink : Colors.muted }]}>
                      {ans !== null ? String(ans) : '?'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View key={i} style={s.cell}><Text style={s.cellTxt}>{n}</Text></View>
                );
              })}
            </View>
            <NumPad onPress={handlePad} />
            <TouchableOpacity style={[s.btn, { backgroundColor: COLOR, marginTop: 18 }]} onPress={handleCheck}>
              <Text style={s.btnTxt}>Zkontrolovat →</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'result' && (
          <View style={s.panel}>
            <ResultBox
              big={`${correct}/${hidden.length}`}
              sub={`${pct}% správně · ${pct === 100 ? '🎉 Perfektní!' : pct >= 70 ? '👍 Dobrá práce!' : '💪 Zkus znovu!'}`}
              pct={pct} color={COLOR}
              actions={[
                { label: 'Jiná velikost', onPress: () => setPhase('settings') },
                { label: 'Hrát znovu →', onPress: startGame, primary: true },
              ]}
              extra={
                <View style={s.resultGrid}>
                  <Text style={[s.plabel, { marginBottom: 10 }]}>Správná mřížka</Text>
                  <View style={[s.grid, { width: gridSize * (CELL_SIZE + 7) - 7 }]}>
                    {nums.map((n, i) => {
                      const st = cellStates[i];
                      return (
                        <View key={i} style={[s.cell, st === 'ok' && s.cellOk, st === 'no' && s.cellNo]}>
                          <Text style={s.cellTxt}>{n}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              }
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
