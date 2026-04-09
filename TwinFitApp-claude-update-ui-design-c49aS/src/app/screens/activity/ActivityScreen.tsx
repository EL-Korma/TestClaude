import React, { useEffect, useState, useCallback } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { colors, radii, typography } from "../../../theme/tokens";
import { notificationsApi, type NotificationItem } from "../../../services/api";
import { useAuth } from "../../../store/AuthStore";

// ─── Notification icon map ────────────────────────────────────────────────────

const TYPE_ICON: Record<string, string> = {
  STREAK:   "🔥",
  CHECKIN:  "📸",
  MEAL:     "🥗",
  SOCIAL:   "👥",
  SYSTEM:   "⚙️",
  QUEST:    "⚔️",
  DUMBBELL: "🏋️",
};

const TYPE_COLOR: Record<string, string> = {
  STREAK:   "#FF5E1A",
  CHECKIN:  "#22C55E",
  MEAL:     "#F59E0B",
  SOCIAL:   "#3B82F6",
  SYSTEM:   "#6B7280",
  QUEST:    "#8B5CF6",
  DUMBBELL: "#FF5E1A",
};

// ─── Notification card ────────────────────────────────────────────────────────

const NotifCard = ({
  notif,
  onRead,
}: {
  notif: NotificationItem;
  onRead: (id: string) => void;
}) => {
  const icon = TYPE_ICON[notif.type] ?? "🔔";
  const accent = TYPE_COLOR[notif.type] ?? colors.primary;
  const unread = !notif.readAt;
  const timeAgo = (() => {
    const diffMs = Date.now() - new Date(notif.createdAt).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  })();

  return (
    <Pressable
      style={[styles.notifCard, unread && styles.notifCardUnread]}
      onPress={() => unread && onRead(notif.id)}
    >
      {unread && <View style={[styles.unreadDot, { backgroundColor: accent }]} />}
      <View style={[styles.notifIconWrap, { backgroundColor: accent + "22" }]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.notifTitle, !unread && { opacity: 0.6 }]}>{notif.title}</Text>
        {notif.body ? <Text style={styles.notifBody}>{notif.body}</Text> : null}
        <Text style={styles.notifTime}>{timeAgo}</Text>
      </View>
    </Pressable>
  );
};

// ─── ActivityScreen ───────────────────────────────────────────────────────────

export const ActivityScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("all");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationsApi.list();
      setNotifications(data);
    } catch {
      // silently fail
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleRead = async (id: string) => {
    await notificationsApi.markRead(id).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
    );
  };

  const handleReadAll = async () => {
    await notificationsApi.markAllRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
  };

  const filtered = tab === "unread"
    ? notifications.filter((n) => !n.readAt)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Drag handle (modal indicator) */}
        <View style={styles.dragHandle} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>ACTIVITY</Text>
            {unreadCount > 0 && (
              <Text style={styles.unreadCount}>{unreadCount} unread</Text>
            )}
          </View>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            {unreadCount > 0 && (
              <Pressable onPress={handleReadAll} style={styles.readAllBtn}>
                <Text style={styles.readAllText}>Mark all read</Text>
              </Pressable>
            )}
            <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(["all", "unread"] as const).map((t) => (
            <Pressable
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
                {t.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>🔔</Text>
              <Text style={styles.emptyTitle}>
                {tab === "unread" ? "All caught up!" : "No notifications yet"}
              </Text>
              <Text style={styles.emptySub}>
                {tab === "unread"
                  ? "No unread notifications."
                  : "Complete quests and check in to earn rewards."}
              </Text>
            </View>
          ) : (
            filtered.map((n) => (
              <NotifCard key={n.id} notif={n} onRead={handleRead} />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  safeArea: { flex: 1 },
  dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.surface2, alignSelf: "center", marginTop: 10, marginBottom: 4 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface1, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.surface2 },
  closeBtnText: { fontSize: 14, color: colors.textMuted },
  screenTitle: {
    fontFamily: typography.displayFont,
    fontSize: 32,
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  unreadCount: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  readAllBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  readAllText: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    color: colors.primary,
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 12,
  },
  tabBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surface1,
    borderWidth: 1.5,
    borderColor: colors.surface2,
  },
  tabBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "22",
  },
  tabBtnText: {
    fontFamily: typography.displayFont,
    fontSize: 13,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  tabBtnTextActive: { color: colors.primary },
  scroll: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  notifCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface0,
    borderRadius: radii.lg,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.surface2,
    position: "relative",
  },
  notifCardUnread: {
    borderColor: colors.primary + "44",
    backgroundColor: "#1C1008",
  },
  unreadDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notifIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  notifTitle: {
    fontFamily: typography.bodyMediumFont,
    fontSize: 14,
    color: colors.textPrimary,
  },
  notifBody: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    color: colors.textMuted,
  },
  notifTime: {
    fontFamily: typography.bodyFont,
    fontSize: 11,
    color: colors.textDim,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: typography.displayFont,
    fontSize: 24,
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  emptySub: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
