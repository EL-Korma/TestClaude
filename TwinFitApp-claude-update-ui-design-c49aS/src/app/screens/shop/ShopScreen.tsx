import React, { useState, useRef } from "react";
import {
  Alert,
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
import {
  useDumbbells,
  SHOP_PACKS,
  SHOP_BOOSTS,
  SHOP_BORDERS,
  ShopBorder,
  ShopBoost,
} from "../../../store/DumbbellStore";
import { Counter } from "../../../components";

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader = ({ title, sub }: { title: string; sub?: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {sub && <Text style={styles.sectionSub}>{sub}</Text>}
  </View>
);

// ─── Dumbbell Pack card ───────────────────────────────────────────────────────

const PackCard = ({ pack }: { pack: typeof SHOP_PACKS[0] }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 8 }),
    ]).start();
    Alert.alert("Purchase", `Buy ${pack.dumbbells}${pack.bonus ? ` (+${pack.bonus.replace("+", "")})` : ""} dumbbells for ${pack.price}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Buy", onPress: () => Alert.alert("Coming Soon", "In-app purchases will be available soon!") },
    ]);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable onPress={handlePress}>
        <LinearGradient
          colors={pack.popular ? ["#2A1208", "#1C1008"] : ["#1C1C1C", "#141414"]}
          style={[styles.packCard, pack.popular && styles.packCardPopular]}
        >
          {pack.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>BEST VALUE</Text>
            </View>
          )}
          <Text style={styles.packDumbbell}>🏋️</Text>
          <Text style={styles.packAmount}>{pack.dumbbells.toLocaleString()}</Text>
          {pack.bonus && <Text style={styles.packBonus}>{pack.bonus}</Text>}
          <Text style={styles.packLabel}>{pack.label}</Text>
          <View style={styles.packPriceRow}>
            <Text style={[styles.packPrice, pack.popular && { color: colors.primary }]}>{pack.price}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

// ─── Boost card ───────────────────────────────────────────────────────────────

const BoostCard = ({ boost }: { boost: ShopBoost }) => {
  const { state, activateBoost, isBoostActive } = useDumbbells();
  const active = isBoostActive();
  const canAfford = state.balance >= boost.cost;

  const handleBuy = () => {
    if (active) {
      Alert.alert("Boost Active", "You already have an active XP boost!");
      return;
    }
    if (!canAfford) {
      Alert.alert("Not Enough 🏋️", `You need ${boost.cost} dumbbells. Earn more via quests or buy a pack!`);
      return;
    }
    Alert.alert(
      `Activate ${boost.label}?`,
      `${boost.description}\nCost: 🏋️ ${boost.cost}`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Activate!", onPress: () => activateBoost(boost) },
      ]
    );
  };

  return (
    <Pressable onPress={handleBuy} style={styles.boostCard}>
      <LinearGradient colors={["#0E1220", "#141414"]} style={styles.boostInner}>
        <Text style={styles.boostIcon}>{boost.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.boostLabel}>{boost.label}</Text>
          <Text style={styles.boostDesc}>{boost.description}</Text>
        </View>
        <View style={[styles.boostCost, !canAfford && styles.boostCostDim]}>
          <Text style={styles.boostCostText}>🏋️ {boost.cost}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
};

// ─── Border card ─────────────────────────────────────────────────────────────

const RARITY_CONFIG: Record<string, { label: string; color: string; cardBg: readonly [string, string] }> = {
  common:    { label: "COMMON",    color: "#8A8A8A", cardBg: ["#141414", "#1C1C1C"] },
  rare:      { label: "RARE",      color: "#FF5E1A", cardBg: ["#1C1008", "#141414"] },
  legendary: { label: "LEGENDARY", color: "#FFD700", cardBg: ["#1C1800", "#141414"] },
  mythic:    { label: "✦ MYTHIC",  color: "#C084FC", cardBg: ["#1A0A2E", "#0D0D1A"] },
};

const BorderCard = ({ border }: { border: ShopBorder }) => {
  const { state, purchaseBorder, setBorder } = useDumbbells();
  const owned = state.ownedBorders.includes(border.code);
  const active = state.activeBorder === border.code;
  const canAfford = state.balance >= border.cost;
  const rc = RARITY_CONFIG[border.rarity] ?? RARITY_CONFIG.common;
  const ringColor = border.color === "transparent" ? colors.surface2 : border.color;

  const handlePress = () => {
    if (owned) { setBorder(border.code); return; }
    if (!canAfford) {
      Alert.alert("Not Enough 🏋️", `You need 🏋️ ${border.cost} dumbbells!\n\n"${border.description}"`);
      return;
    }
    Alert.alert(
      `${border.icon}  ${border.label}`,
      `${border.description}\n\nCost: 🏋️ ${border.cost}`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Buy & Equip", onPress: async () => { await purchaseBorder(border.code); setBorder(border.code); } },
      ]
    );
  };

  return (
    <Pressable onPress={handlePress} style={styles.borderCardWrap}>
      <LinearGradient
        colors={rc.cardBg as [string, string]}
        style={[
          styles.borderCard,
          active && { borderColor: ringColor, borderWidth: 1.5 },
          border.rarity === "mythic" && styles.borderCardMythic,
        ]}
      >
        {/* Rarity stripe */}
        <View style={[styles.rarityStripe, { backgroundColor: rc.color }]} />

        {/* Ring preview */}
        <View style={[
          styles.borderPreview,
          { borderColor: ringColor, shadowColor: ringColor },
          border.color2 && { borderStyle: "solid" },
        ]}>
          {border.color2 ? (
            // Dual-color ring: outer glow in color2
            <View style={[styles.borderPreviewInner, { backgroundColor: `${border.color2}22` }]}>
              <Text style={{ fontSize: 26 }}>🦁</Text>
            </View>
          ) : (
            <Text style={{ fontSize: 26 }}>🦁</Text>
          )}
        </View>

        <Text style={[styles.borderLabel, { color: active ? ringColor : colors.textPrimary }]} numberOfLines={1}>
          {border.label}
        </Text>
        <Text style={[styles.borderRarity, { color: rc.color }]}>{rc.label}</Text>
        <Text style={styles.borderDesc} numberOfLines={2}>{border.description}</Text>

        {owned ? (
          <View style={[styles.borderStatusBtn, { backgroundColor: active ? `${ringColor}30` : colors.surface2, borderColor: active ? ringColor : "transparent" }]}>
            <Text style={[styles.borderStatusText, { color: active ? ringColor : colors.textMuted }]}>
              {active ? "✓ EQUIPPED" : "EQUIP"}
            </Text>
          </View>
        ) : (
          <View style={[styles.borderStatusBtn, { backgroundColor: canAfford ? "rgba(255,94,26,0.12)" : colors.surface1 }]}>
            <Text style={[styles.borderStatusText, { color: canAfford ? colors.primary : colors.textDim }]}>
              🏋️ {border.cost.toLocaleString()}
            </Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
};

// ─── ShopScreen ───────────────────────────────────────────────────────────────

export const ShopScreen = () => {
  const navigation = useNavigation();
  const { state, isBoostActive } = useDumbbells();
  const boostOn = isBoostActive();

  const timeLeft = state.xpBoostExpiresAt
    ? Math.max(0, Math.round((state.xpBoostExpiresAt - Date.now()) / 3600000))
    : 0;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Text style={styles.backBtn}>←</Text>
          </Pressable>
          <Text style={styles.screenTitle}>SHOP</Text>
          <View style={styles.balanceChip}>
            <Text style={styles.balanceIcon}>🏋️</Text>
            <Counter value={state.balance} fontSize={16} color={colors.primary} fontFamily={typography.displayFont} />
          </View>
        </View>

        {/* Active boost banner */}
        {boostOn && (
          <LinearGradient colors={["#0E1220", "#141414"]} style={styles.boostBanner}>
            <Text style={{ fontSize: 22 }}>⚡</Text>
            <Text style={styles.boostBannerText}>{state.xpMultiplier}× XP BOOST ACTIVE — {timeLeft}h remaining</Text>
          </LinearGradient>
        )}

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Dumbbell Packs ───────────────────────────────────────── */}
          <SectionHeader title="🏋️ DUMBBELL PACKS" sub="Fuel your grind" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.packsRow}>
            {SHOP_PACKS.map((p) => <PackCard key={p.id} pack={p} />)}
          </ScrollView>

          {/* ── XP Boosts ────────────────────────────────────────────── */}
          <SectionHeader title="⚡ XP BOOSTS" sub="Earn dumbbells faster" />
          <View style={styles.boostsCol}>
            {SHOP_BOOSTS.map((b) => <BoostCard key={b.id} boost={b} />)}
          </View>

          {/* ── Avatar Borders ───────────────────────────────────────── */}
          <SectionHeader title="🎨 AVATAR BORDERS" sub="Show off your rank" />

          {(["common", "rare", "legendary", "mythic"] as const).map((rarity) => {
            const group = SHOP_BORDERS.filter((b) => b.rarity === rarity);
            if (group.length === 0) return null;
            const rc = { common: { label: "COMMON", color: "#8A8A8A" }, rare: { label: "RARE", color: "#FF5E1A" }, legendary: { label: "LEGENDARY", color: "#FFD700" }, mythic: { label: "✦ MYTHIC", color: "#C084FC" } }[rarity];
            return (
              <View key={rarity} style={{ marginBottom: 8 }}>
                <Text style={[styles.rarityGroupLabel, { color: rc.color }]}>{rc.label}</Text>
                <View style={styles.bordersGrid}>
                  {group.map((b) => <BorderCard key={b.id} border={b} />)}
                </View>
              </View>
            );
          })}

          {/* Earn more hint */}
          <LinearGradient colors={["#1C1008", "#141414"]} style={styles.earnHint}>
            <Text style={styles.earnHintIcon}>💡</Text>
            <Text style={styles.earnHintText}>
              Complete quests daily to earn free dumbbells. A full quest day = ~55 🏋️.
            </Text>
          </LinearGradient>
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

  boostBanner: { marginHorizontal: 20, borderRadius: radii.lg, flexDirection: "row", gap: 10, padding: 14, alignItems: "center", marginBottom: 8, borderWidth: 1, borderColor: "rgba(59,130,246,0.4)" },
  boostBannerText: { fontFamily: typography.displayFont, fontSize: 13, letterSpacing: 1, color: colors.info },

  scroll: { paddingHorizontal: 20, paddingBottom: 50, gap: 0 },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 24, marginBottom: 14 },
  sectionTitle: { fontFamily: typography.displayFont, fontSize: 18, letterSpacing: 2, color: colors.textPrimary },
  sectionSub: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted },

  // Packs
  packsRow: { gap: 12, paddingRight: 20 },
  packCard: { width: 130, borderRadius: radii.xl, padding: 16, alignItems: "center", gap: 4, borderWidth: 1, borderColor: colors.surface2, ...shadows.card },
  packCardPopular: { borderColor: "rgba(255,94,26,0.5)" },
  popularBadge: { backgroundColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  popularBadgeText: { fontFamily: typography.displayFont, fontSize: 9, letterSpacing: 1, color: "#FFF" },
  packDumbbell: { fontSize: 32 },
  packAmount: { fontFamily: typography.displayFont, fontSize: 28, letterSpacing: 1, color: colors.textPrimary },
  packBonus: { fontFamily: typography.bodyFont, fontSize: 11, color: colors.success },
  packLabel: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted },
  packPriceRow: { marginTop: 6 },
  packPrice: { fontFamily: typography.displayFont, fontSize: 16, letterSpacing: 0.5, color: colors.textPrimary },

  // Boosts
  boostsCol: { gap: 10 },
  boostCard: { borderRadius: radii.xl, overflow: "hidden", borderWidth: 1, borderColor: "rgba(59,130,246,0.2)", ...shadows.card },
  boostInner: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  boostIcon: { fontSize: 28 },
  boostLabel: { fontFamily: typography.displayFont, fontSize: 17, letterSpacing: 1, color: colors.textPrimary },
  boostDesc: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  boostCost: { backgroundColor: "rgba(59,130,246,0.15)", borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(59,130,246,0.3)" },
  boostCostDim: { opacity: 0.4 },
  boostCostText: { fontFamily: typography.displayFont, fontSize: 14, letterSpacing: 0.5, color: colors.info },

  // Borders
  bordersGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  borderCardWrap: { width: "47%" },
  borderCard: { borderRadius: radii.xl, padding: 14, alignItems: "center", gap: 5, borderWidth: 1, borderColor: colors.surface2, ...shadows.card, overflow: "hidden", position: "relative" },
  borderCardMythic: { borderColor: "rgba(192,132,252,0.4)" },
  rarityStripe: { position: "absolute", top: 0, left: 0, right: 0, height: 3 },
  borderPreview: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, alignItems: "center", justifyContent: "center", shadowOpacity: 0.6, shadowRadius: 10, elevation: 8, marginTop: 6 },
  borderPreviewInner: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  borderLabel: { fontFamily: typography.displayFont, fontSize: 14, letterSpacing: 0.8, textAlign: "center" },
  borderRarity: { fontFamily: typography.displayFont, fontSize: 9, letterSpacing: 1.5 },
  borderDesc: { fontFamily: typography.bodyFont, fontSize: 10, color: colors.textDim, textAlign: "center", lineHeight: 13 },
  borderStatusBtn: { borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 6, marginTop: 4, borderWidth: 1, borderColor: "transparent" },
  borderStatusText: { fontFamily: typography.displayFont, fontSize: 11, letterSpacing: 1 },
  rarityGroupLabel: { fontFamily: typography.displayFont, fontSize: 11, letterSpacing: 2, marginBottom: 10, marginTop: 4 },

  // Earn hint
  earnHint: { marginTop: 28, borderRadius: radii.xl, flexDirection: "row", gap: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,94,26,0.2)" },
  earnHintIcon: { fontSize: 22 },
  earnHintText: { flex: 1, fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted, lineHeight: 18 },
});
