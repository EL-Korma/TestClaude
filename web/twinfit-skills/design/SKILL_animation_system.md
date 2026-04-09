# SKILL: Animation System
> TwinFit — Reanimated 2, shared presets, gestures

## Setup
```bash
npm install react-native-reanimated react-native-gesture-handler
# Add to babel.config.js plugins: 'react-native-reanimated/plugin'
```

## Shared Animation Hooks (hooks/useAnimations.ts)

```ts
import { useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence } from 'react-native-reanimated';

// Fade up on mount
export function useFadeUp(delay = 0) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 450 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 18 }));
  }, []);
  return useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));
}

// Scale on press
export function usePressScale() {
  const scale = useSharedValue(1);
  const onPressIn = () => { scale.value = withSpring(0.96, { damping: 15 }) };
  const onPressOut = () => { scale.value = withSpring(1, { damping: 15 }) };
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return { animStyle, onPressIn, onPressOut };
}

// Pulse glow (streak, pip)
export function usePulseGlow(color = 'rgba(255,94,26,0.5)') {
  const shadow = useSharedValue(0.4);
  useEffect(() => {
    shadow.value = withRepeat(withSequence(
      withTiming(1, { duration: 1200 }),
      withTiming(0.4, { duration: 1200 })
    ), -1, false);
  }, []);
  return useAnimatedStyle(() => ({
    shadowColor: color,
    shadowOpacity: shadow.value,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  }));
}

// Float (logo, orbs)
export function useFloat(amplitude = 10, duration = 4000) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(withSequence(
      withTiming(-amplitude, { duration }),
      withTiming(0, { duration })
    ), -1, true);
  }, []);
  return useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
}

// Slide in from right
export function useSlideIn(delay = 0) {
  const x = useSharedValue(40);
  const opacity = useSharedValue(0);
  useEffect(() => {
    x.value = withDelay(delay, withSpring(0, { damping: 18 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);
  return useAnimatedStyle(() => ({ transform: [{ translateX: x.value }], opacity: opacity.value }));
}

// Number count-up
export function useCountUp(target: number, duration = 1000) {
  const value = useSharedValue(0);
  useEffect(() => { value.value = withTiming(target, { duration }) }, [target]);
  return value;
}
```

## Screen Transition Config (Expo Router)
```ts
// app/(app)/_layout.tsx
screenOptions={{
  animation: 'slide_from_right',
  animationDuration: 300,
  gestureEnabled: true,
  gestureDirection: 'horizontal',
}}
```

## Staggered List Items
```tsx
function AnimatedListItem({ index, children }) {
  const style = useFadeUp(index * 60); // 60ms stagger
  return <Animated.View style={style}>{children}</Animated.View>;
}
```

## Progress Bar Animation
```tsx
function AnimatedBar({ percent, color }) {
  const width = useSharedValue(0);
  useEffect(() => { width.value = withDelay(200, withTiming(percent, { duration: 900 })) }, [percent]);
  const style = useAnimatedStyle(() => ({ width: `${width.value}%` }));
  return <View style={styles.track}><Animated.View style={[styles.fill, { backgroundColor: color }, style]} /></View>;
}
```
