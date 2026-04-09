import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, shadows, typography } from "../../../theme/tokens";
import { checkInsApi, streaksApi, groupsApi, StreakData, GroupMember } from "../../../services/api";
import { useAuth } from "../../../store/AuthStore";

// Tier thresholds (total sessions)
const TIERS = [
  { key: "bronze",    label: "Bronze Era",    emoji: "🥉", min: 0,   max: 19,  color: "#CD7F32", dimColor: "rgba(205,127,50,0.15)" },
  { key: "silver",    label: "Silver Era",    emoji: "🥈", min: 20,  max: 49,  color: "#C0C0C0", dimColor: "rgba(192,192,192,0.08)" },
  { key: "gold",      label: "Gold Era",      emoji: "🥇", min: 50,  max: 99,  color: "#FFD700", dimColor: "rgba(255,215,0,0.08)" },
  { key: "platinum",  label: "Platinum Era",  emoji: "💎", min: 100, max: 199, color: "#E5E4E2", dimColor: "rgba(229,228,226,0.08)" },
  { key: "legendary", label: "Legendary Era", emoji: "👑", min: 200, max: 999, color: "#FF5E1A", dimColor: "rgba(255,94,26,0.1)" },
] as const;

function getCurrentTier(sessions: number) {
  return TIERS.findIndex((t) => sessions >= t.min && sessions <= t.max);
}

export const EvolveScreen = () => {
  const { token, user } = useAuth();
  const [sessions, setSessions] = useState(0);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [partner, setPartner] = useState<{ name: string; emoji: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const bronzeFloat = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [checkins, streakData, groups] = await Promise.all([
        checkInsApi.mine().catch(() => []),
        streaksApi.me().catch(() => null),
        groupsApi.mine().catch(() => []),
      ]);
      setSessions(checkins.length);
      setStreak(streakData);

      // Find active partner
      const activeGroup = groups.find((g) => g.members.filter((m) => m.status !== "LEFT").length >= 2);
      if (activeGroup) {
        const partnerMember = activeGroup.members.find(
          (m: GroupMember) => m.userId !== user?.id && m.status !== "LEFT"
        );
        if (partnerMember) {
          setPartner({
            name: partnerMember.user.name,
            emoji: partnerMember.user.profile?.avatarEmoji ?? "🦋",
          });
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const activeTierIndex = getCurrentTier(sessions);
  const activeTier = TIERS[activeTierIndex];
  const nextTier = TIERS[activeTierIndex + 1] ?? null;

  useEffect(() => {
    const tierProgress = activeTier
      ? (sessions - activeTier.min) / (activeTier.max - activeTier.min + 1)
      : 1;
    Animated.timing(progressAnim, { toValue: Math.min(1, tierProgress), duration: 1200, delay: 300, useNativeDriver: false }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bronzeFloat, { toValue: -8, duration: 1800, useNativeDriver: true }),
        Animated.timing(bronzeFloat, { toValue: 0, duration: 1800, useNativeDriver: true }),
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

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const activeTierColor = activeTier?.color ?? "#CD7F32";
  const activeTierPct = activeTier
    ? Math.min(100, Math.round(((sessions - activeTier.min) / (activeTier.max - activeTier.min + 1)) * 100))
    : 100;

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

          {/* Duo collectible card */}
          <LinearGradient
            colors={["#1A0E05", "#1C1C1C", "#0A0A0A"]}
            style={[styles.collectibleCard, { borderColor: `${activeTierColor}44` }]}
          >
            <View style={styles.collectibleHeader}>
              <Text style={[styles.collectibleEra, { color: activeTierColor }]}>
                {activeTier?.emoji} {activeTier?.label.toUpperCase() ?? "BRONZE ERA"}
              </Text>
              <Text style={styles.collectibleSessions}>{sessions} sessions</Text>
            </View>

            <View style={styles.poseFramesRow}>
              <View style={styles.poseFrame}>
                <LinearGradient colors={["#2A1A0A", "#1C1008"]} style={[styles.poseFrameInner, { borderColor: `${activeTierColor}80` }]}>
                  <Text style={{ fontSize: 52 }}>{user?.profile?.avatarEmoji ?? "🦁"}</Text>
                </LinearGradient>
                <Text style={styles.poseFrameName}>{user?.name ?? "You"}</Text>
              </View>

              <View style={styles.poseVS}>
                <Animated.Text style={[styles.poseVSFlame, { opacity: glowAnim }]}>🔥</Animated.Text>
                <Text style={styles.poseVSLabel}>DUO</Text>
              </View>

              <View style={styles.poseFrame}>
                <LinearGradient colors={["#2A1A0A", "#1C1008"]} style={[styles.poseFrameInner, { borderColor: `${activeTierColor}80` }]}>
                  <Text style={{ fontSize: 52 }}>{partner?.emoji ?? "🦋"}</Text>
                </LinearGradient>
                <Text style={styles.poseFrameName}>{partner?.name ?? "No partner"}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Evolution path */}
          <Text style={styles.pathTitle}>YOUR EVOLUTION PATH</Text>

          <View style={styles.evolutionPath}>
            <View style={styles.pathLine} />

            {TIERS.map((tier, i) => {
              const isActive = i === activeTierIndex;
              const isUnlocked = i < activeTierIndex;
              const isLocked = i > activeTierIndex;
              const tierPct = isUnlocked ? 100 : isActive
                ? Math.min(100, Math.round(((sessions - tier.min) / (tier.max - tier.min + 1)) * 100))
                : 0;

              return (
                <View key={tier.key} style={styles.pathNode}>
                  <View style={styles.pathNodeLeft}>
                    <Animated.View
                      style={[
                        styles.orbContainer,
                        isActive && { backgroundColor: tier.dimColor, borderWidth: 2, borderColor: tier.color, shadowColor: tier.color, shadowRadius: 12, shadowOpacity: 0.5, elevation: 6 },
                        isUnlocked && { backgroundColor: tier.dimColor, borderWidth: 2, borderColor: tier.color, opacity: 0.8 },
                        isLocked && styles.orbLocked,
                        isActive && { transform: [{ translateY: bronzeFloat }] },
                      ]}
                    >
                      {isActive && (
                        <Animated.View style={[styles.orbGlow, { opacity: glowAnim, backgroundColor: tier.color }]} />
                      )}
                      <Text style={[styles.orbEmoji, isLocked && { opacity: 0.3 }]}>{tier.emoji}</Text>
                      {isLocked && (
                        <View style={styles.orbLockBadge}>
                          <Text style={{ fontSize: 10 }}>🔒</Text>
                        </View>
                      )}
                    </Animated.View>
                  </View>

                  <View style={styles.pathNodeRight}>
                    {isActive && (
                      <View style={[styles.nodeActiveBadge, { backgroundColor: `${tier.color}22` }]}>
                        <Text style={[styles.nodeActiveBadgeText, { color: tier.color }]}>ACTIVE</Text>
                      </View>
                    )}
                    {isUnlocked && (
                      <View style={[styles.nodeActiveBadge, { backgroundColor: "rgba(80,200,120,0.15)" }]}>
                        <Text style={[styles.nodeActiveBadgeText, { color: "#50C878" }]}>✓ COMPLETE</Text>
                      </View>
                    )}
                    {isLocked && (
                      <View style={styles.lockedBadge}>
                        <Text style={styles.lockedBadgeText}>LOCKED</Text>
                      </View>
                    )}
                    <Text style={[styles.nodeName, isLocked && { opacity: 0.4 }]}>{tier.label}</Text>
                    <Text style={[styles.nodeDetail, isLocked && { opacity: 0.4 }]}>
                      {isLocked
                        ? `Requires ${tier.min} sessions`
                        : isUnlocked
                        ? `${tier.max + 1} sessions reached`
                        : `${sessions}/${tier.max + 1} sessions`}
                    </Text>
                    {(isActive || isUnlocked) && (
                      <>
                        <View style={styles.nodeProgressBar}>
                          <Animated.View
                            style={[
                              styles.nodeProgressFill,
                              { backgroundColor: tier.color },
                              isActive ? { width: progressWidth as any } : { width: "100%" },
                            ]}
                          />
                        </View>
                        <Text style={styles.nodeProgressLabel}>{tierPct}% complete</Text>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
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
            <View style={{ flex: 1 }}>
              <Text style={styles.motivationTitle}>Keep pushing!</Text>
              <Text style={styles.motivationText}>
                {nextTier
                  ? `${Math.max(0, nextTier.min - sessions)} more sessions to reach ${nextTier.label}`
                  : "You've reached the highest tier — Legendary!"}
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

  collectibleCard: { borderRadius: radii.xl, padding: 20, marginBottom: 28, borderWidth: 1, ...shadows.card },
  collectibleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  collectibleEra: { fontFamily: typography.displayFont, fontSize: 20, letterSpacing: 1.5 },
  collectibleSessions: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted },
  poseFramesRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  poseFrame: { alignItems: "center", gap: 10 },
  poseFrameInner: {
    width: 110, height: 130, borderRadius: radii.xl,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
  },
  poseFrameName: { fontFamily: typography.displayFont, fontSize: 16, letterSpacing: 1, color: colors.textPrimary },
  poseVS: { alignItems: "center", gap: 4 },
  poseVSFlame: { fontSize: 32 },
  poseVSLabel: { fontFamily: typography.displayFont, fontSize: 12, letterSpacing: 2, color: colors.textMuted },

  pathTitle: { fontFamily: typography.displayFont, fontSize: 16, letterSpacing: 2, color: colors.textMuted, marginBottom: 20 },
  evolutionPath: { position: "relative" },
  pathLine: { position: "absolute", left: 31, top: 40, bottom: 40, width: 2, backgroundColor: colors.surface2 },

  pathNode: { flexDirection: "row", gap: 16, marginBottom: 28, alignItems: "flex-start" },
  pathNodeLeft: { width: 64, alignItems: "center" },
  pathNodeRight: { flex: 1, paddingTop: 6, gap: 4 },

  orbContainer: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  orbGlow: {
    position: "absolute", top: -8, left: -8, right: -8, bottom: -8,
    borderRadius: 40,
  },
  orbEmoji: { fontSize: 30 },
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

  nodeActiveBadge: { borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 2 },
  nodeActiveBadgeText: { fontFamily: typography.displayFont, fontSize: 11, letterSpacing: 1 },
  lockedBadge: { backgroundColor: colors.surface1, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 2 },
  lockedBadgeText: { fontFamily: typography.displayFont, fontSize: 11, letterSpacing: 1, color: colors.textDim },
  nodeName: { fontFamily: typography.displayFont, fontSize: 20, letterSpacing: 1, color: colors.textPrimary },
  nodeDetail: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted },
  nodeProgressBar: { height: 6, backgroundColor: colors.surface2, borderRadius: 3, marginTop: 6, overflow: "hidden" },
  nodeProgressFill: { height: 6, borderRadius: 3 },
  nodeProgressLabel: { fontFamily: typography.bodyFont, fontSize: 11, color: colors.textDim },

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
  streakValue: { fontFamily: typography.displayFont, fontSize: 22, letterSpacing: 1, color: colors.textPrimary },
  streakLabel: { fontFamily: typography.bodyFont, fontSize: 11, color: colors.textDim, marginTop: 2 },
  streakDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.06)" },

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
