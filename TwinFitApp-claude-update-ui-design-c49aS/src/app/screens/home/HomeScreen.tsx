import React, { useRef, useEffect, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Counter, StreakLoseBanner } from "../../../components";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainTabsParamList } from "../../navigation/MainTabs";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, shadows, typography } from "../../../theme/tokens";
import { useDumbbells } from "../../../store/DumbbellStore";
import { useAuth } from "../../../store/AuthStore";
import { streaksApi, groupsApi, notificationsApi, type StreakData } from "../../../services/api";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, "Home">,
  NativeStackNavigationProp<RootStackParamList>
>;

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

// Indexed Sun=0 … Sat=6
const DAILY_POSES = [
  { emoji: "🧘", name: "Recovery Warrior",  cue: "Breathe deep. Stretch tall. Honor rest.", color: "#7C6FF7" },
  { emoji: "🏋️", name: "Power Stance",      cue: "Feet shoulder-width. Chest up. Own the floor.", color: "#FF5E1A" },
  { emoji: "⚡", name: "Iron Will",          cue: "Arms locked, gaze forward — ready to grind.", color: "#FFD700" },
  { emoji: "🔥", name: "Beast Mode",         cue: "Hinge at the hips. Explosive. Unstoppable.", color: "#FF3A3A" },
  { emoji: "💪", name: "The Grinder",        cue: "Low stance. Embrace the burn. Keep moving.", color: "#FF7A3A" },
  { emoji: "🚀", name: "Finisher",           cue: "Sprint posture. Arms driving. Cross that line.", color: "#00C896" },
  { emoji: "🦁", name: "Savage Saturday",   cue: "Full power squat. Roar. Dominate the day.", color: "#CD7F32" },
];

const RESPECT_THEMES = [
  { title: "Reflect",       body: "Look back at your week. Growth is in the review.",  emoji: "🪞" },
  { title: "Discipline",    body: "Show up even when motivation is gone. That's the real flex.", emoji: "🎯" },
  { title: "Consistency",   body: "Small daily wins compound into an unbreakable physique.", emoji: "🧱" },
  { title: "Respect Your Body", body: "Push hard. Recover harder. Both are training.", emoji: "🩺" },
  { title: "Mental Toughness", body: "The mind quits long before the body does. Silence it.", emoji: "🧠" },
  { title: "Gratitude",     body: "Be thankful for the strength you carry every day.", emoji: "🙏" },
  { title: "Brotherhood",   body: "Your partner chose you. Don't let them log alone.", emoji: "🤝" },
];

const LOCKED_CARDS = [
  { emoji: "🥈", label: "Silver Pose", hint: "6 sessions away" },
  { emoji: "🥇", label: "Gold Era", hint: "Coming later" },
  { emoji: "💎", label: "Diamond", hint: "Coming later" },
];

export const HomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const { state } = useDumbbells();
  const { user, token } = useAuth();
  const firstName = user?.name ?? "Athlete";

  const todayIndex = new Date().getDay(); // 0=Sun
  const todayPose = DAILY_POSES[todayIndex];
  const todayTheme = RESPECT_THEMES[todayIndex];
  const poseGlow = useRef(new Animated.Value(0.5)).current;

  const flameScale = useRef(new Animated.Value(1)).current;
  const streakGlow = useRef(new Animated.Value(0.4)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [streak, setStreak] = useState<StreakData | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [partner, setPartner] = useState<{ name: string; avatarEmoji: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellShake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!token) return;
    streaksApi.me().then((s) => { if (s) setStreak(s); }).catch(() => {});
    notificationsApi.list().then((notifs) => {
      const count = notifs.filter((n) => !n.readAt).length;
      setUnreadCount(count);
      if (count > 0) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(bellShake, { toValue: 6, duration: 80, useNativeDriver: true }),
            Animated.timing(bellShake, { toValue: -6, duration: 80, useNativeDriver: true }),
            Animated.timing(bellShake, { toValue: 4, duration: 80, useNativeDriver: true }),
            Animated.timing(bellShake, { toValue: 0, duration: 80, useNativeDriver: true }),
            Animated.delay(3000),
          ])
        ).start();
      }
    }).catch(() => {});
    groupsApi.mine().then((groups) => {
      const active = groups.find((g) => g.members.filter((m) => m.status !== "LEFT").length >= 2);
      if (active) {
        const pm = active.members.find((m) => m.userId !== user?.id && m.status !== "LEFT");
        if (pm) setPartner({ name: pm.user.name, avatarEmoji: pm.user.profile?.avatarEmoji ?? "🤝" });
      }
    }).catch(() => {});
  }, [token]);

  const streakDays = streak?.current ?? 0;
  const lastLog = streak?.lastLogDate ? new Date(streak.lastLogDate) : null;
  const hoursAgo = lastLog ? (Date.now() - lastLog.getTime()) / 3600000 : 0;
  const hoursLeft = Math.max(0, 24 - hoursAgo);
  const showStreakBanner = !bannerDismissed && streakDays > 0 && hoursLeft <= 4;

  // Build 7-day pip data: 0=empty, 1=done, 2=today
  const todayDow = new Date().getDay(); // 0=Sun
  const weeklyCount = streak?.weeklyCount ?? 0;
  const streakData = DAYS.map((_, i) => {
    const dow = (i + 1) % 7; // M=1, T=2, ... S=6, S=0
    if (dow === todayDow) return 2; // today
    const daysSinceToday = (todayDow - dow + 7) % 7;
    return daysSinceToday < weeklyCount ? 1 : 0;
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameScale, { toValue: 1.2, duration: 700, useNativeDriver: true }),
        Animated.timing(flameScale, { toValue: 0.9, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(streakGlow, { toValue: 0.7, duration: 1500, useNativeDriver: true }),
        Animated.timing(streakGlow, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.95, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(poseGlow, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(poseGlow, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header row */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>
                {new Date().getHours() < 12 ? "Good morning 👋" : new Date().getHours() < 18 ? "Good afternoon ⚡" : "Good evening 🌙"}
              </Text>
              <Text style={styles.duoNames}>{firstName}</Text>
            </View>
            <View style={styles.avatarRow}>
              <Pressable onPress={() => navigation.navigate("Activity")} style={styles.bellWrap}>
                <Animated.Text style={[styles.bellIcon, { transform: [{ rotate: bellShake.interpolate({ inputRange: [-6, 6], outputRange: ["-12deg", "12deg"] }) }] }]}>
                  🔔
                </Animated.Text>
                {unreadCount > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                  </View>
                )}
              </Pressable>
              <View style={styles.avatarBubble}>
                <Text style={styles.avatarText}>{user?.profile?.avatarEmoji ?? "🦁"}</Text>
              </View>
              {partner && (
                <View style={[styles.avatarBubble, styles.avatarBubble2]}>
                  <Text style={styles.avatarText}>{partner.avatarEmoji}</Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Streak lose banner ────────────────────────────────── */}
          {showStreakBanner && (
            <StreakLoseBanner
              streakDays={streakDays}
              hoursRemaining={Math.round(hoursLeft)}
              onLogNow={() => { setBannerDismissed(true); navigation.navigate("Log"); }}
              onDismiss={() => setBannerDismissed(true)}
            />
          )}

          {/* ── Dumbbell balance widget ───────────────────────────── */}
          <Pressable style={styles.dumbbellWidget} onPress={() => navigation.navigate("Quests")}>
            <LinearGradient colors={["#1C1008", "#141414"]} style={styles.dumbbellWidgetInner}>
              <Text style={styles.dumbbellWidgetIcon}>🏋️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.dumbbellWidgetLabel}>DUMBBELLS</Text>
                <Counter value={state.balance} fontSize={20} color={colors.primary} fontFamily={typography.displayFont} />
              </View>
              <Pressable style={styles.questsBtn} onPress={() => navigation.navigate("Quests")}>
                <Text style={styles.questsBtnText}>QUESTS →</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>

          {/* ── Streak hero card ───────────────────────────────────── */}
          <Animated.View style={{ opacity: streakGlow }}>
            <View style={styles.streakGlowBg} />
          </Animated.View>
          <LinearGradient
            colors={["#1C1008", "#1A1A1A"]}
            style={styles.streakCard}
          >
            <View style={styles.streakInner}>
              {/* Big streak number */}
              <View style={styles.streakLeft}>
                <Animated.Text style={[styles.streakNumber, { transform: [{ scale: flameScale }] }]}>
                  🔥
                </Animated.Text>
                <Counter
                  value={streakDays}
                  fontSize={72}
                  color={colors.primary}
                  fontFamily={typography.displayFont}
                />
                <Text style={styles.streakLabel}>DAYS{"\n"}IN A ROW</Text>
              </View>

              {/* Avatars with check status */}
              <View style={styles.streakRight}>
                <View style={styles.duoStatus}>
                  <View style={styles.duoMember}>
                    <View style={[styles.duoAvatar, styles.duoAvatarDone]}>
                      <Text style={{ fontSize: 22 }}>{user?.profile?.avatarEmoji ?? "🦁"}</Text>
                    </View>
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkIcon}>✓</Text>
                    </View>
                    <Text style={styles.duoName}>{firstName}</Text>
                  </View>

                  <View style={styles.duoConnector}>
                    <View style={styles.connectorLine} />
                    <Text style={styles.connectorFlame}>🔥</Text>
                    <View style={styles.connectorLine} />
                  </View>

                  <View style={styles.duoMember}>
                    <Animated.View style={[styles.duoAvatar, partner ? styles.duoAvatarDone : styles.duoAvatarPending, { transform: [{ scale: pulseAnim }] }]}>
                      <Text style={{ fontSize: 22 }}>{partner ? partner.avatarEmoji : "👤"}</Text>
                    </Animated.View>
                    {partner ? (
                      <View style={styles.checkBadge}><Text style={styles.checkIcon}>✓</Text></View>
                    ) : (
                      <View style={styles.pendingBadge}><Text style={styles.pendingIcon}>⏳</Text></View>
                    )}
                    <Text style={styles.duoName}>{partner ? partner.name.split(" ")[0] : "Partner"}</Text>
                  </View>
                </View>

                <Text style={styles.streakSubline}>{partner ? "Training together!" : "Invite a partner!"}</Text>
              </View>
            </View>

            {/* 7-day strip */}
            <View style={styles.weekStrip}>
              {DAYS.map((day, i) => (
                <View key={i} style={styles.dayCol}>
                  <Text style={[styles.dayLabel, streakData[i] > 0 && styles.dayLabelActive]}>{day}</Text>
                  <View
                    style={[
                      styles.dayPip,
                      streakData[i] === 1 && styles.dayPipDone,
                      streakData[i] === 2 && styles.dayPipToday,
                    ]}
                  >
                    {streakData[i] > 0 && (
                      <Text style={{ fontSize: streakData[i] === 2 ? 14 : 10 }}>🔥</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* ── Quick action row ───────────────────────────────────── */}
          <View style={styles.quickActions}>
            {/* LOG — primary action */}
            <Pressable
              style={styles.logBtn}
              onPress={() => navigation.navigate("Log")}
            >
              <LinearGradient
                colors={["#FF5E1A", "#FF7A3A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logBtnGradient}
              >
                <Text style={styles.logBtnIcon}>📸</Text>
                <Text style={styles.logBtnText}>LOG</Text>
              </LinearGradient>
            </Pressable>

            {/* EVOLVE */}
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate("Evolve")}
            >
              <Text style={styles.secondaryBtnIcon}>⭐</Text>
              <Text style={styles.secondaryBtnText}>EVOLVE</Text>
            </Pressable>

            {/* FUEL */}
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate("Nutrition")}
            >
              <Text style={styles.secondaryBtnIcon}>🥗</Text>
              <Text style={styles.secondaryBtnText}>FUEL</Text>
            </Pressable>
          </View>

          {/* ── Today's pose card ──────────────────────────────────── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TODAY'S POSE</Text>
            <View style={styles.bronzeBadge}>
              <Text style={styles.bronzeBadgeText}>🥉 BRONZE</Text>
            </View>
          </View>

          <Pressable style={styles.poseCard} onPress={() => navigation.navigate("Log")}>
            <LinearGradient
              colors={["#1C1008", "#1A1A1A"]}
              style={[styles.poseCardInner, { borderLeftWidth: 3, borderLeftColor: todayPose.color }]}
            >
              {/* Glow dot */}
              <Animated.View style={[styles.poseGlowDot, { backgroundColor: todayPose.color, opacity: poseGlow }]} />
              <Text style={{ fontSize: 56 }}>{todayPose.emoji}</Text>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <View style={[styles.poseDayBadge, { backgroundColor: `${todayPose.color}22`, borderColor: `${todayPose.color}66` }]}>
                  <Text style={[styles.poseDayBadgeText, { color: todayPose.color }]}>
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][todayIndex]} · DAILY POSE
                  </Text>
                </View>
                <Text style={styles.poseName}>{todayPose.name}</Text>
                <Text style={styles.poseDesc}>{todayPose.cue}</Text>
                <View style={styles.poseCtaRow}>
                  <Text style={[styles.poseCta, { color: todayPose.color }]}>TAP TO LOG →</Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>

          {/* ── Today's respect theme ──────────────────────────────── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TODAY'S THEME</Text>
          </View>

          <LinearGradient
            colors={["#0F0F1A", "#1A1A2E"]}
            style={styles.themeCard}
          >
            <Animated.View style={[styles.themeGlow, { opacity: poseGlow }]} />
            <Text style={styles.themeEmoji}>{todayTheme.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.themeTitle}>{todayTheme.title.toUpperCase()}</Text>
              <Text style={styles.themeBody}>{todayTheme.body}</Text>
            </View>
          </LinearGradient>

          {/* ── Locked cards teaser ────────────────────────────────── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>COMING SOON</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lockedScroll}
          >
            {LOCKED_CARDS.map((card, i) => (
              <View key={i} style={styles.lockedCard}>
                {/* Blurred content */}
                <View style={styles.lockedBlur}>
                  <Text style={{ fontSize: 40, opacity: 0.3 }}>{card.emoji}</Text>
                  <Text style={styles.lockedLabel}>{card.label}</Text>
                </View>
                {/* Lock overlay */}
                <View style={styles.lockOverlay}>
                  <Text style={{ fontSize: 28 }}>🔒</Text>
                  <Text style={styles.lockHint}>{card.hint}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 12 },

  // Header
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  greeting: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textMuted },
  duoNames: { fontFamily: typography.displayFont, fontSize: 28, letterSpacing: 1, color: colors.textPrimary },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  bellWrap: { position: "relative", width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  bellIcon: { fontSize: 22 },
  bellBadge: { position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: colors.bg },
  bellBadgeText: { fontFamily: typography.displayFont, fontSize: 9, color: "#fff" },
  avatarBubble: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface1, borderWidth: 2, borderColor: colors.surface2, alignItems: "center", justifyContent: "center" },
  avatarBubble2: { marginLeft: -10, borderColor: colors.primary },
  avatarText: { fontSize: 22 },

  // Streak card
  streakGlowBg: {
    position: "absolute",
    left: -20, right: -20,
    height: 200,
    backgroundColor: colors.primary,
    opacity: 0.06,
    borderRadius: radii.xl,
    top: 0,
  },
  streakCard: {
    borderRadius: radii.xl,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,94,26,0.2)",
    ...shadows.card,
  },
  streakInner: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  streakLeft: { alignItems: "center", gap: 2 },
  streakNumber: { fontSize: 36 },
  streakBigNum: { fontFamily: typography.displayFont, fontSize: 72, color: colors.primary, lineHeight: 76, letterSpacing: -2 },
  streakLabel: { fontFamily: typography.displayFont, fontSize: 13, letterSpacing: 1, color: colors.textMuted, textAlign: "center", lineHeight: 16 },
  streakRight: { flex: 1, marginLeft: 20, justifyContent: "center" },
  duoStatus: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 12, marginBottom: 12 },
  duoMember: { alignItems: "center", gap: 4 },
  duoAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surface1, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  duoAvatarDone: { borderColor: colors.success },
  duoAvatarPending: { borderColor: colors.primary },
  checkBadge: { position: "absolute", bottom: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.success, alignItems: "center", justifyContent: "center" },
  checkIcon: { fontSize: 10, color: colors.textPrimary },
  pendingBadge: { position: "absolute", bottom: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.surface1, alignItems: "center", justifyContent: "center" },
  pendingIcon: { fontSize: 10 },
  duoConnector: { flexDirection: "row", alignItems: "center", gap: 4 },
  connectorLine: { width: 16, height: 1, backgroundColor: colors.surface2 },
  connectorFlame: { fontSize: 14 },
  duoName: { fontFamily: typography.bodyFont, fontSize: 11, color: colors.textMuted },
  streakSubline: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted, textAlign: "right" },

  // Week strip
  weekStrip: { flexDirection: "row", justifyContent: "space-between" },
  dayCol: { alignItems: "center", gap: 6 },
  dayLabel: { fontFamily: typography.bodyFont, fontSize: 11, color: colors.textDim },
  dayLabelActive: { color: colors.textMuted },
  dayPip: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.surface2 },
  dayPipDone: { borderColor: colors.primary, backgroundColor: "rgba(255,94,26,0.1)" },
  dayPipToday: { borderColor: colors.primary, backgroundColor: colors.primary, shadowColor: colors.primary, shadowRadius: 8, shadowOpacity: 0.6, elevation: 6 },

  // Quick actions
  quickActions: { flexDirection: "row", gap: 12, marginBottom: 24 },
  logBtn: { flex: 1.3, borderRadius: radii.lg, overflow: "hidden", ...shadows.orangeGlow },
  logBtnGradient: { height: 68, alignItems: "center", justifyContent: "center", gap: 4 },
  logBtnIcon: { fontSize: 22 },
  logBtnText: { fontFamily: typography.displayFont, fontSize: 18, letterSpacing: 2, color: colors.textPrimary },
  secondaryBtn: {
    flex: 1, height: 68, backgroundColor: colors.surface0, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.surface2, alignItems: "center", justifyContent: "center", gap: 4,
  },
  secondaryBtnIcon: { fontSize: 20 },
  secondaryBtnText: { fontFamily: typography.displayFont, fontSize: 13, letterSpacing: 1.5, color: colors.textMuted },

  // Section
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontFamily: typography.displayFont, fontSize: 16, letterSpacing: 1.5, color: colors.textMuted },
  bronzeBadge: { backgroundColor: "rgba(205,127,50,0.15)", borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(205,127,50,0.4)" },
  bronzeBadgeText: { fontFamily: typography.displayFont, fontSize: 11, letterSpacing: 0.8, color: "#CD7F32" },

  // Pose card
  poseCard: { borderRadius: radii.xl, overflow: "hidden", marginBottom: 16, ...shadows.card },
  poseCardInner: { flexDirection: "row", padding: 20, alignItems: "center", position: "relative" },
  poseGlowDot: {
    position: "absolute", top: 12, right: 12,
    width: 8, height: 8, borderRadius: 4,
  },
  poseDayBadge: {
    alignSelf: "flex-start", borderRadius: radii.pill,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, marginBottom: 6,
  },
  poseDayBadgeText: { fontFamily: typography.displayFont, fontSize: 10, letterSpacing: 1.5 },
  poseName: { fontFamily: typography.displayFont, fontSize: 22, letterSpacing: 1, color: colors.textPrimary, marginBottom: 4 },
  poseDesc: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: 12 },
  poseCtaRow: { flexDirection: "row" },
  poseCta: { fontFamily: typography.displayFont, fontSize: 13, letterSpacing: 1.5 },

  // Respect theme card
  themeCard: {
    borderRadius: radii.xl,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(124,111,247,0.25)",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    ...shadows.card,
  },
  themeGlow: {
    position: "absolute", top: -30, right: -30,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#7C6FF7",
  },
  themeEmoji: { fontSize: 40 },
  themeTitle: {
    fontFamily: typography.displayFont,
    fontSize: 18, letterSpacing: 2,
    color: "#A89FF7",
    marginBottom: 6,
  },
  themeBody: {
    fontFamily: typography.bodyFont,
    fontSize: 13, color: colors.textMuted,
    lineHeight: 19,
  },

  // Dumbbell widget
  dumbbellWidget: { borderRadius: radii.xl, overflow: "hidden", marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,94,26,0.35)" },
  dumbbellWidgetInner: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  dumbbellWidgetIcon: { fontSize: 26 },
  dumbbellWidgetLabel: { fontFamily: typography.displayFont, fontSize: 10, letterSpacing: 2, color: colors.textDim, marginBottom: 2 },
  questsBtn: { backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 7 },
  questsBtnText: { fontFamily: typography.displayFont, fontSize: 11, letterSpacing: 1, color: "#FFF" },

  // Locked cards
  lockedScroll: { gap: 12, paddingRight: 20 },
  lockedCard: { width: 130, height: 160, borderRadius: radii.xl, backgroundColor: colors.surface0, borderWidth: 1, borderColor: colors.surface2, overflow: "hidden", position: "relative" },
  lockedBlur: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  lockedLabel: { fontFamily: typography.displayFont, fontSize: 14, letterSpacing: 1, color: colors.textDim },
  lockOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(10,10,10,0.7)", alignItems: "center", justifyContent: "center", gap: 8 },
  lockHint: { fontFamily: typography.bodyFont, fontSize: 11, color: colors.textMuted, textAlign: "center", paddingHorizontal: 10 },
});
