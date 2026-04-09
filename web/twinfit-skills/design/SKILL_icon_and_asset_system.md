# SKILL: Icons & Assets
> TwinFit — Logo SVG, icon set, splash screen, adaptive icons

## Required Assets

```
assets/
├── icon.png              1024x1024 — iOS App Store icon (no alpha)
├── adaptive-icon.png     1024x1024 — Android foreground
├── splash.png            1284x2778 — iOS splash
├── notification-icon.png 96x96 — Android notification icon (white on transparent)
├── favicon.png           48x48 — Web
└── fonts/
    ├── BebasNeue-Regular.ttf
    └── DMSans-*.ttf
```

## Logo SVG (TwinFit mark)
```svg
<svg width="88" height="88" viewBox="0 0 88 88" fill="none">
  <circle cx="44" cy="44" r="42" fill="rgba(255,94,26,0.1)" stroke="rgba(255,94,26,0.25)" stroke-width="1.5"/>
  <!-- Figure A (orange) -->
  <circle cx="32" cy="26" r="9" fill="#FF5E1A"/>
  <!-- Figure B (white) -->
  <circle cx="56" cy="26" r="9" fill="rgba(255,255,255,0.65)"/>
  <!-- Bodies -->
  <path d="M20 62 Q20 46 32 43 Q44 40 44 40 Q44 40 56 43 Q68 46 68 62" stroke="#FF5E1A" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M32 43 L32 56 M56 43 L56 56" stroke="rgba(255,94,26,0.5)" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Arms -->
  <path d="M26 58 L38 58 M50 58 L62 58" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round"/>
  <!-- Flame -->
  <path d="M44 12 Q47 8 44 5 Q42 8 39 7 Q41 11 44 12Z" fill="#FF8A50"/>
</svg>
```

## React Native Logo Component
```tsx
import Svg, { Circle, Path } from 'react-native-svg';

export function TwinFitLogo({ size = 88 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 88 88">
      <Circle cx="44" cy="44" r="42" fill="rgba(255,94,26,0.1)" stroke="rgba(255,94,26,0.25)" strokeWidth="1.5"/>
      <Circle cx="32" cy="26" r="9" fill="#FF5E1A"/>
      <Circle cx="56" cy="26" r="9" fill="rgba(255,255,255,0.65)"/>
      <Path d="M20 62 Q20 46 32 43 Q44 40 44 40 Q44 40 56 43 Q68 46 68 62" stroke="#FF5E1A" strokeWidth="3.5" strokeLinecap="round"/>
      <Path d="M26 58 L38 58 M50 58 L62 58" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round"/>
      <Path d="M44 12 Q47 8 44 5 Q42 8 39 7 Q41 11 44 12Z" fill="#FF8A50"/>
    </Svg>
  );
}
```

## Icon Usage
```tsx
// Use @expo/vector-icons + custom emoji icons
import { Ionicons } from '@expo/vector-icons';

// Tab icons
const tabIcons = {
  home: 'home',
  log: 'camera',
  evolution: 'star',
  nutrition: 'leaf',
};

// Custom emoji icon for special cases
export function EmojiIcon({ emoji, size = 22 }) {
  return <Text style={{ fontSize: size }}>{emoji}</Text>;
}
```

## Font Loading (app/_layout.tsx)
```ts
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'BebasNeue': require('../assets/fonts/BebasNeue-Regular.ttf'),
  'DMSans-Light': require('../assets/fonts/DMSans-Light.ttf'),
  'DMSans': require('../assets/fonts/DMSans-Regular.ttf'),
  'DMSans-Medium': require('../assets/fonts/DMSans-Medium.ttf'),
  'DMSans-SemiBold': require('../assets/fonts/DMSans-SemiBold.ttf'),
});
```
