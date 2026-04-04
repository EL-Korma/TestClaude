import React, { useRef, useEffect, useState } from "react";
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
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { MainTabsParamList } from "../../navigation/MainTabs";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, shadows, typography } from "../../../theme/tokens";

const { width } = Dimensions.get("window");
type Nav = BottomTabNavigationProp<MainTabsParamList, "Log">;

export const LogScreen = () => {
  const navigation = useNavigation<Nav>();
  const [snapped, setSnapped] = useState(false);

  // Animations
  const scanLineY = useRef(new Animated.Value(0)).current;
  const corner1 = useRef(new Animated.Value(0)).current;
  const silhouetteFloat = useRef(new Animated.Value(0)).current;
  const ayaPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Scanning line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineY, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Corner bracket pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(corner1, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(corner1, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Silhouette float
    Animated.loop(
      Animated.sequence([
        Animated.timing(silhouetteFloat, { toValue: -12, duration: 1500, useNativeDriver: true }),
        Animated.timing(silhouetteFloat, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Aya pending pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(ayaPulse, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(ayaPulse, { toValue: 0.9, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const scanLineTranslate = scanLineY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 260],
  });

  const cornerOpacity = corner1;

  if (snapped) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>SESSION LOGGED!</Text>
            <Text style={styles.successSub}>Waiting for Aya to complete her log...</Text>
            <View style={styles.duoStatusCard}>
              <View style={styles.duoRow}>
                <View style={styles.statusMember}>
                  <View style={[styles.statusAvatar, { borderColor: colors.success }]}>
                    <Text style={{ fontSize: 24 }}>🦁</Text>
                  </View>
                  <Text style={styles.statusName}>Karim</Text>
                  <Text style={styles.statusDone}>✓ Logged</Text>
                </View>
                <Text style={{ fontSize: 24 }}>🔥</Text>
                <Animated.View style={[styles.statusMember, { transform: [{ scale: ayaPulse }] }]}>
                  <View style={[styles.statusAvatar, { borderColor: colors.primary }]}>
                    <Text style={{ fontSize: 24 }}>🦋</Text>
                  </View>
                  <Text style={styles.statusName}>Aya</Text>
                  <Text style={styles.statusPending}>⏳ Pending</Text>
                </Animated.View>
              </View>
            </View>
            <Pressable
              style={styles.homeBtn}
              onPress={() => { setSnapped(false); navigation.navigate("Home"); }}
            >
              <Text style={styles.homeBtnText}>← BACK TO HOME</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.navigate("Home")}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>LOG SESSION</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Duo status row */}
        <View style={styles.duoStatusRow}>
          <View style={styles.duoMemberRow}>
            <View style={[styles.duoAvatar, { borderColor: colors.success }]}>
              <Text style={{ fontSize: 18 }}>🦁</Text>
            </View>
            <View>
              <Text style={styles.duoMemberName}>Karim</Text>
              <View style={styles.loggedBadge}>
                <Text style={styles.loggedBadgeText}>✓ LOGGED</Text>
              </View>
            </View>
          </View>

          <View style={styles.connectorDots}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.connectorDot, i < 3 && styles.connectorDotActive]} />
            ))}
          </View>

          <View style={styles.duoMemberRow}>
            <View>
              <Text style={[styles.duoMemberName, { textAlign: "right" }]}>Aya</Text>
              <Animated.View style={[styles.pendingBadge, { transform: [{ scale: ayaPulse }] }]}>
                <Text style={styles.pendingBadgeText}>⏳ PENDING</Text>
              </Animated.View>
            </View>
            <View style={[styles.duoAvatar, { borderColor: colors.primary }]}>
              <Text style={{ fontSize: 18 }}>🦋</Text>
            </View>
          </View>
        </View>

        {/* Viewfinder */}
        <View style={styles.viewfinder}>
          {/* Dark background */}
          <LinearGradient
            colors={["#0D0D0D", "#111111"]}
            style={styles.viewfinderBg}
          >
            {/* Corner brackets */}
            <Animated.View style={[styles.cornerTL, { opacity: cornerOpacity }]} />
            <Animated.View style={[styles.cornerTR, { opacity: cornerOpacity }]} />
            <Animated.View style={[styles.cornerBL, { opacity: cornerOpacity }]} />
            <Animated.View style={[styles.cornerBR, { opacity: cornerOpacity }]} />

            {/* Scanning line */}
            <Animated.View
              style={[styles.scanLine, { transform: [{ translateY: scanLineTranslate }] }]}
            />

            {/* Silhouette */}
            <Animated.View style={[styles.silhouette, { transform: [{ translateY: silhouetteFloat }] }]}>
              <Text style={styles.silhouetteEmoji}>🏋️</Text>
            </Animated.View>

            {/* Instruction label */}
            <View style={styles.instructionLabel}>
              <Text style={styles.instructionText}>MATCH THE POSE · STAY IN FRAME</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Tip card */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>Stand 1–2 meters back. Ensure your full body is visible in frame.</Text>
        </View>

        {/* Action row */}
        <View style={styles.actionRow}>
          {/* Gallery */}
          <Pressable style={styles.sideBtn}>
            <Text style={styles.sideBtnIcon}>🖼️</Text>
          </Pressable>

          {/* Snap button */}
          <Pressable style={styles.snapBtn} onPress={() => setSnapped(true)}>
            <LinearGradient
              colors={["#FF5E1A", "#FF7A3A"]}
              style={styles.snapBtnGradient}
            >
              <Text style={styles.snapBtnText}>📷 SNAP IT</Text>
            </LinearGradient>
          </Pressable>

          {/* Flip */}
          <Pressable style={styles.sideBtn}>
            <Text style={styles.sideBtnIcon}>🔄</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
};

const VIEWFINDER_H = 280;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  safeArea: { flex: 1 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  backIcon: { fontSize: 24, color: colors.textPrimary },
  headerTitle: { fontFamily: typography.displayFont, fontSize: 20, letterSpacing: 2, color: colors.textPrimary },

  // Duo status row
  duoStatusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  duoMemberRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  duoAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface1, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  duoMemberName: { fontFamily: typography.bodyMediumFont, fontSize: 13, color: colors.textPrimary },
  loggedBadge: { backgroundColor: colors.successDim, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2 },
  loggedBadgeText: { fontFamily: typography.displayFont, fontSize: 10, letterSpacing: 0.8, color: colors.success },
  pendingBadge: { backgroundColor: colors.primaryDim, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2 },
  pendingBadgeText: { fontFamily: typography.displayFont, fontSize: 10, letterSpacing: 0.8, color: colors.primary },
  connectorDots: { flexDirection: "row", gap: 4, alignItems: "center" },
  connectorDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.surface2 },
  connectorDotActive: { backgroundColor: colors.success },

  // Viewfinder
  viewfinder: { marginHorizontal: 20, borderRadius: radii.xl, overflow: "hidden", ...shadows.card },
  viewfinderBg: { height: VIEWFINDER_H, alignItems: "center", justifyContent: "center", position: "relative" },

  // Corner brackets
  cornerTL: { position: "absolute", top: 16, left: 16, width: 28, height: 28, borderTopWidth: 3, borderLeftWidth: 3, borderColor: colors.primary, borderTopLeftRadius: 6 },
  cornerTR: { position: "absolute", top: 16, right: 16, width: 28, height: 28, borderTopWidth: 3, borderRightWidth: 3, borderColor: colors.primary, borderTopRightRadius: 6 },
  cornerBL: { position: "absolute", bottom: 16, left: 16, width: 28, height: 28, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: colors.primary, borderBottomLeftRadius: 6 },
  cornerBR: { position: "absolute", bottom: 16, right: 16, width: 28, height: 28, borderBottomWidth: 3, borderRightWidth: 3, borderColor: colors.primary, borderBottomRightRadius: 6 },

  // Scan line
  scanLine: {
    position: "absolute",
    top: 20, left: 16, right: 16,
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.7,
    shadowColor: colors.primary,
    shadowRadius: 6,
    shadowOpacity: 0.8,
    elevation: 4,
  },

  silhouette: { alignItems: "center", justifyContent: "center" },
  silhouetteEmoji: { fontSize: 90, opacity: 0.6 },

  instructionLabel: { position: "absolute", bottom: 14, left: 0, right: 0, alignItems: "center" },
  instructionText: { fontFamily: typography.displayFont, fontSize: 13, letterSpacing: 1.5, color: colors.primary, opacity: 0.8 },

  // Tip card
  tipCard: {
    flexDirection: "row",
    backgroundColor: colors.surface0,
    marginHorizontal: 20,
    borderRadius: radii.md,
    padding: 12,
    marginTop: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.surface2,
    alignItems: "center",
  },
  tipIcon: { fontSize: 18 },
  tipText: { flex: 1, fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted, lineHeight: 18 },

  // Action row
  actionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 16 },
  sideBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.surface2, alignItems: "center", justifyContent: "center" },
  sideBtnIcon: { fontSize: 22 },
  snapBtn: { flex: 1, marginHorizontal: 16, borderRadius: radii.lg, overflow: "hidden", ...shadows.orangeGlow },
  snapBtnGradient: { height: 56, alignItems: "center", justifyContent: "center" },
  snapBtnText: { fontFamily: typography.displayFont, fontSize: 20, letterSpacing: 2, color: colors.textPrimary },

  // Success state
  successIcon: { fontSize: 64 },
  successTitle: { fontFamily: typography.displayFont, fontSize: 40, letterSpacing: 3, color: colors.textPrimary },
  successSub: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textMuted, textAlign: "center" },
  duoStatusCard: { width: "100%", backgroundColor: colors.surface0, borderRadius: radii.xl, padding: 20, borderWidth: 1, borderColor: colors.surface2 },
  duoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  statusMember: { alignItems: "center", gap: 6 },
  statusAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface1, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  statusName: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textPrimary },
  statusDone: { fontFamily: typography.displayFont, fontSize: 12, letterSpacing: 1, color: colors.success },
  statusPending: { fontFamily: typography.displayFont, fontSize: 12, letterSpacing: 1, color: colors.primary },
  homeBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: radii.lg, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.surface2 },
  homeBtnText: { fontFamily: typography.displayFont, fontSize: 16, letterSpacing: 1.5, color: colors.textPrimary },
});
