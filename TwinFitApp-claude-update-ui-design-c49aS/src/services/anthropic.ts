/**
 * Anthropic Claude API service
 * Set your API key in ANTHROPIC_API_KEY constant below, or load from secure storage.
 */

// Replace with your actual Anthropic API key
const ANTHROPIC_API_KEY = "YOUR_ANTHROPIC_API_KEY_HERE";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-opus-4-6";

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string | Array<{ type: string; text?: string; source?: object }>;
}

interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  system?: string;
}

async function callClaude(request: AnthropicRequest): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.content[0]?.text ?? "";
}

// ─── Recipe Generation ──────────────────────────────────────────────────────

export interface RecipeResult {
  name: string;
  emoji: string;
  goal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  iron: string;
  vitaminC: string;
  sodium: string;
  potassium: string;
  ingredients: string[];
  steps: string[];
  insight: string;
}

export async function generateRecipe(
  ingredients: string[],
  goal: string
): Promise<RecipeResult> {
  const prompt = `You are a professional nutritionist and chef. Generate a healthy recipe using these ingredients: ${ingredients.join(", ")}.

The recipe should support the goal: ${goal}.

Respond with ONLY valid JSON in this exact format (no markdown, no explanation):
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
  "ingredients": ["200g chicken breast", "1 cup brown rice", "..."],
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "insight": "This meal is high in lean protein which supports muscle recovery and growth..."
}`;

  const text = await callClaude({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    return JSON.parse(jsonMatch[0]) as RecipeResult;
  } catch {
    throw new Error("Failed to parse recipe response");
  }
}

// ─── Meal Scan ──────────────────────────────────────────────────────────────

export interface MealScanResult {
  foodName: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  healthScore: number;
  ingredients: Array<{ name: string; amount: string }>;
  insight: string;
}

export async function scanMealFromDescription(description: string): Promise<MealScanResult> {
  const prompt = `You are a certified nutritionist. Analyze this meal: "${description}".

Provide a complete nutritional analysis. Respond with ONLY valid JSON (no markdown):
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
    { "name": "Chicken Breast", "amount": "150g" },
    { "name": "Mixed Greens", "amount": "80g" }
  ],
  "insight": "This is an excellent high-protein, low-carb meal. The healthy fats from olive oil enhance nutrient absorption..."
}`;

  const text = await callClaude({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    return JSON.parse(jsonMatch[0]) as MealScanResult;
  } catch {
    throw new Error("Failed to parse meal scan response");
  }
}

export async function scanMealFromImage(base64Image: string): Promise<MealScanResult> {
  const text = await callClaude({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: `Analyze the food in this image. Provide complete nutritional analysis. Respond with ONLY valid JSON (no markdown):
{
  "foodName": "Food Name",
  "emoji": "🍽️",
  "calories": 400,
  "protein": 30,
  "carbs": 40,
  "fat": 10,
  "fibre": 5,
  "healthScore": 75,
  "ingredients": [
    { "name": "Ingredient", "amount": "100g" }
  ],
  "insight": "Health insights about this meal..."
}`,
          },
        ],
      },
    ],
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    return JSON.parse(jsonMatch[0]) as MealScanResult;
  } catch {
    throw new Error("Failed to parse meal scan response");
  }
}
