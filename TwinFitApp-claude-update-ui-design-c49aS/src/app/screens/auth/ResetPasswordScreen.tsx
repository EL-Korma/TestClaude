import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, shadows, typography } from "../../../theme/tokens";

export const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.headline}>RESET{"\n"}PASSWORD</Text>
          <Text style={styles.sub}>We'll send a link to your email to reset your password.</Text>
          {!sent ? (
            <>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.textDim}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <Pressable style={styles.ctaBtn} onPress={() => setSent(true)}>
                <LinearGradient colors={["#FF5E1A", "#FF7A3A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtnGradient}>
                  <Text style={styles.ctaBtnText}>SEND RESET LINK</Text>
                </LinearGradient>
              </Pressable>
            </>
          ) : (
            <View style={styles.sentCard}>
              <Text style={styles.sentEmoji}>📧</Text>
              <Text style={styles.sentTitle}>Check your email!</Text>
              <Text style={styles.sentSub}>We sent a reset link to {email}</Text>
              <Pressable style={styles.backLink} onPress={() => navigation.goBack()}>
                <Text style={styles.backLinkText}>← Back to Sign In</Text>
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  backIcon: { fontSize: 24, color: colors.textPrimary },
  headline: { fontFamily: typography.displayFont, fontSize: 52, letterSpacing: 3, color: colors.textPrimary, lineHeight: 56, marginBottom: 12 },
  sub: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textMuted, marginBottom: 28, lineHeight: 20 },
  inputWrap: { backgroundColor: colors.surface1, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.surface2, height: 54, justifyContent: "center", marginBottom: 16 },
  input: { fontFamily: typography.bodyFont, fontSize: 15, color: colors.textPrimary, paddingHorizontal: 16 },
  ctaBtn: { borderRadius: radii.lg, overflow: "hidden", ...shadows.orangeGlow },
  ctaBtnGradient: { height: 56, alignItems: "center", justifyContent: "center" },
  ctaBtnText: { fontFamily: typography.displayFont, fontSize: 22, letterSpacing: 2, color: colors.textPrimary },
  sentCard: { alignItems: "center", gap: 12, paddingTop: 40 },
  sentEmoji: { fontSize: 64 },
  sentTitle: { fontFamily: typography.displayFont, fontSize: 32, letterSpacing: 2, color: colors.textPrimary },
  sentSub: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textMuted, textAlign: "center" },
  backLink: { marginTop: 16 },
  backLinkText: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.primary },
});
