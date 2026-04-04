import React, { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { colors, radii, shadows, typography } from "../../theme/tokens";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
type Nav = NativeStackNavigationProp<RootStackParamList, "ModeSelect">;

type Mode = "couple" | "besties" | null;

export const ModeSelectScreen = () => {
  const navigation = useNavigation<Nav>();
  const [selectedMode, setSelectedMode] = useState<Mode>(null);
  const logoRotation = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const logoSpin = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleSelect = (mode: Mode) => {
    setSelectedMode(mode);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Rotating logo mark */}
          <View style={styles.logoContainer}>
            <Animated.View style={[styles.spinRing, { transform: [{ rotate: logoSpin }] }]}>
              {Array.from({ length: 12 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.ringDot,
                    { transform: [{ rotate: `${i * 30}deg` }, { translateX: 55 }] },
                  ]}
                />
              ))}
            </Animated.View>
            <View style={styles.logoMark}>
              <Text style={{ fontSize: 36 }}>🔥</Text>
            </View>
          </View>

          <Text style={styles.headline}>CHOOSE YOUR MODE</Text>
          <Text style={styles.subtitle}>How you train together defines how you grow.</Text>

          {/* Mode cards */}
          <View style={styles.cardsRow}>
            {/* Couple Mode */}
            <Pressable
              style={{ flex: 1 }}
              onPress={() => handleSelect("couple")}
            >
              <View
                style={[
                  styles.modeCard,
                  selectedMode === "couple" && styles.modeCardActive,
                ]}
              >
                {selectedMode === "couple" && (
                  <View style={styles.activeGlow} />
                )}
                <Text style={styles.modeEmoji}>❤️</Text>
                <Text style={styles.modeTitle}>COUPLE{"\n"}MODE</Text>
                <Text style={styles.modeDesc}>
                  Train as partners. Celebrate milestones together.
                </Text>
                {selectedMode === "couple" && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>SELECTED</Text>
                  </View>
                )}
              </View>
            </Pressable>

            {/* Besties Mode */}
            <Pressable
              style={{ flex: 1 }}
              onPress={() => handleSelect("besties")}
            >
              <View
                style={[
                  styles.modeCard,
                  selectedMode === "besties" && styles.modeCardActive,
                ]}
              >
                {selectedMode === "besties" && (
                  <View style={styles.activeGlow} />
                )}
                <Text style={styles.modeEmoji}>🤝</Text>
                <Text style={styles.modeTitle}>BESTIES{"\n"}MODE</Text>
                <Text style={styles.modeDesc}>
                  Hold each other accountable. Friendly rivalry.
                </Text>
                {selectedMode === "besties" && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>SELECTED</Text>
                  </View>
                )}
              </View>
            </Pressable>
          </View>

          {/* CTA */}
          <Pressable
            style={[styles.ctaBtn, !selectedMode && styles.ctaBtnDisabled]}
            onPress={() => selectedMode && navigation.navigate("Main")}
          >
            <LinearGradient
              colors={selectedMode ? ["#FF5E1A", "#FF7A3A"] : [colors.surface2, colors.surface2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtnGradient}
            >
              <Text style={[styles.ctaBtnText, !selectedMode && styles.ctaBtnTextDisabled]}>
                START TOGETHER
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  spinRing: {
    position: "absolute",
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
  },
  ringDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    opacity: 0.7,
  },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowRadius: 16,
    shadowOpacity: 0.5,
    elevation: 10,
  },
  headline: {
    fontFamily: typography.displayFont,
    fontSize: 40,
    letterSpacing: 3,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 36,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 14,
    width: "100%",
    marginBottom: 32,
  },
  modeCard: {
    backgroundColor: colors.surface0,
    borderRadius: radii.xl,
    padding: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.surface2,
    gap: 10,
    overflow: "hidden",
    minHeight: 180,
    justifyContent: "center",
  },
  modeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface1,
  },
  activeGlow: {
    position: "absolute",
    top: -30,
    left: -30,
    right: -30,
    bottom: -30,
    backgroundColor: colors.primary,
    opacity: 0.06,
    borderRadius: radii.xl,
  },
  modeEmoji: {
    fontSize: 36,
  },
  modeTitle: {
    fontFamily: typography.displayFont,
    fontSize: 22,
    letterSpacing: 1.5,
    color: colors.textPrimary,
    textAlign: "center",
    lineHeight: 24,
  },
  modeDesc: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  selectedBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
  },
  selectedBadgeText: {
    fontFamily: typography.displayFont,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  ctaBtn: {
    width: "100%",
    borderRadius: radii.lg,
    overflow: "hidden",
    ...shadows.orangeGlow,
  },
  ctaBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaBtnGradient: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaBtnText: {
    fontFamily: typography.displayFont,
    fontSize: 22,
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  ctaBtnTextDisabled: {
    color: colors.textDim,
  },
});
