import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, typography } from "../../theme/tokens";

interface StreakLoseBannerProps {
  /** Current streak count */
  streakDays: number;
  /** Hours remaining until streak resets (0 = already lost) */
  hoursRemaining: number;
  /** Called when user taps "Log Now" */
  onLogNow?: () => void;
  /** Called when user dismisses the banner */
  onDismiss?: () => void;
}

export const StreakLoseBanner: React.FC<StreakLoseBannerProps> = ({
  streakDays,
  hoursRemaining,
  onLogNow,
  onDismiss,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideDown = useRef(new Animated.Value(-80)).current;

  const isLost = hoursRemaining <= 0;

  useEffect(() => {
    // Slide + fade in
    Animated.parallel([
      Animated.spring(slideDown, { toValue: 0, useNativeDriver: true, damping: 14, stiffness: 100 }),
      Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    // Shake on entry
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();

    // Continuous pulse on icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.85, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const borderColor = isLost ? "#EF4444" : hoursRemaining <= 3 ? "#EF4444" : "#FF5E1A";
  const gradColors: [string, string] = isLost
    ? ["#2A0808", "#1A0A0A"]
    : ["#2A1008", "#1A0E08"];

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: fadeIn,
          transform: [{ translateY: slideDown }, { translateX: shakeAnim }],
          borderColor,
        },
      ]}
    >
      <LinearGradient colors={gradColors} style={styles.inner}>
        <Animated.Text style={[styles.icon, { transform: [{ scale: pulseAnim }] }]}>
          {isLost ? "💔" : "⚠️"}
        </Animated.Text>

        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: borderColor }]}>
            {isLost ? "STREAK LOST" : "STREAK AT RISK!"}
          </Text>
          <Text style={styles.body}>
            {isLost
              ? `Your ${streakDays}-day streak just broke. Start fresh today!`
              : `Only ${hoursRemaining}h left to save your ${streakDays}-day streak!`}
          </Text>
        </View>

        <View style={styles.actions}>
          {!isLost && (
            <Pressable style={[styles.logBtn, { backgroundColor: borderColor }]} onPress={onLogNow}>
              <Text style={styles.logBtnText}>LOG NOW</Text>
            </Pressable>
          )}
          <Pressable style={styles.dismissBtn} onPress={onDismiss} hitSlop={10}>
            <Text style={styles.dismissText}>✕</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.xl,
    borderWidth: 1.5,
    marginBottom: 16,
    overflow: "hidden",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  icon: { fontSize: 28 },
  textBlock: { flex: 1 },
  title: {
    fontFamily: typography.displayFont,
    fontSize: 15,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  body: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  logBtn: {
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logBtnText: {
    fontFamily: typography.displayFont,
    fontSize: 12,
    letterSpacing: 1.5,
    color: "#FFFFFF",
  },
  dismissBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
