import { NextRequest } from "next/server";
import { getUserId, unauthorized } from "@/lib/auth";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";

async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("AI not configured");
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`AI error ${res.status}`);
  const data = await res.json();
  return data.content[0]?.text ?? "";
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  const { ingredients, goal } = await req.json().catch(() => ({}));
  if (!ingredients?.length || !goal) {
    return Response.json({ error: "ingredients and goal required" }, { status: 400 });
  }

  const prompt = `You are a professional nutritionist and chef. Generate a healthy recipe using these ingredients: ${(ingredients as string[]).join(", ")}.
The recipe should support the goal: ${goal}.
Respond with ONLY valid JSON (no markdown, no explanation):
{
  "name": "Recipe Name",
  "emoji": "🍗",
  "goal": "${goal}",
  "calories": 450,
  "protein": 42,
  "carbs": 35,
  "fat": 12,
  "fibre": 8,
  "iron": "3.2mg",
  "vitaminC": "45mg",
  "sodium": "380mg",
  "potassium": "620mg",
  "ingredients": ["200g chicken breast", "1 cup brown rice"],
  "steps": ["Step 1: ...", "Step 2: ..."],
  "insight": "This meal is high in lean protein..."
}`;

  try {
    const text = await callClaude(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const recipe = JSON.parse(jsonMatch[0]);
    return Response.json({ recipe });
  } catch (e: any) {
    return Response.json({ error: e.message ?? "AI failed" }, { status: 500 });
  }
}
