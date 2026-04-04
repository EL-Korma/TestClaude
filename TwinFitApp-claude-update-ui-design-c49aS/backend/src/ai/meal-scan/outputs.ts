import { z } from 'zod';

export const MacrosSchema = z.object({
  calories: z.object({
    value: z.number(),
    margin: z.number(),
  }),
  proteins: z.object({
    grams: z.number(),
    percentage: z.number(),
  }),
  carbs: z.object({
    grams: z.number(),
    percentage: z.number(),
  }),
  fibers: z.object({
    grams: z.number(),
    percentage: z.number(),
  }),
  fats: z.object({
    grams: z.number(),
    percentage: z.number(),
  }).optional(),
});

export type Macros = z.infer<typeof MacrosSchema>;

export const DietMatchSchema = z.object({
  score: z.number().min(0).max(100),
  level: z.enum(['GREAT_MATCH', 'GOOD_CHOICE', 'NEEDS_IMPROVEMENT']),
  notes: z.array(z.string()),
  warnings: z.array(z.string()).optional(),
});

export type DietMatch = z.infer<typeof DietMatchSchema>;

export const DetectedItemSchema = z.object({
  name: z.string(),
  category: z.enum(['PROTEIN', 'CARB', 'VEGETABLE', 'FRUIT', 'DAIRY', 'FAT', 'BEVERAGE', 'OTHER']),
  confidence: z.number().min(0).max(100),
  portion: z.string().optional(),
});

export type DetectedItem = z.infer<typeof DetectedItemSchema>;

export const MealScanOutputSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  detectedItems: z.array(DetectedItemSchema),
  macros: MacrosSchema,
  dietMatch: DietMatchSchema,
  summary: z.string(),
  createdAt: z.string().datetime(),
});

export type MealScanOutput = z.infer<typeof MealScanOutputSchema>;

export interface MealScanProvider {
  analyzeImage(imageUrl: string): Promise<{
    detectedItems: DetectedItem[];
    rawMacros: {
      calories: number;
      proteins: number;
      carbs: number;
      fibers: number;
      fats?: number;
    };
    summary: string;
  }>;
}
