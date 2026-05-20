'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'

type BaseFoodInput = {
  name: string
  category: string
  servingSizeGrams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
  potassium?: number
  calcium?: number
  iron?: number
  magnesium?: number
  zinc?: number
  vitaminA?: number
  vitaminC?: number
  vitaminD?: number
  vitaminB12?: number
  cholesterol?: number
  saturatedFat?: number
  transFat?: number
}

type AddFoodInput = {
  foodId: number
  grams: number
  mealType: MealType
  logDate: string
}

type CreateCustomFoodInput = BaseFoodInput

type UpdateCustomFoodInput = BaseFoodInput & {
  foodId: number
}

type UpdateLoggedEntryInput = {
  itemId: number
  grams: number
  mealType: MealType
}

type FoodNutrition = {
  id: number
  serving_size_grams: number
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

function num(value: number | undefined) {
  return Number(value ?? 0)
}

function customFoodPayload(input: BaseFoodInput, userId: string) {
  return {
    name: input.name.trim(),
    category: input.category.trim() || 'Custom',
    serving_size_grams: input.servingSizeGrams,

    calories: input.calories,
    protein: input.protein,
    carbs: input.carbs,
    fat: input.fat,

    fiber: num(input.fiber),
    sugar: num(input.sugar),
    sodium: num(input.sodium),
    potassium: num(input.potassium),
    calcium: num(input.calcium),
    iron: num(input.iron),
    magnesium: num(input.magnesium),
    zinc: num(input.zinc),
    vitamin_a: num(input.vitaminA),
    vitamin_c: num(input.vitaminC),
    vitamin_d: num(input.vitaminD),
    vitamin_b12: num(input.vitaminB12),
    cholesterol: num(input.cholesterol),
    saturated_fat: num(input.saturatedFat),
    trans_fat: num(input.transFat),

    user_id: userId,
    is_custom: true,
    source: 'custom',
  }
}

function validateFoodInput(input: BaseFoodInput) {
  const name = input.name.trim()

  if (!name) {
    throw new Error('Food name is required.')
  }

  const values = [
    input.servingSizeGrams,
    input.calories,
    input.protein,
    input.carbs,
    input.fat,
    num(input.fiber),
    num(input.sugar),
    num(input.sodium),
    num(input.potassium),
    num(input.calcium),
    num(input.iron),
    num(input.magnesium),
    num(input.zinc),
    num(input.vitaminA),
    num(input.vitaminC),
    num(input.vitaminD),
    num(input.vitaminB12),
    num(input.cholesterol),
    num(input.saturatedFat),
    num(input.transFat),
  ]

  if (input.servingSizeGrams <= 0 || values.some((value) => value < 0)) {
    throw new Error('Please enter valid food values.')
  }
}

function scaleFoodNutrition(food: FoodNutrition, grams: number) {
  const ratio = grams / Number(food.serving_size_grams)

  return {
    calories: Number(food.calories ?? 0) * ratio,
    protein: Number(food.protein ?? 0) * ratio,
    carbs: Number(food.carbs ?? 0) * ratio,
    fat: Number(food.fat ?? 0) * ratio,
    fiber: Number(food.fiber ?? 0) * ratio,
    sugar: Number(food.sugar ?? 0) * ratio,
    sodium: Number(food.sodium ?? 0) * ratio,
    potassium: Number(food.potassium ?? 0) * ratio,
    calcium: Number(food.calcium ?? 0) * ratio,
    iron: Number(food.iron ?? 0) * ratio,
    magnesium: Number(food.magnesium ?? 0) * ratio,
    zinc: Number(food.zinc ?? 0) * ratio,
    vitamin_a: Number(food.vitamin_a ?? 0) * ratio,
    vitamin_c: Number(food.vitamin_c ?? 0) * ratio,
    vitamin_d: Number(food.vitamin_d ?? 0) * ratio,
    vitamin_b12: Number(food.vitamin_b12 ?? 0) * ratio,
    cholesterol: Number(food.cholesterol ?? 0) * ratio,
    saturated_fat: Number(food.saturated_fat ?? 0) * ratio,
    trans_fat: Number(food.trans_fat ?? 0) * ratio,
  }
}

const foodNutritionSelect = `
  id,
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

export async function addFoodToToday(input: AddFoodInput) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('You must be logged in to add food.')
  }

  if (!input.foodId || input.grams <= 0) {
    throw new Error('Please choose a food and enter valid grams.')
  }

  if (!input.mealType) {
    throw new Error('Please choose a meal section.')
  }

  if (!input.logDate) {
    throw new Error('Missing log date.')
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

  const { data: food, error: foodError } = await supabase
    .from('foods')
    .select(foodNutritionSelect)
    .eq('id', input.foodId)
    .single()

  if (foodError || !food) {
    throw new Error(foodError?.message || 'Food not found.')
  }

  const scaledNutrition = scaleFoodNutrition(
    food as unknown as FoodNutrition,
    input.grams
  )

  const { error: itemInsertError } = await supabase
    .from('daily_log_items')
    .insert({
      daily_log_id: dailyLogId,
      food_id: food.id,
      grams: input.grams,
      meal_type: input.mealType,
      ...scaledNutrition,
    })

  if (itemInsertError) {
    throw new Error(itemInsertError.message)
  }

  revalidatePath('/dashboard')
}

export async function updateLoggedEntry(input: UpdateLoggedEntryInput) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('You must be logged in to update an entry.')
  }

  if (!input.itemId || input.grams <= 0) {
    throw new Error('Please enter valid values.')
  }

  const { data: item, error: itemError } = await supabase
    .from('daily_log_items')
    .select(`
      id,
      food_id,
      daily_log_id,
      daily_logs (
        user_id,
        log_date
      )
    `)
    .eq('id', input.itemId)
    .single()

  if (itemError || !item) {
    throw new Error(itemError?.message || 'Log entry not found.')
  }

  const dailyLog = item.daily_logs as unknown as {
    user_id: string
    log_date: string
  } | null

  if (!dailyLog || dailyLog.user_id !== user.id) {
    throw new Error('You can only edit your own log entries.')
  }

  const { data: food, error: foodError } = await supabase
    .from('foods')
    .select(foodNutritionSelect)
    .eq('id', item.food_id)
    .single()

  if (foodError || !food) {
    throw new Error(foodError?.message || 'Food not found.')
  }

  const scaledNutrition = scaleFoodNutrition(
    food as unknown as FoodNutrition,
    input.grams
  )

  const { error: updateError } = await supabase
    .from('daily_log_items')
    .update({
      grams: input.grams,
      meal_type: input.mealType,
      ...scaledNutrition,
    })
    .eq('id', input.itemId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard?date=${dailyLog.log_date}`)
  revalidatePath(`/entries/${input.itemId}`)
}

export async function removeFoodFromToday(itemId: number) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('You must be logged in to remove food.')
  }

  const { data: item, error: itemError } = await supabase
    .from('daily_log_items')
    .select(`
      id,
      daily_log_id,
      daily_logs (
        user_id
      )
    `)
    .eq('id', itemId)
    .single()

  if (itemError || !item) {
    throw new Error(itemError?.message || 'Food entry not found.')
  }

  const dailyLog = item.daily_logs as unknown as { user_id: string } | null

  const ownerId = dailyLog?.user_id

  if (ownerId !== user.id) {
    throw new Error('You can only remove your own food entries.')
  }

  const { error: deleteError } = await supabase
    .from('daily_log_items')
    .delete()
    .eq('id', itemId)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  revalidatePath('/dashboard')
}

export async function createCustomFood(input: CreateCustomFoodInput) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('You must be logged in to create a custom food.')
  }

  validateFoodInput(input)

  const { error } = await supabase.from('foods').insert(
    customFoodPayload(input, user.id)
  )

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/foods/new')
  revalidatePath('/foods/manage')
}

export async function updateCustomFood(input: UpdateCustomFoodInput) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('You must be logged in to update a custom food.')
  }

  validateFoodInput(input)

  const { data: existingFood, error: existingFoodError } = await supabase
    .from('foods')
    .select('id, user_id, is_custom, source')
    .eq('id', input.foodId)
    .single()

  if (existingFoodError || !existingFood) {
    throw new Error(existingFoodError?.message || 'Custom food not found.')
  }

  if (
    existingFood.user_id !== user.id ||
    existingFood.is_custom !== true ||
    existingFood.source === 'recipe'
  ) {
    throw new Error('You can only edit your own manually created foods.')
  }

  const { user_id, is_custom, source, ...payload } = customFoodPayload(
    input,
    user.id
  )

  const { error } = await supabase
    .from('foods')
    .update(payload)
    .eq('id', input.foodId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/foods/new')
  revalidatePath('/foods/manage')
  revalidatePath(`/foods/manage/${input.foodId}`)
}

export async function deleteCustomFood(foodId: number) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('You must be logged in to delete a custom food.')
  }

  const { data: existingFood, error: existingFoodError } = await supabase
    .from('foods')
    .select('id, user_id, is_custom')
    .eq('id', foodId)
    .single()

  if (existingFoodError || !existingFood) {
    throw new Error(existingFoodError?.message || 'Custom food not found.')
  }

  if (existingFood.user_id !== user.id || existingFood.is_custom !== true) {
    throw new Error('You can only delete your own custom foods.')
  }

  const { error } = await supabase.from('foods').delete().eq('id', foodId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/foods/new')
  revalidatePath('/foods/manage')
}