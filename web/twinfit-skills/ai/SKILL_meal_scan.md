# SKILL: Meal Scan
> TwinFit — AI nutritional analysis, health score, tips

## Edge Function: ai-meal-scan
```ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { meal_name, meal_type } = await req.json();
  const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");

  const prompt = "Sports nutritionist AI. Analyse: \"" + meal_name + "\" as " + meal_type + ". " +
    "Return ONLY valid JSON no markdown: " +
    '{"emoji":"food emoji","name":"full meal name","score":82,"scoreLabel":"Great",' +
    '"verdict":"2-3 sentences with <strong> tags for key nutrients.",' +
    '"nutrients":[{"name":"Calories","val":"420 kcal","pct":65},{"name":"Protein","val":"32g","pct":80},' +
    '{"name":"Carbs","val":"45g","pct":55},{"name":"Fat","val":"12g","pct":40},{"name":"Fibre","val":"5g","pct":50}],' +
    '"tips":[{"icon":"checkmark","text":"what makes this great"},{"icon":"bulb","text":"improvement tip"},{"icon":"bolt","text":"fitness benefit"}]}';

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
  return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
});
```
