import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { colors, typography, radii, shadows } from "../../theme/tokens";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

type Nav = NativeStackNavigationProp<RootStackParamList, "Splash">;

export const SplashScreen = () => {
  const navigation = useNavigation<Nav>();

  // Animation refs
  const ring1Rotation = useRef(new Animated.Value(0)).current;
  const ring2Rotation = useRef(new Animated.Value(0)).current;
  const flameScale = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(30)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(20)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 700, delay: 200, useNativeDriver: true }),
      Animated.timing(logoTranslateY, { toValue: 0, duration: 700, delay: 200, useNativeDriver: true }),
      Animated.timing(buttonsOpacity, { toValue: 1, duration: 600, delay: 800, useNativeDriver: true }),
      Animated.timing(buttonsTranslateY, { toValue: 0, duration: 600, delay: 800, useNativeDriver: true }),
    ]).start();

    // Ring rotations
    Animated.loop(
      Animated.timing(ring1Rotation, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(ring2Rotation, {
        toValue: -1,
        duration: 12000,
        useNativeDriver: true,
      })
    ).start();

    // Flame pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameScale, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(flameScale, { toValue: 0.9, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.55, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.25, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const ring1Spin = ring1Rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const ring2Spin = ring2Rotation.interpolate({
    inputRange: [-1, 0],
    outputRange: ["-360deg", "0deg"],
  });

  return (
    <View style={styles.container}>
      {/* Ambient orange glow */}
      <Animated.View style={[styles.ambientGlow, { opacity: glowOpacity }]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo area with rotating rings */}
          <Animated.View
            style={[
              styles.logoArea,
              { opacity: logoOpacity, transform: [{ translateY: logoTranslateY }] },
            ]}
          >
            {/* Outer dashed ring */}
            <Animated.View
              style={[styles.ring1, { transform: [{ rotate: ring1Spin }] }]}
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.ringDash,
                    {
                      transform: [
                        { rotate: `${i * 18}deg` },
                        { translateX: 110 },
                      ],
                    },
                  ]}
                />
              ))}
            </Animated.View>

            {/* Inner dashed ring */}
            <Animated.View
              style={[styles.ring2, { transform: [{ rotate: ring2Spin }] }]}
            >
              {Array.from({ length: 14 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.ringDashInner,
                    {
                      transform: [
                        { rotate: `${i * 25.7}deg` },
                        { translateX: 78 },
                      ],
                    },
                  ]}
                />
              ))}
            </Animated.View>

            {/* Logo core */}
            <View style={styles.logoCore}>
              {/* Twin fitness silhouette */}
              <View style={styles.figuresRow}>
                <Text style={styles.figureEmoji}>🏋️</Text>
                <Animated.Text
                  style={[styles.flameEmoji, { transform: [{ scale: flameScale }] }]}
                >
                  🔥
                </Animated.Text>
                <Text style={styles.figureEmoji}>🤸</Text>
              </View>
            </View>
          </Animated.View>

          {/* Brand text */}
          <Animated.View
            style={[
              styles.brandArea,
              { opacity: logoOpacity, transform: [{ translateY: logoTranslateY }] },
            ]}
          >
            <LinearGradient
              colors={["#FF5E1A", "#FF8C42", "#FF5E1A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.brandGradient}
            >
              <Text style={styles.brandText}>TWINFIT</Text>
            </LinearGradient>
            <Text style={styles.tagline}>Train Together · Evolve Together</Text>
          </Animated.View>

          {/* CTA Buttons */}
          <Animated.View
            style={[
              styles.buttonsArea,
              { opacity: buttonsOpacity, transform: [{ translateY: buttonsTranslateY }] },
            ]}
          >
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
              onPress={() => navigation.navigate("Auth", { screen: "SignUp" } as any)}
            >
              <LinearGradient
                colors={["#FF5E1A", "#FF7A3A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGradient}
              >
                <Text style={styles.primaryBtnText}>GET STARTED</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.7 }]}
              onPress={() => navigation.navigate("Auth", { screen: "SignIn" } as any)}
            >
              <Text style={styles.ghostBtnText}>I HAVE AN ACCOUNT</Text>
            </Pressable>
          </Animated.View>
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
  ambientGlow: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    backgroundColor: colors.primary,
    top: height * 0.05,
    left: -width * 0.1,
    opacity: 0.3,
    // Simulate radial blur with large radius
    shadowColor: colors.primary,
    shadowRadius: 120,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  logoArea: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  ring1: {
    position: "absolute",
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  ring2: {
    position: "absolute",
    width: 170,
    height: 170,
    alignItems: "center",
    justifyContent: "center",
  },
  ringDash: {
    position: "absolute",
    width: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
    opacity: 0.6,
  },
  ringDashInner: {
    position: "absolute",
    width: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
    opacity: 0.4,
  },
  logoCore: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowRadius: 20,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  figuresRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  figureEmoji: {
    fontSize: 28,
  },
  flameEmoji: {
    fontSize: 32,
  },
  brandArea: {
    alignItems: "center",
    marginBottom: 16,
  },
  brandGradient: {
    borderRadius: 4,
  },
  brandText: {
    fontFamily: typography.displayFont,
    fontSize: 72,
    letterSpacing: 6,
    color: colors.textPrimary,
    paddingHorizontal: 8,
  },
  tagline: {
    fontFamily: typography.bodyFont,
    fontSize: 15,
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginTop: 6,
    textAlign: "center",
  },
  buttonsArea: {
    width: "100%",
    gap: 14,
    marginTop: 32,
  },
  primaryBtn: {
    borderRadius: radii.lg,
    overflow: "hidden",
    ...shadows.orangeGlow,
  },
  primaryBtnGradient: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontFamily: typography.displayFont,
    fontSize: 22,
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  ghostBtn: {
    height: 56,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.textDim,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostBtnText: {
    fontFamily: typography.displayFont,
    fontSize: 20,
    letterSpacing: 1.5,
    color: colors.textMuted,
  },
});
