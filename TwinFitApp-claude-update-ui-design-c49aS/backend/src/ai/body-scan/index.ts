import { randomUUID } from 'crypto';
import { BodyScanInput, BodyScanInputSchema, UserContext, ExerciseType } from './inputs.js';
import { BodyScanOutput, BodyScanProvider, CorrectionPoint } from './outputs.js';

function enrichTips(corrections: CorrectionPoint[], experienceLevel?: string): string[] {
  const tips: string[] = [];
  
  if (corrections.length === 0) {
    tips.push('Excellente posture ! Continuez à vous concentrer sur votre form');
    return tips;
  }

  const highSeverityCount = corrections.filter(c => c.severity === 'HIGH').length;
  
  if (highSeverityCount > 0 && experienceLevel === 'BEGINNER') {
    tips.push('Commencez avec des mouvements plus simples avant de progresser');
    tips.push('Enregistrez-vous en vidéo pour mieux analyser votre posture');
  }

  corrections.forEach(correction => {
    if (correction.severity === 'HIGH') {
      tips.push(correction.advice);
    }
  });

  if (experienceLevel === 'ADVANCED') {
    tips.push('Essayez d\'ajouter du poids progressivement tout en maintenant la forme');
  }

  return Array.from(new Set(tips));
}

export class BodyScanService {
  constructor(private provider: BodyScanProvider) {}

  async analyze(input: BodyScanInput, userContext?: UserContext): Promise<BodyScanOutput> {
    const validatedInput = BodyScanInputSchema.parse(input);

    const result = await this.provider.analyzePose(
      validatedInput.imageUrl,
      validatedInput.exerciseType
    );

    const tips = enrichTips(
      result.corrections.map(c => ({
        ...c,
        bodyPart: c.bodyPart,
        issue: c.issue,
        severity: c.severity,
        advice: c.advice,
      })),
      userContext?.experienceLevel
    );

    return {
      id: randomUUID(),
      imageUrl: validatedInput.imageUrl,
      correctedImageUrl: undefined,
      exerciseType: validatedInput.exerciseType,
      keypoints: result.keypoints,
      corrections: result.corrections,
      overallScore: result.overallScore,
      summary: result.summary,
      tips,
      createdAt: new Date().toISOString(),
    };
  }
}

export function createBodyScanService(provider: BodyScanProvider): BodyScanService {
  return new BodyScanService(provider);
}

export { BodyScanInputSchema } from './inputs.js';
export { BodyScanOutputSchema } from './outputs.js';
