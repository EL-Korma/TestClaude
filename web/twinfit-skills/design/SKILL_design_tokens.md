# SKILL: Design Tokens
> TwinFit — Colors, typography, spacing, shadows — all in one file

---

## constants/tokens.ts

```ts
import { Platform } from 'react-native';

// ─── COLORS ───────────────────────────────────
export const colors = {
  // Brand
  orange:      '#FF5E1A',
  orangeLight: '#FF8A50',
  orangeGlow:  'rgba(255, 94, 26, 0.35)',
  orangeDim:   'rgba(255, 94, 26, 0.12)',

  // Backgrounds
  black:       '#080808',
  surface1:    '#111111',
  surface2:    '#191919',
  surface3:    '#222222',
  surface4:    '#2C2C2C',

  // Text
  text:        '#F2EDE8',
  muted:       '#78726D',
  dim:         '#36322F',

  // Semantic
  green:       '#3ECF8E',
  blue:        '#5BC4FF',
  yellow:      '#FFCB47',
  purple:      '#A78BFA',
  red:         '#FF4D4D',

  // Tiers
  bronze:      '#CD7F32',
  silver:      '#A8A9AD',
  gold:        '#FFD700',

  // Utils
  transparent: 'transparent',
  white:       '#FFFFFF',
};

// ─── TYPOGRAPHY ───────────────────────────────
export const fonts = {
  display:       'BebasNeue_400Regular',
  bodyLight:     'DMSans_300Light',
  body:          'DMSans_400Regular',
  bodyMedium:    'DMSans_500Medium',
  bodySemiBold:  'DMSans_600SemiBold',
};

export const fontSize = {
  xs:   9,
  sm:   11,
  base: 13,
  md:   15,
  lg:   18,
  xl:   22,
  '2xl': 28,
  '3xl': 36,
  '4xl': 48,
  '5xl': 64,
  display_sm:  20,
  display_md:  28,
  display_lg:  36,
  display_xl:  48,
  display_hero: 80,
};

export const letterSpacing = {
  tight:    -1,
  normal:   0,
  wide:     1,
  wider:    2,
  widest:   3,
  ultra:    4,
  label:    2.5,  // For uppercase labels
};

// ─── SPACING ──────────────────────────────────
export const spacing = {
  0:   0,
  1:   4,
  2:   8,
  3:   12,
  4:   16,
  5:   20,
  6:   24,
  7:   28,
  8:   32,
  10:  40,
  12:  48,
  16:  64,
  20:  80,
};

// ─── BORDER RADIUS ────────────────────────────
export const radius = {
  xs:     6,
  sm:     10,
  md:     14,
  lg:     18,
  xl:     22,
  '2xl':  26,
  '3xl':  32,
  full:   9999,
  phone:  54,
};

// ─── SHADOWS ──────────────────────────────────
export const shadows = {
  orange: {
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  orangeGlow: {
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 15,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
};

// ─── ANIMATIONS ───────────────────────────────
export const duration = {
  fast:    150,
  normal:  250,
  slow:    400,
  slower:  600,
};

export const easing = {
  // Use with Reanimated Easing
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  enter:    'cubic-bezier(0.0, 0.0, 0.2, 1)',
  exit:     'cubic-bezier(0.4, 0.0, 1, 1)',
  spring:   { damping: 15, stiffness: 120 },
};

// ─── COMPONENT SIZES ──────────────────────────
export const size = {
  // Touch targets (min 44px per Apple HIG)
  touchMin:   44,
  // Bottom nav
  navHeight:  76,
  navPadding: 10,
  // Status bar
  statusBar:  Platform.OS === 'ios' ? 54 : 24,
  // Header
  headerHeight: 60,
  // Icon sizes
  iconSm:  18,
  iconMd:  22,
  iconLg:  28,
  iconXl:  36,
};

// ─── GRADIENT PRESETS ─────────────────────────
export const gradients = {
  orangeFade:    ['#FF5E1A', '#FF8A50'],
  darkCard:      ['#170D04', '#0C0804'],
  darkSurface:   ['#1A1A1A', '#111111'],
  bronzeTier:    ['#CD7F32', '#7A4A1A'],
  silverTier:    ['#A8A9AD', '#5A5B5E'],
  goldTier:      ['#FFD700', '#B8860B'],
};
```

---

## Usage in Components

```tsx
import { colors, fonts, fontSize, spacing, radius, shadows } from '@constants/tokens';

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.display_lg,
    color: colors.text,
    letterSpacing: letterSpacing.wide,
  },
  card: {
    backgroundColor: colors.surface2,
    borderRadius: radius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    ...shadows.card,
  },
  primaryButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.lg,
    padding: spacing[4],
    ...shadows.orange,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
  },
});
```
