# SKILL: App Store ASO
> TwinFit — Keyword research, icon tests, conversion optimization

## iOS Keyword Targets
```
Primary (high intent):
  couple fitness app
  workout streak app
  gym partner app
  duo fitness tracker
  fitness streak app

Secondary (volume):
  workout tracker
  gym log app
  fitness challenge
  accountability partner fitness

Long-tail (low competition):
  couples gym streak
  workout together app
  boyfriend girlfriend gym app
```

## App Store Title (30 chars limit for subtitle)
```
Title:    TwinFit: Couple Fitness Streak
Subtitle: Train Together, Never Break It
```

## Screenshot Strategy
```
Frame 1 (search visible): Giant orange "🔥 14" streak number
  Copy: "Never Break the Streak. Together."
  Dark bg, high contrast, orange dominant

Frame 2: Duo status (one logged, one pending)
  Copy: "Your partner is waiting ⏳"
  Emotional hook: accountability

Frame 3: Evolution path Bronze→Silver→Gold
  Copy: "Your pose evolves with you"

Frame 4: AI Recipe result with macro grid
  Copy: "AI-powered nutrition, built for athletes"

Frame 5: Meal scan health score 84/100
  Copy: "Know exactly what you're eating"
```

## Icon A/B Test Options
```
Option A: TwinFit duo logo on black (brand-focused)
Option B: Orange flame on black (high visibility in search)
Option C: "14" streak number on orange (benefit-focused)

Test via Apple Product Page Optimization (PPO)
Run 90 days, need 1000+ impressions per variant
```

## Review Prompts
```ts
import * as StoreReview from "expo-store-review";

// Trigger after:
// - User has 3+ consecutive days logged
// - User has 5+ total sessions
// - NOT prompted in last 90 days
if (await StoreReview.hasAction()) {
  await StoreReview.requestReview();
}
```

## App Description Structure
```
Line 1-2: Hook (what problem + for who)
Line 3-5: Core mechanic (shared streak, both must log)
Line 6-8: Secondary features (evolution, AI nutrition)
Line 9:   Mode choices
Line 10:  Tagline: "We go to the gym. We don't break our streak. Our pose evolves."
```
