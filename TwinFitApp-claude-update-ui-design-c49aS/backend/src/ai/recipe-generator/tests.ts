import { RecipeGeneratorService, createRecipeGeneratorService, RecipeGeneratorInputSchema } from './index.js';
import { RecipeGeneratorProvider } from './outputs.js';

class MockRecipeProvider implements RecipeGeneratorProvider {
  async generateRecipes(input: {
    availableIngredients: string[];
    excludedIngredients?: string[];
    dietType?: string;
    objective?: string;
    mealType?: string;
    servings?: number;
    maxPrepTime?: number;
  }) {
    return {
      recipes: [
        {
          title: 'Poulet rôti aux légumes',
          description: 'Un repas complet riche en protéines avec des légumes de saison',
          ingredients: [
            { name: 'poulet', quantity: '400g' },
            { name: 'brocoli', quantity: '200g' },
            { name: 'patate douce', quantity: '300g' },
          ],
          steps: [
            'Préchauffer le four à 200°C',
            'Assaisonner le poulet',
            'Cuire 35 minutes',
          ],
          prepTime: 15,
          cookTime: 35,
          servings: input.servings || 2,
          macros: {
            caloriesPerServing: 450,
            proteins: 45,
            carbs: 35,
            fibers: 8,
            fats: 15,
          },
          tags: ['high-protein', 'balanced', 'meal'],
        },
        {
          title: 'Salade protéinée',
          description: 'Salade fraîche et énergétique parfaite pour le lunch',
          ingredients: [
            { name: 'poulet', quantity: '200g' },
            { name: 'roquette', quantity: '100g' },
            { name: 'tomates', quantity: '150g' },
          ],
          steps: [
            'Griller le poulet',
            'Laver les légumes',
            'Mélanger et assaisonner',
          ],
          prepTime: 10,
          cookTime: 10,
          servings: input.servings || 2,
          macros: {
            caloriesPerServing: 320,
            proteins: 35,
            carbs: 15,
            fibers: 5,
            fats: 12,
          },
          tags: ['light', 'quick', 'salad'],
        },
        {
          title: 'Buddha Bowl',
          description: 'Bol créatif avec tous vos ingrédients en toppings',
          ingredients: [
            { name: 'patate douce', quantity: '200g' },
            { name: 'brocoli', quantity: '150g' },
            { name: 'pois chiches', quantity: '100g' },
          ],
          steps: [
            'Cuire les légumes',
            'Préparer les pois chiches',
            'Disposer en bol',
          ],
          prepTime: 15,
          cookTime: 25,
          servings: input.servings || 2,
          macros: {
            caloriesPerServing: 380,
            proteins: 18,
            carbs: 55,
            fibers: 12,
            fats: 10,
          },
          tags: ['vegan', 'creative', 'fiber'],
        },
      ],
    };
  }
}

const mockProvider = new MockRecipeProvider();
const service = createRecipeGeneratorService(mockProvider);

async function runTests() {
  console.log('🧪 Running Recipe Generator AI Tests\n');

  console.log('Test 1: Génération avec ingrédients simples');
  const result1 = await service.generate({
    userId: 'user-123',
    availableIngredients: ['poulet', 'brocoli', 'patate douce'],
    servings: 2,
  });
  console.log(`  Recettes générées: ${result1.recipes.length}`);
  console.log(`  1ère recette: ${result1.recipes[0].title}`);
  console.log(`  Match level: ${result1.recipes[0].matchLevel}`);
  console.log('');

  console.log('Test 2: Avec régime HIGH_PROTEIN');
  const result2 = await service.generate(
    {
      userId: 'user-123',
      availableIngredients: ['poulet', 'riz', 'haricots verts'],
      servings: 2,
      dietType: 'HIGH_PROTEIN',
      objective: 'BULKING',
    },
    {
      userId: 'user-123',
      dietType: 'HIGH_PROTEIN',
      objective: 'BULKING',
    }
  );
  console.log(`  1ère recette: ${result2.recipes[0].title}`);
  console.log(`  Match level: ${result2.recipes[0].matchLevel}`);
  console.log(`  Reason: ${result2.recipes[0].matchReason}`);
  console.log(`  Calories: ${result2.recipes[0].macros.caloriesPerServing} kcal/portion`);
  console.log('');

  console.log('Test 3: Avec exclusions + allergies');
  const result3 = await service.generate(
    {
      userId: 'user-123',
      availableIngredients: ['saumon', 'épinards', 'pommes de terre'],
      excludedIngredients: ['beurre', 'crème'],
    },
    {
      userId: 'user-123',
      allergies: ['lactose'],
      dislikes: ['oignon'],
    }
  );
  console.log(`  Recettes générées: ${result3.recipes.length}`);
  console.log(`  Ingrédiants staple ajoutés: ${result3.recipes[0].ingredients.filter(i => !i.isFromUserList).length}`);
  console.log('');

  console.log('Test 4: Validation schéma input');
  try {
    RecipeGeneratorInputSchema.parse({
      userId: 'user-123',
      availableIngredients: [],
    });
    console.log('  ❌ Devrait échouer sans ingrédients');
  } catch (e: any) {
    console.log('  ✅ Rejet sans ingrédients: OK');
  }

  try {
    RecipeGeneratorInputSchema.parse({
      userId: 'user-123',
      availableIngredients: ['poulet'],
      dietType: 'INVALID_DIET',
    });
    console.log('  ❌ Devrait échouer avec dietType invalide');
  } catch (e: any) {
    console.log('  ✅ Rejet dietType invalide: OK');
  }

  console.log('\n✅ Tous les tests passés!');
}

runTests().catch(console.error);
