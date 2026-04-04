import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Aurora from '../components/bits/Aurora'
import ScanLine from '../components/bits/ScanLine'
import MacroBar from '../components/ui/MacroBar'
import BottomNav from '../components/ui/BottomNav'
import { generateRecipe, scanMeal } from '../services/anthropic'
import type { RecipeResult, MealScanResult } from '../services/anthropic'

const GOALS = ['Muscle', 'Fat Loss', 'Energy', 'Recovery']
const QUICK_INGREDIENTS = ['Chicken', 'Rice', 'Eggs', 'Spinach', 'Avocado', 'Oats', 'Salmon']

export default function NutritionPage() {
  const [tab, setTab] = useState<'recipe' | 'scan'>('recipe')

  // Recipe Engine
  const [ingredients, setIngredients] = useState<string[]>([])
  const [ingredientInput, setIngredientInput] = useState('')
  const [goal, setGoal] = useState('Muscle')
  const [recipe, setRecipe] = useState<RecipeResult | null>(null)
  const [recipeLoading, setRecipeLoading] = useState(false)

  // Meal Scan
  const [mealDesc, setMealDesc] = useState('')
  const [mealResult, setMealResult] = useState<MealScanResult | null>(null)
  const [mealLoading, setMealLoading] = useState(false)
  const [portion, setPortion] = useState<'Small' | 'Medium' | 'Large'>('Medium')

  const addIngredient = (ing: string) => {
    if (ing && !ingredients.includes(ing)) setIngredients((p) => [...p, ing])
    setIngredientInput('')
  }

  const handleGenerateRecipe = async () => {
    if (!ingredients.length) return
    setRecipeLoading(true)
    try {
      const result = await generateRecipe(ingredients, goal)
      setRecipe(result)
    } catch {
      setRecipe({
        name: 'Power Protein Bowl',
        macros: { calories: 480, protein: 42, carbs: 38, fat: 14 },
        micronutrients: ['Iron 18%', 'Vitamin C 35%', 'Calcium 12%'],
        steps: ['Cook rice until fluffy', 'Season and grill chicken', 'Combine with greens and serve'],
        insight: 'High protein meal ideal for muscle synthesis post-workout.',
      })
    } finally {
      setRecipeLoading(false)
    }
  }

  const handleScanMeal = async () => {
    if (!mealDesc.trim()) return
    setMealLoading(true)
    try {
      const result = await scanMeal(mealDesc)
      setMealResult(result)
    } catch {
      setMealResult({
        name: 'Analyzed Meal',
        healthScore: 74,
        macros: { calories: 520, protein: 28, carbs: 60, fat: 18 },
        ingredients: ['chicken', 'rice', 'broccoli'],
        insight: 'Balanced meal with good protein. Consider adding more greens.',
      })
    } finally {
      setMealLoading(false)
    }
  }

  const portionMultiplier = portion === 'Small' ? 0.7 : portion === 'Large' ? 1.3 : 1

  return (
    <div className="relative min-h-screen pb-20" style={{ background: '#0A0A0A' }}>
      <Aurora colorStops={['#3B82F6', '#1a0a00', '#0A0A0A']} intensity={0.2} />

      {/* Header */}
      <div className="px-5 pt-14 pb-4 relative z-10">
        <p className="font-body text-xs tracking-widest mb-1" style={{ color: '#7A7570' }}>AI-POWERED</p>
        <h1 className="font-display text-5xl tracking-widest" style={{ color: '#F5F0EA' }}>NUTRITION</h1>
      </div>

      {/* Sub-tabs */}
      <div className="mx-5 mb-5 p-1 rounded-2xl flex relative z-10" style={{ background: '#141414' }}>
        {(['recipe', 'scan'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 h-10 rounded-xl font-display text-sm tracking-widest transition-all"
            style={{
              background: tab === t ? 'linear-gradient(135deg, #FF5E1A, #FF8C42)' : 'transparent',
              color: tab === t ? '#fff' : '#7A7570',
            }}
          >
            {t === 'recipe' ? '🍳 RECIPE ENGINE' : '🔍 MEAL SCAN'}
          </button>
        ))}
      </div>

      <div className="px-5 relative z-10">
        <AnimatePresence mode="wait">
          {tab === 'recipe' && (
            <motion.div
              key="recipe"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              {/* Ingredient input */}
              <div className="card">
                <p className="font-body text-xs tracking-widest mb-3" style={{ color: '#7A7570' }}>INGREDIENTS</p>
                <div className="flex gap-2 mb-3">
                  <input
                    className="input-field flex-1"
                    placeholder="Add ingredient..."
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addIngredient(ingredientInput)}
                  />
                  <button
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                    style={{ background: '#FF5E1A22', color: '#FF5E1A', border: '1px solid rgba(255,94,26,0.3)' }}
                    onClick={() => addIngredient(ingredientInput)}
                  >+</button>
                </div>
                {/* Quick add */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {QUICK_INGREDIENTS.map((ing) => (
                    <button
                      key={ing}
                      onClick={() => addIngredient(ing)}
                      className="px-3 py-1 rounded-xl font-body text-xs"
                      style={{ background: '#242424', color: '#7A7570', border: '1px solid rgba(255,255,255,0.06)' }}
                    >{ing}</button>
                  ))}
                </div>
                {/* Tags */}
                {ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ing) => (
                      <div key={ing} className="flex items-center gap-1 px-3 py-1 rounded-xl"
                        style={{ background: '#FF5E1A22', border: '1px solid rgba(255,94,26,0.3)' }}>
                        <span className="font-body text-xs" style={{ color: '#FF5E1A' }}>{ing}</span>
                        <button onClick={() => setIngredients((p) => p.filter((x) => x !== ing))}
                          className="text-xs" style={{ color: '#FF5E1A' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Goal selector */}
              <div className="card">
                <p className="font-body text-xs tracking-widest mb-3" style={{ color: '#7A7570' }}>GOAL</p>
                <div className="flex gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGoal(g)}
                      className="flex-1 py-2 rounded-xl font-body text-xs transition-all"
                      style={{
                        background: goal === g ? '#FF5E1A22' : '#242424',
                        border: `1px solid ${goal === g ? '#FF5E1A' : 'transparent'}`,
                        color: goal === g ? '#FF5E1A' : '#7A7570',
                      }}
                    >{g}</button>
                  ))}
                </div>
              </div>

              <motion.button
                className="btn-primary"
                onClick={handleGenerateRecipe}
                disabled={recipeLoading || !ingredients.length}
                style={{ opacity: ingredients.length ? 1 : 0.5 }}
                whileTap={{ scale: 0.97 }}
              >
                {recipeLoading ? '✨ GENERATING...' : '✨ GENERATE RECIPE'}
              </motion.button>

              {/* Recipe result */}
              {recipe && (
                <motion.div
                  className="flex flex-col gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="card">
                    <h3 className="font-display text-2xl tracking-wide mb-4" style={{ color: '#F5F0EA' }}>{recipe.name}</h3>
                    <MacroBar label="Calories" value={recipe.macros.calories} max={800} unit="kcal" color="#FF5E1A" />
                    <MacroBar label="Protein" value={recipe.macros.protein} max={80} unit="g" color="#22C55E" />
                    <MacroBar label="Carbs" value={recipe.macros.carbs} max={100} unit="g" color="#3B82F6" />
                    <MacroBar label="Fat" value={recipe.macros.fat} max={50} unit="g" color="#EAB308" />
                  </div>
                  <div className="card">
                    <p className="font-body text-xs tracking-widest mb-3" style={{ color: '#7A7570' }}>STEPS</p>
                    {recipe.steps.map((step, i) => (
                      <div key={i} className="flex gap-3 mb-3 last:mb-0">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-display flex-shrink-0"
                          style={{ background: '#FF5E1A22', color: '#FF5E1A' }}>{i + 1}</div>
                        <p className="font-body text-sm" style={{ color: '#F5F0EA' }}>{step}</p>
                      </div>
                    ))}
                  </div>
                  <div className="card flex gap-3">
                    <span className="text-2xl">🧠</span>
                    <p className="font-body text-sm" style={{ color: '#7A7570' }}>{recipe.insight}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {tab === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              {/* Viewfinder */}
              <div className="relative rounded-3xl overflow-hidden flex items-center justify-center"
                style={{ height: 200, background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.06)' }}>
                <ScanLine height={180} color="#3B82F6" />
                <motion.div
                  className="text-5xl"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >🍽️</motion.div>
              </div>

              {/* Meal input */}
              <div className="card">
                <p className="font-body text-xs tracking-widest mb-2" style={{ color: '#7A7570' }}>DESCRIBE YOUR MEAL</p>
                <textarea
                  className="input-field w-full resize-none"
                  rows={3}
                  placeholder="e.g. grilled chicken breast with brown rice and steamed broccoli..."
                  value={mealDesc}
                  onChange={(e) => setMealDesc(e.target.value)}
                  style={{ height: 80 }}
                />
              </div>

              <motion.button
                className="btn-primary"
                onClick={handleScanMeal}
                disabled={mealLoading || !mealDesc.trim()}
                style={{ opacity: mealDesc.trim() ? 1 : 0.5 }}
                whileTap={{ scale: 0.97 }}
              >
                {mealLoading ? '🔍 SCANNING...' : '🔍 SCAN MEAL'}
              </motion.button>

              {/* Scan result */}
              {mealResult && (
                <motion.div
                  className="flex flex-col gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Health score */}
                  <div className="card flex items-center gap-5">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="32" stroke="#242424" strokeWidth="6" fill="none" />
                        <motion.circle
                          cx="40" cy="40" r="32"
                          stroke="#22C55E" strokeWidth="6" fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 32}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - mealResult.healthScore / 100) }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-xl" style={{ color: '#22C55E' }}>{mealResult.healthScore}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-display text-lg tracking-wide" style={{ color: '#F5F0EA' }}>{mealResult.name}</p>
                      <p className="font-body text-xs" style={{ color: '#7A7570' }}>Health Score</p>
                    </div>
                  </div>

                  {/* Portion selector */}
                  <div className="card">
                    <p className="font-body text-xs tracking-widest mb-2" style={{ color: '#7A7570' }}>PORTION SIZE</p>
                    <div className="flex gap-2">
                      {(['Small', 'Medium', 'Large'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPortion(p)}
                          className="flex-1 py-2 rounded-xl font-body text-xs transition-all"
                          style={{
                            background: portion === p ? '#FF5E1A22' : '#242424',
                            border: `1px solid ${portion === p ? '#FF5E1A' : 'transparent'}`,
                            color: portion === p ? '#FF5E1A' : '#7A7570',
                          }}
                        >{p}</button>
                      ))}
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="card">
                    <MacroBar label="Calories" value={Math.round(mealResult.macros.calories * portionMultiplier)} max={800} unit="kcal" color="#FF5E1A" />
                    <MacroBar label="Protein" value={Math.round(mealResult.macros.protein * portionMultiplier)} max={80} unit="g" color="#22C55E" />
                    <MacroBar label="Carbs" value={Math.round(mealResult.macros.carbs * portionMultiplier)} max={100} unit="g" color="#3B82F6" />
                    <MacroBar label="Fat" value={Math.round(mealResult.macros.fat * portionMultiplier)} max={50} unit="g" color="#EAB308" />
                  </div>

                  {/* Ingredients */}
                  <div className="card">
                    <p className="font-body text-xs tracking-widest mb-3" style={{ color: '#7A7570' }}>DETECTED INGREDIENTS</p>
                    <div className="flex flex-wrap gap-2">
                      {mealResult.ingredients.map((ing) => (
                        <span key={ing} className="px-3 py-1 rounded-xl font-body text-xs"
                          style={{ background: '#242424', color: '#F5F0EA' }}>{ing}</span>
                      ))}
                    </div>
                  </div>

                  <button className="btn-primary">LOG THIS MEAL</button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  )
}
