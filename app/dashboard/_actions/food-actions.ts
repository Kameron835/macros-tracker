'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type AddFoodInput = {
  foodId: number
  grams: number
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'
  logDate: string
}

type CreateCustomFoodInput = {
  name: string
  category: string
  servingSizeGrams: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

type UpdateCustomFoodInput = {
  foodId: number
  name: string
  category: string
  servingSizeGrams: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

type UpdateLoggedEntryInput = {
  itemId: number
  grams: number
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'
}

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
    .select('id, serving_size_grams, calories, protein, carbs, fat')
    .eq('id', input.foodId)
    .single()

  if (foodError || !food) {
    throw new Error(foodError?.message || 'Food not found.')
  }

  const ratio = input.grams / Number(food.serving_size_grams)

  const calories = Number(food.calories) * ratio
  const protein = Number(food.protein) * ratio
  const carbs = Number(food.carbs) * ratio
  const fat = Number(food.fat) * ratio

  const { error: itemInsertError } = await supabase
    .from('daily_log_items')
    .insert({
      daily_log_id: dailyLogId,
      food_id: food.id,
      grams: input.grams,
      calories,
      protein,
      carbs,
      fat,
      meal_type: input.mealType,
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

  const dailyLog = Array.isArray(item.daily_logs)
    ? item.daily_logs[0]
    : item.daily_logs

  if (!dailyLog || dailyLog.user_id !== user.id) {
    throw new Error('You can only edit your own log entries.')
  }

  const { data: food, error: foodError } = await supabase
    .from('foods')
    .select('id, serving_size_grams, calories, protein, carbs, fat')
    .eq('id', item.food_id)
    .single()

  if (foodError || !food) {
    throw new Error(foodError?.message || 'Food not found.')
  }

  const ratio = input.grams / Number(food.serving_size_grams)

  const calories = Number(food.calories) * ratio
  const protein = Number(food.protein) * ratio
  const carbs = Number(food.carbs) * ratio
  const fat = Number(food.fat) * ratio

  const { error: updateError } = await supabase
    .from('daily_log_items')
    .update({
      grams: input.grams,
      meal_type: input.mealType,
      calories,
      protein,
      carbs,
      fat,
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

  const name = input.name.trim()
  const category = input.category.trim()

  if (!name) {
    throw new Error('Food name is required.')
  }

  if (
    input.servingSizeGrams <= 0 ||
    input.calories < 0 ||
    input.protein < 0 ||
    input.carbs < 0 ||
    input.fat < 0
  ) {
    throw new Error('Please enter valid food values.')
  }

  const { error } = await supabase
    .from('foods')
    .insert({
      name,
      category: category || 'Custom',
      serving_size_grams: input.servingSizeGrams,
      calories: input.calories,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
      user_id: user.id,
      is_custom: true,
    })

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

  const name = input.name.trim()
  const category = input.category.trim()

  if (!name) {
    throw new Error('Food name is required.')
  }

  if (
    input.servingSizeGrams <= 0 ||
    input.calories < 0 ||
    input.protein < 0 ||
    input.carbs < 0 ||
    input.fat < 0
  ) {
    throw new Error('Please enter valid food values.')
  }

  const { data: existingFood, error: existingFoodError } = await supabase
    .from('foods')
    .select('id, user_id, is_custom')
    .eq('id', input.foodId)
    .single()

  if (existingFoodError || !existingFood) {
    throw new Error(existingFoodError?.message || 'Custom food not found.')
  }

  if (existingFood.user_id !== user.id || existingFood.is_custom !== true) {
    throw new Error('You can only edit your own custom foods.')
  }

  const { error } = await supabase
    .from('foods')
    .update({
      name,
      category: category || 'Custom',
      serving_size_grams: input.servingSizeGrams,
      calories: input.calories,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
    })
    .eq('id', input.foodId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/foods/new')
  revalidatePath('/foods/manage')
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

  const { error } = await supabase
    .from('foods')
    .delete()
    .eq('id', foodId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/foods/new')
  revalidatePath('/foods/manage')
}