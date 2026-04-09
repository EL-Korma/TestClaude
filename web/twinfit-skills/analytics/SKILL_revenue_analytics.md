# SKILL: Revenue Analytics
> TwinFit — MRR, conversion funnels, churn monitoring

## RevenueCat KPIs
```
MRR:              monthly delta, by plan (monthly vs annual)
Conversion:       Free → Premium target >5% at D30
Paywall → Buy:    target >8%
Monthly churn:    target <10%
Annual churn:     target <5%
LTV:              avg duration × price, target LTV > 3× CAC
```

## Track Purchase Context
```ts
analytics.track(EVENTS.PURCHASE_COMPLETED, {
  plan: "annual",
  revenue: 34.99,
  source: paywallSource,        // "streak_freeze" | "locked_feature" | "settings"
  days_since_signup: daysSinceSignup,
  streak_at_purchase: currentStreak,
  sessions_at_purchase: totalSessions,
});
```

## Paywall Entry Points to Track
```ts
const PAYWALL_SOURCES = {
  STREAK_FREEZE:    "streak_freeze",
  STREAK_BROKEN:    "streak_broken",
  LOCKED_FEATURE:   "locked_feature",
  NUTRITION_LIMIT:  "nutrition_limit",
  SETTINGS:         "settings",
  POST_MILESTONE:   "post_milestone",
};

// Always pass source:
router.push({ pathname: "/(app)/paywall", params: { source: PAYWALL_SOURCES.STREAK_FREEZE } });
```

## Monthly Review
```
[ ] MRR vs last month
[ ] New vs churned subscribers
[ ] Annual vs monthly plan split (target 60% annual)
[ ] Top paywall entry source by conversion
[ ] Conversion rate by streak length at paywall
[ ] Store cut: 30% year 1, 15% year 2+
```
