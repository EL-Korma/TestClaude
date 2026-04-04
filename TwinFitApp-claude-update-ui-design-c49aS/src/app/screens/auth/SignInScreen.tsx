import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, shadows, typography } from "../../../theme/tokens";

type Nav = NativeStackNavigationProp<RootStackParamList, "Auth">;

export const SignInScreen = () => {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back */}
            <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backIcon}>←</Text>
            </Pressable>

            {/* Logo */}
            <View style={styles.logoArea}>
              <View style={styles.logoBadge}>
                <Text style={{ fontSize: 28 }}>🔥</Text>
              </View>
              <LinearGradient
                colors={["#FF5E1A", "#FF8C42"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>TWINFIT</Text>
              </LinearGradient>
            </View>

            <Text style={styles.headline}>SIGN IN</Text>
            <Text style={styles.subline}>Let's keep your streak alive.</Text>

            {/* Form card */}
            <View style={styles.formCard}>
              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>EMAIL</Text>
                <View style={[styles.inputWrap, emailFocused && styles.inputFocused]}>
                  <Text style={styles.inputIcon}>✉</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="email@example.com"
                    placeholderTextColor={colors.textDim}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <View style={[styles.inputWrap, passFocused && styles.inputFocused]}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textDim}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                  />
                </View>
              </View>

              {/* Forgot */}
              <Pressable style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              {/* Sign In CTA */}
              <Pressable
                style={styles.signInBtn}
                onPress={() => navigation.navigate("Main")}
              >
                <LinearGradient
                  colors={["#FF5E1A", "#FF7A3A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signInBtnGradient}
                >
                  <Text style={styles.signInBtnText}>SIGN IN</Text>
                </LinearGradient>
              </Pressable>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social buttons */}
              <View style={styles.socialRow}>
                <Pressable style={styles.socialBtn}>
                  <Text style={styles.socialBtnText}>G  Google</Text>
                </Pressable>
                <Pressable style={styles.socialBtn}>
                  <Text style={styles.socialBtnText}> Apple</Text>
                </Pressable>
              </View>
            </View>

            {/* Sign up link */}
            <View style={styles.signUpRow}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <Pressable onPress={() => navigation.navigate("Auth", { screen: "SignUp" } as any)}>
                <Text style={styles.signUpLink}>Sign up</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  safeArea: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 28,
    gap: 8,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowRadius: 12,
    shadowOpacity: 0.4,
    elevation: 8,
  },
  logoGradient: { borderRadius: 4 },
  logoText: {
    fontFamily: typography.displayFont,
    fontSize: 32,
    letterSpacing: 4,
    color: colors.textPrimary,
    paddingHorizontal: 6,
  },
  headline: {
    fontFamily: typography.displayFont,
    fontSize: 44,
    letterSpacing: 3,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subline: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 24,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: colors.surface0,
    borderRadius: radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surface2,
    gap: 4,
  },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: {
    fontFamily: typography.displayFont,
    fontSize: 13,
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface1,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.surface2,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  inputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowRadius: 8,
    shadowOpacity: 0.25,
    elevation: 4,
  },
  inputIcon: { fontSize: 16 },
  input: {
    flex: 1,
    fontFamily: typography.bodyFont,
    fontSize: 15,
    color: colors.textPrimary,
  },
  forgotBtn: { alignSelf: "flex-end", marginBottom: 4 },
  forgotText: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    color: colors.primary,
  },
  signInBtn: {
    borderRadius: radii.lg,
    overflow: "hidden",
    marginTop: 8,
    ...shadows.orangeGlow,
  },
  signInBtnGradient: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  signInBtnText: {
    fontFamily: typography.displayFont,
    fontSize: 22,
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.surface2 },
  dividerText: {
    fontFamily: typography.bodyFont,
    fontSize: 13,
    color: colors.textMuted,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 48,
    backgroundColor: colors.surface1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  socialBtnText: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
    color: colors.textPrimary,
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signUpText: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
    color: colors.textMuted,
  },
  signUpLink: {
    fontFamily: typography.bodyMediumFont,
    fontSize: 14,
    color: colors.primary,
  },
});
