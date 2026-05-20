import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AddRecipeIngredientForm from '@/components/recipes/add-recipe-ingredient-form'
import LogRecipeForm from '@/components/recipes/log-recipe-form'
import RemoveRecipeIngredientButton from '@/components/recipes/remove-recipe-ingredient-button'
import IngredientMatchReview from '@/components/recipes/ingredient-match-review'
import AutoRecipeNutritionForm from '@/components/recipes/auto-recipe-nutrition-form'

function formatNumber(value: number, decimals = 0) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

type RecipePageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function RecipeDetailPage({ params }: RecipePageProps) {
  const { id } = await params
  const recipeId = Number(id)

  if (!recipeId) {
    notFound()
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('id, name, description, servings, instructions, source_url')
    .eq('id', recipeId)
    .eq('user_id', user.id)
    .single()

  if (recipeError || !recipe) {
    notFound()
  }

  const foodSelect = `
    id,
    name,
    category,
    serving_size_grams,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    sodium,
    potassium,
    calcium,
    iron,
    magnesium,
    zinc,
    vitamin_a,
    vitamin_c,
    vitamin_d,
    vitamin_b12,
    cholesterol,
    saturated_fat,
    trans_fat
  `

  const { data: foods, error: foodsError } = await supabase
    .from('foods')
    .select(foodSelect)
    .order('name', { ascending: true })

  if (foodsError) {
    throw new Error(foodsError.message)
  }

  const { data: ingredients, error: ingredientsError } = await supabase
    .from('recipe_ingredients')
    .select(`
      id,
      grams,
      notes,
      foods (
        ${foodSelect}
      )
    `)
    .eq('recipe_id', recipeId)
    .order('id', { ascending: true })

  if (ingredientsError) {
    throw new Error(ingredientsError.message)
  }

  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0
  let totalFiber = 0
  let totalSugar = 0
  let totalSodium = 0
  let totalPotassium = 0
  let totalCalcium = 0
  let totalIron = 0
  let totalVitaminC = 0

  const normalizedIngredients =
    ingredients?.map((ingredient) => {
      const food = Array.isArray(ingredient.foods)
        ? ingredient.foods[0]
        : ingredient.foods

      const grams = Number(ingredient.grams ?? 0)
      const servingSize = Number(food?.serving_size_grams ?? 100) || 100
      const ratio = grams / servingSize

      const calories = Number(food?.calories ?? 0) * ratio
      const protein = Number(food?.protein ?? 0) * ratio
      const carbs = Number(food?.carbs ?? 0) * ratio
      const fat = Number(food?.fat ?? 0) * ratio
      const fiber = Number(food?.fiber ?? 0) * ratio
      const sugar = Number(food?.sugar ?? 0) * ratio
      const sodium = Number(food?.sodium ?? 0) * ratio
      const potassium = Number(food?.potassium ?? 0) * ratio
      const calcium = Number(food?.calcium ?? 0) * ratio
      const iron = Number(food?.iron ?? 0) * ratio
      const vitaminC = Number(food?.vitamin_c ?? 0) * ratio

      totalCalories += calories
      totalProtein += protein
      totalCarbs += carbs
      totalFat += fat
      totalFiber += fiber
      totalSugar += sugar
      totalSodium += sodium
      totalPotassium += potassium
      totalCalcium += calcium
      totalIron += iron
      totalVitaminC += vitaminC

      return {
        id: ingredient.id,
        grams,
        notes: ingredient.notes,
        food,
        calories,
        protein,
        carbs,
        fat,
      }
    }) ?? []

  const servings = Number(recipe.servings ?? 1) || 1

  const perServing = {
    calories: totalCalories / servings,
    protein: totalProtein / servings,
    carbs: totalCarbs / servings,
    fat: totalFat / servings,
    fiber: totalFiber / servings,
    sugar: totalSugar / servings,
    sodium: totalSodium / servings,
    potassium: totalPotassium / servings,
    calcium: totalCalcium / servings,
    iron: totalIron / servings,
    vitaminC: totalVitaminC / servings,
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
              Recipe
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              {recipe.name}
            </h1>

            {recipe.description ? (
              <p className="mt-3 max-w-3xl text-neutral-300">
                {recipe.description}
              </p>
            ) : null}

            <p className="mt-3 text-sm text-neutral-400">
              Servings: {formatNumber(servings, 2)}
            </p>

            {recipe.source_url ? (
              <a
                href={recipe.source_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm text-emerald-400 hover:text-emerald-300"
              >
                View source recipe
              </a>
            ) : null}
          </div>

          <Link
            href="/recipes/new"
            className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-500/10"
          >
            New recipe
          </Link>
        </div>

        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          Estimated nutrition values. Actual values may vary depending on
          ingredient brands, substitutions, cooking methods, cooking loss, and
          serving sizes.
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm text-neutral-400">Calories / serving</p>
            <p className="mt-3 text-2xl font-semibold">
              {formatNumber(perServing.calories, 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm text-neutral-400">Protein / serving</p>
            <p className="mt-3 text-2xl font-semibold">
              {formatNumber(perServing.protein, 1)}g
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm text-neutral-400">Carbs / serving</p>
            <p className="mt-3 text-2xl font-semibold">
              {formatNumber(perServing.carbs, 1)}g
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm text-neutral-400">Fat / serving</p>
            <p className="mt-3 text-2xl font-semibold">
              {formatNumber(perServing.fat, 1)}g
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-2xl font-semibold">Ingredients</h2>

            {normalizedIngredients.length === 0 ? (
              <p className="mt-6 text-neutral-400">
                No ingredients added yet.
              </p>
            ) : (
              <div className="mt-6 space-y-3">
                {normalizedIngredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">
                          {ingredient.food?.name ?? 'Unknown ingredient'}
                        </p>

                        <p className="mt-1 text-sm text-neutral-400">
                          {formatNumber(ingredient.grams, 1)}g
                          {ingredient.notes ? ` • ${ingredient.notes}` : ''}
                        </p>
                      </div>

                      <div className="text-right text-sm text-neutral-300">
                        <p>{formatNumber(ingredient.calories, 0)} cal</p>
                        <p className="text-xs text-neutral-500">
                          {formatNumber(ingredient.protein, 1)}P /{' '}
                          {formatNumber(ingredient.carbs, 1)}C /{' '}
                          {formatNumber(ingredient.fat, 1)}F
                        </p>
                         <div className="mt-3">
                            <RemoveRecipeIngredientButton
                             ingredientId={ingredient.id}
                             />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {recipe.instructions ? (
              <div className="mt-8 border-t border-neutral-800 pt-6">
                <h2 className="text-2xl font-semibold">Instructions / notes</h2>

                <p className="mt-4 whitespace-pre-wrap text-neutral-300">
                  {recipe.instructions}
                </p>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <LogRecipeForm recipeId={recipeId} />

            <AddRecipeIngredientForm
              recipeId={recipeId}
              foods={(foods ?? []) as unknown as Parameters<
                typeof AddRecipeIngredientForm
              >[0]['foods']}
            />
            <div className="mt-8">
              <IngredientMatchReview
                recipeId={recipe.id}
                initialIngredientText=""
              />
            </div>
            <div className="mt-8">
               <AutoRecipeNutritionForm
               recipeId={recipe.id}
               initialIngredientText=""
                />
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="text-2xl font-semibold">Estimated micronutrients</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-neutral-950 p-4">
              <p className="text-sm text-neutral-400">Fiber / serving</p>
              <p className="mt-2 text-xl font-semibold">
                {formatNumber(perServing.fiber, 1)}g
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-950 p-4">
              <p className="text-sm text-neutral-400">Sodium / serving</p>
              <p className="mt-2 text-xl font-semibold">
                {formatNumber(perServing.sodium, 0)}mg
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-950 p-4">
              <p className="text-sm text-neutral-400">Potassium / serving</p>
              <p className="mt-2 text-xl font-semibold">
                {formatNumber(perServing.potassium, 0)}mg
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-950 p-4">
              <p className="text-sm text-neutral-400">Vitamin C / serving</p>
              <p className="mt-2 text-xl font-semibold">
                {formatNumber(perServing.vitaminC, 1)}mg
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}