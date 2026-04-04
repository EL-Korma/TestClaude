import { z } from 'zod';

export const CorrectionPointSchema = z.object({
  bodyPart: z.string(),
  issue: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  advice: z.string(),
  coordinates: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
});

export type CorrectionPoint = z.infer<typeof CorrectionPointSchema>;

export const PoseKeypointSchema = z.object({
  name: z.string(),
  x: z.number(),
  y: z.number(),
  confidence: z.number(),
});

export type PoseKeypoint = z.infer<typeof PoseKeypointSchema>;

export const BodyScanOutputSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  correctedImageUrl: z.string().optional(),
  exerciseType: z.string(),
  keypoints: z.array(PoseKeypointSchema).optional(),
  corrections: z.array(CorrectionPointSchema),
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  tips: z.array(z.string()),
  createdAt: z.string().datetime(),
});

export type BodyScanOutput = z.infer<typeof BodyScanOutputSchema>;

export interface BodyScanProvider {
  analyzePose(imageUrl: string, exerciseType: string): Promise<{
    keypoints: PoseKeypoint[];
    corrections: Array<{
      bodyPart: string;
      issue: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
      advice: string;
      coordinates?: { x: number; y: number };
    }>;
    overallScore: number;
    summary: string;
    tips: string[];
  }>;
}
