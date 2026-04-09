# SKILL: Onboarding Analytics
> TwinFit — Funnel tracking, drop-off, A/B tests

## Track Each Step
```ts
// In each signup step, on completion:
analytics.track(EVENTS.SIGNUP_STEP_COMPLETED, {
  step: stepNumber,
  step_name: stepName,
  time_on_step_ms: Date.now() - stepStartTime,
});
```

## PostHog Funnel Setup
```
Steps:
1. signup_started
2. signup_step_completed { step: 1 }
3. signup_step_completed { step: 2 }
4. signup_step_completed { step: 3 }
5. signup_step_completed { step: 4 }
6. signup_step_completed { step: 5 }
7. signup_completed

Target: >60% step-1 → step-7 completion
Alert if: any step-to-step drop > 25%
```

## A/B Tests to Run
```
Test 1: Partner step timing
  Control: Step 5 in onboarding
  Variant: After first session logged
  Metric: signup completion rate + D7 retention

Test 2: Stats step vs skip
  Control: Age/height/weight required
  Variant: Stats optional, ask later
  Metric: step 2 → 3 conversion

Test 3: Avatar picker
  Control: Emoji grid
  Variant: No avatar step (set later in settings)
  Metric: overall signup completion
```
