import { randomUUID } from 'crypto';
import { MealScanInput, MealScanInputSchema, UserContext, DietType, Objective } from './inputs.js';
import { 
  MealScanOutput, 
  MealScanProvider, 
  Macros, 
  DietMatch, 
  DetectedItem 
} from './outputs.js';

const CALORIE_MARGIN = 50;

function calculateDietMatch(
  macros: Macros,
  userContext: UserContext | undefined
): DietMatch {
  const notes: string[] = [];
  const warnings: string[] = [];
  let score = 50;

  if (!userContext) {
    return {
      score: 50,
      level: 'GOOD_CHOICE',
      notes: ['Analyse basée sur des valeurs nutritionnelles générales'],
      warnings: undefined,
    };
  }

  const { dietType, objective, proteinTarget, carbsTarget } = userContext;

  if (dietType === 'HIGH_PROTEIN') {
    if (macros.proteins.grams >= 25) {
      score += 20;
      notes.push('Excellente source de protéines pour vos objectifs');
    } else {
      score -= 10;
      warnings.push('Repas faible en protéines pour un régime high-protein');
    }
  }

  if (dietType === 'ANTI_INFLAMMATORY') {
    const hasVegetable = macros.fibers.grams >= 5;
    if (hasVegetable) {
      score += 15;
      notes.push('Bon apport en fibres anti-inflammatoires');
    } else {
      score -= 15;
      warnings.push('Ajoutez des légumes pour un régime anti-inflammatoire');
    }
  }

  if (objective === 'SLIMMING') {
    if (macros.calories.value <= 600) {
      score += 10;
      notes.push('portion adaptée pour la perte de poids');
    } else if (macros.calories.value > 800) {
      score -= 10;
      warnings.push('portion élevée pour un objectif de perte de poids');
    }
  }

  if (objective === 'BULKING') {
    if (macros.calories.value >= 600) {
      score += 10;
      notes.push('portion conséquente pour la prise de masse');
    } else {
      score -= 10;
      warnings.push('portion faible pour un objectif de prise de masse');
    }
  }

  if (proteinTarget && macros.proteins.grams >= proteinTarget * 0.3) {
    notes.push(`Vous couvre ${Math.round((macros.proteins.grams / proteinTarget) * 100)}% de votre objectif protéique`);
  }

  if (carbsTarget && macros.carbs.grams >= carbsTarget * 0.3) {
    notes.push(`Vous couvre ${Math.round((macros.carbs.grams / carbsTarget) * 100)}% de votre objectif en glucides`);
  }

  score = Math.max(0, Math.min(100, score));

  let level: DietMatch['level'];
  if (score >= 75) {
    level = 'GREAT_MATCH';
  } else if (score >= 50) {
    level = 'GOOD_CHOICE';
  } else {
    level = 'NEEDS_IMPROVEMENT';
  }

  return {
    score,
    level,
    notes,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

function calculateMacros(rawMacros: {
  calories: number;
  proteins: number;
  carbs: number;
  fibers: number;
  fats?: number;
}): Macros {
  const total = rawMacros.proteins + rawMacros.carbs + rawMacros.fibers + (rawMacros.fats || 0);
  
  return {
    calories: {
      value: rawMacros.calories,
      margin: CALORIE_MARGIN,
    },
    proteins: {
      grams: rawMacros.proteins,
      percentage: total > 0 ? Math.round((rawMacros.proteins / total) * 100) : 0,
    },
    carbs: {
      grams: rawMacros.carbs,
      percentage: total > 0 ? Math.round((rawMacros.carbs / total) * 100) : 0,
    },
    fibers: {
      grams: rawMacros.fibers,
      percentage: total > 0 ? Math.round((rawMacros.fibers / total) * 100) : 0,
    },
    fats: rawMacros.fats ? {
      grams: rawMacros.fats,
      percentage: total > 0 ? Math.round((rawMacros.fats / total) * 100) : 0,
    } : undefined,
  };
}

export class MealScanService {
  constructor(private provider: MealScanProvider) {}

  async analyze(input: MealScanInput, userContext?: UserContext): Promise<MealScanOutput> {
    const validatedInput = MealScanInputSchema.parse(input);

    const { detectedItems, rawMacros, summary } = await this.provider.analyzeImage(
      validatedInput.imageUrl
    );

    const macros = calculateMacros(rawMacros);
    const dietMatch = calculateDietMatch(macros, userContext);

    return {
      id: randomUUID(),
      imageUrl: validatedInput.imageUrl,
      detectedItems,
      macros,
      dietMatch,
      summary,
      createdAt: new Date().toISOString(),
    };
  }
}

export function createMealScanService(provider: MealScanProvider): MealScanService {
  return new MealScanService(provider);
}

export { MealScanInputSchema } from './inputs.js';
export { MealScanOutputSchema } from './outputs.js';
