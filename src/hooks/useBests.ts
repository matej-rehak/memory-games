import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { GameId } from '../theme';

type Bests = Record<GameId, number | null>;

const KEYS: Record<GameId, string> = {
  words: '@best_words',
  seq: '@best_seq',
  pairs: '@best_pairs',
  nums: '@best_nums',
  letters: '@best_letters',
};

const INITIAL: Bests = { words: null, seq: null, pairs: null, nums: null, letters: null };

export function useBests() {
  const [bests, setBests] = useState<Bests>(INITIAL);

  useEffect(() => {
    (async () => {
      const pairs = await AsyncStorage.multiGet(Object.values(KEYS));
      const loaded: Bests = { ...INITIAL };
      pairs.forEach(([key, val]) => {
        const id = (Object.keys(KEYS) as GameId[]).find(k => KEYS[k] === key);
        if (id && val !== null) loaded[id] = parseFloat(val);
      });
      setBests(loaded);
    })();
  }, []);

  const updateBest = useCallback(async (game: GameId, value: number) => {
    let isBetter = false;
    setBests(prev => {
      const current = prev[game];
      isBetter =
        game === 'pairs'
          ? current === null || value < current
          : current === null || value > current;
      if (!isBetter) return prev;
      AsyncStorage.setItem(KEYS[game], String(value));
      return { ...prev, [game]: value };
    });
    return isBetter;
  }, []);


  return { bests, updateBest };
}
