import React from 'react';
import { Animated, Text, View } from 'react-native';
import { s } from './styles';

interface Props {
  secondsLeft: number;
  animWidth: Animated.Value;
  color: string;
}

export default function CountdownBar({ secondsLeft, animWidth, color }: Props) {
  const widthInterpolated = animWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={s.wrap}>
      <View style={s.track}>
        <Animated.View style={[s.fill, { width: widthInterpolated, backgroundColor: color }]} />
      </View>
      <Text style={s.txt}>{secondsLeft}s zbývá</Text>
    </View>
  );
}
