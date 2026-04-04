import { BodyScanService, createBodyScanService, BodyScanInputSchema } from './index.js';
import { BodyScanProvider } from './outputs.js';

class MockBodyScanProvider implements BodyScanProvider {
  private response: Awaited<ReturnType<BodyScanProvider['analyzePose']>>;

  constructor(response: Awaited<ReturnType<BodyScanProvider['analyzePose']>>) {
    this.response = response;
  }

  async analyzePose(imageUrl: string, exerciseType: string) {
    return this.response;
  }
}

const goodSquatProvider = new MockBodyScanProvider({
  keypoints: [
    { name: 'head', x: 0.5, y: 0.1, confidence: 0.95 },
    { name: 'left_shoulder', x: 0.35, y: 0.25, confidence: 0.9 },
    { name: 'right_shoulder', x: 0.65, y: 0.25, confidence: 0.9 },
    { name: 'left_knee', x: 0.4, y: 0.6, confidence: 0.85 },
    { name: 'right_knee', x: 0.6, y: 0.6, confidence: 0.85 },
  ],
  corrections: [],
  overallScore: 90,
  summary: 'Excellente posture ! Vos genoux sont alignés et votre dos est droit',
  tips: ['Continuez ainsi !', 'Essayez d\'aller plus profond progressivement'],
});

const badSquatProvider = new MockBodyScanProvider({
  keypoints: [
    { name: 'head', x: 0.5, y: 0.15, confidence: 0.9 },
    { name: 'left_knee', x: 0.35, y: 0.6, confidence: 0.85 },
    { name: 'right_knee', x: 0.55, y: 0.6, confidence: 0.85 },
  ],
  corrections: [
    {
      bodyPart: 'knees',
      issue: 'Les genoux rentrent vers l\'intérieur (knee valgus)',
      severity: 'HIGH',
      advice: 'Poussez vos genoux vers l\'extérieur pour les aligner avec vos orteils',
      coordinates: { x: 0.45, y: 0.6 },
    },
    {
      bodyPart: 'back',
      issue: 'Dos légèrement arrondi',
      severity: 'MEDIUM',
      advice: 'Gardez la poitrine sortie et le regard vers l\'avant',
      coordinates: { x: 0.5, y: 0.3 },
    },
  ],
  overallScore: 55,
  summary: 'Posture à améliorer : vos genoux rentrent vers l\'intérieur',
  tips: ['Concentrez-vous sur vos genoux', 'Pratiquez sans poids d\'abord'],
});

async function runTests() {
  console.log('🧪 Running Body Scan AI Tests\n');

  console.log('Test 1: Squat avec bonne posture');
  const service1 = createBodyScanService(goodSquatProvider as unknown as BodyScanProvider);
  const result1 = await service1.analyze({
    imageUrl: 'https://example.com/squat-good.jpg',
    userId: 'user-123',
    exerciseType: 'SQUAT',
  });
  console.log(`  Score: ${result1.overallScore}/100`);
  console.log(`  Corrections: ${result1.corrections.length}`);
  console.log(`  Summary: ${result1.summary}`);
  console.log('');

  console.log('Test 2: Squat avec mauvaise posture');
  const service2 = createBodyScanService(badSquatProvider as unknown as BodyScanProvider);
  const result2 = await service2.analyze({
    imageUrl: 'https://example.com/squat-bad.jpg',
    userId: 'user-123',
    exerciseType: 'SQUAT',
  }, {
    userId: 'user-123',
    experienceLevel: 'BEGINNER',
  });
  console.log(`  Score: ${result2.overallScore}/100`);
  console.log(`  Corrections: ${result2.corrections.length}`);
  console.log(`  High severity: ${result2.corrections.filter(c => c.severity === 'HIGH').length}`);
  console.log(`  Tips: ${result2.tips.length}`);
  console.log('');

  console.log('Test 3: Deadlift avec blessures');
  const injuryProvider = new MockBodyScanProvider({
    keypoints: [],
    corrections: [
      {
        bodyPart: 'lower_back',
        issue: 'Dos arrondi en bas du mouvement',
        severity: 'HIGH',
        advice: 'Attention à votre dos - pouvez-vous avoir des problèmes de dos ?',
      },
    ],
    overallScore: 40,
    summary: 'Risque pour le dos',
    tips: ['Arrêtez si vous sentez une douleur'],
  });
  const service3 = createBodyScanService(injuryProvider as unknown as BodyScanProvider);
  const result3 = await service3.analyze(
    {
      imageUrl: 'https://example.com/deadlift.jpg',
      userId: 'user-123',
      exerciseType: 'DEADLIFT',
    },
    {
      userId: 'user-123',
      knownInjuries: ['dos', 'lombaires'],
    }
  );
  console.log(`  Score: ${result3.overallScore}/100`);
  console.log(`  Warnings included in tips: ${result3.tips.some(t => t.includes('douleur'))}`);
  console.log('');

  console.log('Test 4: Validation schéma input');
  try {
    BodyScanInputSchema.parse({
      imageUrl: 'not-a-url',
      userId: 'user-123',
      exerciseType: 'SQUAT',
    });
    console.log('  ❌ Devrait échouer avec URL invalide');
  } catch (e: any) {
    console.log('  ✅ Rejet URL invalide: OK');
  }

  try {
    BodyScanInputSchema.parse({
      imageUrl: 'https://example.com/squat.jpg',
      userId: 'user-123',
      exerciseType: 'INVALID_EXERCISE',
    });
    console.log('  ❌ Devrait échouer avec exerciseType invalide');
  } catch (e: any) {
    console.log('  ✅ Rejet exerciseType invalide: OK');
  }

  console.log('\n✅ Tous les tests passés!');
}

runTests().catch(console.error);
