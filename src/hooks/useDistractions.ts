import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { WSETS } from '../data/words';
import { GameColors } from '../theme';

type Diff = 'easy' | 'medium' | 'hard';

export interface DistractionSettings {
  fakeWords: boolean;
  movement: boolean;
  noise: boolean;
}

export interface DisplayWord {
  word: string;
  real: boolean;
}

export interface NoisePatch {
  id: number;
  top: number;
  left: number;
  color: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDisplayWords(realWords: string[], diff: Diff, fakeWords: boolean): DisplayWord[] {
  const real: DisplayWord[] = realWords.map(w => ({ word: w, real: true }));
  if (!fakeWords) return real;
  const pool = WSETS[diff].filter(w => !realWords.includes(w));
  const decoyCount = Math.floor(realWords.length / 2);
  const decoys: DisplayWord[] = shuffle(pool).slice(0, decoyCount).map(w => ({ word: w, real: false }));
  return shuffle([...real, ...decoys]);
}

const PATCH_COLORS = Object.values(GameColors);

function generatePatches(): NoisePatch[] {
  return Array.from({ length: 4 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 180,
    color: PATCH_COLORS[Math.floor(Math.random() * PATCH_COLORS.length)],
  }));
}

export function useDistractions(
  settings: DistractionSettings,
  realWords: string[],
  diff: Diff,
  active: boolean,
): { displayWords: DisplayWord[]; shakeAnim: Animated.Value; noisePatches: NoisePatch[] } {
  const [displayWords, setDisplayWords] = useState<DisplayWord[]>(() =>
    buildDisplayWords(realWords, diff, settings.fakeWords),
  );
  const [noisePatches, setNoisePatches] = useState<NoisePatch[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shakeLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    setDisplayWords(buildDisplayWords(realWords, diff, settings.fakeWords));
  }, [realWords, diff, settings.fakeWords]);

  useEffect(() => {
    if (settings.movement && active) {
      intervalRef.current = setInterval(() => {
        setDisplayWords(prev => shuffle(prev));
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [settings.movement, active]);

  useEffect(() => {
    if (settings.noise && active) {
      setNoisePatches(generatePatches());
      shakeLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 4, duration: 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -4, duration: 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 3, duration: 70, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -3, duration: 70, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
          Animated.delay(3000),
        ]),
      );
      shakeLoopRef.current.start();
    } else {
      shakeLoopRef.current?.stop();
      shakeLoopRef.current = null;
      shakeAnim.setValue(0);
      setNoisePatches([]);
    }
    return () => {
      shakeLoopRef.current?.stop();
      shakeLoopRef.current = null;
      shakeAnim.setValue(0);
    };
  }, [settings.noise, active, shakeAnim]);

  return { displayWords, shakeAnim, noisePatches };
}
