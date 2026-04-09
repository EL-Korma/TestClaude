import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { colors, radii, shadows, typography } from "../../../theme/tokens";
import { useDumbbells, SHOP_BORDERS } from "../../../store/DumbbellStore";
import { useAuth } from "../../../store/AuthStore";
import { meApi, streaksApi } from "../../../services/api";

const AVATARS = ["🦁", "🦋", "🐺", "🦅", "🐯", "🦊", "🐉", "💪"];

export const ProfileSettingsScreen = () => {
  const navigation = useNavigation();
  const { state, setBorder } = useDumbbells();
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user ? `${user.name} ${user.surname}` : "");
  const [bio, setBio] = useState(user?.profile?.bio ?? "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.profile?.avatarEmoji ?? "🦁");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    streaksApi.me().then((s) => { if (s) setStreak(s.current); }).catch(() => {});
  }, []);

  const activeBorder = SHOP_BORDERS.find((b) => b.code === state.activeBorder);
  const borderColor = activeBorder?.color ?? "transparent";

  const handleSave = async () => {
    setSaving(true);
    try {
      await meApi.updateProfile({ avatarEmoji: selectedAvatar, bio });
      await refreshUser();
      setSaved(true);
      setTimeout(() => { setSaved(false); navigation.goBack(); }, 1200);
    } catch (e: any) {
      Alert.alert("Save failed", e.message ?? "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Text style={styles.backBtn}>←</Text>
          </Pressable>
          <Text style={styles.screenTitle}>PROFILE</Text>
          <Pressable onPress={handleSave} style={styles.saveBtn} disabled={saving}>
            {saving
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={styles.saveBtnText}>{saved ? "✓ SAVED" : "SAVE"}</Text>}
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Avatar preview ───────────────────────── */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatarRing, { borderColor: borderColor === "transparent" ? colors.surface2 : borderColor, shadowColor: borderColor }]}>
              <Text style={styles.avatarEmoji}>{selectedAvatar}</Text>
            </View>
            {activeBorder && activeBorder.code !== "br0" && (
              <View style={styles.borderBadge}>
                <Text style={styles.borderBadgeText}>{activeBorder.label}</Text>
              </View>
            )}
          </View>

          {/* ── Avatar picker ────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>CHOOSE AVATAR</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((emoji, i) => (
                <Pressable
                  key={i}
                  style={[styles.avatarOption, selectedAvatar === emoji && styles.avatarOptionActive]}
                  onPress={() => setSelectedAvatar(emoji)}
                >
                  <Text style={{ fontSize: 30 }}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── Name & Bio ───────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>DISPLAY NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor={colors.textDim}
              selectionColor={colors.primary}
              maxLength={24}
            />
            <Text style={styles.inputHint}>{name.length}/24</Text>

            <Text style={[styles.cardTitle, { marginTop: 16 }]}>BIO</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={bio}
              onChangeText={setBio}
              placeholderTextColor={colors.textDim}
              selectionColor={colors.primary}
              multiline
              maxLength={100}
              numberOfLines={3}
            />
            <Text style={styles.inputHint}>{bio.length}/100</Text>
          </View>

          {/* ── Active border ────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ACTIVE BORDER</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.borderRow}>
              {SHOP_BORDERS.map((border) => {
                const owned = state.ownedBorders.includes(border.code);
                const isActive = state.activeBorder === border.code;
                return (
                  <Pressable
                    key={border.code}
                    onPress={() => {
                      if (owned) setBorder(border.code);
                      else Alert.alert("Not Owned", `Buy ${border.label} in the Shop for 🏋️ ${border.cost}!`);
                    }}
                    style={[styles.borderChip, isActive && { borderColor: border.color }]}
                  >
                    <View style={[styles.borderChipRing, { borderColor: owned ? border.color : colors.surface2 }]}>
                      <Text style={{ fontSize: 18, opacity: owned ? 1 : 0.3 }}>🦁</Text>
                    </View>
                    <Text style={[styles.borderChipLabel, { color: isActive ? border.color : colors.textMuted }]}>
                      {border.label}
                    </Text>
                    {!owned && <Text style={styles.lockLabel}>🔒</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Stats (read-only) ────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>LIFETIME STATS</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>Streak 🔥</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{state.totalEarned}</Text>
                <Text style={styles.statLabel}>🏋️ Earned</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{state.xp}</Text>
                <Text style={styles.statLabel}>XP Total</Text>
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
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  backBtn: { fontFamily: typography.displayFont, fontSize: 26, color: colors.textPrimary },
  screenTitle: { flex: 1, fontFamily: typography.displayFont, fontSize: 28, letterSpacing: 3, color: colors.textPrimary },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: { fontFamily: typography.displayFont, fontSize: 13, letterSpacing: 1.5, color: "#FFF" },
  scroll: { paddingHorizontal: 20, paddingBottom: 50, gap: 16 },

  avatarSection: { alignItems: "center", paddingVertical: 20, gap: 8 },
  avatarRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, alignItems: "center", justifyContent: "center",
    backgroundColor: colors.surface1,
    shadowOpacity: 0.6, shadowRadius: 16, elevation: 10,
  },
  avatarEmoji: { fontSize: 52 },
  borderBadge: { backgroundColor: "rgba(255,94,26,0.15)", borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,94,26,0.3)" },
  borderBadgeText: { fontFamily: typography.displayFont, fontSize: 11, letterSpacing: 1, color: colors.primary },

  card: { backgroundColor: colors.surface0, borderRadius: radii.xl, padding: 16, borderWidth: 1, borderColor: colors.surface2, ...shadows.card },
  cardTitle: { fontFamily: typography.displayFont, fontSize: 12, letterSpacing: 2, color: colors.textDim, marginBottom: 12 },

  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  avatarOption: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface1, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: colors.surface2 },
  avatarOptionActive: { borderColor: colors.primary, backgroundColor: "rgba(255,94,26,0.12)" },

  input: { backgroundColor: colors.surface1, borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 12, fontFamily: typography.bodyFont, fontSize: 16, color: colors.textPrimary, borderWidth: 1, borderColor: colors.surface2 },
  inputMulti: { height: 80, textAlignVertical: "top" },
  inputHint: { fontFamily: typography.bodyFont, fontSize: 11, color: colors.textDim, textAlign: "right", marginTop: 4 },

  borderRow: { gap: 12, paddingRight: 4 },
  borderChip: { alignItems: "center", gap: 6, padding: 10, borderRadius: radii.lg, backgroundColor: colors.surface1, borderWidth: 1.5, borderColor: colors.surface2, minWidth: 70 },
  borderChipRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, alignItems: "center", justifyContent: "center" },
  borderChipLabel: { fontFamily: typography.bodyFont, fontSize: 10, textAlign: "center" },
  lockLabel: { fontSize: 10 },

  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontFamily: typography.displayFont, fontSize: 28, letterSpacing: 1, color: colors.primary },
  statLabel: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted },
  statDivider: { width: 1, height: 40, backgroundColor: colors.surface2 },
});
