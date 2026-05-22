export type GameId = 'words' | 'seq' | 'pairs' | 'nums' | 'letters' | 'schulte';

export const Colors = {
  bg: '#F8FAFC', // Slate 50 - cleaner background
  surface: '#F1F5F9', // Slate 100
  card: '#FFFFFF',
  ink: '#0F172A', // Slate 900 - professional dark
  ink2: '#475569', // Slate 600
  muted: '#94A3B8', // Slate 400
  accent: '#EF4444', // Red 500
  accent2: '#0EA5E9', // Sky 500
  accent3: '#10B981', // Emerald 500
  accent4: '#8B5CF6', // Violet 500
  accent5: '#F59E0B', // Amber 500
  gold: '#FBBF24',
  border: '#E2E8F0', // Slate 200
  green: '#DCFCE7',
  greenBorder: '#86EFAC',
  greenText: '#166534',
  red: '#FEE2E2',
  redBorder: '#FCA5A5',
  redText: '#991B1B',
  yellow: '#FEF3C7',
  yellowText: '#92400E',
};

export const GameColors: Record<GameId, string> = {
  words: '#EF4444',
  seq: '#0EA5E9',
  pairs: '#10B981',
  nums: '#8B5CF6',
  letters: '#F59E0B',
  schulte: '#F97316',
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
};

export const GameNames: Record<GameId, string> = {
  words: '📝 Zapamatuj si slova',
  seq: '🔢 Sekvence čísel',
  pairs: '🃏 Pexeso',
  nums: '🧮 Čísla v mřížce',
  letters: '🔤 Chybějící písmeno',
  schulte: '🔲 Schulte tabulka',
};

export const R = {
  card: 24,
  btn: 14,
  chip: 12,
  tag: 8,
  cell: 14,
};

