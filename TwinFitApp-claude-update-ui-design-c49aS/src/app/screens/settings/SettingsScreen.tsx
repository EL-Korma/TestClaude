import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import { colors, radii, typography } from "../../../theme/tokens";
import { useAuth } from "../../../store/AuthStore";

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Setting row ─────────────────────────────────────────────────────────────

interface SettingRowProps {
  icon: string;
  label: string;
  sub?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  danger?: boolean;
  last?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon, label, sub, onPress, toggle, toggleValue, onToggle, danger, last,
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.row, last && styles.rowLast]}
    disabled={toggle && !onPress}
  >
    <View style={styles.rowIcon}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.rowLabel, danger && { color: colors.accentRed }]}>{label}</Text>
      {sub && <Text style={styles.rowSub}>{sub}</Text>}
    </View>
    {toggle ? (
      <Switch
        value={toggleValue}
        onValueChange={onToggle}
        trackColor={{ false: colors.surface2, true: "rgba(255,94,26,0.5)" }}
        thumbColor={toggleValue ? colors.primary : colors.textMuted}
      />
    ) : (
      <Text style={styles.rowChevron}>›</Text>
    )}
  </Pressable>
);

// ─── Section ─────────────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

// ─── SettingsScreen ───────────────────────────────────────────────────────────

export const SettingsScreen = () => {
  const navigation = useNavigation<Nav>();
  const { logout, user } = useAuth();

  // Toggle states (UI-only, would persist to storage in production)
  const [notifStreak, setNotifStreak] = useState(true);
  const [notifQuests, setNotifQuests] = useState(true);
  const [notifPartner, setNotifPartner] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [shareActivity, setShareActivity] = useState(true);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => { logout(); } },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => Alert.alert("We're sorry to see you go", "Account deletion requested.") },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Text style={styles.backBtn}>←</Text>
          </Pressable>
          <Text style={styles.screenTitle}>SETTINGS</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Account ───────────────────────────────── */}
          <Section title="ACCOUNT">
            <SettingRow
              icon="👤"
              label="Profile Settings"
              sub="Edit name, avatar, bio"
              onPress={() => navigation.navigate("ProfileSettings")}
            />
            <SettingRow
              icon="🔗"
              label="Linked Partner"
              sub="Aya • Connected"
              onPress={() => Alert.alert("Partner", "Partner management coming soon!")}
            />
            <SettingRow
              icon="🔐"
              label="Change Password"
              onPress={() => Alert.alert("Password", "Password reset coming soon!")}
              last
            />
          </Section>

          {/* ── Notifications ─────────────────────────── */}
          <Section title="NOTIFICATIONS">
            <SettingRow
              icon="🔥"
              label="Streak Reminders"
              sub="Get alerted before your streak breaks"
              toggle
              toggleValue={notifStreak}
              onToggle={setNotifStreak}
            />
            <SettingRow
              icon="⚔️"
              label="Quest Resets"
              sub="Notified when new quests are available"
              toggle
              toggleValue={notifQuests}
              onToggle={setNotifQuests}
            />
            <SettingRow
              icon="🤝"
              label="Partner Activity"
              sub="When your partner logs a session"
              toggle
              toggleValue={notifPartner}
              onToggle={setNotifPartner}
              last
            />
          </Section>

          {/* ── Appearance ────────────────────────────── */}
          <Section title="APPEARANCE">
            <SettingRow
              icon="🌑"
              label="Dark Mode"
              sub="Always on (recommended)"
              toggle
              toggleValue={darkMode}
              onToggle={setDarkMode}
            />
            <SettingRow
              icon="📳"
              label="Haptic Feedback"
              toggle
              toggleValue={haptics}
              onToggle={setHaptics}
              last
            />
          </Section>

          {/* ── Privacy ───────────────────────────────── */}
          <Section title="PRIVACY">
            <SettingRow
              icon="🌐"
              label="Public Profile"
              sub="Visible on leaderboards"
              toggle
              toggleValue={publicProfile}
              onToggle={setPublicProfile}
            />
            <SettingRow
              icon="📊"
              label="Share Activity"
              sub="Let your partner see your sessions"
              toggle
              toggleValue={shareActivity}
              onToggle={setShareActivity}
            />
            <SettingRow
              icon="📄"
              label="Privacy Policy"
              onPress={() => Alert.alert("Privacy Policy", "Opens privacy policy link")}
              last
            />
          </Section>

          {/* ── Support ───────────────────────────────── */}
          <Section title="SUPPORT">
            <SettingRow icon="💬" label="Contact Support" onPress={() => Alert.alert("Support", "support@twinfit.app")} />
            <SettingRow icon="⭐" label="Rate TwinFit" onPress={() => Alert.alert("Rating", "Opens App Store review")} />
            <SettingRow icon="📋" label="Terms of Service" onPress={() => Alert.alert("Terms", "Opens terms link")} last />
          </Section>

          {/* ── Danger zone ───────────────────────────── */}
          <Section title="ACCOUNT ACTIONS">
            <SettingRow icon="🚪" label="Log Out" onPress={handleLogout} danger />
            <SettingRow icon="🗑️" label="Delete Account" onPress={handleDeleteAccount} danger last />
          </Section>

          <Text style={styles.version}>TwinFit v1.0.0 · Built with 🔥</Text>
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
  scroll: { paddingHorizontal: 20, paddingBottom: 50, gap: 0 },

  section: { marginTop: 24 },
  sectionTitle: { fontFamily: typography.displayFont, fontSize: 12, letterSpacing: 2, color: colors.textDim, marginBottom: 8, marginLeft: 4 },
  sectionCard: { backgroundColor: colors.surface0, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.surface2, overflow: "hidden" },

  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.surface2 },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface1, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontFamily: typography.bodyMediumFont, fontSize: 15, color: colors.textPrimary },
  rowSub: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  rowChevron: { fontFamily: typography.bodyFont, fontSize: 22, color: colors.textDim },

  version: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textDim, textAlign: "center", marginTop: 32 },
});
