import 'dotenv/config';
import OpenAI from 'openai';
import { RecipeGeneratorProvider } from './outputs.js';
import { RecipeGeneratorInput } from './inputs.js';

export class OpenAIRecipeProvider implements RecipeGeneratorProvider {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generateRecipes(input: {
    availableIngredients: string[];
    excludedIngredients?: string[];
    dietType?: string;
    objective?: string;
    mealType?: string;
    servings?: number;
    maxPrepTime?: number;
  }): Promise<{
    recipes: Array<{
      title: string;
      description: string;
      ingredients: Array<{ name: string; quantity: string }>;
      steps: string[];
      prepTime: number;
      cookTime: number;
      servings: number;
      macros: {
        caloriesPerServing: number;
        proteins: number;
        carbs: number;
        fibers: number;
        fats?: number;
      };
      tags: string[];
    }>;
  }> {
    const excludedText = input.excludedIngredients?.length 
      ? `\nExcluded ingredients (do NOT use): ${input.excludedIngredients.join(', ')}` 
      : '';
    
    const dietText = input.dietType ? `\nDiet type: ${input.dietType}` : '';
    const objectiveText = input.objective ? `\nFitness objective: ${input.objective}` : '';
    const mealText = input.mealType ? `\nMeal type: ${input.mealType}` : '';
    const servingsText = input.servings ? `\nServings: ${input.servings}` : '';
    const prepTimeText = input.maxPrepTime ? `\nMax prep time: ${input.maxPrepTime} minutes` : '';

    const prompt = `You are a professional nutritionist and chef. Generate 3 recipes based on the available ingredients.

Available ingredients: ${input.availableIngredients.join(', ')}${excludedText}${dietText}${objectiveText}${mealText}${servingsText}${prepTimeText}

Return a JSON object with exactly this structure:
{
  "recipes": [
    {
      "title": "Recipe name",
      "description": "Brief description (1-2 sentences)",
      "ingredients": [{"name": "ingredient name", "quantity": "amount"}],
      "steps": ["step 1", "step 2", ...],
      "prepTime": minutes,
      "cookTime": minutes,
      "servings": number,
      "macros": {
        "caloriesPerServing": number,
        "proteins": grams,
        "carbs": grams,
        "fibers": grams,
        "fats": grams (optional)
      },
      "tags": ["tag1", "tag2", ...]
    }
  ]
}

IMPORTANT: 
- First recipe should be a GREAT_MATCH - uses most of user's ingredients, perfectly matches diet/objective
- Second recipe should be a GOOD_CHOICE - uses some ingredients, good for the diet
- Third recipe should be an ALTERNATIVE - creative use of ingredients, different but still healthy
- Include common staples (olive oil, spices, salt, pepper) automatically - don't ask user for them
- Be specific with quantities`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a professional nutritionist. Always respond with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    return parsed;
  }
}

export function createRecipeProvider(apiKey?: string): RecipeGeneratorProvider {
  const providerType = process.env.RECIPE_GENERATOR_PROVIDER || 'openai';

  switch (providerType) {
    case 'openai':
      return new OpenAIRecipeProvider(apiKey);
    default:
      throw new Error(`Unknown provider: ${providerType}`);
  }
}
