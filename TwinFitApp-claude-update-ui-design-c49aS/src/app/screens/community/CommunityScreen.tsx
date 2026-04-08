import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, shadows, typography } from "../../../theme/tokens";
import { groupsApi, streaksApi, Group, GroupMember, StreakData } from "../../../services/api";
import { useAuth } from "../../../store/AuthStore";

type ScreenMode = "idle" | "joining" | "creating" | "waiting" | "connected";

// ─── Animated dots ────────────────────────────────────────────────────────────

const WaitingDots = () => {
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.delay((dots.length - i - 1) * 200),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: 8, marginTop: 20 }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.primary,
            opacity: dot,
          }}
        />
      ))}
    </View>
  );
};

// ─── Waiting Room ────────────────────────────────────────────────────────────

const WaitingRoom = ({
  group,
  currentUserId,
  onCancel,
  onConnected,
}: {
  group: Group;
  currentUserId: string;
  onCancel: () => void;
  onConnected: (g: Group) => void;
}) => {
  const pulse = useRef(new Animated.Value(1)).current;
  const activeMembers = group.members.filter((m) => m.status !== "LEFT");
  const me = activeMembers.find((m) => m.userId === currentUserId);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Poll for partner
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updated = await groupsApi.get(group.id);
        const active = updated.members.filter((m: any) => m.status !== "LEFT");
        if (active.length >= 2) {
          clearInterval(interval);
          onConnected(updated);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [group.id]);

  return (
    <View style={wStyles.container}>
      {/* Pulsing ring */}
      <Animated.View style={[wStyles.ring, { transform: [{ scale: pulse }] }]}>
        <View style={wStyles.innerRing}>
          <Text style={wStyles.ringEmoji}>🔗</Text>
        </View>
      </Animated.View>

      <Text style={wStyles.label}>WAITING FOR YOUR TWIN</Text>
      <Text style={wStyles.sub}>
        Share your invite code with your partner
      </Text>

      {/* Invite code card */}
      <LinearGradient colors={["#1C0E04", "#0D0D0D"]} style={wStyles.codeCard}>
        <Text style={wStyles.codeLabel}>INVITE CODE</Text>
        <Text style={wStyles.code}>{group.inviteCode}</Text>
        <Text style={wStyles.codeHint}>Send this to your partner</Text>
      </LinearGradient>

      {/* Members joined */}
      <View style={wStyles.membersRow}>
        {activeMembers.map((m) => (
          <View key={m.id} style={wStyles.memberPill}>
            <Text style={wStyles.memberPillEmoji}>
              {m.user.profile?.avatarEmoji ?? "🏋️"}
            </Text>
            <Text style={wStyles.memberPillName}>{m.user.name.split(" ")[0]}</Text>
            <View style={wStyles.memberPillDot} />
          </View>
        ))}
        <View style={[wStyles.memberPill, wStyles.memberPillGhost]}>
          <Text style={wStyles.memberPillEmoji}>👤</Text>
          <Text style={[wStyles.memberPillName, { color: colors.textDim }]}>Partner</Text>
        </View>
      </View>

      <WaitingDots />

      <Text style={wStyles.pollingText}>Checking every 3 seconds…</Text>

      <Pressable style={wStyles.cancelBtn} onPress={onCancel}>
        <Text style={wStyles.cancelBtnText}>CANCEL</Text>
      </Pressable>
    </View>
  );
};

// ─── TwinFit Success Popup ────────────────────────────────────────────────────

const TwinFitSuccessPopup = ({
  visible,
  groupName,
  onDismiss,
}: {
  visible: boolean;
  groupName: string;
  onDismiss: () => void;
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 7 }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
          ]),
          { iterations: 3 }
        ).start();
      });
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
      <Pressable style={sStyles.overlay} onPress={onDismiss}>
        <Animated.View style={[sStyles.card, { opacity, transform: [{ scale }] }]}>
          <LinearGradient colors={["#1C0E04", "#0D0D0D"]} style={sStyles.gradient}>
            <View style={sStyles.glowRing}>
              <Animated.Text style={[{ fontSize: 40 }, { transform: [{ scale: pulse }] }]}>
                🔗
              </Animated.Text>
            </View>
            <Text style={sStyles.label}>TWINFIT ACTIVATED</Text>
            <Text style={sStyles.title}>You're Connected!</Text>
            <Text style={sStyles.sub}>
              You are now training with{"\n"}
              <Text style={{ color: colors.primary }}>{groupName}</Text>
            </Text>
            <View style={sStyles.divider} />
            <Text style={sStyles.hint}>Stay consistent. Outperform yesterday.</Text>
            <Pressable style={sStyles.btn} onPress={onDismiss}>
              <Text style={sStyles.btnText}>LET'S GO 🔥</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// ─── Member card ─────────────────────────────────────────────────────────────

const MemberCard = ({ member, isMe, rank }: { member: GroupMember; isMe: boolean; rank: number }) => {
  const emoji = member.user.profile?.avatarEmoji ?? "🏋️";
  const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const rankColor = rank <= 3 ? rankColors[rank - 1] : colors.textDim;

  return (
    <View style={[styles.memberCard, isMe && styles.memberCardMe]}>
      <View style={[styles.rankBadge, { borderColor: rankColor }]}>
        <Text style={[styles.rankText, { color: rankColor }]}>{rank}</Text>
      </View>
      <View style={[styles.avatarCircle, isMe && styles.avatarCircleMe]}>
        <Text style={{ fontSize: 26 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={[styles.memberName, isMe && { color: colors.primary }]}>{member.user.name}</Text>
          {isMe && (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>YOU</Text>
            </View>
          )}
        </View>
        <Text style={styles.memberUsername}>@{member.user.username}</Text>
      </View>
      {rank === 1 && <Text style={{ fontSize: 20 }}>👑</Text>}
    </View>
  );
};

// ─── CommunityScreen ──────────────────────────────────────────────────────────

export const CommunityScreen = () => {
  const { user, token } = useAuth();
  const [mode, setMode] = useState<ScreenMode>("idle");
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [groupStreak, setGroupStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [inviteInput, setInviteInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [successVisible, setSuccessVisible] = useState(false);
  const [successGroupName, setSuccessGroupName] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const groups = await groupsApi.mine();
      if (groups.length > 0) {
        const g = groups[0];
        setActiveGroup(g);
        const active = g.members.filter((m: any) => m.status !== "LEFT");
        setMode(active.length >= 2 ? "connected" : "waiting");
        const streak = await streaksApi.group(g.id).catch(() => null);
        setGroupStreak(streak);
      } else {
        setActiveGroup(null);
        setMode("idle");
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleJoin = async () => {
    if (!inviteInput.trim() || actionLoading) return;
    setActionLoading(true);
    try {
      const group = await groupsApi.join(inviteInput.trim().toUpperCase());
      setActiveGroup(group);
      setInviteInput("");
      const active = group.members.filter((m: any) => m.status !== "LEFT");
      if (active.length >= 2) {
        setMode("connected");
        setSuccessGroupName(group.name ?? "your partner");
        setSuccessVisible(true);
      } else {
        setMode("waiting");
      }
    } catch (e: any) {
      Alert.alert("Failed to join", e.message ?? "Invalid invite code");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!nameInput.trim() || actionLoading) return;
    setActionLoading(true);
    try {
      const group = await groupsApi.create(nameInput.trim(), "DUO");
      setActiveGroup(group);
      setNameInput("");
      setMode("waiting");
    } catch (e: any) {
      Alert.alert("Failed to create", e.message ?? "Could not create group");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePartnerConnected = (updatedGroup: Group) => {
    setActiveGroup(updatedGroup);
    setMode("connected");
    setSuccessGroupName(updatedGroup.name ?? "your partner");
    setSuccessVisible(true);
  };

  const handleLeave = () => {
    if (!activeGroup) return;
    Alert.alert(
      "Leave Group",
      `Leave "${activeGroup.name}"? You'll need a new invite code to rejoin.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await groupsApi.leave(activeGroup.id);
              setActiveGroup(null);
              setMode("idle");
            } catch {}
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // ── Waiting room ──
  if (mode === "waiting" && activeGroup) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.screenTitle}>COMMUNITY</Text>
            <Pressable style={styles.leaveBtn} onPress={handleLeave}>
              <Text style={styles.leaveBtnText}>Leave</Text>
            </Pressable>
          </View>
          <WaitingRoom
            group={activeGroup}
            currentUserId={user?.id ?? ""}
            onCancel={() => { groupsApi.leave(activeGroup.id).catch(() => {}); setActiveGroup(null); setMode("idle"); }}
            onConnected={handlePartnerConnected}
          />
        </SafeAreaView>
        <TwinFitSuccessPopup
          visible={successVisible}
          groupName={successGroupName}
          onDismiss={() => setSuccessVisible(false)}
        />
      </View>
    );
  }

  const members = activeGroup?.members.filter((m) => m.status !== "LEFT") ?? [];
  const sortedMembers = [...members].sort((a, b) => a.user.name.localeCompare(b.user.name));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>COMMUNITY</Text>
          {mode === "connected" && (
            <Pressable style={styles.leaveBtn} onPress={handleLeave}>
              <Text style={styles.leaveBtnText}>Leave</Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── IDLE / JOINING / CREATING ── */}
          {(mode === "idle" || mode === "joining" || mode === "creating") && (
            <>
              <View style={styles.noGroupContainer}>
                <Text style={{ fontSize: 64, marginBottom: 16 }}>👥</Text>
                <Text style={styles.noGroupTitle}>No Partner Yet</Text>
                <Text style={styles.noGroupSub}>
                  Join your duo partner's group or create a new one to start training together.
                </Text>

                {/* JOIN flow */}
                {mode !== "creating" && (
                  <Pressable
                    style={[styles.joinBtn, mode === "joining" && styles.joinBtnActive]}
                    onPress={() => setMode(mode === "joining" ? "idle" : "joining")}
                  >
                    <Text style={styles.joinBtnText}>
                      {mode === "joining" ? "▲ CLOSE" : "JOIN WITH CODE"}
                    </Text>
                  </Pressable>
                )}

                {mode === "joining" && (
                  <View style={styles.inlineForm}>
                    <TextInput
                      style={styles.inlineInput}
                      placeholder="Enter invite code"
                      placeholderTextColor={colors.textDim}
                      value={inviteInput}
                      onChangeText={setInviteInput}
                      autoCapitalize="characters"
                      maxLength={8}
                      autoFocus
                    />
                    <Pressable
                      style={[styles.inlineConfirm, (!inviteInput.trim() || actionLoading) && { opacity: 0.45 }]}
                      onPress={handleJoin}
                      disabled={!inviteInput.trim() || actionLoading}
                    >
                      {actionLoading
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={styles.inlineConfirmText}>CONNECT →</Text>
                      }
                    </Pressable>
                  </View>
                )}

                {/* CREATE flow */}
                {mode !== "joining" && (
                  <Pressable
                    style={[styles.createBtn, mode === "creating" && styles.createBtnActive]}
                    onPress={() => setMode(mode === "creating" ? "idle" : "creating")}
                  >
                    <Text style={styles.createBtnText}>
                      {mode === "creating" ? "▲ CLOSE" : "CREATE GROUP"}
                    </Text>
                  </Pressable>
                )}

                {mode === "creating" && (
                  <View style={styles.inlineForm}>
                    <TextInput
                      style={styles.inlineInput}
                      placeholder="Group name (e.g. Iron Duo)"
                      placeholderTextColor={colors.textDim}
                      value={nameInput}
                      onChangeText={setNameInput}
                      maxLength={30}
                      autoFocus
                    />
                    <Pressable
                      style={[styles.inlineConfirm, (!nameInput.trim() || actionLoading) && { opacity: 0.45 }]}
                      onPress={handleCreate}
                      disabled={!nameInput.trim() || actionLoading}
                    >
                      {actionLoading
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={styles.inlineConfirmText}>CREATE →</Text>
                      }
                    </Pressable>
                  </View>
                )}
              </View>
            </>
          )}

          {/* ── CONNECTED ── */}
          {mode === "connected" && activeGroup && (
            <>
              <LinearGradient colors={["#1A0E05", "#0D0D0D"]} style={styles.groupCard}>
                <View style={styles.groupCardTop}>
                  <View>
                    <Text style={styles.groupName}>{activeGroup.name}</Text>
                    <Text style={styles.groupMode}>{activeGroup.mode} MODE · {members.length} MEMBERS</Text>
                  </View>
                  <View style={styles.inviteBlock}>
                    <Text style={styles.inviteLabel}>INVITE CODE</Text>
                    <Text style={styles.inviteCode}>{activeGroup.inviteCode}</Text>
                  </View>
                </View>
                <View style={styles.streakRow}>
                  <View style={styles.streakItem}>
                    <Text style={styles.streakValue}>{groupStreak ? `${groupStreak.current}🔥` : "—"}</Text>
                    <Text style={styles.streakLabel}>Group streak</Text>
                  </View>
                  <View style={styles.streakDivider} />
                  <View style={styles.streakItem}>
                    <Text style={styles.streakValue}>{groupStreak ? groupStreak.weeklyCount : "—"}</Text>
                    <Text style={styles.streakLabel}>This week</Text>
                  </View>
                  <View style={styles.streakDivider} />
                  <View style={styles.streakItem}>
                    <Text style={styles.streakValue}>{groupStreak ? groupStreak.longest : "—"}</Text>
                    <Text style={styles.streakLabel}>Best streak</Text>
                  </View>
                </View>
              </LinearGradient>

              <Text style={styles.sectionTitle}>MEMBERS</Text>
              {sortedMembers.map((m, idx) => (
                <MemberCard key={m.id} member={m} isMe={m.userId === user?.id} rank={idx + 1} />
              ))}

              <View style={styles.shareCard}>
                <Text style={{ fontSize: 28 }}>🔗</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shareTitle}>Invite your partner</Text>
                  <Text style={styles.shareCode}>{activeGroup.inviteCode}</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <TwinFitSuccessPopup
        visible={successVisible}
        groupName={successGroupName}
        onDismiss={() => setSuccessVisible(false)}
      />
    </View>
  );
};

// ─── Waiting Room Styles ──────────────────────────────────────────────────────

const wStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  ring: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryDim,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  innerRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1C0E04",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary + "88",
  },
  ringEmoji: { fontSize: 36 },
  label: {
    fontFamily: typography.displayFont,
    fontSize: 12,
    letterSpacing: 3,
    color: colors.primary,
    marginBottom: 8,
  },
  sub: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  codeCard: {
    width: "100%",
    borderRadius: radii.xl,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,94,26,0.3)",
    marginBottom: 24,
  },
  codeLabel: {
    fontFamily: typography.bodyFont,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textDim,
    marginBottom: 8,
  },
  code: {
    fontFamily: typography.displayFont,
    fontSize: 36,
    letterSpacing: 6,
    color: colors.primary,
    marginBottom: 8,
  },
  codeHint: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    color: colors.textDim,
  },
  membersRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  memberPill: {
    alignItems: "center",
    backgroundColor: colors.surface0,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.primary + "55",
    gap: 4,
  },
  memberPillGhost: {
    borderColor: colors.surface2,
    borderStyle: "dashed",
  },
  memberPillEmoji: { fontSize: 22 },
  memberPillName: {
    fontFamily: typography.bodyFont,
    fontSize: 11,
    color: colors.textMuted,
  },
  memberPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
  },
  pollingText: {
    fontFamily: typography.bodyFont,
    fontSize: 11,
    color: colors.textDim,
    marginTop: 10,
    marginBottom: 28,
  },
  cancelBtn: {
    paddingHorizontal: 32,
    paddingVertical: 13,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surface2,
  },
  cancelBtnText: {
    fontFamily: typography.displayFont,
    fontSize: 14,
    letterSpacing: 2,
    color: colors.textMuted,
  },
});

// ─── Success Popup Styles ─────────────────────────────────────────────────────

const sStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "82%",
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.primary + "55",
  },
  gradient: { padding: 32, alignItems: "center" },
  glowRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryDim,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    fontFamily: typography.displayFont,
    fontSize: 11,
    letterSpacing: 3,
    color: colors.primary,
    marginBottom: 8,
  },
  title: {
    fontFamily: typography.displayFont,
    fontSize: 30,
    letterSpacing: 1,
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: "center",
  },
  sub: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 16,
  },
  hint: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    color: colors.textDim,
    textAlign: "center",
    marginBottom: 24,
    fontStyle: "italic",
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  btnText: {
    fontFamily: typography.displayFont,
    fontSize: 16,
    letterSpacing: 2,
    color: "#fff",
  },
});

// ─── Main Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: "center", justifyContent: "center" },
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 4 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  screenTitle: {
    fontFamily: typography.displayFont,
    fontSize: 32,
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  leaveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.accentRed,
  },
  leaveBtnText: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.accentRed },

  // No group / inline form
  noGroupContainer: { alignItems: "center", paddingTop: 40, paddingHorizontal: 8, width: "100%" },
  noGroupTitle: {
    fontFamily: typography.displayFont,
    fontSize: 28,
    letterSpacing: 1,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  noGroupSub: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  joinBtn: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  joinBtnActive: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.primary },
  joinBtnText: {
    fontFamily: typography.displayFont,
    fontSize: 16,
    letterSpacing: 2,
    color: "#fff",
  },
  createBtn: {
    width: "100%",
    backgroundColor: colors.surface1,
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surface2,
    marginBottom: 12,
  },
  createBtnActive: { borderColor: colors.primary },
  createBtnText: {
    fontFamily: typography.displayFont,
    fontSize: 16,
    letterSpacing: 2,
    color: colors.textMuted,
  },
  inlineForm: {
    width: "100%",
    backgroundColor: colors.surface0,
    borderRadius: radii.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.surface2,
    gap: 12,
  },
  inlineInput: {
    backgroundColor: colors.surface1,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: typography.displayFont,
    fontSize: 20,
    letterSpacing: 3,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.surface2,
    textAlign: "center",
  },
  inlineConfirm: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  inlineConfirmText: {
    fontFamily: typography.displayFont,
    fontSize: 16,
    letterSpacing: 2,
    color: "#fff",
  },

  // Connected view
  groupCard: {
    borderRadius: radii.xl,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,94,26,0.2)",
    ...shadows.card,
  },
  groupCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  groupName: {
    fontFamily: typography.displayFont,
    fontSize: 22,
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  groupMode: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  inviteBlock: { alignItems: "flex-end" },
  inviteLabel: {
    fontFamily: typography.bodyFont,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textDim,
    marginBottom: 4,
  },
  inviteCode: {
    fontFamily: typography.displayFont,
    fontSize: 20,
    letterSpacing: 3,
    color: colors.primary,
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 14,
  },
  streakItem: { alignItems: "center", flex: 1 },
  streakValue: {
    fontFamily: typography.displayFont,
    fontSize: 22,
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  streakLabel: { fontFamily: typography.bodyFont, fontSize: 11, color: colors.textDim, marginTop: 2 },
  streakDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  sectionTitle: {
    fontFamily: typography.displayFont,
    fontSize: 14,
    letterSpacing: 2,
    color: colors.textMuted,
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface0,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.surface2,
  },
  memberCardMe: { borderColor: colors.primary + "44", backgroundColor: "#1C1008" },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontFamily: typography.displayFont, fontSize: 13 },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.surface2,
  },
  avatarCircleMe: { borderColor: colors.primary, backgroundColor: colors.primaryDim },
  memberName: { fontFamily: typography.bodyMediumFont, fontSize: 15, color: colors.textPrimary },
  memberUsername: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  youBadge: {
    backgroundColor: colors.primaryDim,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  youBadgeText: {
    fontFamily: typography.displayFont,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.primary,
  },
  shareCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surface0,
    borderRadius: radii.xl,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.surface2,
  },
  shareTitle: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted },
  shareCode: {
    fontFamily: typography.displayFont,
    fontSize: 22,
    letterSpacing: 3,
    color: colors.primary,
    marginTop: 2,
  },
});
