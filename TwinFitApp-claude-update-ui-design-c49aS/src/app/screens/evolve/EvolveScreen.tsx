import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, shadows, typography } from "../../../theme/tokens";
import { checkInsApi, streaksApi, StreakData } from "../../../services/api";
import { useAuth } from "../../../store/AuthStore";

const { width } = Dimensions.get("window");

const BRONZE_TARGET = 20;
const SILVER_TARGET = 40;

export const EvolveScreen = () => {
  const { token, user } = useAuth();
  const [sessions, setSessions] = useState(0);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const bronzeFloat = useRef(new Animated.Value(0)).current;
  const silverFloat = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [checkins, streakData] = await Promise.all([
        checkInsApi.mine().catch(() => []),
        streaksApi.me().catch(() => null),
      ]);
      setSessions(checkins.length);
      setStreak(streakData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    Animated.timing(progressAnim, { toValue: sessions / BRONZE_TARGET, duration: 1200, delay: 300, useNativeDriver: false }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bronzeFloat, { toValue: -8, duration: 1800, useNativeDriver: true }),
        Animated.timing(bronzeFloat, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(silverFloat, { toValue: -6, duration: 2200, useNativeDriver: true }),
        Animated.timing(silverFloat, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.7, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [sessions]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const bronzePct = Math.min(100, Math.round((sessions / BRONZE_TARGET) * 100));

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.screenTitle}>EVOLUTION</Text>
            <View style={styles.sessionBadge}>
              <Text style={styles.sessionBadgeText}>{sessions} sessions</Text>
            </View>
          </View>

          {/* ── Duo collectible card ─────────────────────────────── */}
          <LinearGradient
            colors={["#1A0E05", "#1C1C1C", "#0A0A0A"]}
            style={styles.collectibleCard}
          >
            <View style={styles.collectibleHeader}>
              <Text style={styles.collectibleEra}>🥉 BRONZE ERA</Text>
              <Text style={styles.collectibleSessions}>{sessions} sessions</Text>
            </View>

            <View style={styles.poseFramesRow}>
              <View style={styles.poseFrame}>
                <LinearGradient colors={["#2A1A0A", "#1C1008"]} style={styles.poseFrameInner}>
                  <Text style={{ fontSize: 52 }}>🦁</Text>
                  <View style={styles.poseFrameBronzeBorder} />
                </LinearGradient>
                <Text style={styles.poseFrameName}>{user?.name ?? "You"}</Text>
              </View>

              <View style={styles.poseVS}>
                <Animated.Text style={[styles.poseVSFlame, { opacity: glowAnim }]}>🔥</Animated.Text>
                <Text style={styles.poseVSLabel}>DUO</Text>
              </View>

              <View style={styles.poseFrame}>
                <LinearGradient colors={["#2A1A0A", "#1C1008"]} style={styles.poseFrameInner}>
                  <Text style={{ fontSize: 52 }}>🦋</Text>
                  <View style={styles.poseFrameBronzeBorder} />
                </LinearGradient>
                <Text style={styles.poseFrameName}>Aya</Text>
              </View>
            </View>
          </LinearGradient>

          {/* ── Evolution path ───────────────────────────────────── */}
          <Text style={styles.pathTitle}>YOUR EVOLUTION PATH</Text>

          <View style={styles.evolutionPath}>
            {/* Connecting line */}
            <View style={styles.pathLine} />

            {/* 🥉 Bronze — ACTIVE */}
            <View style={styles.pathNode}>
              <View style={styles.pathNodeLeft}>
                <Animated.View
                  style={[
                    styles.orbContainer,
                    styles.orbBronzeActive,
                    { transform: [{ translateY: bronzeFloat }] },
                  ]}
                >
                  <Animated.View style={[styles.orbGlow, { opacity: glowAnim }]} />
                  <Text style={styles.orbEmoji}>🥉</Text>
                </Animated.View>
              </View>

              <View style={styles.pathNodeRight}>
                <View style={styles.nodeActiveBadge}>
                  <Text style={styles.nodeActiveBadgeText}>ACTIVE</Text>
                </View>
                <Text style={styles.nodeName}>Bronze Era</Text>
                <Text style={styles.nodeDetail}>{sessions}/{BRONZE_TARGET} sessions</Text>
                <View style={styles.nodeProgressBar}>
                  <Animated.View style={[styles.nodeProgressFill, styles.nodeProgressBronze, { width: progressWidth as any }]} />
                </View>
                <Text style={styles.nodeProgressLabel}>{bronzePct}% complete</Text>
              </View>
            </View>

            {/* 🥈 Silver */}
            <View style={styles.pathNode}>
              <View style={styles.pathNodeLeft}>
                <Animated.View
                  style={[styles.orbContainer, styles.orbSilver, { transform: [{ translateY: silverFloat }] }]}
                >
                  <Text style={styles.orbEmoji}>🥈</Text>
                </Animated.View>
              </View>
              <View style={styles.pathNodeRight}>
                <Text style={styles.nodeName}>Silver Era</Text>
                <Text style={styles.nodeDetail}>{Math.max(0, SILVER_TARGET - sessions)} sessions away</Text>
                <View style={styles.nodeProgressBar}>
                  <View style={[styles.nodeProgressFill, styles.nodeProgressSilver, { width: `${Math.min(100, Math.round((sessions / SILVER_TARGET) * 100))}%` as any }]} />
                </View>
                <Text style={styles.nodeProgressLabel}>{Math.min(100, Math.round((sessions / SILVER_TARGET) * 100))}% complete</Text>
              </View>
            </View>

            {/* 🥇 Gold — locked */}
            <View style={styles.pathNode}>
              <View style={styles.pathNodeLeft}>
                <View style={[styles.orbContainer, styles.orbLocked]}>
                  <Text style={[styles.orbEmoji, { opacity: 0.3 }]}>🥇</Text>
                  <View style={styles.orbLockBadge}>
                    <Text style={{ fontSize: 10 }}>🔒</Text>
                  </View>
                </View>
              </View>
              <View style={styles.pathNodeRight}>
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedBadgeText}>LOCKED</Text>
                </View>
                <Text style={[styles.nodeName, { opacity: 0.4 }]}>Gold Era</Text>
                <Text style={[styles.nodeDetail, { opacity: 0.4 }]}>Coming later</Text>
              </View>
            </View>

            {/* 💎 Diamond — locked */}
            <View style={styles.pathNode}>
              <View style={styles.pathNodeLeft}>
                <View style={[styles.orbContainer, styles.orbLocked]}>
                  <Text style={[styles.orbEmoji, { opacity: 0.25 }]}>💎</Text>
                  <View style={styles.orbLockBadge}>
                    <Text style={{ fontSize: 10 }}>🔒</Text>
                  </View>
                </View>
              </View>
              <View style={styles.pathNodeRight}>
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedBadgeText}>LOCKED</Text>
                </View>
                <Text style={[styles.nodeName, { opacity: 0.3 }]}>Diamond Era</Text>
                <Text style={[styles.nodeDetail, { opacity: 0.3 }]}>Coming later</Text>
              </View>
            </View>
          </View>

          {/* Streak stats */}
          {streak && (
            <View style={styles.streakRow}>
              <View style={styles.streakItem}>
                <Text style={styles.streakValue}>{streak.current}🔥</Text>
                <Text style={styles.streakLabel}>Current streak</Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakItem}>
                <Text style={styles.streakValue}>{streak.longest}</Text>
                <Text style={styles.streakLabel}>Best streak</Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakItem}>
                <Text style={styles.streakValue}>{streak.weeklyCount}</Text>
                <Text style={styles.streakLabel}>This week</Text>
              </View>
            </View>
          )}

          {/* Motivation footer */}
          <View style={styles.motivationCard}>
            <Text style={styles.motivationEmoji}>💪</Text>
            <View>
              <Text style={styles.motivationTitle}>Keep pushing!</Text>
              <Text style={styles.motivationText}>
                {Math.max(0, BRONZE_TARGET - sessions)} more sessions to reach Silver Era
              </Text>
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
  scroll: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  screenTitle: { fontFamily: typography.displayFont, fontSize: 36, letterSpacing: 3, color: colors.textPrimary },
  sessionBadge: { backgroundColor: colors.primaryDim, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: colors.primary },
  sessionBadgeText: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.primary },

  // Collectible card
  collectibleCard: { borderRadius: radii.xl, padding: 20, marginBottom: 28, borderWidth: 1, borderColor: "rgba(205,127,50,0.3)", ...shadows.card },
  collectibleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  collectibleEra: { fontFamily: typography.displayFont, fontSize: 20, letterSpacing: 1.5, color: "#CD7F32" },
  collectibleSessions: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted },
  poseFramesRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  poseFrame: { alignItems: "center", gap: 10 },
  poseFrameInner: {
    width: 110, height: 130, borderRadius: radii.xl,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(205,127,50,0.5)",
    position: "relative", overflow: "hidden",
  },
  poseFrameBronzeBorder: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radii.xl, borderWidth: 2, borderColor: "rgba(205,127,50,0.3)",
  },
  poseFrameName: { fontFamily: typography.displayFont, fontSize: 16, letterSpacing: 1, color: colors.textPrimary },
  poseVS: { alignItems: "center", gap: 4 },
  poseVSFlame: { fontSize: 32 },
  poseVSLabel: { fontFamily: typography.displayFont, fontSize: 12, letterSpacing: 2, color: colors.textMuted },

  // Path
  pathTitle: { fontFamily: typography.displayFont, fontSize: 16, letterSpacing: 2, color: colors.textMuted, marginBottom: 20 },
  evolutionPath: { position: "relative" },
  pathLine: { position: "absolute", left: 31, top: 40, bottom: 40, width: 2, backgroundColor: colors.surface2 },

  pathNode: { flexDirection: "row", gap: 16, marginBottom: 28, alignItems: "flex-start" },
  pathNodeLeft: { width: 64, alignItems: "center" },
  pathNodeRight: { flex: 1, paddingTop: 6, gap: 4 },

  // Orbs
  orbContainer: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  orbBronzeActive: {
    backgroundColor: "rgba(205,127,50,0.15)",
    borderWidth: 2, borderColor: "#CD7F32",
    shadowColor: "#CD7F32", shadowRadius: 12, shadowOpacity: 0.5, elevation: 6,
  },
  orbGlow: {
    position: "absolute", top: -8, left: -8, right: -8, bottom: -8,
    borderRadius: 40, backgroundColor: "#CD7F32",
  },
  orbEmoji: { fontSize: 30 },
  orbSilver: {
    backgroundColor: "rgba(192,192,192,0.08)",
    borderWidth: 2, borderColor: "#C0C0C0",
  },
  orbLocked: {
    backgroundColor: colors.surface1,
    borderWidth: 1, borderColor: colors.surface2,
    opacity: 0.5,
  },
  orbLockBadge: {
    position: "absolute", bottom: -4, right: -4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center",
  },

  // Node info
  nodeActiveBadge: { backgroundColor: colors.primaryDim, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 2 },
  nodeActiveBadgeText: { fontFamily: typography.displayFont, fontSize: 11, letterSpacing: 1, color: colors.primary },
  lockedBadge: { backgroundColor: colors.surface1, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 2 },
  lockedBadgeText: { fontFamily: typography.displayFont, fontSize: 11, letterSpacing: 1, color: colors.textDim },
  nodeName: { fontFamily: typography.displayFont, fontSize: 20, letterSpacing: 1, color: colors.textPrimary },
  nodeDetail: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted },
  nodeProgressBar: { height: 6, backgroundColor: colors.surface2, borderRadius: 3, marginTop: 6, overflow: "hidden" },
  nodeProgressFill: { height: 6, borderRadius: 3 },
  nodeProgressBronze: { backgroundColor: "#CD7F32" },
  nodeProgressSilver: { backgroundColor: "#C0C0C0" },
  nodeProgressLabel: { fontFamily: typography.bodyFont, fontSize: 11, color: colors.textDim },

  // Streak stats
  streakRow: {
    flexDirection: "row",
    backgroundColor: colors.surface0,
    borderRadius: radii.xl,
    padding: 18,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.surface2,
    justifyContent: "space-around",
  },
  streakItem: { alignItems: "center", flex: 1 },
  streakValue: {
    fontFamily: typography.displayFont,
    fontSize: 22,
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  streakLabel: {
    fontFamily: typography.bodyFont,
    fontSize: 11,
    color: colors.textDim,
    marginTop: 2,
  },
  streakDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.06)" },

  // Motivation
  motivationCard: {
    flexDirection: "row",
    backgroundColor: colors.surface0,
    borderRadius: radii.xl,
    padding: 18,
    gap: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surface2,
    marginTop: 8,
  },
  motivationEmoji: { fontSize: 32 },
  motivationTitle: { fontFamily: typography.displayFont, fontSize: 18, letterSpacing: 1, color: colors.textPrimary },
  motivationText: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted },
});
