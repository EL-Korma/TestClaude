import React, { useRef, useEffect, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import { colors, radii, shadows, typography } from "../../../theme/tokens";
import { useDumbbells, SHOP_BORDERS } from "../../../store/DumbbellStore";
import { Counter, DumbbellIcon } from "../../../components";
import { useAuth } from "../../../store/AuthStore";
import { streaksApi, type StreakData } from "../../../services/api";

type Nav = NativeStackNavigationProp<RootStackParamList>;


export const ProfileScreen = () => {
  const navigation = useNavigation<Nav>();
  const { state, isBoostActive } = useDumbbells();
  const { user, token } = useAuth();
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const boostPulse = useRef(new Animated.Value(1)).current;
  const [streak, setStreak] = useState<StreakData | null>(null);

  useEffect(() => {
    if (token) streaksApi.me().then((s) => { if (s) setStreak(s); }).catch(() => {});
  }, [token]);

  const displayName = user ? `${user.name} ${user.surname}` : "Athlete";
  const xp = state.xp;
  const xpNext = Math.max(1000, Math.ceil((xp + 1) / 1000) * 1000);
  const questsDone = state.quests.filter((q) => q.completed).length;
  const statItems = [
    { label: "Sessions", value: streak?.weeklyCount ?? 0, icon: "💪" },
    { label: "Streak", value: streak?.current ?? 0, icon: "🔥" },
    { label: "Quests Done", value: questsDone, icon: "⚔️" },
  ];

  const activeBorder = SHOP_BORDERS.find((b) => b.code === state.activeBorder);
  const borderColor = activeBorder?.color ?? colors.surface2;

  const boostActive = isBoostActive();
  const timeLeft = state.xpBoostExpiresAt
    ? Math.max(0, Math.round((state.xpBoostExpiresAt - Date.now()) / 3600000))
    : 0;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.8, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.2, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    if (boostActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(boostPulse, { toValue: 1.12, duration: 600, useNativeDriver: true }),
          Animated.timing(boostPulse, { toValue: 0.92, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [boostActive]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Header ──────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.screenTitle}>PROFILE</Text>
            <Pressable
              style={styles.settingsBtn}
              onPress={() => navigation.navigate("Settings")}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </Pressable>
          </View>

          {/* ── Avatar card ─────────────────────────────────────── */}
          <LinearGradient colors={["#1C1008", "#141414"]} style={styles.avatarCard}>
            {/* Glow behind avatar */}
            <Animated.View style={[styles.avatarGlow, { opacity: glowAnim, backgroundColor: borderColor === "transparent" ? colors.primary : borderColor }]} />

            <View style={[styles.avatarRing, { borderColor: borderColor === "transparent" ? colors.surface2 : borderColor, shadowColor: borderColor }]}>
              <Text style={styles.avatarEmoji}>🦁</Text>
            </View>

            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.bio}>@{user?.username ?? "athlete"}</Text>

            {activeBorder && activeBorder.code !== "br0" && (
              <View style={[styles.borderBadge, { borderColor: borderColor }]}>
                <Text style={[styles.borderBadgeText, { color: borderColor }]}>{activeBorder.label} border</Text>
              </View>
            )}

            {/* XP bar */}
            <View style={styles.xpSection}>
              <View style={styles.xpLabelRow}>
                <Text style={styles.xpLabel}>XP {xp.toLocaleString()} / {xpNext.toLocaleString()}</Text>
                {boostActive && (
                  <Animated.View style={[styles.boostBadge, { transform: [{ scale: boostPulse }] }]}>
                    <Text style={styles.boostBadgeText}>⚡ {state.xpMultiplier}× BOOST {timeLeft}h</Text>
                  </Animated.View>
                )}
              </View>
              <View style={styles.xpTrack}>
                <View style={[styles.xpFill, { width: `${Math.round((xp % xpNext) / xpNext * 100)}%` as any }]} />
              </View>
            </View>
          </LinearGradient>

          {/* ── Dumbbell balance ────────────────────────────────── */}
          <Pressable onPress={() => navigation.navigate("Shop")} style={styles.balanceCard}>
            <LinearGradient colors={["#1C1008", "#0A0A0A"]} style={styles.balanceInner}>
              <DumbbellIcon size={32} glow pulse />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.balanceLabel}>DUMBBELL BALANCE</Text>
                <Counter value={state.balance} fontSize={36} color={colors.primary} fontFamily={typography.displayFont} />
                <Text style={styles.balanceSub}>Total earned: {state.totalEarned} 🏋️</Text>
              </View>
              <View style={styles.shopArrow}>
                <Text style={styles.shopArrowText}>SHOP →</Text>
              </View>
            </LinearGradient>
          </Pressable>

          {/* ── Stats row ───────────────────────────────────────── */}
          <View style={styles.statsRow}>
            {statItems.map((item, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statIcon}>{item.icon}</Text>
                <Counter value={item.value} fontSize={28} color={colors.primary} fontFamily={typography.displayFont} />
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Quick actions ────────────────────────────────────── */}
          <View style={styles.actionsGrid}>
            <Pressable style={styles.actionBtn} onPress={() => navigation.navigate("Quests")}>
              <LinearGradient colors={["#1C1008", "#141414"]} style={styles.actionInner}>
                <Text style={styles.actionIcon}>⚔️</Text>
                <Text style={styles.actionLabel}>QUESTS</Text>
                <Text style={styles.actionSub}>Earn 🏋️</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={() => navigation.navigate("Shop")}>
              <LinearGradient colors={["#1C1008", "#141414"]} style={styles.actionInner}>
                <Text style={styles.actionIcon}>🏪</Text>
                <Text style={styles.actionLabel}>SHOP</Text>
                <Text style={styles.actionSub}>Spend 🏋️</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={() => navigation.navigate("Settings")}>
              <LinearGradient colors={["#1C1808", "#141414"]} style={styles.actionInner}>
                <Text style={styles.actionIcon}>⚙️</Text>
                <Text style={styles.actionLabel}>SETTINGS</Text>
                <Text style={styles.actionSub}>Preferences</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={() => navigation.navigate("ProfileSettings")}>
              <LinearGradient colors={["#141414", "#1C1C1C"]} style={styles.actionInner}>
                <Text style={styles.actionIcon}>✏️</Text>
                <Text style={styles.actionLabel}>EDIT</Text>
                <Text style={styles.actionSub}>Profile</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* ── Partner card ─────────────────────────────────────── */}
          <View style={styles.partnerCard}>
            <Text style={styles.partnerTitle}>DUO PARTNER</Text>
            <View style={styles.partnerRow}>
              <View style={styles.partnerAvatar}>
                <Text style={{ fontSize: 28 }}>🦋</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.partnerName}>Aya</Text>
                <Text style={styles.partnerSub}>🔥 14-day streak together</Text>
              </View>
              <View style={styles.partnerStatusBadge}>
                <Text style={styles.partnerStatusText}>ACTIVE</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12, gap: 16 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  screenTitle: { fontFamily: typography.displayFont, fontSize: 32, letterSpacing: 3, color: colors.textPrimary },
  settingsBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface1, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.surface2 },
  settingsIcon: { fontSize: 20 },

  // Avatar card
  avatarCard: { borderRadius: radii.xl, padding: 24, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,94,26,0.2)", ...shadows.card, position: "relative", overflow: "hidden" },
  avatarGlow: { position: "absolute", width: 160, height: 160, borderRadius: 80, top: -30 },
  avatarRing: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface1, shadowOpacity: 0.6, shadowRadius: 16, elevation: 12 },
  avatarEmoji: { fontSize: 50 },
  displayName: { fontFamily: typography.displayFont, fontSize: 28, letterSpacing: 2, color: colors.textPrimary },
  bio: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted },
  borderBadge: { borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1 },
  borderBadgeText: { fontFamily: typography.displayFont, fontSize: 11, letterSpacing: 1 },

  xpSection: { width: "100%", gap: 6, marginTop: 8 },
  xpLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  xpLabel: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted },
  xpTrack: { height: 6, backgroundColor: colors.surface2, borderRadius: 3, overflow: "hidden" },
  xpFill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
  boostBadge: { backgroundColor: "rgba(59,130,246,0.2)", borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(59,130,246,0.5)" },
  boostBadgeText: { fontFamily: typography.displayFont, fontSize: 10, letterSpacing: 1, color: colors.info },

  // Balance
  balanceCard: { borderRadius: radii.xl, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,94,26,0.35)", ...shadows.orangeGlow },
  balanceInner: { flexDirection: "row", alignItems: "center", padding: 18, gap: 14 },
  balanceLabel: { fontFamily: typography.displayFont, fontSize: 11, letterSpacing: 2, color: colors.textMuted, marginBottom: 2 },
  balanceSub: { fontFamily: typography.bodyFont, fontSize: 11, color: colors.textDim, marginTop: 4 },
  shopArrow: { backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 8 },
  shopArrowText: { fontFamily: typography.displayFont, fontSize: 11, letterSpacing: 1, color: "#FFF" },

  // Stats
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: colors.surface0, borderRadius: radii.xl, padding: 14, alignItems: "center", gap: 4, borderWidth: 1, borderColor: colors.surface2, ...shadows.card },
  statIcon: { fontSize: 20 },
  statLabel: { fontFamily: typography.bodyFont, fontSize: 11, color: colors.textMuted },

  // Actions grid
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionBtn: { width: "47%", borderRadius: radii.xl, overflow: "hidden", borderWidth: 1, borderColor: colors.surface2, ...shadows.card },
  actionInner: { padding: 16, gap: 4 },
  actionIcon: { fontSize: 26 },
  actionLabel: { fontFamily: typography.displayFont, fontSize: 16, letterSpacing: 1.5, color: colors.textPrimary },
  actionSub: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted },

  // Partner
  partnerCard: { backgroundColor: colors.surface0, borderRadius: radii.xl, padding: 16, borderWidth: 1, borderColor: colors.surface2, gap: 12, ...shadows.card },
  partnerTitle: { fontFamily: typography.displayFont, fontSize: 13, letterSpacing: 2, color: colors.textDim },
  partnerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  partnerAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surface1, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.primary },
  partnerName: { fontFamily: typography.displayFont, fontSize: 20, letterSpacing: 1, color: colors.textPrimary },
  partnerSub: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  partnerStatusBadge: { backgroundColor: "rgba(34,197,94,0.15)", borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(34,197,94,0.4)" },
  partnerStatusText: { fontFamily: typography.displayFont, fontSize: 11, letterSpacing: 1, color: colors.success },
});
