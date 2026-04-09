# SKILL: Project Architecture
> TwinFit — Monorepo structure, tech stack, folder conventions

---

## Tech Stack Decision

| Layer | Choice | Why |
|---|---|---|
| Mobile | React Native + Expo SDK 51 | Cross-platform, OTA updates, large ecosystem |
| Backend | Supabase | Auth + DB + Realtime + Storage + Edge Functions in one |
| AI | Anthropic Claude API (server-side only) | Recipe engine + meal scan |
| Payments | RevenueCat | Abstracts iOS/Android billing |
| Analytics | PostHog | Free, self-hostable, product-focused |
| Notifications | Expo Notifications + APNs/FCM | Native push via Expo |
| CI/CD | GitHub Actions + EAS Build | Automated builds and deploys |

---

## Monorepo Structure

```
twinfit/
├── apps/
│   ├── mobile/                    # Expo React Native app
│   │   ├── app/                   # Expo Router screens
│   │   │   ├── (auth)/
│   │   │   │   ├── splash.tsx
│   │   │   │   ├── login.tsx
│   │   │   │   └── signup/
│   │   │   │       ├── step-1-basics.tsx
│   │   │   │       ├── step-2-stats.tsx
│   │   │   │       ├── step-3-diet.tsx
│   │   │   │       ├── step-4-goal.tsx
│   │   │   │       └── step-5-partner.tsx
│   │   │   ├── (app)/
│   │   │   │   ├── _layout.tsx    # Tab navigator
│   │   │   │   ├── home.tsx
│   │   │   │   ├── log.tsx
│   │   │   │   ├── evolution.tsx
│   │   │   │   └── nutrition/
│   │   │   │       ├── index.tsx
│   │   │   │       ├── recipe.tsx
│   │   │   │       └── scan.tsx
│   │   │   └── _layout.tsx        # Root layout
│   │   ├── components/            # Shared UI components
│   │   │   ├── atoms/             # Button, Input, Badge, etc.
│   │   │   ├── molecules/         # StreakCard, PoseCard, MacroRow
│   │   │   └── organisms/         # FullScreenModal, BottomSheet
│   │   ├── hooks/                 # useStreak, useDuo, useAuth, etc.
│   │   ├── stores/                # Zustand stores
│   │   ├── services/              # API calls, Supabase queries
│   │   ├── constants/             # Design tokens, config
│   │   ├── utils/                 # Helpers, formatters
│   │   ├── assets/                # Images, fonts, icons
│   │   ├── app.json
│   │   ├── eas.json
│   │   └── package.json
│   └── web/                       # Landing page (Next.js)
│       ├── pages/
│       ├── components/
│       └── package.json
├── packages/
│   ├── shared-types/              # TypeScript interfaces used by all apps
│   │   ├── src/
│   │   │   ├── user.ts
│   │   │   ├── duo.ts
│   │   │   ├── streak.ts
│   │   │   ├── nutrition.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── shared-utils/              # Pure utility functions
│       ├── src/
│       │   ├── streak.ts          # Streak calculation logic
│       │   ├── nutrition.ts       # Macro calculations
│       │   └── date.ts            # Timezone-safe date utils
│       └── package.json
├── supabase/
│   ├── migrations/                # SQL migration files
│   ├── functions/                 # Edge Functions
│   │   ├── ai-recipe/
│   │   ├── ai-meal-scan/
│   │   ├── streak-update/
│   │   └── send-notification/
│   └── seed.sql
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── package.json                   # Workspace root
├── turbo.json                     # Turborepo config
└── .env.example
```

---

## Environment Variables

```bash
# .env.example
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Server/Edge Functions only

# Anthropic (NEVER expose to client)
ANTHROPIC_API_KEY=sk-ant-...       # Edge Functions only

# RevenueCat
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...

# PostHog
EXPO_PUBLIC_POSTHOG_KEY=phc_...
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App Config
EXPO_PUBLIC_APP_ENV=development    # development | staging | production
EXPO_PUBLIC_APP_SCHEME=twinfit
```

---

## Initial Setup Commands

```bash
# 1. Clone and install
git clone https://github.com/yourorg/twinfit
cd twinfit
npm install

# 2. Install Expo CLI and EAS
npm install -g expo-cli eas-cli

# 3. Set up Supabase
npx supabase init
npx supabase start              # local dev
npx supabase db push            # apply migrations

# 4. Configure EAS
cd apps/mobile
eas build:configure

# 5. Start mobile dev
npx expo start
```

---

## Key Conventions

- **Screens** use Expo Router file-based routing
- **State** is Zustand (lightweight, no boilerplate)
- **DB calls** go through `/services/` — never inline in components
- **AI calls** always go through Supabase Edge Functions — API key never touches client
- **Types** are defined in `packages/shared-types` and imported everywhere
- **Env vars** prefixed `EXPO_PUBLIC_` are safe for client; all others are server-only

---

## Dependencies (mobile app)

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "react-native": "0.74.0",
    "@supabase/supabase-js": "^2.43.0",
    "zustand": "^4.5.0",
    "react-native-reanimated": "~3.10.0",
    "react-native-gesture-handler": "~2.16.0",
    "expo-camera": "~15.0.0",
    "expo-image-picker": "~15.0.0",
    "expo-notifications": "~0.28.0",
    "react-native-purchases": "^7.0.0",
    "posthog-react-native": "^3.0.0",
    "@shopify/flash-list": "^1.6.0",
    "date-fns": "^3.6.0"
  }
}
```
