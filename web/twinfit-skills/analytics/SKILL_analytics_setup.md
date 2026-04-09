# SKILL: Analytics Setup
> TwinFit — PostHog, events, screen tracking

## Installation
```bash
npm install posthog-react-native
npx expo install expo-file-system expo-application @react-native-async-storage/async-storage
```

## Init (services/analytics.ts)
```ts
import PostHog from "posthog-react-native";

export const posthog = new PostHog(
  process.env.EXPO_PUBLIC_POSTHOG_KEY,
  { host: process.env.EXPO_PUBLIC_POSTHOG_HOST }
);

export const analytics = {
  identify: (userId: string, traits: object) => posthog.identify(userId, traits),
  screen: (name: string, props?: object) => posthog.screen(name, props),
  track: (event: string, props?: object) => posthog.capture(event, props),
  reset: () => posthog.reset(),
};
```

## Event Taxonomy
```ts
export const EVENTS = {
  SIGNUP_STARTED: "signup_started",
  SIGNUP_STEP_COMPLETED: "signup_step_completed",
  SIGNUP_COMPLETED: "signup_completed",
  SESSION_LOGGED: "session_logged",
  STREAK_BROKEN: "streak_broken",
  STREAK_FREEZE_USED: "streak_freeze_used",
  MILESTONE_REACHED: "milestone_reached",
  TIER_UNLOCKED: "tier_unlocked",
  RECIPE_GENERATED: "recipe_generated",
  MEAL_SCANNED: "meal_scanned",
  PAYWALL_VIEWED: "paywall_viewed",
  PURCHASE_COMPLETED: "purchase_completed",
  PURCHASE_FAILED: "purchase_failed",
};
```

## Key Metrics
```
D1/D7/D30 retention
Streak length distribution
Onboarding funnel completion rate
Paywall conversion by entry point
Revenue per user segment
Feature usage: recipe vs scan ratio
```
