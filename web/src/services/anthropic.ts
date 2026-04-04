const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY ?? ''
const MODEL = 'claude-opus-4-6'
const API_URL = 'https://api.anthropic.com/v1/messages'

async function callClaude(prompt: string): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  return (data.content[0] as { text: string }).text
}

export interface RecipeResult {
  name: string
  macros: { calories: number; protein: number; carbs: number; fat: number }
  micronutrients: string[]
  steps: string[]
  insight: string
}

export async function generateRecipe(
  ingredients: string[],
  goal: string
): Promise<RecipeResult> {
  const prompt = `You are a sports nutritionist. Create a fitness meal recipe using these ingredients: ${ingredients.join(', ')}.
Goal: ${goal}. Return JSON only:
{
  "name": "Recipe Name",
  "macros": {"calories": 450, "protein": 35, "carbs": 42, "fat": 12},
  "micronutrients": ["Iron 15%", "Vitamin C 30%"],
  "steps": ["Step 1", "Step 2", "Step 3"],
  "insight": "One sentence about why this meal supports the goal."
}`
  const text = await callClaude(prompt)
  const json = text.match(/\{[\s\S]*\}/)?.[0] ?? '{}'
  return JSON.parse(json)
}

export interface MealScanResult {
  name: string
  healthScore: number
  macros: { calories: number; protein: number; carbs: number; fat: number }
  ingredients: string[]
  insight: string
}

export async function scanMeal(description: string): Promise<MealScanResult> {
  const prompt = `You are a nutrition AI. Analyze this meal: "${description}".
Return JSON only:
{
  "name": "Meal Name",
  "healthScore": 78,
  "macros": {"calories": 520, "protein": 28, "carbs": 60, "fat": 18},
  "ingredients": ["chicken breast", "rice", "broccoli"],
  "insight": "One sentence health tip."
}`
  const text = await callClaude(prompt)
  const json = text.match(/\{[\s\S]*\}/)?.[0] ?? '{}'
  return JSON.parse(json)
}
