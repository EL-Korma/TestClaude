import OpenAI from 'openai';
import { MealScanProvider, DetectedItem } from './outputs.js';
import { MealScanInput } from './inputs.js';

export class OpenAIVisionProvider implements MealScanProvider {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async analyzeImage(imageUrl: string): Promise<{
    detectedItems: DetectedItem[];
    rawMacros: {
      calories: number;
      proteins: number;
      carbs: number;
      fibers: number;
      fats?: number;
    };
    summary: string;
  }> {
    const prompt = `Analyze this food image and provide:
1. A list of detected food items with their category (PROTEIN, CARB, VEGETABLE, FRUIT, DAIRY, FAT, BEVERAGE, OTHER) and confidence level (0-100)
2. Estimated nutritional values:
   - calories (integer)
   - proteins in grams (integer)
   - carbs in grams (integer)
   - fibers in grams (integer)
   - fats in grams (integer, optional)
3. A brief summary of the meal

Return the response as a JSON object with this exact structure:
{
  "detectedItems": [{"name": "string", "category": "string", "confidence": number, "portion": "string"}],
  "calories": number,
  "proteins": number,
  "carbs": number,
  "fibers": number,
  "fats": number,
  "summary": "string"
}`;

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
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);

    return {
      detectedItems: parsed.detectedItems.map((item: any) => ({
        name: item.name,
        category: item.category as DetectedItem['category'],
        confidence: item.confidence,
        portion: item.portion,
      })),
      rawMacros: {
        calories: parsed.calories,
        proteins: parsed.proteins,
        carbs: parsed.carbs,
        fibers: parsed.fibers,
        fats: parsed.fats,
      },
      summary: parsed.summary,
    };
  }
}

export function createProvider(apiKey?: string): MealScanProvider {
  const providerType = process.env.MEAL_SCAN_PROVIDER || 'openai';

  switch (providerType) {
    case 'openai':
      return new OpenAIVisionProvider(apiKey);
    default:
      throw new Error(`Unknown provider: ${providerType}`);
  }
}
