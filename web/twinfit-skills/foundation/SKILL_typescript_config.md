# SKILL: TypeScript Configuration
> TwinFit — tsconfig, strict mode, path aliases, shared types

---

## tsconfig.json (mobile app)

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@screens/*": ["./src/screens/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@stores/*": ["./src/stores/*"],
      "@services/*": ["./src/services/*"],
      "@constants/*": ["./src/constants/*"],
      "@utils/*": ["./src/utils/*"],
      "@assets/*": ["./assets/*"],
      "@types/*": ["../../packages/shared-types/src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.d.ts", "expo-env.d.ts"]
}
```

---

## Shared Types (packages/shared-types/src/)

### user.ts
```ts
export type DietType =
  | 'standard'
  | 'high_protein'
  | 'vegetarian'
  | 'vegan'
  | 'keto'
  | 'mediterranean';

export type FitnessGoal =
  | 'build_muscle'
  | 'fat_loss'
  | 'energy'
  | 'recovery';

export type DuoMode = 'couple' | 'besties';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;           // emoji e.g. "🦁"
  age: number;
  height_cm: number;
  weight_kg: number;
  diet_type: DietType;
  fitness_goal: FitnessGoal;
  duo_id: string | null;
  invite_code: string;      // 6-char alphanumeric
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}
```

### duo.ts
```ts
import { DuoMode, UserProfile } from './user';

export type EvolutionTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';

export interface Duo {
  id: string;
  mode: DuoMode;
  user_a_id: string;
  user_b_id: string;
  user_a?: UserProfile;
  user_b?: UserProfile;
  current_streak: number;
  longest_streak: number;
  total_sessions: number;
  evolution_tier: EvolutionTier;
  evolution_sessions: number;   // sessions in current tier
  created_at: string;
}

export interface DuoRealtimeStatus {
  duo_id: string;
  user_a_logged_today: boolean;
  user_b_logged_today: boolean;
  last_updated: string;
}
```

### streak.ts
```ts
export interface StreakDay {
  date: string;           // YYYY-MM-DD
  user_a_logged: boolean;
  user_b_logged: boolean;
  both_logged: boolean;
}

export interface Session {
  id: string;
  duo_id: string;
  user_id: string;
  photo_url: string;
  logged_at: string;
  pose_type: string;
}

export interface StreakFreeze {
  id: string;
  duo_id: string;
  used_on_date: string;
  created_at: string;
}
```

### nutrition.ts
```ts
export interface Macro {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Micro {
  label: string;
  value: string;
}

export interface RecipeResult {
  emoji: string;
  name: string;
  servings: string;
  goal_badge: string;
  macros: Macro & {
    cal_pct: number;
    protein_pct: number;
    carbs_pct: number;
    fat_pct: number;
  };
  micros: Micro[];
  ingredients: string[];
  steps: string[];
  insight: string;
}

export interface MealScanResult {
  emoji: string;
  name: string;
  score: number;         // 0-100
  score_label: string;
  verdict: string;
  nutrients: Array<{
    name: string;
    value: string;
    pct: number;
  }>;
  tips: Array<{
    icon: string;
    text: string;
  }>;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  type: 'recipe' | 'scan';
  meal_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
}
```

---

## Zustand Store Types

```ts
// stores/authStore.ts
import { Session } from '@supabase/supabase-js';
import { UserProfile } from '@types/user';

interface AuthState {
  session: Session | null;
  user: UserProfile | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: UserProfile | null) => void;
  signOut: () => Promise<void>;
}

// stores/duoStore.ts
import { Duo, DuoRealtimeStatus } from '@types/duo';

interface DuoState {
  duo: Duo | null;
  realtimeStatus: DuoRealtimeStatus | null;
  setDuo: (duo: Duo | null) => void;
  setRealtimeStatus: (status: DuoRealtimeStatus) => void;
}

// stores/streakStore.ts
import { StreakDay } from '@types/streak';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  weekHistory: StreakDay[];
  todayStatus: { userLogged: boolean; partnerLogged: boolean };
  setStreakData: (data: Partial<StreakState>) => void;
}
```

---

## Babel Config (for path aliases)

```js
// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@stores': './src/stores',
            '@services': './src/services',
            '@constants': './src/constants',
            '@utils': './src/utils',
            '@types': '../../packages/shared-types/src',
          },
        },
      ],
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
```
