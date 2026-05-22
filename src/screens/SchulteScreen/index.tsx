import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameTopBar from '../../components/GameTopBar';
import ResultBox from '../../components/ResultBox';
import { useBests } from '../../hooks/useBests';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors, GameColors } from '../../theme';
import { haptics } from '../../utils/haptics';
import { s } from './styles';

type Phase = 'settings' | 'playing' | 'result';
type Props = NativeStackScreenProps<RootStackParamList, 'Schulte'>;

const COLOR = GameColors.schulte;
const MIN_SIZE = 3;
const MAX_SIZE = 7;
const GAP = 4;
const H_PAD = 32;

function getCellSize(gridSize: number, screenW: number): number {
  return (screenW - H_PAD - GAP * (gridSize - 1)) / gridSize;
}

function buildGrid(size: number): number[] {
  const total = size * size;
  const nums = Array.from({ length: total }, (_, i) => i + 1);
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums;
}

export default function SchulteScreen({ navigation }: Props) {
  const { bests, updateBest } = useBests();
  const { width: screenW } = useWindowDimensions();

  const [phase, setPhase] = useState<Phase>('settings');
  const [gridSize, setGridSize] = useState(5);
  const [round, setRound] = useState(0);
  const [grid, setGrid] = useState<number[]>([]);
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [nextTarget, setNextTarget] = useState(1);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [flashRed, setFlashRed] = useState<number | null>(null);
  const [displayTime, setDisplayTime] = useState('0.0');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  const startGame = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const now = Date.now();
    setGrid(buildGrid(gridSize));
    setTapped(new Set());
    setNextTarget(1);
    setWrongTaps(0);
    setElapsedMs(0);
    setDisplayTime('0.0');
    setStartTime(now);
    setRound(r => r + 1);
    setPhase('playing');
    timerRef.current = setInterval(() => {
      setDisplayTime(((Date.now() - now) / 1000).toFixed(1));
    }, 100);
  }, [gridSize]);

  const handleCellPress = useCallback((index: number, value: number) => {
    if (value !== nextTarget) {
      setWrongTaps(w => w + 1);
      setFlashRed(index);
      haptics.error();
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = setTimeout(() => setFlashRed(f => (f === index ? null : f)), 300);
      return;
    }
    const newTapped = new Set(tapped);
    newTapped.add(value);
    setTapped(newTapped);
    haptics.light();
    const total = gridSize * gridSize;
    if (value === total) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      const elapsed = Date.now() - startTime;
      setElapsedMs(elapsed);
      const finalScore = Math.round((elapsed / 1000 + wrongTaps * 2) * 10) / 10;
      updateBest('schulte', finalScore);
      haptics.success();
      phaseTimeoutRef.current = setTimeout(() => setPhase('result'), 300);
    } else {
      setNextTarget(value + 1);
    }
  }, [nextTarget, tapped, gridSize, startTime, wrongTaps, updateBest]);

  const cellSize = getCellSize(gridSize, screenW);
  const fontSize = Math.max(10, Math.floor(cellSize * 0.38));
  const bestLabel = bests.schulte !== null ? `${bests.schulte}s` : '—';
  const elapsedSec = (elapsedMs / 1000).toFixed(1);
  const finalScore = Math.round((elapsedMs / 1000 + wrongTaps * 2) * 10) / 10;
  const pct = wrongTaps === 0 ? 100 : Math.max(0, 100 - wrongTaps * 10);

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <GameTopBar
        title="🔲 Schulte tabulka"
        color={COLOR}
        round={round}
        best={bestLabel}
        onBack={() => {
          if (timerRef.current) clearInterval(timerRef.current);
          if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
          if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
          navigation.goBack();
        }}
      />
      <ScrollView contentContainerStyle={s.scroll}>

        {phase === 'settings' && (
          <View style={s.panel}>
            <Text style={s.plabel}>Nastavení — <Text style={{ color: COLOR }}>Schulte tabulka</Text></Text>
            <Text style={s.desc}>
              Klikej čísla v pořadí od 1 co nejrychleji. Za každou chybu +2s penalizace.
            </Text>
            <Text style={[s.plabel, { marginTop: 16, marginBottom: 10 }]}>Velikost tabulky</Text>
            <View style={s.stepperRow}>
              <TouchableOpacity
                style={s.stepBtn}
                onPress={() => setGridSize(g => Math.max(MIN_SIZE, g - 1))}>
                <Text style={s.stepTxt}>−</Text>
              </TouchableOpacity>
              <Text style={s.stepVal}>{gridSize}×{gridSize}</Text>
              <TouchableOpacity
                style={s.stepBtn}
                onPress={() => setGridSize(g => Math.min(MAX_SIZE, g + 1))}>
                <Text style={s.stepTxt}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.hint}>{gridSize * gridSize} čísel</Text>
            <TouchableOpacity
              style={[s.btn, { backgroundColor: COLOR, marginTop: 24 }]}
              onPress={startGame}>
              <Text style={s.btnTxt}>Spustit →</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'playing' && (
          <View style={s.panel}>
            <Text style={s.stopwatch}>{displayTime}s</Text>
            <Text style={s.target}>
              Hledej: <Text style={{ color: COLOR }}>{nextTarget}</Text>
            </Text>
            <View style={s.grid}>
              {grid.map((value, index) => {
                const isTapped = tapped.has(value);
                const isFlash = flashRed === index;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[
                      s.cell,
                      { width: cellSize, height: cellSize, borderRadius: Math.floor(cellSize * 0.2) },
                      isFlash && s.cellFlash,
                      isTapped && s.cellTapped,
                    ]}
                    onPress={() => handleCellPress(index, value)}
                    activeOpacity={0.7}
                    disabled={isTapped}
                  >
                    {!isTapped && <Text style={[s.cellTxt, { fontSize }]}>{value}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={s.wrongCount}>{wrongTaps > 0 ? `${wrongTaps} chyb` : ' '}</Text>
          </View>
        )}

        {phase === 'result' && (
          <View style={s.panel}>
            <ResultBox
              big={`${finalScore}s`}
              sub={
                wrongTaps === 0
                  ? '🎉 Perfektní! Žádné chyby!'
                  : `Čas: ${elapsedSec}s · Chyby: ${wrongTaps} (+${wrongTaps * 2}s)`
              }
              pct={pct}
              color={COLOR}
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
