import 'dotenv/config';
import OpenAI from 'openai';
import { BodyScanProvider, PoseKeypoint } from './outputs.js';

export class OpenAIBodyScanProvider implements BodyScanProvider {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async analyzePose(
    imageUrl: string,
    exerciseType: string
  ): Promise<{
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
  }> {
    const exerciseGuidelines = this.getExerciseGuidelines(exerciseType);

    const prompt = `Analyze this fitness pose for ${exerciseType}.

Exercise guidelines for ${exerciseType}:
${exerciseGuidelines}

Provide a detailed analysis as JSON:
{
  "keypoints": [
    {"name": "head", "x": 0.5, "y": 0.1, "confidence": 0.9},
    {"name": "left_shoulder", "x": 0.3, "y": 0.25, "confidence": 0.85},
    ...
  ],
  "corrections": [
    {
      "bodyPart": "knees",
      "issue": "knees caving inward",
      "severity": "HIGH",
      "advice": "Push your knees out in line with your toes",
      "coordinates": {"x": 0.5, "y": 0.7}
    }
  ],
  "overallScore": 75,
  "summary": "Good depth but knees cave inward",
  "tips": [
    "Focus on pushing knees outward",
    "Keep core engaged throughout"
  ]
}

IMPORTANT: 
- Provide keypoints with normalized coordinates (0-1) for each body part
- Score overall posture from 0-100
- List specific corrections with severity levels (LOW/MEDIUM/HIGH)
- Give actionable advice for each correction`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);

    return {
      keypoints: parsed.keypoints || [],
      corrections: parsed.corrections || [],
      overallScore: parsed.overallScore || 50,
      summary: parsed.summary || 'Analysis completed',
      tips: parsed.tips || [],
    };
  }

  private getExerciseGuidelines(exerciseType: string): string {
    const guidelines: Record<string, string> = {
      SQUAT: 'Feet shoulder-width apart, knees tracking over toes, chest up, core engaged, descend until thighs parallel or below',
      DEADLIFT: 'Bar close to shins, back straight, hips and knees extension synchronized, shoulders retracted',
      BENCH_PRESS: 'Grip slightly wider than shoulders, elbows at 45 degrees, full range of motion, controlled descent',
      OVERHEAD_PRESS: 'Bar path straight up, core braced, shoulders depressed, elbows slightly in front',
      PULL_UP: 'Full range of motion, chin over bar, core engaged, no swinging',
      LUNGE: 'Front knee over ankle, back knee toward floor, torso upright, core engaged',
      PLANK: 'Straight line from head to heels, core braced, glutes engaged, no sagging or piking',
    };

    return guidelines[exerciseType] || guidelines.OTHER || 'Maintain proper form throughout the movement';
  }
}

export function createBodyScanProvider(apiKey?: string): BodyScanProvider {
  const providerType = process.env.BODY_SCAN_PROVIDER || 'openai';

  switch (providerType) {
    case 'openai':
      return new OpenAIBodyScanProvider(apiKey);
    default:
      throw new Error(`Unknown provider: ${providerType}`);
  }
}
