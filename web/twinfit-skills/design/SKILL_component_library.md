# SKILL: Component Library
> TwinFit — Button, Input, Card, Badge, Modal, Toast — built once, used everywhere

---

## Button (components/atoms/Button.tsx)

```tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, fonts, fontSize, radius, shadows, spacing } from '@constants/tokens';

type ButtonVariant = 'primary' | 'ghost' | 'surface';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({ label, onPress, variant = 'primary', loading, disabled, style, fullWidth = true }: ButtonProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.97, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 15 });
    });
    onPress();
  };

  return (
    <AnimatedTouchable
      style={[styles.base, styles[variant], fullWidth && styles.full, disabled && styles.disabled, animStyle, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.9}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.orange} size="small" />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`]]}>{label}</Text>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base:          { borderRadius: radius.lg, padding: spacing[4], alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  full:          { width: '100%' },
  primary:       { backgroundColor: colors.orange, ...shadows.orange },
  ghost:         { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)' },
  surface:       { backgroundColor: colors.surface2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  disabled:      { opacity: 0.5 },
  label:         { fontFamily: fonts.display, fontSize: fontSize.xl, letterSpacing: 2 },
  label_primary: { color: '#fff' },
  label_ghost:   { color: colors.muted },
  label_surface: { color: colors.text, fontFamily: fonts.bodyMedium, fontSize: fontSize.base, letterSpacing: 0 },
});
```

---

## Input (components/atoms/Input.tsx)

```tsx
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, fonts, fontSize, radius, spacing } from '@constants/tokens';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: string;
  error?: string;
}

export function Input({ label, icon, error, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.row, focused && styles.focused, error && styles.errored]}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholderTextColor={colors.dim}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:         { marginBottom: spacing[4] },
  label:        { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, color: colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: spacing[2] },
  row:          { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface2, borderRadius: radius.md, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)' },
  focused:      { borderColor: colors.orange },
  errored:      { borderColor: colors.red },
  icon:         { fontSize: 18, paddingLeft: spacing[4], opacity: 0.5 },
  input:        { flex: 1, fontFamily: fonts.body, fontSize: fontSize.base, color: colors.text, padding: spacing[4] },
  inputWithIcon:{ paddingLeft: spacing[2] },
  error:        { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.red, marginTop: spacing[1] },
});
```

---

## Card (components/atoms/Card.tsx)

```tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from '@constants/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glow?: boolean;
  variant?: 'default' | 'dark' | 'orange';
}

export function Card({ children, style, glow, variant = 'default' }: CardProps) {
  return (
    <View style={[styles.base, styles[variant], glow && styles.glow, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base:   { borderRadius: radius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: spacing[4] },
  default:{ backgroundColor: colors.surface2 },
  dark:   { backgroundColor: colors.surface1 },
  orange: { backgroundColor: 'rgba(255,94,26,0.07)', borderColor: 'rgba(255,94,26,0.2)' },
  glow:   { ...shadows.orangeGlow },
});
```

---

## Badge (components/atoms/Badge.tsx)

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSize, radius, spacing } from '@constants/tokens';

type BadgeVariant = 'orange' | 'green' | 'silver' | 'bronze' | 'muted' | 'locked';

interface BadgeProps { label: string; variant?: BadgeVariant; }

export function Badge({ label, variant = 'orange' }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant]]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base:          { borderRadius: radius.xs, paddingHorizontal: spacing[2]+2, paddingVertical: 3, alignSelf: 'flex-start' },
  orange:        { backgroundColor: 'rgba(255,94,26,0.12)' },
  green:         { backgroundColor: 'rgba(62,207,142,0.12)' },
  silver:        { backgroundColor: 'rgba(168,169,173,0.1)' },
  bronze:        { backgroundColor: 'rgba(205,127,50,0.15)' },
  muted:         { backgroundColor: colors.surface3 },
  locked:        { backgroundColor: colors.surface2 },
  text:          { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, letterSpacing: 1, textTransform: 'uppercase' },
  text_orange:   { color: colors.orange },
  text_green:    { color: colors.green },
  text_silver:   { color: colors.silver },
  text_bronze:   { color: colors.bronze },
  text_muted:    { color: colors.muted },
  text_locked:   { color: colors.dim },
});
```

---

## Toast (components/atoms/Toast.tsx)

```tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, withTiming } from 'react-native-reanimated';
import { colors, fonts, fontSize, radius, spacing } from '@constants/tokens';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onHide: () => void;
}

export function Toast({ message, type = 'info', visible, onHide }: ToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15 });
      opacity.value = withTiming(1, { duration: 200 });
      // Auto-hide after 3s
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        setTimeout(onHide, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const typeColor = { success: colors.green, error: colors.red, info: colors.orange };

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <View style={[styles.accent, { backgroundColor: typeColor[type] }]} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 60, left: 16, right: 16, backgroundColor: colors.surface2, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', padding: spacing[4], zIndex: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 } },
  accent: { width: 3, height: '100%', borderRadius: 2, marginRight: spacing[3] },
  text:   { fontFamily: fonts.bodyMedium, fontSize: fontSize.base, color: colors.text, flex: 1 },
});
```
