# SKILL: AI Prompt Library
> TwinFit — All prompts as versioned constants

## constants/prompts.ts

```ts
export const PROMPTS = {
  RECIPE_V1: {
    version: "1.0",
    system: "You are a professional sports nutritionist and chef for athletes. Use positive, empowering language around food. Never use words like: cheat, restriction, bad food, failure.",
    build: (ingredients: string[], goal: string) =>
      "Ingredients: " + ingredients.join(", ") + ". Fitness goal: " + goal + ". " +
      "Create ONE healthy recipe optimized for their goal. " +
      "Return ONLY valid JSON no markdown: {emoji, name, servings, goalBadge, macros:{calories,protein,carbs,fat,calP,proP,crbP,fatP}, micros:[{l,v}], ingredients:[string], steps:[string], insight}",
  },

  MEAL_SCAN_V1: {
    version: "1.0",
    system: "You are a sports nutritionist AI. Score meals 0-100. Use positive framing.",
    build: (mealName: string, mealType: string) =>
      "Analyse this meal: \"" + mealName + "\" as " + mealType + ". " +
      "Return ONLY valid JSON: {emoji, name, score, scoreLabel, verdict, nutrients:[{name,val,pct}], tips:[{icon,text}]}",
  },

  WEEKLY_INSIGHT_V1: {
    version: "1.0",
    build: (sessions: number, goal: string) =>
      "User completed " + sessions + "/7 sessions. Goal: " + goal + ". " +
      "Write a 2-sentence motivational weekly summary. " +
      "Use bold for 1-2 key stats. Positive, energizing tone. Return plain text only.",
  },
};
```

## Testing Checklist
```
For each prompt, run 20 times and verify:
[ ] Always returns valid JSON
[ ] All required fields present
[ ] Handles 1-ingredient edge case
[ ] Handles unusual foods
[ ] No markdown leakage
[ ] HTML tags present in insight/verdict
[ ] Numeric percentage fields are 0-100
```
