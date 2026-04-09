import React, { useState, useEffect, useRef } from "react";
import {
  Alert, Animated, Pressable, ScrollView,
  StyleSheet, Text, View, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { colors, radii, shadows, typography } from "../../../theme/tokens";
import { groupsApi, streaksApi, type Group, type StreakData } from "../../../services/api";
import { useAuth } from "../../../store/AuthStore";

export const LinkedPartnerScreen = () => {
  const navigation = useNavigation();
  const { user, token } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupStreak, setGroupStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPartner();
  }, [token]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const loadPartner = async () => {
    try {
      const groups = await groupsApi.mine();
      const active = groups.find((g) => g.members.filter((m) => m.status !== "LEFT").length >= 1);
      if (active) {
        setGroup(active);
        const gs = await streaksApi.group(active.id).catch(() => null);
        setGroupStreak(gs);
      }
    } catch {}
    setLoading(false);
  };

  const handleLeave = () => {
    if (!group) return;
    Alert.alert(
      "Leave Group",
      "Are you sure? This will end your duo streak and disconnect your partner.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            setLeaving(true);
            try {
              await groupsApi.leave(group.id);
              setGroup(null);
              setGroupStreak(null);
              Alert.alert("Left group", "You have been disconnected from your partner.");
            } catch (e: any) {
              Alert.alert("Error", e.message ?? "Could not leave group");
            }
            setLeaving(false);
          },
        },
      ]
    );
  };

  const partner = group?.members.find((m) => m.userId !== user?.id && m.status !== "LEFT");

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.title}>LINKED PARTNER</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 60 }} />
          ) : group && partner ? (
            <Animated.View style={{ opacity: cardOpacity, transform: [{ translateY: cardSlide }] }}>
              {/* Status badge */}
              <View style={styles.statusRow}>
                <Animated.View style={[styles.statusDot, { transform: [{ scale: pulseAnim }] }]} />
                <Text style={styles.statusText}>CONNECTED</Text>
              </View>

              {/* Partner card */}
              <LinearGradient colors={["#1C1008", "#141414"]} style={styles.partnerCard}>
                <View style={styles.partnerAvatarRing}>
                  <Text style={{ fontSize: 52 }}>{partner.user.profile?.avatarEmoji ?? "🤝"}</Text>
                </View>
                <Text style={styles.partnerName}>{partner.user.name}</Text>
                <Text style={styles.partnerUsername}>@{partner.user.username}</Text>
                {partner.user.profile?.bio ? (
                  <Text style={styles.partnerBio}>"{partner.user.profile.bio}"</Text>
                ) : null}
                <View style={styles.partnerBadge}>
                  <Text style={styles.partnerBadgeText}>🤝 DUO PARTNER</Text>
                </View>
              </LinearGradient>

              {/* Group stats */}
              <View style={styles.statsCard}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{groupStreak?.current ?? 0}🔥</Text>
                  <Text style={styles.statLabel}>Duo Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{groupStreak?.longest ?? 0}</Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{groupStreak?.weeklyCount ?? 0}</Text>
                  <Text style={styles.statLabel}>This Week</Text>
                </View>
              </View>

              {/* Invite code */}
              <View style={styles.inviteCard}>
                <Text style={styles.inviteLabel}>GROUP INVITE CODE</Text>
                <Text style={styles.inviteCode}>{group.inviteCode}</Text>
                <Text style={styles.inviteHint}>Share to invite a new partner to your group</Text>
              </View>

              {/* Leave */}
              <Pressable style={styles.leaveBtn} onPress={handleLeave} disabled={leaving}>
                <Text style={styles.leaveBtnText}>{leaving ? "Leaving…" : "🚪 Leave Group"}</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <Animated.View style={[styles.emptyState, { opacity: cardOpacity }]}>
              <Text style={styles.emptyEmoji}>👤</Text>
              <Text style={styles.emptyTitle}>No Partner Linked</Text>
              <Text style={styles.emptySub}>Go to the Community tab to connect with a partner</Text>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 40 },
  backIcon: { fontFamily: typography.displayFont, fontSize: 26, color: colors.textPrimary },
  title: { flex: 1, fontFamily: typography.displayFont, fontSize: 22, letterSpacing: 2, color: colors.textPrimary, textAlign: "center" },
  scroll: { paddingHorizontal: 20, paddingBottom: 50 },

  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#22C55E", shadowColor: "#22C55E", shadowRadius: 8, shadowOpacity: 0.8 },
  statusText: { fontFamily: typography.displayFont, fontSize: 13, letterSpacing: 2, color: "#22C55E" },

  partnerCard: { borderRadius: radii.xl, padding: 28, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,94,26,0.2)", ...shadows.card, marginBottom: 16 },
  partnerAvatarRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: colors.primary, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface1, shadowColor: colors.primary, shadowRadius: 16, shadowOpacity: 0.5, elevation: 10 },
  partnerName: { fontFamily: typography.displayFont, fontSize: 26, letterSpacing: 1, color: colors.textPrimary },
  partnerUsername: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textMuted },
  partnerBio: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted, textAlign: "center", fontStyle: "italic", paddingHorizontal: 16 },
  partnerBadge: { backgroundColor: "rgba(255,94,26,0.15)", borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(255,94,26,0.3)", marginTop: 6 },
  partnerBadgeText: { fontFamily: typography.displayFont, fontSize: 12, letterSpacing: 1.5, color: colors.primary },

  statsCard: { flexDirection: "row", backgroundColor: colors.surface0, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.surface2, padding: 20, justifyContent: "space-around", marginBottom: 16 },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontFamily: typography.displayFont, fontSize: 24, color: colors.textPrimary },
  statLabel: { fontFamily: typography.bodyFont, fontSize: 11, color: colors.textDim, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.surface2 },

  inviteCard: { backgroundColor: colors.surface0, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.surface2, padding: 20, alignItems: "center", gap: 8, marginBottom: 24 },
  inviteLabel: { fontFamily: typography.displayFont, fontSize: 11, letterSpacing: 2, color: colors.textDim },
  inviteCode: { fontFamily: typography.displayFont, fontSize: 28, letterSpacing: 4, color: colors.primary },
  inviteHint: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted, textAlign: "center" },

  leaveBtn: { backgroundColor: "rgba(239,68,68,0.1)", borderRadius: radii.xl, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)" },
  leaveBtnText: { fontFamily: typography.displayFont, fontSize: 15, letterSpacing: 1, color: "#EF4444" },

  emptyState: { alignItems: "center", gap: 12, paddingTop: 80 },
  emptyEmoji: { fontSize: 64, opacity: 0.4 },
  emptyTitle: { fontFamily: typography.displayFont, fontSize: 24, letterSpacing: 1, color: colors.textPrimary },
  emptySub: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textMuted, textAlign: "center", paddingHorizontal: 32 },
});
