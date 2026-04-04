import { createRecipeProvider } from './provider.js';

const provider = createRecipeProvider();

async function runRealTest() {
  console.log('🧪 Testing Recipe Generator with OpenAI API\n');

  try {
    const result = await provider.generateRecipes({
      availableIngredients: ['poulet', 'riz', 'brocoli', 'tomates'],
      excludedIngredients: ['beurre'],
      dietType: 'HIGH_PROTEIN',
      objective: 'BULKING',
      mealType: 'DINNER',
      servings: 2,
    });

    console.log('✅ Recettes reçues:\n');
    
    result.recipes.forEach((recipe, index) => {
      console.log(`--- Recette ${index + 1} ---`);
      console.log(`Titre: ${recipe.title}`);
      console.log(`Description: ${recipe.description}`);
      console.log(`Temps prep: ${recipe.prepTime}min, cook: ${recipe.cookTime}min`);
      console.log(`Calories: ${recipe.macros.caloriesPerServing} kcal/portion`);
      console.log(`Protéines: ${recipe.macros.proteins}g, Glucides: ${recipe.macros.carbs}g`);
      console.log(`Tags: ${recipe.tags.join(', ')}`);
      console.log(`Ingrédients: ${recipe.ingredients.map(i => `${i.name} (${i.quantity})`).join(', ')}`);
      console.log('');
    });

    console.log('✅ Test OpenAI réussi!');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

runRealTest();
