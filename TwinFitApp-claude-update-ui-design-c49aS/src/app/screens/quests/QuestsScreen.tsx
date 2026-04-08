import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { colors, radii, shadows, typography } from "../../../theme/tokens";
import { useDumbbells, Quest, QuestFrequency } from "../../../store/DumbbellStore";
import { Counter } from "../../../components";

// ─── Quest Card ──────────────────────────────────────────────────────────────

const QuestCard = ({ quest, onClaim }: { quest: Quest; onClaim: () => void }) => {
  const fillAnim = useRef(new Animated.Value(quest.progress)).current;
  const claimScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: quest.progress,
      duration: 800,
      delay: 100,
      useNativeDriver: false,
    }).start();
  }, [quest.progress]);

  const handleClaim = () => {
    Animated.sequence([
      Animated.timing(claimScale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(claimScale, { toValue: 1, useNativeDriver: true, damping: 10 }),
    ]).start();
    onClaim();
  };

  const progressWidth = fillAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const progressColor = quest.completed ? colors.success : quest.progress >= 1 ? colors.primary : "#FF5E1A";

  return (
    <View style={[styles.questCard, quest.completed && styles.questCardDone]}>
      <LinearGradient
        colors={quest.completed ? ["#0E1A0E", "#141414"] : ["#1C1008", "#141414"]}
        style={styles.questCardInner}
      >
        {/* Icon + info */}
        <View style={styles.questRow}>
          <View style={styles.questIconWrap}>
            <Text style={styles.questIcon}>{quest.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.questTitle, quest.completed && styles.questTitleDone]}>
              {quest.title}
            </Text>
            <Text style={styles.questDesc}>{quest.description}</Text>
          </View>
          {/* Reward */}
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardDumbbell}>🏋️</Text>
            <Text style={styles.rewardAmount}>+{quest.reward}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: progressWidth as any, backgroundColor: progressColor }]}
          />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {quest.completed ? "Completed!" : `${Math.round(quest.progress * 100)}%`}
          </Text>
          <Text style={styles.xpLabel}>+{quest.xpReward} XP</Text>
        </View>

        {/* Claim button */}
        {!quest.completed && quest.progress >= 1 && (
          <Animated.View style={{ transform: [{ scale: claimScale }] }}>
            <Pressable style={styles.claimBtn} onPress={handleClaim}>
              <LinearGradient colors={["#FF5E1A", "#FF7A3A"]} style={styles.claimBtnInner}>
                <Text style={styles.claimBtnText}>CLAIM 🏋️ {quest.reward}</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {quest.completed && (
          <View style={styles.claimedBadge}>
            <Text style={styles.claimedText}>✓ CLAIMED</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

// ─── Tab button ───────────────────────────────────────────────────────────────

const TabBtn = ({
  label,
  sub,
  active,
  onPress,
}: {
  label: string;
  sub: string;
  active: boolean;
  onPress: () => void;
}) => (
  <Pressable style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    <Text style={styles.tabSub}>{sub}</Text>
  </Pressable>
);

// ─── QuestsScreen ─────────────────────────────────────────────────────────────

export const QuestsScreen = () => {
  const navigation = useNavigation();
  const { state, completeQuest } = useDumbbells();
  const [tab, setTab] = useState<QuestFrequency>("daily");

  const filteredQuests = state.quests.filter((q) => q.frequency === tab);
  const totalReward = filteredQuests.reduce((acc, q) => acc + (!q.completed ? q.reward : 0), 0);
  const doneCount = filteredQuests.filter((q) => q.completed).length;

  // Refresh label per tab
  const refreshLabel = tab === "daily" ? "Resets midnight" : tab === "weekly" ? "Resets Monday" : "Resets 1st of month";

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Text style={styles.backBtn}>←</Text>
          </Pressable>
          <Text style={styles.screenTitle}>QUESTS</Text>
          {/* Balance chip */}
          <View style={styles.balanceChip}>
            <Text style={styles.balanceIcon}>🏋️</Text>
            <Counter
              value={state.balance}
              fontSize={16}
              color={colors.primary}
              fontFamily={typography.displayFont}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TabBtn label="DAILY" sub={`${doneCount === 0 || tab !== "daily" ? "" : `${doneCount}/${filteredQuests.length}`}`} active={tab === "daily"} onPress={() => setTab("daily")} />
          <TabBtn label="WEEKLY" sub="" active={tab === "weekly"} onPress={() => setTab("weekly")} />
          <TabBtn label="MONTHLY" sub="" active={tab === "monthly"} onPress={() => setTab("monthly")} />
        </View>

        {/* Summary bar */}
        <LinearGradient colors={["#1C1008", "#141414"]} style={styles.summaryBar}>
          <View style={{ gap: 2 }}>
            <Text style={styles.summaryLabel}>{refreshLabel}</Text>
            <Text style={styles.summaryDone}>{doneCount}/{filteredQuests.length} completed</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryPotential}>Up to</Text>
            <Text style={styles.summaryAmount}>🏋️ {totalReward}</Text>
            <Text style={styles.summaryPotential}>remaining</Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onClaim={() => completeQuest(quest.code)}
            />
          ))}

          {filteredQuests.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48 }}>🏆</Text>
              <Text style={styles.emptyText}>All quests done!</Text>
              <Text style={styles.emptySubText}>Come back after reset for more.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  safeArea: { flex: 1 },

  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  backBtn: { fontFamily: typography.displayFont, fontSize: 26, color: colors.textPrimary },
  screenTitle: { flex: 1, fontFamily: typography.displayFont, fontSize: 28, letterSpacing: 3, color: colors.textPrimary },
  balanceChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.surface1, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(255,94,26,0.3)" },
  balanceIcon: { fontSize: 16 },

  tabs: { flexDirection: "row", paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radii.md, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.surface2, alignItems: "center" },
  tabActive: { backgroundColor: "rgba(255,94,26,0.15)", borderColor: colors.primary },
  tabLabel: { fontFamily: typography.displayFont, fontSize: 13, letterSpacing: 1.5, color: colors.textMuted },
  tabLabelActive: { color: colors.primary },
  tabSub: { fontFamily: typography.bodyFont, fontSize: 10, color: colors.textDim, marginTop: 2 },

  summaryBar: { marginHorizontal: 20, borderRadius: radii.lg, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,94,26,0.2)" },
  summaryLabel: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted },
  summaryDone: { fontFamily: typography.displayFont, fontSize: 15, letterSpacing: 1, color: colors.textPrimary },
  summaryRight: { alignItems: "flex-end", gap: 2 },
  summaryPotential: { fontFamily: typography.bodyFont, fontSize: 10, color: colors.textDim },
  summaryAmount: { fontFamily: typography.displayFont, fontSize: 20, letterSpacing: 1, color: colors.primary },

  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },

  // Quest card
  questCard: { borderRadius: radii.xl, overflow: "hidden", borderWidth: 1, borderColor: colors.surface2, ...shadows.card },
  questCardDone: { borderColor: "rgba(34,197,94,0.3)", opacity: 0.75 },
  questCardInner: { padding: 16, gap: 10 },
  questRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  questIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,94,26,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,94,26,0.25)" },
  questIcon: { fontSize: 22 },
  questTitle: { fontFamily: typography.displayFont, fontSize: 17, letterSpacing: 0.8, color: colors.textPrimary },
  questTitleDone: { color: colors.success },
  questDesc: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  rewardBadge: { alignItems: "center", gap: 2 },
  rewardDumbbell: { fontSize: 18 },
  rewardAmount: { fontFamily: typography.displayFont, fontSize: 13, letterSpacing: 0.5, color: colors.primary },

  progressTrack: { height: 6, backgroundColor: colors.surface2, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  progressRow: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontFamily: typography.bodyFont, fontSize: 11, color: colors.textDim },
  xpLabel: { fontFamily: typography.bodyFont, fontSize: 11, color: colors.info },

  claimBtn: { borderRadius: radii.md, overflow: "hidden" },
  claimBtnInner: { paddingVertical: 10, alignItems: "center" },
  claimBtnText: { fontFamily: typography.displayFont, fontSize: 14, letterSpacing: 1.5, color: "#FFFFFF" },

  claimedBadge: { backgroundColor: "rgba(34,197,94,0.12)", borderRadius: radii.md, paddingVertical: 8, alignItems: "center", borderWidth: 1, borderColor: "rgba(34,197,94,0.3)" },
  claimedText: { fontFamily: typography.displayFont, fontSize: 12, letterSpacing: 1.5, color: colors.success },

  emptyState: { alignItems: "center", gap: 12, paddingTop: 60 },
  emptyText: { fontFamily: typography.displayFont, fontSize: 22, letterSpacing: 1, color: colors.textPrimary },
  emptySubText: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textMuted },
});
