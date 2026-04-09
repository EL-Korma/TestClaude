import React, { useState, useRef, useEffect } from "react";
import {
  Alert, Animated, Linking, Pressable,
  ScrollView, StyleSheet, Switch, Text, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import { colors, radii, typography } from "../../../theme/tokens";
import { useAuth } from "../../../store/AuthStore";
import { groupsApi } from "../../../services/api";

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Animated setting row ─────────────────────────────────────────────────────

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
  badge?: string;
  delay?: number;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon, label, sub, onPress, toggle, toggleValue, onToggle,
  danger, last, badge, delay = 0,
}) => {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    if (onPress) Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ translateX: slideAnim }, { scale: scaleAnim }], opacity: opacityAnim }, last && styles.rowLast]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.row, last && { borderBottomWidth: 0 }]}
        disabled={toggle && !onPress}
      >
        <View style={[styles.rowIcon, danger && { backgroundColor: "rgba(239,68,68,0.12)" }]}>
          <Text style={{ fontSize: 18 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowLabel, danger && { color: "#EF4444" }]}>{label}</Text>
          {sub && <Text style={styles.rowSub}>{sub}</Text>}
        </View>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {toggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: colors.surface2, true: "rgba(255,94,26,0.5)" }}
            thumbColor={toggleValue ? colors.primary : colors.textMuted}
          />
        ) : (
          <Text style={[styles.rowChevron, danger && { color: "#EF4444" }]}>›</Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

// ─── Section ──────────────────────────────────────────────────────────────────

const Section = ({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) => {
  const slideAnim = useRef(new Animated.Value(16)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.section, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </Animated.View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

export const SettingsScreen = () => {
  const navigation = useNavigation<Nav>();
  const { logout, user, token } = useAuth();

  const [notifStreak, setNotifStreak] = useState(true);
  const [notifQuests, setNotifQuests] = useState(true);
  const [notifPartner, setNotifPartner] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [shareActivity, setShareActivity] = useState(true);
  const [partnerName, setPartnerName] = useState<string | null>(null);

  const headerSlide = useRef(new Animated.Value(-20)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerSlide, { toValue: 0, duration: 450, useNativeDriver: true }),
      Animated.timing(headerOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
    ]).start();

    if (token) {
      groupsApi.mine().then((groups) => {
        const active = groups.find((g) => g.members.filter((m) => m.status !== "LEFT").length >= 2);
        if (active) {
          const pm = active.members.find((m) => m.userId !== user?.id && m.status !== "LEFT");
          if (pm) setPartnerName(pm.user.name.split(" ")[0]);
        }
      }).catch(() => {});
    }
  }, [token]);

  const handleLogout = () => {
    const confirmed = typeof window !== "undefined"
      ? window.confirm("Are you sure you want to log out?")
      : true;
    if (confirmed) { navigation.popToTop(); logout(); }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This permanently deletes your account, all check-ins, streaks, and rewards. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: () => Alert.alert("Deletion requested", "Our team will process this within 48 hours.\nsupport@twinfit.app"),
        },
      ]
    );
  };

  const openLink = (url: string, fallback: string) => {
    Linking.canOpenURL(url).then((ok) => {
      if (ok) Linking.openURL(url);
      else Alert.alert("Link", fallback);
    }).catch(() => Alert.alert("Link", fallback));
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerSlide }] }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.screenTitle}>SETTINGS</Text>
          <Pressable onPress={() => navigation.navigate("Activity")} style={styles.bellBtn}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </Pressable>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* User card */}
          <Section title="ACCOUNT" delay={50}>
            <SettingRow
              icon="👤" label="Profile Settings" sub="Edit name, avatar & bio"
              onPress={() => navigation.navigate("ProfileSettings")} delay={80}
            />
            <SettingRow
              icon="🔗" label="Linked Partner"
              sub={partnerName ? `${partnerName} • Connected` : "No partner linked"}
              badge={partnerName ? "ACTIVE" : undefined}
              onPress={() => navigation.navigate("LinkedPartner")} delay={110}
            />
            <SettingRow
              icon="🔐" label="Change Password"
              onPress={() => navigation.navigate("ChangePassword")} delay={140} last
            />
          </Section>

          <Section title="NOTIFICATIONS" delay={180}>
            <SettingRow
              icon="🔥" label="Streak Reminders" sub="Alert when streak is at risk"
              toggle toggleValue={notifStreak} onToggle={setNotifStreak} delay={210}
            />
            <SettingRow
              icon="⚔️" label="Quest Resets" sub="When new quests are available"
              toggle toggleValue={notifQuests} onToggle={setNotifQuests} delay={240}
            />
            <SettingRow
              icon="🤝" label="Partner Activity" sub="When your partner logs a session"
              toggle toggleValue={notifPartner} onToggle={setNotifPartner} delay={270} last
            />
          </Section>

          <Section title="APPEARANCE" delay={310}>
            <SettingRow
              icon="🌑" label="Dark Mode" sub="Always on — built for the night"
              toggle toggleValue={true} onToggle={() => {}} delay={340}
            />
            <SettingRow
              icon="📳" label="Haptic Feedback" sub="Vibration on key actions"
              toggle toggleValue={haptics} onToggle={setHaptics} delay={370} last
            />
          </Section>

          <Section title="PRIVACY" delay={410}>
            <SettingRow
              icon="🌐" label="Public Profile" sub="Visible on leaderboards"
              toggle toggleValue={publicProfile} onToggle={setPublicProfile} delay={440}
            />
            <SettingRow
              icon="📊" label="Share Activity" sub="Let partner see your sessions"
              toggle toggleValue={shareActivity} onToggle={setShareActivity} delay={470}
            />
            <SettingRow
              icon="📄" label="Privacy Policy"
              onPress={() => openLink("https://twinfit.app/privacy", "Visit twinfit.app/privacy")}
              delay={500} last
            />
          </Section>

          <Section title="SUPPORT" delay={540}>
            <SettingRow
              icon="💬" label="Contact Support" sub="support@twinfit.app"
              onPress={() => openLink("mailto:support@twinfit.app", "Email us at support@twinfit.app")}
              delay={570}
            />
            <SettingRow
              icon="⭐" label="Rate TwinFit" sub="Love the app? Let us know!"
              onPress={() => Alert.alert("Thank you! ⭐", "App Store review opens on launch.\nYou're amazing for doing this!")}
              delay={600}
            />
            <SettingRow
              icon="📋" label="Terms of Service"
              onPress={() => openLink("https://twinfit.app/terms", "Visit twinfit.app/terms")}
              delay={630} last
            />
          </Section>

          <Section title="ACCOUNT ACTIONS" delay={670}>
            <SettingRow
              icon="🚪" label="Log Out" onPress={handleLogout} danger delay={700}
            />
            <SettingRow
              icon="🗑️" label="Delete Account" sub="Permanent — cannot be undone"
              onPress={handleDeleteAccount} danger delay={730} last
            />
          </Section>

          <Text style={styles.version}>TwinFit v1.0.0 · Built with 🔥 by the TwinFit team</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  safeArea: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  backBtn: { width: 36 },
  backIcon: { fontFamily: typography.displayFont, fontSize: 26, color: colors.textPrimary },
  screenTitle: { flex: 1, fontFamily: typography.displayFont, fontSize: 28, letterSpacing: 3, color: colors.textPrimary },
  bellBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface1, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.surface2 },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },

  section: { marginTop: 24 },
  sectionTitle: { fontFamily: typography.displayFont, fontSize: 12, letterSpacing: 2, color: colors.textDim, marginBottom: 8, marginLeft: 4 },
  sectionCard: { backgroundColor: colors.surface0, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.surface2, overflow: "hidden" },

  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.surface2 },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface1, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontFamily: typography.bodyMediumFont ?? typography.bodyFont, fontSize: 15, color: colors.textPrimary },
  rowSub: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  rowChevron: { fontFamily: typography.bodyFont, fontSize: 22, color: colors.textDim },

  badge: { backgroundColor: "rgba(34,197,94,0.15)", borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(34,197,94,0.3)", marginRight: 4 },
  badgeText: { fontFamily: typography.displayFont, fontSize: 10, letterSpacing: 1, color: "#22C55E" },

  version: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textDim, textAlign: "center", marginTop: 36, marginBottom: 12 },
});
