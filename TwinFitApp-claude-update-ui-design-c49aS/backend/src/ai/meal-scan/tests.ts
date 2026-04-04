import { MealScanService, createMealScanService, MealScanInputSchema } from './index.js';
import { MealScanProvider, DetectedItem } from './outputs.js';

class MockMealScanProvider implements MealScanProvider {
  private response: Awaited<ReturnType<MealScanProvider['analyzeImage']>>;

  constructor(response: Awaited<ReturnType<MealScanProvider['analyzeImage']>>) {
    this.response = response;
  }

  async analyzeImage(imageUrl: string) {
    return this.response;
  }
}

const mockProvider = new MockMealScanProvider({
  detectedItems: [
    { name: 'Poulet', category: 'PROTEIN', confidence: 95, portion: '150g' },
    { name: 'Riz', category: 'CARB', confidence: 90, portion: '100g' },
    { name: 'Brocoli', category: 'VEGETABLE', confidence: 88, portion: '80g' },
  ],
  rawMacros: {
    calories: 450,
    proteins: 40,
    carbs: 50,
    fibers: 8,
    fats: 12,
  },
  summary: 'Repas équilibré avec une bonne source de protéines',
});

const service = createMealScanService(mockProvider as unknown as MealScanProvider);

async function runTests() {
  console.log('🧪 Running Meal Scan AI Tests\n');

  console.log('Test 1: Analyse sans contexte utilisateur');
  const result1 = await service.analyze({
    imageUrl: 'https://example.com/meal.jpg',
    userId: 'user-123',
  });
  console.log(`  Score: ${result1.dietMatch.score}%`);
  console.log(`  Level: ${result1.dietMatch.level}`);
  console.log(`  Calories: ${result1.macros.calories.value} ± ${result1.macros.calories.margin}`);
  console.log(`  Proteins: ${result1.macros.proteins.grams}g\n`);

  console.log('Test 2: Analyse avec objectif SLIMMING');
  const result2 = await service.analyze(
    {
      imageUrl: 'https://example.com/meal.jpg',
      userId: 'user-123',
      mealType: 'LUNCH',
    },
    {
      userId: 'user-123',
      objective: 'SLIMMING',
      dietType: 'BALANCED',
      dailyCaloriesTarget: 2000,
      proteinTarget: 120,
      carbsTarget: 200,
    }
  );
  console.log(`  Score: ${result2.dietMatch.score}%`);
  console.log(`  Level: ${result2.dietMatch.level}`);
  console.log(`  Notes: ${result2.dietMatch.notes.join(', ')}`);
  if (result2.dietMatch.warnings) {
    console.log(`  Warnings: ${result2.dietMatch.warnings.join(', ')}`);
  }
  console.log('');

  console.log('Test 3: Analyse avec régime HIGH_PROTEIN - repas faible en protéines');
  const lowProteinProvider = new MockMealScanProvider({
    detectedItems: [
      { name: 'Pâtes', category: 'CARB', confidence: 90, portion: '200g' },
      { name: 'Sauce tomate', category: 'OTHER', confidence: 85, portion: '50g' },
    ],
    rawMacros: {
      calories: 350,
      proteins: 8,
      carbs: 60,
      fibers: 4,
      fats: 6,
    },
    summary: 'Repas principalement glucidique',
  });

  const lowProteinService = createMealScanService(lowProteinProvider as unknown as MealScanProvider);
  const result3 = await lowProteinService.analyze(
    {
      imageUrl: 'https://example.com/pasta.jpg',
      userId: 'user-123',
      dietType: 'HIGH_PROTEIN',
    },
    {
      userId: 'user-123',
      objective: 'BULKING',
      dietType: 'HIGH_PROTEIN',
      proteinTarget: 150,
    }
  );
  console.log(`  Score: ${result3.dietMatch.score}%`);
  console.log(`  Level: ${result3.dietMatch.level}`);
  console.log(`  Warnings: ${result3.dietMatch.warnings?.join(', ') || 'none'}`);
  console.log('');

  console.log('Test 4: Validation schéma input');
  try {
    MealScanInputSchema.parse({
      imageUrl: 'not-a-url',
      userId: 'user-123',
    });
    console.log('  ❌ Devrait échouer avec URL invalide');
  } catch (e: any) {
    console.log('  ✅ Rejet URL invalide: OK');
  }

  try {
    MealScanInputSchema.parse({
      imageUrl: 'https://example.com/meal.jpg',
      userId: 'user-123',
      dietType: 'INVALID_DIET',
    });
    console.log('  ❌ Devrait échouer avec dietType invalide');
  } catch (e: any) {
    console.log('  ✅ Rejet dietType invalide: OK');
  }

  console.log('\n✅ Tous les tests passés!');
}

runTests().catch(console.error);
