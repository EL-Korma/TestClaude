import React, { useState, useRef } from "react";
import {
  Alert, Animated, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { colors, radii, shadows, typography } from "../../../theme/tokens";
import { meApi } from "../../../services/api";

export const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Shake animation for error
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const strength = (() => {
    if (next.length === 0) return 0;
    let score = 0;
    if (next.length >= 8) score++;
    if (/[A-Z]/.test(next)) score++;
    if (/[0-9]/.test(next)) score++;
    if (/[^A-Za-z0-9]/.test(next)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#EF4444", "#F59E0B", "#22C55E", "#FF5E1A"][strength];

  const handleSave = async () => {
    if (!current || !next || !confirm) { shake(); Alert.alert("Fill all fields"); return; }
    if (next !== confirm) { shake(); Alert.alert("Passwords don't match"); return; }
    if (next.length < 8) { shake(); Alert.alert("Password too short", "Minimum 8 characters"); return; }
    setLoading(true);
    try {
      await meApi.changePassword(current, next);
      setDone(true);
      Animated.spring(successScale, { toValue: 1, useNativeDriver: true, damping: 10 }).start();
      setTimeout(() => navigation.goBack(), 2000);
    } catch (e: any) {
      shake();
      Alert.alert("Failed", e.message ?? "Could not update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.title}>CHANGE PASSWORD</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {done ? (
              <Animated.View style={[styles.successBox, { transform: [{ scale: successScale }] }]}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successTitle}>PASSWORD UPDATED</Text>
                <Text style={styles.successSub}>Redirecting you back…</Text>
              </Animated.View>
            ) : (
              <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>

                <Text style={styles.sectionLabel}>CURRENT PASSWORD</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter current password"
                    placeholderTextColor={colors.textDim}
                    secureTextEntry
                    value={current}
                    onChangeText={setCurrent}
                  />
                </View>

                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>NEW PASSWORD</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="Minimum 8 characters"
                    placeholderTextColor={colors.textDim}
                    secureTextEntry
                    value={next}
                    onChangeText={setNext}
                  />
                </View>

                {next.length > 0 && (
                  <View style={styles.strengthRow}>
                    {[1, 2, 3, 4].map((i) => (
                      <View
                        key={i}
                        style={[styles.strengthBar, { backgroundColor: i <= strength ? strengthColor : colors.surface2 }]}
                      />
                    ))}
                    <Text style={[styles.strengthLabel, { color: strengthColor }]}>{strengthLabel}</Text>
                  </View>
                )}

                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>CONFIRM NEW PASSWORD</Text>
                <View style={[styles.inputWrap, confirm && confirm !== next && { borderColor: "#EF4444" }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Repeat new password"
                    placeholderTextColor={colors.textDim}
                    secureTextEntry
                    value={confirm}
                    onChangeText={setConfirm}
                  />
                  {confirm.length > 0 && (
                    <Text style={{ fontSize: 18, paddingRight: 14, color: confirm === next ? "#22C55E" : "#EF4444" }}>
                      {confirm === next ? "✓" : "✗"}
                    </Text>
                  )}
                </View>

                <View style={styles.hintCard}>
                  <Text style={styles.hintTitle}>Password requirements</Text>
                  {[
                    ["At least 8 characters", next.length >= 8],
                    ["One uppercase letter", /[A-Z]/.test(next)],
                    ["One number", /[0-9]/.test(next)],
                    ["One special character", /[^A-Za-z0-9]/.test(next)],
                  ].map(([label, met]) => (
                    <Text key={label as string} style={[styles.hintItem, { color: met ? "#22C55E" : colors.textMuted }]}>
                      {met ? "✓" : "○"} {label}
                    </Text>
                  ))}
                </View>

                <Pressable onPress={handleSave} disabled={loading} style={{ marginTop: 8 }}>
                  <LinearGradient
                    colors={loading ? [colors.surface2, colors.surface2] : ["#FF5E1A", "#FF7A3A"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.saveBtn}
                  >
                    <Text style={styles.saveBtnText}>{loading ? "SAVING…" : "UPDATE PASSWORD"}</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
  scroll: { paddingHorizontal: 20, paddingBottom: 50, paddingTop: 8 },

  sectionLabel: { fontFamily: typography.displayFont, fontSize: 12, letterSpacing: 2, color: colors.textDim, marginBottom: 8 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface0, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.surface2, overflow: "hidden" },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontFamily: typography.bodyFont, fontSize: 15, color: colors.textPrimary },

  strengthRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontFamily: typography.displayFont, fontSize: 12, letterSpacing: 1, width: 50, textAlign: "right" },

  hintCard: { backgroundColor: colors.surface0, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.surface2, padding: 16, gap: 8, marginTop: 24 },
  hintTitle: { fontFamily: typography.displayFont, fontSize: 13, letterSpacing: 1, color: colors.textMuted, marginBottom: 4 },
  hintItem: { fontFamily: typography.bodyFont, fontSize: 13 },

  saveBtn: { height: 54, borderRadius: radii.xl, alignItems: "center", justifyContent: "center", marginTop: 32, ...shadows.orangeGlow },
  saveBtnText: { fontFamily: typography.displayFont, fontSize: 16, letterSpacing: 2, color: "#fff" },

  successBox: { alignItems: "center", gap: 12, paddingTop: 80 },
  successIcon: { fontSize: 72, color: "#22C55E" },
  successTitle: { fontFamily: typography.displayFont, fontSize: 28, letterSpacing: 2, color: colors.textPrimary },
  successSub: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textMuted },
});
