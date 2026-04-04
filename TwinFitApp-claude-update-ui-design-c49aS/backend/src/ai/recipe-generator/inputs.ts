import { z } from 'zod';

export const DietType = z.enum([
  'ANTI_INFLAMMATORY',
  'BALANCED',
  'HIGH_PROTEIN',
  'NONE',
]);

export const Objective = z.enum([
  'BULKING',
  'SLIMMING',
  'MAINTENANCE',
  'WELLNESS',
]);

export const MealType = z.enum([
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK',
]);

export type DietType = z.infer<typeof DietType>;
export type Objective = z.infer<typeof Objective>;
export type MealType = z.infer<typeof MealType>;

export const RecipeGeneratorInputSchema = z.object({
  userId: z.string(),
  availableIngredients: z.array(z.string()).min(1),
  excludedIngredients: z.array(z.string()).optional(),
  dietType: DietType.optional(),
  objective: Objective.optional(),
  mealType: MealType.optional(),
  servings: z.number().int().min(1).max(8).default(2),
  maxPrepTime: z.number().int().min(10).max(180).optional(),
});

export type RecipeGeneratorInput = z.infer<typeof RecipeGeneratorInputSchema>;

export const UserContextSchema = z.object({
  userId: z.string(),
  dietType: DietType.optional(),
  objective: Objective.optional(),
  dailyCaloriesTarget: z.number().optional(),
  proteinTarget: z.number().optional(),
  allergies: z.array(z.string()).optional(),
  dislikes: z.array(z.string()).optional(),
});

export type UserContext = z.infer<typeof UserContextSchema>;
