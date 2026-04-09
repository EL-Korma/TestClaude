# SKILL: Evolution System
> TwinFit — Tier thresholds, progress, unlock celebrations

## Tier Config
```ts
export const TIERS = {
  bronze:    { min: 0,   max: 19,  label: "Bronze",   emoji: "🥉", color: "#CD7F32" },
  silver:    { min: 20,  max: 49,  label: "Silver",   emoji: "🥈", color: "#A8A9AD" },
  gold:      { min: 50,  max: 99,  label: "Gold",     emoji: "🥇", color: "#FFD700" },
  platinum:  { min: 100, max: 199, label: "Platinum", emoji: "💎", color: "#E5E4E2" },
  legendary: { min: 200, max: Infinity, label: "Legendary", emoji: "🔱", color: "#FF5E1A" },
};

export function getTier(sessions: number) {
  return Object.entries(TIERS).find(([, t]) => sessions >= t.min && sessions < t.max)?.[0] ?? "bronze";
}

export function getTierProgress(sessions: number): number {
  const tier = getTier(sessions);
  const { min, max } = TIERS[tier];
  if (max === Infinity) return 100;
  return Math.round(((sessions - min) / (max - min)) * 100);
}

export function getSessionsUntilNext(sessions: number): number | null {
  const tier = getTier(sessions);
  const { max } = TIERS[tier];
  return max === Infinity ? null : max - sessions;
}
```

## Evolution Hook
```ts
export function useEvolution() {
  const { duo } = useDuoStore();
  const sessions = duo?.total_sessions ?? 0;
  return {
    currentTier: getTier(sessions),
    tierConfig: TIERS,
    progress: getTierProgress(sessions),
    sessionsUntilNext: getSessionsUntilNext(sessions),
    totalSessions: sessions,
  };
}
```
