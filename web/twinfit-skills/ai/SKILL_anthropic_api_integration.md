# SKILL: Anthropic API Integration
> TwinFit — Server-side only via Supabase Edge Functions

## Golden Rule
The Anthropic API key NEVER touches the client. All AI calls go through Edge Functions.

## Client-Side AI Service (services/ai.ts)
```ts
import { supabase } from "./supabase";
import type { RecipeResult, MealScanResult } from "@types/nutrition";

export const aiService = {
  async generateRecipe(ingredients: string[], goal: string): Promise<RecipeResult> {
    const { data, error } = await supabase.functions.invoke("ai-recipe", {
      body: { ingredients, goal },
    });
    if (error) throw new Error("Recipe generation failed");
    return data;
  },

  async analyseMeal(mealName: string, mealType: string): Promise<MealScanResult> {
    const { data, error } = await supabase.functions.invoke("ai-meal-scan", {
      body: { meal_name: mealName, meal_type: mealType },
    });
    if (error) throw new Error("Meal analysis failed");
    return data;
  },
};
```

## Rate Limit per User (Edge Function check)
```ts
async function checkRateLimit(userId: string, fn: string) {
  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase.from("ai_usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId).eq("function_name", fn).gte("created_at", today);
  const limit = isPremium ? 100 : 3;
  if ((count ?? 0) >= limit) throw new Error("Daily AI limit reached.");
}
```
