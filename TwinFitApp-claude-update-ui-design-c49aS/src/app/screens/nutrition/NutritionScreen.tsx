import React, { useState, useRef, useEffect } from "react";
import {
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
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, shadows, typography } from "../../../theme/tokens";
import { generateRecipe, scanMealFromDescription, RecipeResult, MealScanResult } from "../../../services/anthropic";

type Tab = "recipe" | "scan";

const QUICK_INGREDIENTS = [
  "Chicken", "Eggs", "Brown Rice", "Broccoli", "Olive Oil",
  "Yogurt", "Sweet Potato", "Spinach", "Oats", "Salmon",
];

const GOALS = [
  { emoji: "💪", label: "Muscle", value: "Build Muscle" },
  { emoji: "🔥", label: "Fat Loss", value: "Fat Loss" },
  { emoji: "⚡", label: "Energy", value: "Energy & Balance" },
  { emoji: "🧘", label: "Recovery", value: "Recovery" },
];

const LOADING_MESSAGES = [
  "Analyzing your ingredients...",
  "Calculating macros...",
  "Crafting the perfect recipe...",
  "Adding nutritional insights...",
  "Almost ready...",
];

const PORTION_MULTIPLIERS: Record<string, number> = { Small: 0.75, Medium: 1, Large: 1.35 };

// ─── Macro bar component ─────────────────────────────────────────────────────
const MacroBar = ({
  label, value, unit, color, total,
}: { label: string; value: number; unit: string; color: string; total: number }) => {
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, { toValue: Math.min(value / total, 1), duration: 900, delay: 200, useNativeDriver: false }).start();
  }, [value]);

  const width = fillAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={macroStyles.wrap}>
      <View style={macroStyles.labelRow}>
        <Text style={macroStyles.label}>{label}</Text>
        <Text style={[macroStyles.value, { color }]}>{value}{unit}</Text>
      </View>
      <View style={macroStyles.track}>
        <Animated.View style={[macroStyles.fill, { width: width as any, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const macroStyles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted },
  value: { fontFamily: typography.displayFont, fontSize: 14, letterSpacing: 0.5 },
  track: { height: 6, backgroundColor: colors.surface2, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
});

// ─── Health score ring ───────────────────────────────────────────────────────
const HealthScoreRing = ({ score }: { score: number }) => {
  const arcAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(arcAnim, { toValue: score / 100, duration: 1200, delay: 300, useNativeDriver: false }).start();
  }, [score]);

  const color = score >= 70 ? colors.success : score >= 50 ? colors.warning : colors.accentRed;

  return (
    <View style={ringStyles.container}>
      <View style={[ringStyles.ring, { borderColor: colors.surface2 }]}>
        <View style={ringStyles.center}>
          <Text style={[ringStyles.score, { color }]}>{score}</Text>
          <Text style={ringStyles.label}>HEALTH{"\n"}SCORE</Text>
        </View>
      </View>
    </View>
  );
};

const ringStyles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", marginBottom: 8 },
  ring: { width: 90, height: 90, borderRadius: 45, borderWidth: 6, alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center" },
  score: { fontFamily: typography.displayFont, fontSize: 28, letterSpacing: 1 },
  label: { fontFamily: typography.bodyFont, fontSize: 9, color: colors.textMuted, textAlign: "center", letterSpacing: 0.5 },
});

// ─── RECIPE ENGINE TAB ───────────────────────────────────────────────────────
const RecipeTab = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedGoal, setSelectedGoal] = useState(GOALS[0]);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [recipe, setRecipe] = useState<RecipeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const brainBounce = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  let msgInterval = useRef<any>(null);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(brainBounce, { toValue: -10, duration: 400, useNativeDriver: true }),
          Animated.timing(brainBounce, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(300),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      ).start();

      msgInterval.current = setInterval(() => {
        setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
      }, 1800);
    } else {
      clearInterval(msgInterval.current);
    }
    return () => clearInterval(msgInterval.current);
  }, [loading]);

  const addIngredient = (item: string) => {
    const clean = item.trim();
    if (clean && !ingredients.includes(clean)) setIngredients((prev) => [...prev, clean]);
    setInputText("");
  };

  const removeIngredient = (item: string) => {
    setIngredients((prev) => prev.filter((i) => i !== item));
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setRecipe(null);
    setError(null);
    setLoadingMsgIdx(0);
    try {
      const result = await generateRecipe(ingredients, selectedGoal.value);
      setRecipe(result);
    } catch (e: any) {
      setError(e.message ?? "Failed to generate recipe. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tabStyles.scroll}>
      {/* Ingredient input */}
      <Text style={tabStyles.sectionTitle}>INGREDIENTS</Text>
      <View style={tabStyles.inputRow}>
        <View style={tabStyles.ingredientInput}>
          <TextInput
            style={tabStyles.input}
            placeholder="Type ingredient..."
            placeholderTextColor={colors.textDim}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => addIngredient(inputText)}
            returnKeyType="done"
          />
        </View>
        <Pressable style={tabStyles.addBtn} onPress={() => addIngredient(inputText)}>
          <Text style={tabStyles.addBtnText}>+</Text>
        </Pressable>
      </View>

      {/* Selected ingredient tags */}
      {ingredients.length > 0 && (
        <View style={tabStyles.tagWrap}>
          {ingredients.map((ing) => (
            <Pressable key={ing} style={tabStyles.tag} onPress={() => removeIngredient(ing)}>
              <Text style={tabStyles.tagText}>{ing}</Text>
              <Text style={tabStyles.tagRemove}> ×</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Quick add chips */}
      <Text style={tabStyles.quickLabel}>QUICK ADD</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tabStyles.chipsRow}>
        {QUICK_INGREDIENTS.map((item) => (
          <Pressable
            key={item}
            style={[tabStyles.chip, ingredients.includes(item) && tabStyles.chipActive]}
            onPress={() => (ingredients.includes(item) ? removeIngredient(item) : addIngredient(item))}
          >
            <Text style={[tabStyles.chipText, ingredients.includes(item) && tabStyles.chipTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Goal selector */}
      <Text style={[tabStyles.sectionTitle, { marginTop: 20 }]}>GOAL</Text>
      <View style={tabStyles.goalsRow}>
        {GOALS.map((g) => (
          <Pressable
            key={g.value}
            style={[tabStyles.goalBtn, selectedGoal.value === g.value && tabStyles.goalBtnActive]}
            onPress={() => setSelectedGoal(g)}
          >
            <Text style={tabStyles.goalEmoji}>{g.emoji}</Text>
            <Text style={[tabStyles.goalLabel, selectedGoal.value === g.value && tabStyles.goalLabelActive]}>{g.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Generate CTA */}
      <Pressable
        style={[tabStyles.generateBtn, ingredients.length === 0 && tabStyles.generateBtnDisabled]}
        onPress={handleGenerate}
        disabled={ingredients.length === 0 || loading}
      >
        <LinearGradient
          colors={ingredients.length > 0 ? ["#FF5E1A", "#FF7A3A"] : [colors.surface2, colors.surface2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={tabStyles.generateBtnGradient}
        >
          <Text style={[tabStyles.generateBtnText, ingredients.length === 0 && tabStyles.generateBtnTextDisabled]}>
            ✨ GENERATE MY RECIPE
          </Text>
        </LinearGradient>
      </Pressable>

      {/* Loading state */}
      {loading && (
        <View style={tabStyles.loadingCard}>
          <Animated.Text style={[tabStyles.brainEmoji, { transform: [{ translateY: brainBounce }] }]}>🧠</Animated.Text>
          <Text style={tabStyles.loadingMsg}>{LOADING_MESSAGES[loadingMsgIdx]}</Text>
          <View style={tabStyles.dotsRow}>
            <Animated.View style={[tabStyles.loadDot, { opacity: dot1 }]} />
            <Animated.View style={[tabStyles.loadDot, { opacity: dot2 }]} />
            <Animated.View style={[tabStyles.loadDot, { opacity: dot3 }]} />
          </View>
        </View>
      )}

      {/* Error state */}
      {error && (
        <View style={tabStyles.errorCard}>
          <Text style={tabStyles.errorText}>⚠️ {error}</Text>
          <Text style={tabStyles.errorHint}>Make sure your Anthropic API key is set in src/services/anthropic.ts</Text>
        </View>
      )}

      {/* Recipe result */}
      {recipe && !loading && (
        <View style={tabStyles.recipeCard}>
          {/* Header */}
          <View style={tabStyles.recipeHeader}>
            <Text style={tabStyles.recipeEmoji}>{recipe.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={tabStyles.recipeName}>{recipe.name}</Text>
              <View style={tabStyles.goalBadge}>
                <Text style={tabStyles.goalBadgeText}>{selectedGoal.emoji} {recipe.goal}</Text>
              </View>
            </View>
          </View>

          {/* Macros */}
          <View style={tabStyles.divider} />
          <Text style={tabStyles.cardSectionTitle}>MACROS</Text>
          <MacroBar label="Calories" value={recipe.calories} unit=" kcal" color={colors.primary} total={800} />
          <MacroBar label="Protein" value={recipe.protein} unit="g" color={colors.info} total={100} />
          <MacroBar label="Carbs" value={recipe.carbs} unit="g" color={colors.warning} total={150} />
          <MacroBar label="Fat" value={recipe.fat} unit="g" color={colors.purple} total={80} />

          {/* Micronutrients */}
          <Text style={[tabStyles.cardSectionTitle, { marginTop: 12 }]}>MICRONUTRIENTS</Text>
          <View style={tabStyles.microRow}>
            {[
              { label: "Fibre", value: `${recipe.fibre}g` },
              { label: "Iron", value: recipe.iron },
              { label: "Vit C", value: recipe.vitaminC },
              { label: "Sodium", value: recipe.sodium },
              { label: "Potassium", value: recipe.potassium },
            ].map((m) => (
              <View key={m.label} style={tabStyles.microPill}>
                <Text style={tabStyles.microValue}>{m.value}</Text>
                <Text style={tabStyles.microLabel}>{m.label}</Text>
              </View>
            ))}
          </View>

          {/* Ingredients */}
          <View style={tabStyles.divider} />
          <Text style={tabStyles.cardSectionTitle}>INGREDIENTS</Text>
          <View style={tabStyles.ingList}>
            {recipe.ingredients.map((ing, i) => (
              <View key={i} style={tabStyles.ingItem}>
                <View style={tabStyles.ingDot} />
                <Text style={tabStyles.ingText}>{ing}</Text>
              </View>
            ))}
          </View>

          {/* Steps */}
          <View style={tabStyles.divider} />
          <Text style={tabStyles.cardSectionTitle}>STEPS</Text>
          {recipe.steps.map((step, i) => (
            <View key={i} style={tabStyles.stepItem}>
              <View style={tabStyles.stepNum}>
                <Text style={tabStyles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={tabStyles.stepText}>{step}</Text>
            </View>
          ))}

          {/* AI Insight */}
          <View style={tabStyles.insightCard}>
            <Text style={tabStyles.insightIcon}>🤖</Text>
            <Text style={tabStyles.insightText}>{recipe.insight}</Text>
          </View>

          {/* Regenerate */}
          <Pressable style={tabStyles.regenBtn} onPress={handleGenerate}>
            <Text style={tabStyles.regenText}>🔄 Generate another variation</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
};

// ─── MEAL SCAN TAB ───────────────────────────────────────────────────────────
const MealScanTab = () => {
  const [mealDesc, setMealDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [portion, setPortion] = useState<"Small" | "Medium" | "Large">("Medium");
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const scanLineY = useRef(new Animated.Value(0)).current;
  const cornerOp = useRef(new Animated.Value(0.5)).current;
  const brainBounce = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  let msgInterval = useRef<any>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineY, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerOp, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(cornerOp, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(brainBounce, { toValue: -10, duration: 400, useNativeDriver: true }),
          Animated.timing(brainBounce, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(Animated.sequence([Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }), Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }), Animated.delay(600)])).start();
      Animated.loop(Animated.sequence([Animated.delay(300), Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }), Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }), Animated.delay(300)])).start();
      Animated.loop(Animated.sequence([Animated.delay(600), Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }), Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true })])).start();
      msgInterval.current = setInterval(() => setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length), 1800);
    } else {
      clearInterval(msgInterval.current);
    }
    return () => clearInterval(msgInterval.current);
  }, [loading]);

  const scanLineTranslate = scanLineY.interpolate({ inputRange: [0, 1], outputRange: [0, 180] });

  const handleScan = async () => {
    if (!mealDesc.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setLoadingMsgIdx(0);
    try {
      const data = await scanMealFromDescription(mealDesc.trim());
      setResult(data);
    } catch (e: any) {
      setError(e.message ?? "Failed to analyze meal.");
    } finally {
      setLoading(false);
    }
  };

  const multiplier = PORTION_MULTIPLIERS[portion];
  const adj = (v: number) => Math.round(v * multiplier);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tabStyles.scroll}>
      {/* Viewfinder */}
      <View style={scanStyles.viewfinder}>
        <LinearGradient colors={["#0D0D0D", "#111111"]} style={scanStyles.viewfinderBg}>
          {/* Corners */}
          <Animated.View style={[scanStyles.cornerTL, { opacity: cornerOp }]} />
          <Animated.View style={[scanStyles.cornerTR, { opacity: cornerOp }]} />
          <Animated.View style={[scanStyles.cornerBL, { opacity: cornerOp }]} />
          <Animated.View style={[scanStyles.cornerBR, { opacity: cornerOp }]} />
          {/* Scan line */}
          <Animated.View style={[scanStyles.scanLine, { transform: [{ translateY: scanLineTranslate }] }]} />
          <Text style={scanStyles.plateEmoji}>🍽️</Text>
          <Text style={scanStyles.scanInstruction}>POINT AT YOUR MEAL</Text>
        </LinearGradient>
      </View>

      {/* Manual desc input */}
      <Text style={[tabStyles.sectionTitle, { marginTop: 16 }]}>DESCRIBE YOUR MEAL</Text>
      <View style={[tabStyles.ingredientInput, { marginBottom: 12 }]}>
        <TextInput
          style={[tabStyles.input, { minHeight: 52 }]}
          placeholder="e.g. Grilled chicken with rice and salad"
          placeholderTextColor={colors.textDim}
          value={mealDesc}
          onChangeText={setMealDesc}
          multiline
        />
      </View>

      <Pressable
        style={[tabStyles.generateBtn, !mealDesc.trim() && tabStyles.generateBtnDisabled]}
        onPress={handleScan}
        disabled={!mealDesc.trim() || loading}
      >
        <LinearGradient
          colors={mealDesc.trim() ? ["#FF5E1A", "#FF7A3A"] : [colors.surface2, colors.surface2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={tabStyles.generateBtnGradient}
        >
          <Text style={[tabStyles.generateBtnText, !mealDesc.trim() && tabStyles.generateBtnTextDisabled]}>
            🔍 ANALYZE MEAL
          </Text>
        </LinearGradient>
      </Pressable>

      {/* Loading */}
      {loading && (
        <View style={tabStyles.loadingCard}>
          <Animated.Text style={[tabStyles.brainEmoji, { transform: [{ translateY: brainBounce }] }]}>🧠</Animated.Text>
          <Text style={tabStyles.loadingMsg}>{LOADING_MESSAGES[loadingMsgIdx]}</Text>
          <View style={tabStyles.dotsRow}>
            <Animated.View style={[tabStyles.loadDot, { opacity: dot1 }]} />
            <Animated.View style={[tabStyles.loadDot, { opacity: dot2 }]} />
            <Animated.View style={[tabStyles.loadDot, { opacity: dot3 }]} />
          </View>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={tabStyles.errorCard}>
          <Text style={tabStyles.errorText}>⚠️ {error}</Text>
          <Text style={tabStyles.errorHint}>Make sure your Anthropic API key is set in src/services/anthropic.ts</Text>
        </View>
      )}

      {/* Result */}
      {result && !loading && (
        <View style={tabStyles.recipeCard}>
          <View style={tabStyles.recipeHeader}>
            <Text style={tabStyles.recipeEmoji}>{result.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={tabStyles.recipeName}>{result.foodName}</Text>
              <HealthScoreRing score={result.healthScore} />
            </View>
          </View>

          {/* Portion selector */}
          <View style={tabStyles.divider} />
          <Text style={tabStyles.cardSectionTitle}>PORTION SIZE</Text>
          <View style={scanStyles.portionRow}>
            {(["Small", "Medium", "Large"] as const).map((p) => (
              <Pressable
                key={p}
                style={[scanStyles.portionBtn, portion === p && scanStyles.portionBtnActive]}
                onPress={() => setPortion(p)}
              >
                <Text style={[scanStyles.portionText, portion === p && scanStyles.portionTextActive]}>{p}</Text>
              </Pressable>
            ))}
          </View>

          {/* Macros */}
          <View style={tabStyles.divider} />
          <Text style={tabStyles.cardSectionTitle}>NUTRITION ({portion})</Text>
          <MacroBar label="Calories" value={adj(result.calories)} unit=" kcal" color={colors.primary} total={800} />
          <MacroBar label="Protein" value={adj(result.protein)} unit="g" color={colors.info} total={100} />
          <MacroBar label="Carbs" value={adj(result.carbs)} unit="g" color={colors.warning} total={150} />
          <MacroBar label="Fat" value={adj(result.fat)} unit="g" color={colors.purple} total={80} />
          <MacroBar label="Fibre" value={adj(result.fibre)} unit="g" color={colors.success} total={30} />

          {/* Ingredients breakdown */}
          <View style={tabStyles.divider} />
          <Text style={tabStyles.cardSectionTitle}>DETECTED INGREDIENTS</Text>
          <View style={tabStyles.tagWrap}>
            {result.ingredients.map((ing, i) => (
              <View key={i} style={tabStyles.tag}>
                <Text style={tabStyles.tagText}>{ing.name}</Text>
                <Text style={[tabStyles.tagText, { color: colors.textMuted }]}> · {ing.amount}</Text>
              </View>
            ))}
          </View>

          {/* AI Insight */}
          <View style={tabStyles.insightCard}>
            <Text style={tabStyles.insightIcon}>🤖</Text>
            <Text style={tabStyles.insightText}>{result.insight}</Text>
          </View>

          {/* Log meal CTA */}
          <Pressable style={tabStyles.generateBtn}>
            <LinearGradient colors={["#FF5E1A", "#FF7A3A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={tabStyles.generateBtnGradient}>
              <Text style={tabStyles.generateBtnText}>LOG THIS MEAL</Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
};

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export const NutritionScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>("recipe");

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>FUEL</Text>
          <Text style={styles.headerEmoji}>🥗</Text>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tab, activeTab === "recipe" && styles.tabActive]}
            onPress={() => setActiveTab("recipe")}
          >
            <Text style={[styles.tabText, activeTab === "recipe" && styles.tabTextActive]}>
              ✨ RECIPE ENGINE
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "scan" && styles.tabActive]}
            onPress={() => setActiveTab("scan")}
          >
            <Text style={[styles.tabText, activeTab === "scan" && styles.tabTextActive]}>
              📷 MEAL SCAN
            </Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={{ flex: 1, paddingHorizontal: 20 }}>
            {activeTab === "recipe" ? <RecipeTab /> : <MealScanTab />}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  safeArea: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  screenTitle: { fontFamily: typography.displayFont, fontSize: 36, letterSpacing: 3, color: colors.textPrimary },
  headerEmoji: { fontSize: 28 },
  tabRow: { flexDirection: "row", marginHorizontal: 20, backgroundColor: colors.surface1, borderRadius: radii.lg, padding: 4, marginBottom: 8, borderWidth: 1, borderColor: colors.surface2 },
  tab: { flex: 1, height: 42, alignItems: "center", justifyContent: "center", borderRadius: radii.md },
  tabActive: { backgroundColor: colors.primary, shadowColor: colors.primary, shadowRadius: 8, shadowOpacity: 0.4, elevation: 4 },
  tabText: { fontFamily: typography.displayFont, fontSize: 13, letterSpacing: 1, color: colors.textMuted },
  tabTextActive: { color: colors.textPrimary },
});

const tabStyles = StyleSheet.create({
  scroll: { paddingBottom: 40, paddingTop: 8 },
  sectionTitle: { fontFamily: typography.displayFont, fontSize: 14, letterSpacing: 1.5, color: colors.textMuted, marginBottom: 10 },
  inputRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  ingredientInput: {
    flex: 1, backgroundColor: colors.surface1, borderRadius: radii.md,
    borderWidth: 1.5, borderColor: colors.surface2, justifyContent: "center",
  },
  input: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textPrimary, paddingHorizontal: 14, paddingVertical: 12 },
  addBtn: { width: 50, height: 50, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", ...shadows.orangeGlow },
  addBtnText: { fontSize: 26, color: colors.textPrimary, lineHeight: 30 },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  tag: { flexDirection: "row", backgroundColor: colors.surface1, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.primary },
  tagText: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.primary },
  tagRemove: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted },
  quickLabel: { fontFamily: typography.displayFont, fontSize: 12, letterSpacing: 1.5, color: colors.textDim, marginBottom: 8 },
  chipsRow: { gap: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface1, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.surface2 },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primaryDim },
  chipText: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted },
  chipTextActive: { color: colors.primary },
  goalsRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  goalBtn: { flex: 1, paddingVertical: 12, backgroundColor: colors.surface1, borderRadius: radii.md, alignItems: "center", borderWidth: 1.5, borderColor: colors.surface2, gap: 4 },
  goalBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryDim },
  goalEmoji: { fontSize: 20 },
  goalLabel: { fontFamily: typography.displayFont, fontSize: 11, letterSpacing: 0.8, color: colors.textMuted },
  goalLabelActive: { color: colors.primary },
  generateBtn: { borderRadius: radii.lg, overflow: "hidden", marginVertical: 16, ...shadows.orangeGlow },
  generateBtnDisabled: { shadowOpacity: 0, elevation: 0 },
  generateBtnGradient: { height: 56, alignItems: "center", justifyContent: "center" },
  generateBtnText: { fontFamily: typography.displayFont, fontSize: 20, letterSpacing: 2, color: colors.textPrimary },
  generateBtnTextDisabled: { color: colors.textDim },
  loadingCard: { backgroundColor: colors.surface0, borderRadius: radii.xl, padding: 28, alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.surface2 },
  brainEmoji: { fontSize: 48 },
  loadingMsg: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textMuted, textAlign: "center" },
  dotsRow: { flexDirection: "row", gap: 6 },
  loadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  errorCard: { backgroundColor: "rgba(239,68,68,0.08)", borderRadius: radii.xl, padding: 20, borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", gap: 8 },
  errorText: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.accentRed },
  errorHint: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.textMuted },
  recipeCard: { backgroundColor: colors.surface0, borderRadius: radii.xl, padding: 20, borderWidth: 1, borderColor: colors.surface2 },
  recipeHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  recipeEmoji: { fontSize: 48 },
  recipeName: { fontFamily: typography.displayFont, fontSize: 22, letterSpacing: 1, color: colors.textPrimary, marginBottom: 6 },
  goalBadge: { backgroundColor: colors.primaryDim, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  goalBadgeText: { fontFamily: typography.bodyFont, fontSize: 12, color: colors.primary },
  divider: { height: 1, backgroundColor: colors.surface2, marginVertical: 14 },
  cardSectionTitle: { fontFamily: typography.displayFont, fontSize: 13, letterSpacing: 1.5, color: colors.textMuted, marginBottom: 12 },
  microRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  microPill: { backgroundColor: colors.surface1, borderRadius: radii.md, paddingHorizontal: 10, paddingVertical: 8, alignItems: "center", borderWidth: 1, borderColor: colors.surface2 },
  microValue: { fontFamily: typography.displayFont, fontSize: 14, color: colors.textPrimary, letterSpacing: 0.5 },
  microLabel: { fontFamily: typography.bodyFont, fontSize: 10, color: colors.textMuted, marginTop: 2 },
  ingList: { gap: 6, marginBottom: 4 },
  ingItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  ingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  ingText: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textPrimary, flex: 1 },
  stepItem: { flexDirection: "row", gap: 12, marginBottom: 10, alignItems: "flex-start" },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  stepNumText: { fontFamily: typography.displayFont, fontSize: 13, color: colors.textPrimary },
  stepText: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textPrimary, flex: 1, lineHeight: 20 },
  insightCard: { flexDirection: "row", gap: 10, backgroundColor: colors.surface1, borderRadius: radii.md, padding: 14, marginTop: 12, borderWidth: 1, borderColor: colors.surface2 },
  insightIcon: { fontSize: 20 },
  insightText: { fontFamily: typography.bodyFont, fontSize: 13, color: colors.textMuted, flex: 1, lineHeight: 19 },
  regenBtn: { marginTop: 14, height: 46, backgroundColor: colors.surface1, borderRadius: radii.md, borderWidth: 1, borderColor: colors.surface2, alignItems: "center", justifyContent: "center" },
  regenText: { fontFamily: typography.bodyFont, fontSize: 14, color: colors.textMuted },
});

const scanStyles = StyleSheet.create({
  viewfinder: { borderRadius: radii.xl, overflow: "hidden", ...shadows.card },
  viewfinderBg: { height: 220, alignItems: "center", justifyContent: "center", position: "relative" },
  cornerTL: { position: "absolute", top: 14, left: 14, width: 24, height: 24, borderTopWidth: 3, borderLeftWidth: 3, borderColor: colors.primary, borderTopLeftRadius: 6 },
  cornerTR: { position: "absolute", top: 14, right: 14, width: 24, height: 24, borderTopWidth: 3, borderRightWidth: 3, borderColor: colors.primary, borderTopRightRadius: 6 },
  cornerBL: { position: "absolute", bottom: 14, left: 14, width: 24, height: 24, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: colors.primary, borderBottomLeftRadius: 6 },
  cornerBR: { position: "absolute", bottom: 14, right: 14, width: 24, height: 24, borderBottomWidth: 3, borderRightWidth: 3, borderColor: colors.primary, borderBottomRightRadius: 6 },
  scanLine: { position: "absolute", top: 20, left: 14, right: 14, height: 2, backgroundColor: colors.primary, opacity: 0.7, shadowColor: colors.primary, shadowRadius: 6, shadowOpacity: 0.8, elevation: 4 },
  plateEmoji: { fontSize: 64, opacity: 0.5 },
  scanInstruction: { fontFamily: typography.displayFont, fontSize: 14, letterSpacing: 1.5, color: colors.primary, opacity: 0.8, marginTop: 8 },
  portionRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  portionBtn: { flex: 1, height: 40, backgroundColor: colors.surface1, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.surface2, alignItems: "center", justifyContent: "center" },
  portionBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryDim },
  portionText: { fontFamily: typography.displayFont, fontSize: 14, letterSpacing: 1, color: colors.textMuted },
  portionTextActive: { color: colors.primary },
});
