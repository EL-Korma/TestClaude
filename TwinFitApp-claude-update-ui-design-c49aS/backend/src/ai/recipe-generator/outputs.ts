import { z } from 'zod';

export const RecipeMacrosSchema = z.object({
  caloriesPerServing: z.number(),
  proteins: z.number(),
  carbs: z.number(),
  fibers: z.number(),
  fats: z.number().optional(),
});

export type RecipeMacros = z.infer<typeof RecipeMacrosSchema>;

export const RecipeMatchLevelSchema = z.enum(['GREAT_MATCH', 'GOOD_CHOICE', 'ALTERNATIVE']);

export type RecipeMatchLevel = z.infer<typeof RecipeMatchLevelSchema>;

export const RecipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  matchLevel: RecipeMatchLevelSchema,
  matchReason: z.string(),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    isFromUserList: z.boolean(),
  })),
  steps: z.array(z.string()),
  prepTime: z.number(),
  cookTime: z.number(),
  servings: z.number(),
  macros: RecipeMacrosSchema,
  tags: z.array(z.string()),
});

export type Recipe = z.infer<typeof RecipeSchema>;

export const RecipeGeneratorOutputSchema = z.object({
  id: z.string(),
  userId: z.string(),
  recipes: z.array(RecipeSchema),
  generatedAt: z.string().datetime(),
});

export type RecipeGeneratorOutput = z.infer<typeof RecipeGeneratorOutputSchema>;

export interface RecipeGeneratorProvider {
  generateRecipes(input: {
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
  }>;
}
