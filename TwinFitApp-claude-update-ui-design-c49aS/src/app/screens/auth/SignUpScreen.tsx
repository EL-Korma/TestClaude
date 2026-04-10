import React, { useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { useAuth } from "../../../store/AuthStore";
import { apiFetch } from "../../../services/api";

type Nav = NativeStackNavigationProp<RootStackParamList, "Auth">;

// Steps:
// 1 — Credentials (name, email, password, confirm password)
// 2 — Verify Email (OTP)
// 3 — Body (age, height, weight, gender, gym frequency)
// 4 — Diet
// 5 — Goal + Avatar
// 6 — Connect (partner code)
const TOTAL_STEPS = 6;

const DIET_OPTIONS = ["Standard", "High Protein", "Vegetarian", "Vegan", "Keto", "Mediterranean"];
const GOAL_OPTIONS = ["Build Muscle", "Fat Loss", "Energy & Balance", "Recovery"];
const AVATARS = ["🦁", "🐺", "🦊", "🐯", "🦅", "🦋", "🐉", "⚡", "🔥", "💪", "🏆", "⭐"];

const GYM_FREQUENCY_OPTIONS = [
  { label: "1–2×/week", value: "ONE_TO_TWO" },
  { label: "3–5×/week", value: "THREE_TO_FIVE" },
  { label: "6+×/week", value: "SIX_PLUS" },
] as const;

const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
] as const;

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const InputField = ({
  label, placeholder, value, onChangeText, keyboardType = "default", secure = false, hint,
}: {
  label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; keyboardType?: any; secure?: boolean; hint?: React.ReactNode;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputFocused]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textDim}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secure}
          autoCapitalize={keyboardType === "email-address" ? "none" : secure ? "none" : "words"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {hint}
    </View>
  );
};

export const SignUpScreen = () => {
  const navigation = useNavigation<Nav>();
  const { register, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Step 1 — credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 — email OTP
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");

  // Step 3 — body
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const [gender, setGender] = useState<string | null>(null);
  const [gymFrequency, setGymFrequency] = useState<string | null>(null);

  // Steps 4-5 — diet / goal / avatar
  const [diet, setDiet] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [avatar, setAvatar] = useState("🦁");

  // Step 6 — partner
  const [myCode] = useState(generateCode());
  const [partnerCode, setPartnerCode] = useState("");

  const isLoading = loading || actionLoading;

  const advance = () => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -20, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
    setStep((s) => s + 1);
  };

  // ─── Password strength ────────────────────────────────────────────────────

  const getPasswordStrength = () => {
    if (password.length === 0) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: "Weak", color: "#EF4444" };
    if (score === 2) return { label: "Fair", color: "#F59E0B" };
    if (score === 3) return { label: "Good", color: "#3B82F6" };
    return { label: "Strong", color: "#22C55E" };
  };

  const strength = getPasswordStrength();
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // ─── Actions ──────────────────────────────────────────────────────────────

  const sendVerificationEmail = async () => {
    setActionLoading(true);
    try {
      await apiFetch("/auth/send-verification", {
        method: "POST",
        body: { email: email.trim().toLowerCase() },
        auth: false,
      });
    } catch {
      // Non-fatal — we still advance; user can request resend
    } finally {
      setActionLoading(false);
    }
  };

  const verifyEmailOTP = async (): Promise<boolean> => {
    if (verificationCode.length !== 6) {
      setVerificationError("Enter the 6-digit code we sent to your email.");
      return false;
    }
    setActionLoading(true);
    setVerificationError("");
    try {
      await apiFetch("/auth/verify-code", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), code: verificationCode },
        auth: false,
      });
      return true;
    } catch (e: any) {
      setVerificationError(e.message ?? "Invalid code. Please try again.");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegister = async () => {
    const parts = name.trim().split(" ");
    const firstName = parts[0];
    const surname = parts.slice(1).join(" ") || "User";
    const username =
      email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") +
      Math.floor(Math.random() * 1000);

    try {
      await register({
        name: firstName,
        surname,
        username,
        email: email.trim().toLowerCase(),
        password,
        age,
        gender: (gender as any) ?? undefined,
        gymFrequency: (gymFrequency as any) ?? undefined,
        heightCm: height,
        weightKg: weight,
      });

      if (partnerCode.length === 6) {
        try {
          await apiFetch("/groups/join", { method: "POST", body: { inviteCode: partnerCode } });
        } catch {
          // Non-fatal — can link later
        }
      }
    } catch (e: any) {
      Alert.alert("Registration Failed", e.message ?? "Something went wrong.");
    }
  };

  const goNext = async () => {
    if (step === 1) {
      if (!name.trim()) {
        Alert.alert("Missing name", "Please enter your full name.");
        return;
      }
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        Alert.alert("Invalid email", "Please enter a valid email address.");
        return;
      }
      if (password.length < 8) {
        Alert.alert("Weak password", "Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Password mismatch", "Passwords do not match.");
        return;
      }
      // Send OTP then advance to verification step
      await sendVerificationEmail();
      advance();
      return;
    }

    if (step === 2) {
      const verified = await verifyEmailOTP();
      if (!verified) return;
      advance();
      return;
    }

    if (step < TOTAL_STEPS) {
      advance();
    } else {
      handleRegister();
    }
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else navigation.goBack();
  };

  // ─── Sub-components ───────────────────────────────────────────────────────

  const SliderRow = ({
    label, value, min, max, unit, onChange,
  }: {
    label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void;
  }) => {
    const pct = ((value - min) / (max - min)) * 100;
    return (
      <View style={styles.sliderGroup}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>{label}</Text>
          <View style={styles.sliderValueBadge}>
            <Text style={styles.sliderValue}>{value}{unit}</Text>
          </View>
        </View>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${pct}%` as any }]} />
        </View>
        <View style={styles.sliderControls}>
          <Pressable style={styles.sliderArrowBtn} onPress={() => onChange(Math.max(min, value - 1))}>
            <Text style={styles.sliderArrow}>−</Text>
          </Pressable>
          <Text style={styles.sliderRangeText}>{min} — {max}</Text>
          <Pressable style={styles.sliderArrowBtn} onPress={() => onChange(Math.min(max, value + 1))}>
            <Text style={styles.sliderArrow}>+</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // ─── Steps ────────────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      // ── Step 1: Credentials ──────────────────────────────────────────────
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeadline}>LET'S START</Text>
            <Text style={styles.stepSub}>Create your TwinFit identity</Text>

            <InputField
              label="FULL NAME"
              placeholder="Alex Johnson"
              value={name}
              onChangeText={setName}
            />
            <InputField
              label="EMAIL"
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <InputField
              label="PASSWORD"
              placeholder="Min. 8 characters"
              value={password}
              onChangeText={setPassword}
              secure
              hint={
                strength ? (
                  <View style={styles.strengthRow}>
                    <View style={styles.strengthBars}>
                      {[1, 2, 3, 4].map((i) => {
                        const filled =
                          strength.label === "Weak" ? i <= 1 :
                          strength.label === "Fair" ? i <= 2 :
                          strength.label === "Good" ? i <= 3 : true;
                        return (
                          <View
                            key={i}
                            style={[
                              styles.strengthBar,
                              filled && { backgroundColor: strength.color },
                            ]}
                          />
                        );
                      })}
                    </View>
                    <Text style={[styles.strengthLabel, { color: strength.color }]}>
                      {strength.label}
                    </Text>
                  </View>
                ) : null
              }
            />
            <InputField
              label="CONFIRM PASSWORD"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secure
              hint={
                confirmPassword.length > 0 ? (
                  <Text style={[styles.matchHint, { color: passwordsMatch ? "#22C55E" : "#EF4444" }]}>
                    {passwordsMatch ? "✓ Passwords match" : "✗ Passwords don't match"}
                  </Text>
                ) : null
              }
            />
          </View>
        );

      // ── Step 2: Email OTP ────────────────────────────────────────────────
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeadline}>VERIFY</Text>
            <Text style={styles.stepSub}>Check your inbox</Text>

            <View style={styles.otpCard}>
              <Text style={styles.otpEmailLabel}>We sent a code to</Text>
              <Text style={styles.otpEmail}>{email.trim().toLowerCase()}</Text>
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 28, marginBottom: 8 }]}>6-DIGIT CODE</Text>
            <View style={[styles.inputWrap, { paddingHorizontal: 16 }]}>
              <TextInput
                style={[styles.input, { textAlign: "center", letterSpacing: 10, fontSize: 24 }]}
                placeholder="——————"
                placeholderTextColor={colors.textDim}
                value={verificationCode}
                onChangeText={(t) => {
                  setVerificationCode(t.replace(/[^0-9]/g, "").slice(0, 6));
                  if (verificationError) setVerificationError("");
                }}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            {verificationError ? (
              <Text style={styles.errorText}>{verificationError}</Text>
            ) : null}

            <Pressable
              style={styles.resendBtn}
              onPress={async () => {
                setVerificationCode("");
                setVerificationError("");
                await sendVerificationEmail();
                Alert.alert("Sent!", "A new code has been sent to your email.");
              }}
              disabled={actionLoading}
            >
              <Text style={styles.resendText}>Didn't receive it? Resend code</Text>
            </Pressable>
          </View>
        );

      // ── Step 3: Body Metrics ─────────────────────────────────────────────
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeadline}>YOUR BODY</Text>
            <Text style={styles.stepSub}>Personalize your fitness profile</Text>

            <SliderRow label="Age" value={age} min={16} max={60} unit=" yrs" onChange={setAge} />
            <SliderRow label="Height" value={height} min={140} max={210} unit=" cm" onChange={setHeight} />
            <SliderRow label="Weight" value={weight} min={40} max={150} unit=" kg" onChange={setWeight} />

            <Text style={styles.sectionLabel}>GENDER</Text>
            <View style={[styles.pillGrid, { marginBottom: 24 }]}>
              {GENDER_OPTIONS.map(({ label, value }) => (
                <Pressable
                  key={value}
                  style={[styles.pill, gender === value && styles.pillActive]}
                  onPress={() => setGender(value)}
                >
                  <Text style={[styles.pillText, gender === value && styles.pillTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>GYM FREQUENCY</Text>
            <View style={styles.pillGrid}>
              {GYM_FREQUENCY_OPTIONS.map(({ label, value }) => (
                <Pressable
                  key={value}
                  style={[styles.pill, gymFrequency === value && styles.pillActive]}
                  onPress={() => setGymFrequency(value)}
                >
                  <Text style={[styles.pillText, gymFrequency === value && styles.pillTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      // ── Step 4: Diet ─────────────────────────────────────────────────────
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeadline}>YOUR DIET</Text>
            <Text style={styles.stepSub}>Select your dietary preference</Text>
            <View style={styles.pillGrid}>
              {DIET_OPTIONS.map((d) => (
                <Pressable key={d} style={[styles.pill, diet === d && styles.pillActive]} onPress={() => setDiet(d)}>
                  <Text style={[styles.pillText, diet === d && styles.pillTextActive]}>{d}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      // ── Step 5: Goal + Avatar ─────────────────────────────────────────────
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeadline}>YOUR GOAL</Text>
            <Text style={styles.stepSub}>What are you training for?</Text>
            <View style={styles.pillGrid}>
              {GOAL_OPTIONS.map((g) => (
                <Pressable key={g} style={[styles.pill, goal === g && styles.pillActive]} onPress={() => setGoal(g)}>
                  <Text style={[styles.pillText, goal === g && styles.pillTextActive]}>{g}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.sectionLabel, { marginTop: 28 }]}>PICK YOUR AVATAR</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((a) => (
                <Pressable key={a} style={[styles.avatarBtn, avatar === a && styles.avatarBtnActive]} onPress={() => setAvatar(a)}>
                  <Text style={styles.avatarEmoji}>{a}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      // ── Step 6: Connect ──────────────────────────────────────────────────
      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeadline}>CONNECT</Text>
            <Text style={styles.stepSub}>Link with your training partner</Text>
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>YOUR INVITE CODE</Text>
              <View style={styles.codeRow}>
                {myCode.split("").map((char, i) => (
                  <View key={i} style={styles.codeChar}>
                    <Text style={styles.codeCharText}>{char}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.codeHint}>Share this code with your partner</Text>
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 28 }]}>ENTER PARTNER'S CODE</Text>
            <View style={[styles.inputWrap, { paddingHorizontal: 16 }]}>
              <TextInput
                style={[styles.input, { textAlign: "center", letterSpacing: 8, fontSize: 22 }]}
                placeholder="ABC123"
                placeholderTextColor={colors.textDim}
                value={partnerCode}
                onChangeText={(t) => setPartnerCode(t.toUpperCase().slice(0, 6))}
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>

            {partnerCode.length === 6 && (
              <Pressable
                style={[styles.nextBtn, { marginTop: 20 }, isLoading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <LinearGradient colors={["#FF5E1A", "#FF7A3A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGradient}>
                  {isLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.nextBtnText}>CONNECT WITH {name.split(" ")[0]?.toUpperCase() || "PARTNER"}</Text>}
                </LinearGradient>
              </Pressable>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const isLastStep = step === TOTAL_STEPS;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.header}>
            <Pressable onPress={goBack} style={styles.backBtn}>
              <Text style={styles.backIcon}>←</Text>
            </Pressable>
            <Text style={styles.stepCounter}>STEP {step} OF {TOTAL_STEPS}</Text>
          </View>

          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i + 1 === step && styles.dotActive,
                  i + 1 < step && styles.dotDone,
                ]}
              />
            ))}
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
              {renderStep()}
            </Animated.View>
          </ScrollView>

          {/* Bottom action */}
          {!isLastStep && (
            <View style={styles.nextBtnWrap}>
              <Pressable
                style={[styles.nextBtn, isLoading && { opacity: 0.7 }]}
                onPress={goNext}
                disabled={isLoading}
              >
                <LinearGradient colors={["#FF5E1A", "#FF7A3A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGradient}>
                  {isLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.nextBtnText}>
                        {step === 1 ? "CONTINUE →" :
                         step === 2 ? "VERIFY EMAIL →" :
                         step === 5 ? "ALMOST DONE →" : "NEXT →"}
                      </Text>}
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {isLastStep && partnerCode.length < 6 && (
            <View style={styles.nextBtnWrap}>
              <Pressable style={styles.skipBtn} onPress={handleRegister} disabled={isLoading}>
                {isLoading
                  ? <ActivityIndicator color={colors.textMuted} />
                  : <Text style={styles.skipText}>Skip for now →</Text>}
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 24, color: colors.textPrimary },
  stepCounter: { fontFamily: typography.displayFont, fontSize: 14, letterSpacing: 1, color: colors.textMuted },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surface2 },
  dotActive: { width: 28, backgroundColor: colors.primary, shadowColor: colors.primary, shadowRadius: 6, shadowOpacity: 0.5, elevation: 4 },
  dotDone: { backgroundColor: colors.textDim },
  scroll: { paddingHorizontal: 24, paddingBottom: 20, flexGrow: 1 },
  stepContent: { flex: 1 },
  stepHeadline: { fontFamily: typography.displayFont, fontSize: 44, letterSpacing: 3, color: colors.textPrimary, marginBottom: 6 },
  stepSub: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textMuted, marginBottom: 24 },
  sectionLabel: { fontFamily: typography.displayFont, fontSize: 13, letterSpacing: 1, color: colors.textMuted, marginBottom: 10 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontFamily: typography.displayFont, fontSize: 13, letterSpacing: 1, color: colors.textMuted, marginBottom: 8 },
  inputWrap: {
    backgroundColor: colors.surface1,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.surface2,
    height: 52,
    justifyContent: "center",
  },
  inputFocused: { borderColor: colors.primary, shadowColor: colors.primary, shadowRadius: 8, shadowOpacity: 0.25, elevation: 4 },
  input: { fontFamily: typography.bodyFont, fontSize: 15, color: colors.textPrimary, paddingHorizontal: 16 },

  // Password strength
  strengthRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  strengthBars: { flexDirection: "row", gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.surface2 },
  strengthLabel: { fontFamily: typography.bodyFont, fontSize: 12, minWidth: 44 },
  matchHint: { fontFamily: typography.bodyFont, fontSize: 12, marginTop: 6 },

  // OTP step
  otpCard: {
    backgroundColor: colors.surface0,
    borderRadius: radii.xl,
    padding: 24,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.surface2,
    marginBottom: 8,
  },
  otpEmailLabel: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted, marginBottom: 6 },
  otpEmail: { fontFamily: typography.displayFont, fontSize: 16, color: colors.textPrimary, letterSpacing: 0.5 },
  errorText: { fontFamily: typography.bodyFont, fontSize: 13, color: "#EF4444", marginTop: 10 },
  resendBtn: { marginTop: 20, alignSelf: "center" },
  resendText: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted, textDecorationLine: "underline" },

  // Sliders
  sliderGroup: { marginBottom: 24 },
  sliderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sliderLabel: { fontFamily: typography.displayFont, fontSize: 18, letterSpacing: 1, color: colors.textPrimary },
  sliderValueBadge: { backgroundColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 5 },
  sliderValue: { fontFamily: typography.displayFont, fontSize: 15, color: colors.textPrimary, letterSpacing: 0.5 },
  sliderTrack: { height: 6, backgroundColor: colors.surface2, borderRadius: 3, marginBottom: 12 },
  sliderFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  sliderControls: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sliderArrowBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface1,
    borderWidth: 1, borderColor: colors.surface2, alignItems: "center", justifyContent: "center",
  },
  sliderArrow: { fontSize: 20, color: colors.textPrimary },
  sliderRangeText: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textDim },

  // Pills
  pillGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: radii.pill, backgroundColor: colors.surface1, borderWidth: 1.5, borderColor: colors.surface2 },
  pillActive: { borderColor: colors.primary, backgroundColor: colors.primaryDim, shadowColor: colors.primary, shadowRadius: 8, shadowOpacity: 0.3, elevation: 4 },
  pillText: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textMuted },
  pillTextActive: { color: colors.primary },

  // Avatars
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  avatarBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface1, borderWidth: 2, borderColor: colors.surface2, alignItems: "center", justifyContent: "center" },
  avatarBtnActive: { borderColor: colors.primary, shadowColor: colors.primary, shadowRadius: 8, shadowOpacity: 0.4, elevation: 4 },
  avatarEmoji: { fontSize: 26 },

  // Partner code
  codeCard: { backgroundColor: colors.surface0, borderRadius: radii.xl, padding: 24, alignItems: "center", borderWidth: 1.5, borderColor: colors.primary, shadowColor: colors.primary, shadowRadius: 16, shadowOpacity: 0.2, elevation: 6 },
  codeLabel: { fontFamily: typography.displayFont, fontSize: 14, letterSpacing: 1.5, color: colors.textMuted, marginBottom: 16 },
  codeRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  codeChar: { width: 40, height: 50, borderRadius: radii.sm, backgroundColor: colors.surface1, borderWidth: 1.5, borderColor: colors.primary, alignItems: "center", justifyContent: "center" },
  codeCharText: { fontFamily: typography.displayFont, fontSize: 24, color: colors.primary },
  codeHint: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textDim },

  // Buttons
  nextBtnWrap: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
  nextBtn: { borderRadius: radii.lg, overflow: "hidden", ...shadows.orangeGlow },
  nextBtnGradient: { height: 56, alignItems: "center", justifyContent: "center" },
  nextBtnText: { fontFamily: typography.displayFont, fontSize: 22, letterSpacing: 2, color: colors.textPrimary },
  skipBtn: { height: 48, alignItems: "center", justifyContent: "center" },
  skipText: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textMuted },
});
