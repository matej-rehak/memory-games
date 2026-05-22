import { useCallback, useRef, useState } from 'react';
import { Animated } from 'react-native';

export function useCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const animWidth = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animRef.current) animRef.current.stop();
    intervalRef.current = null;
    animRef.current = null;
  }, []);

  const start = useCallback(
    (total: number, onDone: () => void) => {
      stop();
      setSecondsLeft(total);
      animWidth.setValue(1);

      animRef.current = Animated.timing(animWidth, {
        toValue: 0,
        duration: total * 1000,
        useNativeDriver: false,
      });
      animRef.current.start();

      let left = total;
      intervalRef.current = setInterval(() => {
        left -= 1;
        setSecondsLeft(left);
        if (left <= 0) {
          stop();
          onDone();
        }
      }, 1000);
    },
    [stop, animWidth],
  );

  return { secondsLeft, animWidth, start, stop };
}
