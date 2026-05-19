'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'

type CreateRecipeInput = {
  name: string
  description?: string
  servings: number
  instructions?: string
  sourceUrl?: string
}

type AddRecipeIngredientInput = {
  recipeId: number
  foodId: number
  grams: number
  notes?: string
}

type LogRecipeToMealInput = {
  recipeId: number
  servings: number
  mealType: MealType
  logDate: string
}

type IngredientWithFood = {
  grams: number
  foods:
    | {
        serving_size_grams: number | null
        calories: number | null
        protein: number | null
        carbs: number | null
        fat: number | null
        fiber: number | null
        sugar: number | null
        sodium: number | null
        potassium: number | null
        calcium: number | null
        iron: number | null
        magnesium: number | null
        zinc: number | null
        vitamin_a: number | null
        vitamin_c: number | null
        vitamin_d: number | null
        vitamin_b12: number | null
        cholesterol: number | null
        saturated_fat: number | null
        trans_fat: number | null
      }
    | {
        serving_size_grams: number | null
        calories: number | null
        protein: number | null
        carbs: number | null
        fat: number | null
        fiber: number | null
        sugar: number | null
        sodium: number | null
        potassium: number | null
        calcium: number | null
        iron: number | null
        magnesium: number | null
        zinc: number | null
        vitamin_a: number | null
        vitamin_c: number | null
        vitamin_d: number | null
        vitamin_b12: number | null
        cholesterol: number | null
        saturated_fat: number | null
        trans_fat: number | null
      }[]
    | null
}

function getFoodObject(ingredient: IngredientWithFood) {
  return Array.isArray(ingredient.foods)
    ? ingredient.foods[0] ?? null
    : ingredient.foods
}

function emptyNutrition() {
  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    potassium: 0,
    calcium: 0,
    iron: 0,
    magnesium: 0,
    zinc: 0,
    vitamin_a: 0,
    vitamin_c: 0,
    vitamin_d: 0,
    vitamin_b12: 0,
    cholesterol: 0,
    saturated_fat: 0,
    trans_fat: 0,
  }
}

export async function createRecipe(input: CreateRecipeInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in.')
  }

  const name = input.name.trim()

  if (!name) {
    throw new Error('Recipe name is required.')
  }

  if (!input.servings || input.servings <= 0) {
    throw new Error('Servings must be greater than zero.')
  }

  const { data: recipe, error } = await supabase
    .from('recipes')
    .insert({
      user_id: user.id,
      name,
      description: input.description?.trim() || null,
      servings: input.servings,
      instructions: input.instructions?.trim() || null,
      source_url: input.sourceUrl?.trim() || null,
    })
    .select('id')
    .single()

  if (error || !recipe) {
    throw new Error(error?.message || 'Could not create recipe.')
  }

  revalidatePath('/recipes')
  revalidatePath('/recipes/new')

  return recipe.id as number
}

export async function addRecipeIngredient(input: AddRecipeIngredientInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in.')
  }

  if (!input.recipeId || !input.foodId) {
    throw new Error('Missing recipe or food.')
  }

  if (!input.grams || input.grams <= 0) {
    throw new Error('Ingredient grams must be greater than zero.')
  }

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('id, user_id')
    .eq('id', input.recipeId)
    .single()

  if (recipeError || !recipe) {
    throw new Error(recipeError?.message || 'Recipe not found.')
  }

  if (recipe.user_id !== user.id) {
    throw new Error('You can only edit your own recipes.')
  }

  const { error } = await supabase.from('recipe_ingredients').insert({
    recipe_id: input.recipeId,
    food_id: input.foodId,
    grams: input.grams,
    notes: input.notes?.trim() || null,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/recipes/${input.recipeId}`)
}

export async function logRecipeToMeal(input: LogRecipeToMealInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in.')
  }

  if (!input.recipeId || !input.logDate) {
    throw new Error('Missing recipe or date.')
  }

  if (!input.servings || input.servings <= 0) {
    throw new Error('Servings must be greater than zero.')
  }

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('id, user_id, name, servings')
    .eq('id', input.recipeId)
    .single()

  if (recipeError || !recipe) {
    throw new Error(recipeError?.message || 'Recipe not found.')
  }

  if (recipe.user_id !== user.id) {
    throw new Error('You can only log your own recipes.')
  }

  const { data: ingredients, error: ingredientError } = await supabase
    .from('recipe_ingredients')
    .select(`
      grams,
      foods (
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
      )
    `)
    .eq('recipe_id', input.recipeId)

  if (ingredientError) {
    throw new Error(ingredientError.message)
  }

  if (!ingredients || ingredients.length === 0) {
    throw new Error('Add at least one ingredient before logging this recipe.')
  }

  const totalNutrition = emptyNutrition()

  for (const ingredient of ingredients as unknown as IngredientWithFood[]) {
    const food = getFoodObject(ingredient)

    if (!food) continue

    const grams = Number(ingredient.grams ?? 0)
    const servingSize = Number(food.serving_size_grams ?? 100) || 100
    const ratio = grams / servingSize

    totalNutrition.calories += Number(food.calories ?? 0) * ratio
    totalNutrition.protein += Number(food.protein ?? 0) * ratio
    totalNutrition.carbs += Number(food.carbs ?? 0) * ratio
    totalNutrition.fat += Number(food.fat ?? 0) * ratio
    totalNutrition.fiber += Number(food.fiber ?? 0) * ratio
    totalNutrition.sugar += Number(food.sugar ?? 0) * ratio
    totalNutrition.sodium += Number(food.sodium ?? 0) * ratio
    totalNutrition.potassium += Number(food.potassium ?? 0) * ratio
    totalNutrition.calcium += Number(food.calcium ?? 0) * ratio
    totalNutrition.iron += Number(food.iron ?? 0) * ratio
    totalNutrition.magnesium += Number(food.magnesium ?? 0) * ratio
    totalNutrition.zinc += Number(food.zinc ?? 0) * ratio
    totalNutrition.vitamin_a += Number(food.vitamin_a ?? 0) * ratio
    totalNutrition.vitamin_c += Number(food.vitamin_c ?? 0) * ratio
    totalNutrition.vitamin_d += Number(food.vitamin_d ?? 0) * ratio
    totalNutrition.vitamin_b12 += Number(food.vitamin_b12 ?? 0) * ratio
    totalNutrition.cholesterol += Number(food.cholesterol ?? 0) * ratio
    totalNutrition.saturated_fat += Number(food.saturated_fat ?? 0) * ratio
    totalNutrition.trans_fat += Number(food.trans_fat ?? 0) * ratio
  }

  const recipeServings = Number(recipe.servings ?? 1) || 1
  const servingMultiplier = input.servings / recipeServings

  const scaledNutrition = {
    calories: totalNutrition.calories * servingMultiplier,
    protein: totalNutrition.protein * servingMultiplier,
    carbs: totalNutrition.carbs * servingMultiplier,
    fat: totalNutrition.fat * servingMultiplier,
    fiber: totalNutrition.fiber * servingMultiplier,
    sugar: totalNutrition.sugar * servingMultiplier,
    sodium: totalNutrition.sodium * servingMultiplier,
    potassium: totalNutrition.potassium * servingMultiplier,
    calcium: totalNutrition.calcium * servingMultiplier,
    iron: totalNutrition.iron * servingMultiplier,
    magnesium: totalNutrition.magnesium * servingMultiplier,
    zinc: totalNutrition.zinc * servingMultiplier,
    vitamin_a: totalNutrition.vitamin_a * servingMultiplier,
    vitamin_c: totalNutrition.vitamin_c * servingMultiplier,
    vitamin_d: totalNutrition.vitamin_d * servingMultiplier,
    vitamin_b12: totalNutrition.vitamin_b12 * servingMultiplier,
    cholesterol: totalNutrition.cholesterol * servingMultiplier,
    saturated_fat: totalNutrition.saturated_fat * servingMultiplier,
    trans_fat: totalNutrition.trans_fat * servingMultiplier,
  }

  const { data: existingLog, error: logFetchError } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('user_id', user.id)
    .eq('log_date', input.logDate)
    .maybeSingle()

  if (logFetchError) {
    throw new Error(logFetchError.message)
  }

  let dailyLogId = existingLog?.id

  if (!dailyLogId) {
    const { data: newLog, error: insertLogError } = await supabase
      .from('daily_logs')
      .insert({
        user_id: user.id,
        log_date: input.logDate,
      })
      .select('id')
      .single()

    if (insertLogError || !newLog) {
      throw new Error(insertLogError?.message || 'Could not create daily log.')
    }

    dailyLogId = newLog.id
  }

  const { data: recipeFood, error: recipeFoodError } = await supabase
    .from('foods')
    .insert({
      name: recipe.name,
      category: 'Recipe',
      serving_size_grams: input.servings,
      calories: scaledNutrition.calories,
      protein: scaledNutrition.protein,
      carbs: scaledNutrition.carbs,
      fat: scaledNutrition.fat,
      fiber: scaledNutrition.fiber,
      sugar: scaledNutrition.sugar,
      sodium: scaledNutrition.sodium,
      potassium: scaledNutrition.potassium,
      calcium: scaledNutrition.calcium,
      iron: scaledNutrition.iron,
      magnesium: scaledNutrition.magnesium,
      zinc: scaledNutrition.zinc,
      vitamin_a: scaledNutrition.vitamin_a,
      vitamin_c: scaledNutrition.vitamin_c,
      vitamin_d: scaledNutrition.vitamin_d,
      vitamin_b12: scaledNutrition.vitamin_b12,
      cholesterol: scaledNutrition.cholesterol,
      saturated_fat: scaledNutrition.saturated_fat,
      trans_fat: scaledNutrition.trans_fat,
      user_id: user.id,
      is_custom: true,
      source: 'recipe',
      source_id: String(recipe.id),
    })
    .select('id')
    .single()

  if (recipeFoodError || !recipeFood) {
    throw new Error(recipeFoodError?.message || 'Could not create recipe food.')
  }

  const { error: itemInsertError } = await supabase
    .from('daily_log_items')
    .insert({
      daily_log_id: dailyLogId,
      food_id: recipeFood.id,
      grams: input.servings,
      meal_type: input.mealType,
      ...scaledNutrition,
    })

  if (itemInsertError) {
    throw new Error(itemInsertError.message)
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard?date=${input.logDate}`)
  revalidatePath(`/recipes/${input.recipeId}`)
}