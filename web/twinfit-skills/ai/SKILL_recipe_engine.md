# SKILL: Recipe Engine
> TwinFit — Ingredient-to-recipe AI, JSON schema, caching

## Edge Function: ai-recipe (supabase/functions/ai-recipe/index.ts)
```ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { ingredients, goal } = await req.json();
  const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");

  const prompt = "You are a sports nutritionist chef. " +
    "Ingredients: " + ingredients.join(", ") + ". Goal: " + goal + ". " +
    "Create ONE optimized recipe. Return ONLY valid JSON no markdown: " +
    '{"emoji":"food emoji","name":"name max 5 words","servings":"2 servings","goalBadge":"High Protein",' +
    '"macros":{"calories":"480","protein":"42g","carbs":"38g","fat":"14g","calP":72,"proP":88,"crbP":55,"fatP":40},' +
    '"micros":[{"l":"Fibre","v":"6g"},{"l":"Iron","v":"3mg"}],' +
    '"ingredients":["200g chicken breast"],"steps":["Heat oil..."],' +
    '"insight":"2-3 sentences. Use <strong> tags."}';

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content.map((b) => b.text || "").join("");
  const result = JSON.parse(text.replace(/```json|```/g, "").trim());

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
});
```
