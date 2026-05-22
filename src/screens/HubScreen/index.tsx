import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBests } from '../../hooks/useBests';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors, GameColors, GameId } from '../../theme';
import { s } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Hub'>;

interface GameCard {
  id: GameId;
  icon: string;
  title: string;
  desc: string;
  tags: { label: string; color: 'g' | 'y' | 'r' | 'n' }[];
  screen: keyof RootStackParamList;
}

const GAMES: GameCard[] = [
  {
    id: 'words',
    icon: '📝',
    title: 'Zapamatuj si slova',
    desc: 'Zapamatuj si sadu slov a po uplynutí času je napiš zpět. Čím více slov, tím těžší.',
    tags: [{ label: 'Slovní zásoba', color: 'n' }, { label: 'Lehká', color: 'g' }, { label: 'Střední', color: 'y' }, { label: 'Těžká', color: 'r' }],
    screen: 'Words',
  },
  {
    id: 'seq',
    icon: '🔢',
    title: 'Sekvence čísel',
    desc: 'Zapamatuj si posloupnost čísel a zadej ji ve správném pořadí. Délka roste s každým kolem!',
    tags: [{ label: 'Čísla', color: 'n' }, { label: 'Pořadí', color: 'y' }],
    screen: 'Seq',
  },
  {
    id: 'pairs',
    icon: '🃏',
    title: 'Pexeso',
    desc: 'Klasické pexeso s emoji. Otáčej karty a hledej shodné páry s co nejméně pokusy.',
    tags: [{ label: 'Vizuální', color: 'n' }, { label: '4×4', color: 'g' }, { label: '6×6', color: 'y' }],
    screen: 'Pairs',
  },
  {
    id: 'nums',
    icon: '🧮',
    title: 'Čísla v mřížce',
    desc: 'Zapamatuj si čísla na konkrétních pozicích v mřížce. Pak doplň chybějící hodnoty.',
    tags: [{ label: 'Prostorová paměť', color: 'n' }, { label: 'Výzva', color: 'r' }],
    screen: 'Nums',
  },
  {
    id: 'letters',
    icon: '🔤',
    title: 'Chybějící písmeno',
    desc: 'Zobrazí se slovo s chybějícími písmeny. Doplň je správně! Čím těžší, tím více písmen chybí.',
    tags: [{ label: 'Pravopis', color: 'n' }, { label: 'Lehká', color: 'g' }, { label: 'Střední', color: 'y' }, { label: 'Těžká', color: 'r' }],
    screen: 'Letters',
  },
  {
    id: 'schulte',
    icon: '🔲',
    title: 'Schulte tabulka',
    desc: 'Najdi a klikni čísla v pořadí od 1 co nejrychleji. Trénink periferního vidění a pozornosti.',
    tags: [{ label: 'Pozornost', color: 'n' }, { label: '3×3 – 7×7', color: 'g' }],
    screen: 'Schulte',
  },
];

const TAG_BG: Record<string, string> = {
  g: Colors.green,
  y: Colors.yellow,
  r: Colors.red,
  n: Colors.surface,
};
const TAG_TXT: Record<string, string> = {
  g: Colors.greenText,
  y: Colors.yellowText,
  r: Colors.redText,
  n: Colors.ink2,
};

function bestLabel(id: GameId, val: number | null): string {
  if (val === null) return '—';
  if (id === 'words') return `${val} slov`;
  if (id === 'seq') return `${val} číslic`;
  if (id === 'pairs') return `${val} tahů`;
  if (id === 'schulte') return `${val}s`;
  return `${val}%`;
}

export default function HubScreen({ navigation }: Props) {
  const { bests } = useBests();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.eyebrow}>Trénink mozku</Text>
          <Text style={s.title}>Paměťové{'\n'}<Text style={s.red}>výzvy</Text></Text>
          <Text style={s.desc}>Pět her pro trénink paměti. Každá hra má stovky slov — bez opakování.</Text>
        </View>

        {GAMES.map(g => (
          <TouchableOpacity
            key={g.id}
            style={[s.card, { borderTopColor: GameColors[g.id] }]}
            onPress={() => navigation.navigate(g.screen as any)}
            activeOpacity={0.85}
          >
            <View style={[s.cardTop, { borderTopColor: GameColors[g.id] }]} />
            <View style={s.row}>
              <Text style={s.icon}>{g.icon}</Text>
              <View style={s.best}>
                <Text style={s.bestLbl}>Nejlepší</Text>
                <Text style={[s.bestVal, { color: Colors.gold }]}>{bestLabel(g.id, bests[g.id])}</Text>
              </View>
            </View>
            <Text style={s.gameTitle}>{g.title}</Text>
            <Text style={s.gameDesc}>{g.desc}</Text>
            <View style={s.tags}>
              {g.tags.map((t, i) => (
                <View key={i} style={[s.tag, { backgroundColor: TAG_BG[t.color] }]}>
                  <Text style={[s.tagTxt, { color: TAG_TXT[t.color] }]}>{t.label}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
