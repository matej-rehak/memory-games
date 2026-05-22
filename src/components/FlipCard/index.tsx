import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';
import { s } from './styles';

interface Props {
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  onPress: () => void;
  size: number;
}

export default function FlipCard({ emoji, isFlipped, isMatched, onPress, size }: Props) {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: isFlipped || isMatched ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [isFlipped, isMatched, flipAnim]);

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const cardSize = { width: size, height: size };

  return (
    <TouchableOpacity onPress={onPress} style={cardSize} activeOpacity={0.8}>
      <Animated.View style={[s.face, s.front, cardSize, { transform: [{ rotateY: frontRotate }] }]}>
        <Text style={s.question}>?</Text>
      </Animated.View>
      <Animated.View style={[s.face, s.back, cardSize, isMatched && s.matched, { transform: [{ rotateY: backRotate }] }]}>
        <Text style={[s.emoji, { fontSize: size * 0.38 }]}>{emoji}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}
