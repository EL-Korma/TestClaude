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

  const { description } = await req.json().catch(() => ({}));
  if (!description) {
    return Response.json({ error: "description required" }, { status: 400 });
  }

  const prompt = `You are a certified nutritionist. Analyze this meal: "${description}".
Provide complete nutritional analysis. Respond with ONLY valid JSON (no markdown):
{
  "foodName": "Grilled Chicken Salad",
  "emoji": "🥗",
  "calories": 380,
  "protein": 35,
  "carbs": 18,
  "fat": 14,
  "fibre": 6,
  "healthScore": 82,
  "ingredients": [
    { "name": "Chicken Breast", "amount": "150g" }
  ],
  "insight": "High-protein meal that supports muscle recovery..."
}`;

  try {
    const text = await callClaude(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const scan = JSON.parse(jsonMatch[0]);
    return Response.json({ scan });
  } catch (e: any) {
    return Response.json({ error: e.message ?? "AI failed" }, { status: 500 });
  }
}
