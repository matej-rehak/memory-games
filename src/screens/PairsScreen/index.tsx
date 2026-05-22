import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FlipCard from '../../components/FlipCard';
import GameTopBar from '../../components/GameTopBar';
import ResultBox from '../../components/ResultBox';
import { EMOJIS } from '../../data/words';
import { useBests } from '../../hooks/useBests';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { GameColors } from '../../theme';
import { haptics } from '../../utils/haptics';
import { s } from './styles';

type Phase = 'settings' | 'playing' | 'result';
type Props = NativeStackScreenProps<RootStackParamList, 'Pairs'>;

const COLOR = GameColors.pairs;
const SCREEN_W = Dimensions.get('window').width;

function fTime(sec: number) {
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

export default function PairsScreen({ navigation }: Props) {
  const { bests, updateBest } = useBests();

  const [phase, setPhase] = useState<Phase>('settings');
  const [pSize, setPSize] = useState<4 | 6>(4);
  const [round, setRound] = useState(0);
  const [board, setBoard] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [secs, setSecs] = useState(0);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startGame = useCallback(() => {
    stopTimer();
    const total = pSize * pSize;
    const half = EMOJIS.slice(0, total / 2);
    const b = [...half, ...half].sort(() => Math.random() - 0.5);
    setBoard(b); setFlipped([]); setMatched(new Set());
    setMoves(0); setSecs(0); setLocked(false);
    setRound(r => r + 1); setPhase('playing');
    timerRef.current = setInterval(() => setSecs(s => s + 1), 1000);
  }, [pSize, stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const handleFlip = useCallback((idx: number) => {
    if (locked) return;
    haptics.selection();
    setFlipped(prev => {
      if (prev.includes(idx) || matched.has(idx)) return prev;
      if (prev.length === 1) {
        const [a] = prev;
        const newMoves = moves + 1;
        setMoves(newMoves); setLocked(true);
        if (board[a] === board[idx]) {
          const newMatched = new Set([...matched, a, idx]);
          setMatched(newMatched); setLocked(false); haptics.success();
          if (newMatched.size === board.length) {
            stopTimer(); updateBest('pairs', newMoves);
            setTimeout(() => setPhase('result'), 500);
          }
          return [];
        } else {
          haptics.error();
          setTimeout(() => { setFlipped([]); setLocked(false); }, 900);
          return [a, idx];
        }
      }
      return [idx];
    });
  }, [locked, matched, board, moves, stopTimer, updateBest]);

  const cellSize = Math.floor((SCREEN_W - 32 - 24 * 2 - (pSize - 1) * 8) / pSize);
  const bestLabel = bests.pairs !== null ? `${bests.pairs} tahů` : '—';
  const starPct = board.length > 0
    ? (moves <= board.length / 2 + 2 ? 100 : moves <= board.length ? 70 : 40)
    : 0;

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <GameTopBar title="🃏 Pexeso" color={COLOR} round={round} best={bestLabel}
        onBack={() => { stopTimer(); navigation.goBack(); }} />
      <ScrollView contentContainerStyle={s.scroll}>

        {phase === 'settings' && (
          <View style={s.panel}>
            <Text style={s.plabel}>Pexeso — <Text style={{ color: COLOR }}>najdi páry</Text></Text>
            <View style={s.sizeRow}>
              {([4, 6] as const).map(sz => (
                <TouchableOpacity key={sz}
                  style={[s.sizeBtn, pSize === sz && { backgroundColor: COLOR, borderColor: COLOR }]}
                  onPress={() => setPSize(sz)}>
                  <Text style={[s.sizeTxt, pSize === sz && { color: '#fff' }]}>{sz}×{sz}</Text>
                  <Text style={[s.sizeSub, pSize === sz && { color: 'rgba(255,255,255,0.8)' }]}>{sz * sz / 2} párů</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[s.btn, { backgroundColor: COLOR }]} onPress={startGame}>
              <Text style={s.btnTxt}>Začít →</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'playing' && (
          <View style={s.panel}>
            <View style={s.infoRow}>
              <View style={s.infoItem}><Text style={s.infoVal}>{moves}</Text><Text style={s.infoLbl}>Tahy</Text></View>
              <View style={s.infoItem}><Text style={s.infoVal}>{matched.size / 2}/{board.length / 2}</Text><Text style={s.infoLbl}>Páry</Text></View>
              <View style={s.infoItem}><Text style={s.infoVal}>{fTime(secs)}</Text><Text style={s.infoLbl}>Čas</Text></View>
            </View>
            <View style={[s.grid, { gap: 8 }]}>
              {board.map((emoji, i) => (
                <FlipCard key={i} emoji={emoji}
                  isFlipped={flipped.includes(i)} isMatched={matched.has(i)}
                  onPress={() => handleFlip(i)} size={cellSize} />
              ))}
            </View>
          </View>
        )}

        {phase === 'result' && (
          <View style={s.panel}>
            <ResultBox big={String(moves)} sub={`tahů · čas ${fTime(secs)}`}
              pct={starPct} color={COLOR}
              actions={[
                { label: 'Jiná velikost', onPress: () => setPhase('settings') },
                { label: 'Hrát znovu →', onPress: startGame, primary: true },
              ]}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
