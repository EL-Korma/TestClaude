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

export type DietType = z.infer<typeof DietType>;
export type Objective = z.infer<typeof Objective>;

export const MealScanInputSchema = z.object({
  imageUrl: z.string().url(),
  userId: z.string(),
  dietType: DietType.optional(),
  objective: Objective.optional(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']).optional(),
  timestamp: z.string().datetime().optional(),
});

export type MealScanInput = z.infer<typeof MealScanInputSchema>;

export const UserContextSchema = z.object({
  userId: z.string(),
  dietType: DietType.optional(),
  objective: Objective.optional(),
  dailyCaloriesTarget: z.number().optional(),
  proteinTarget: z.number().optional(),
  carbsTarget: z.number().optional(),
  fibersTarget: z.number().optional(),
});

export type UserContext = z.infer<typeof UserContextSchema>;
