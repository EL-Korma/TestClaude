# SKILL: Onboarding Flow
> TwinFit — 5-step signup with state machine

## Onboarding State (stores/onboardingStore.ts)
```ts
import { create } from "zustand";
import type { DietType, FitnessGoal } from "@types/user";

export interface OnboardingData {
  name: string; email: string; password: string;
  age: number; height_cm: number; weight_kg: number; sex: string;
  diet_type: DietType; fitness_goal: FitnessGoal; avatar: string;
  partner_code: string;
}

interface OnboardingState {
  step: number;
  data: Partial<OnboardingData>;
  setStep: (step: number) => void;
  updateData: (patch: Partial<OnboardingData>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 0,
  data: { age: 26, height_cm: 175, weight_kg: 74, diet_type: "standard", fitness_goal: "build_muscle", avatar: "lion" },
  setStep: (step) => set({ step }),
  updateData: (patch) => set((s) => ({ data: { ...s.data, ...patch } })),
  reset: () => set({ step: 0, data: {} }),
}));
```

## Step 2: Body Stats Slider Component
```tsx
function SliderField({ label, unit, min, max, value, onChange }) {
  return (
    <View style={styles.sliderWrap}>
      <View style={styles.sliderRow}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderVal}>{value} {unit}</Text>
      </View>
      <Slider
        minimumValue={min} maximumValue={max} value={value}
        onValueChange={(v) => onChange(Math.round(v))}
        minimumTrackTintColor={colors.orange}
        maximumTrackTintColor={colors.surface3}
        thumbTintColor={colors.orange}
      />
    </View>
  );
}
```

## Final Submit (StepPartner)
```tsx
async function handleComplete() {
  setLoading(true);
  try {
    await authService.signUp(data.email, data.password, data.name);
    await supabase.from("users").update({
      age: data.age, height_cm: data.height_cm, weight_kg: data.weight_kg,
      diet_type: data.diet_type, fitness_goal: data.fitness_goal, avatar: data.avatar,
    }).eq("id", session.user.id);
    if (data.partner_code) await connectPartner(data.partner_code);
    router.replace("/(auth)/mode-select");
  } finally {
    setLoading(false);
  }
}
```
