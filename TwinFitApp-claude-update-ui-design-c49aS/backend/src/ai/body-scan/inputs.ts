import { z } from 'zod';

export const ExerciseType = z.enum([
  'SQUAT',
  'DEADLIFT',
  'BENCH_PRESS',
  'OVERHEAD_PRESS',
  'PULL_UP',
  'LUNGE',
  'PLANK',
  'OTHER',
]);

export type ExerciseType = z.infer<typeof ExerciseType>;

export const BodyScanInputSchema = z.object({
  imageUrl: z.string().url(),
  userId: z.string(),
  exerciseType: ExerciseType,
  timestamp: z.string().datetime().optional(),
});

export type BodyScanInput = z.infer<typeof BodyScanInputSchema>;

export const UserContextSchema = z.object({
  userId: z.string(),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  knownInjuries: z.array(z.string()).optional(),
});

export type UserContext = z.infer<typeof UserContextSchema>;
