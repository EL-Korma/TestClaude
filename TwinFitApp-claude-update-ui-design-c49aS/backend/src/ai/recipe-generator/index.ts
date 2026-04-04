import { randomUUID } from 'crypto';
import { RecipeGeneratorInput, RecipeGeneratorInputSchema, UserContext, DietType, Objective, MealType } from './inputs.js';
import { RecipeGeneratorOutput, RecipeGeneratorProvider, Recipe, RecipeMatchLevel } from './outputs.js';

function determineMatchLevel(
  recipeIndex: number,
  recipe: { tags: string[] },
  dietType?: DietType,
  objective?: Objective
): { level: RecipeMatchLevel; reason: string } {
  const userIngredients = recipe.tags.includes('high-protein') || recipe.tags.includes('protein');
  
  if (recipeIndex === 0) {
    if (dietType === 'HIGH_PROTEIN') {
      return { level: 'GREAT_MATCH', reason: 'Excellent source de protéines pour votre régime' };
    }
    if (dietType === 'ANTI_INFLAMMATORY') {
      return { level: 'GREAT_MATCH', reason: 'Recette riche en anti-inflammatoires naturels' };
    }
    if (objective === 'SLIMMING') {
      return { level: 'GREAT_MATCH', reason: 'portion maîtrisée et équilibrée pour la perte de poids' };
    }
    if (objective === 'BULKING') {
      return { level: 'GREAT_MATCH', reason: 'Apport calorique adapté à vos objectifs de prise de masse' };
    }
    return { level: 'GREAT_MATCH', reason: 'Utilise parfaitement vos ingrédients disponibles' };
  }

  if (recipeIndex === 1) {
    return { level: 'GOOD_CHOICE', reason: 'Alternative équilibrée avec vos ingrédients' };
  }

  return { level: 'ALTERNATIVE', reason: 'Option créative et savoureuse' };
}

function addStapleIngredients(ingredients: Array<{ name: string; quantity: string }>): Array<{ name: string; quantity: string; isFromUserList: boolean }> {
  const staples = [
    { name: 'huile d\'olive', quantity: '2 cs' },
    { name: 'sel', quantity: 'selon goût' },
    { name: 'poivre', quantity: 'selon goût' },
  ];

  return [
    ...ingredients.map(ing => ({ ...ing, isFromUserList: true })),
    ...staples.map(ing => ({ ...ing, isFromUserList: false }))
  ];
}

export class RecipeGeneratorService {
  constructor(private provider: RecipeGeneratorProvider) {}

  async generate(input: RecipeGeneratorInput, userContext?: UserContext): Promise<RecipeGeneratorOutput> {
    const validatedInput = RecipeGeneratorInputSchema.parse(input);

    const excludedIngredients = [
      ...(validatedInput.excludedIngredients || []),
      ...(userContext?.allergies || []),
      ...(userContext?.dislikes || []),
    ];

    const rawRecipes = await this.provider.generateRecipes({
      availableIngredients: validatedInput.availableIngredients,
      excludedIngredients: excludedIngredients.length > 0 ? excludedIngredients : undefined,
      dietType: validatedInput.dietType || userContext?.dietType,
      objective: validatedInput.objective || userContext?.objective,
      mealType: validatedInput.mealType,
      servings: validatedInput.servings,
      maxPrepTime: validatedInput.maxPrepTime,
    });

    const recipes: Recipe[] = rawRecipes.recipes.map((recipe, index) => {
      const { level, reason } = determineMatchLevel(index, recipe, validatedInput.dietType || userContext?.dietType, validatedInput.objective || userContext?.objective);

      return {
        id: randomUUID(),
        title: recipe.title,
        description: recipe.description,
        matchLevel: level,
        matchReason: reason,
        ingredients: addStapleIngredients(recipe.ingredients),
        steps: recipe.steps,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        macros: recipe.macros,
        tags: recipe.tags,
      };
    });

    return {
      id: randomUUID(),
      userId: validatedInput.userId,
      recipes,
      generatedAt: new Date().toISOString(),
    };
  }
}

export function createRecipeGeneratorService(provider: RecipeGeneratorProvider): RecipeGeneratorService {
  return new RecipeGeneratorService(provider);
}

export { RecipeGeneratorInputSchema } from './inputs.js';
export { RecipeGeneratorOutputSchema } from './outputs.js';
