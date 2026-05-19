'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'

type OpenFoodFactsProduct = {
  product_name?: string
  brands?: string
  categories?: string
  nutriments?: Record<string, number | string | undefined>
}

type OpenFoodFactsResponse = {
  status: number
  product?: OpenFoodFactsProduct
}

type ImportFoodByBarcodeInput = {
  barcode: string
  addToMeal?: boolean
  mealType?: MealType
  grams?: number
  logDate?: string
}

function getNumber(value: number | string | undefined) {
  return Number(value ?? 0)
}

function scaleFoodNutrition(food: {
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
}, grams: number) {
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

export async function importFoodByBarcode(input: ImportFoodByBarcodeInput) {
  const cleanedBarcode = input.barcode.trim()

  if (!cleanedBarcode) {
    throw new Error('Please enter a barcode.')
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in.')
  }

  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${cleanedBarcode}.json`,
    {
      headers: {
        'User-Agent': 'StrongManDamsNutrition/1.0',
      },
    }
  )

  if (!response.ok) {
    throw new Error('Could not connect to Open Food Facts.')
  }

  const data = (await response.json()) as OpenFoodFactsResponse

  if (data.status !== 1 || !data.product) {
    throw new Error('No food found for this barcode.')
  }

  const product = data.product
  const nutriments = product.nutriments ?? {}

  const name = product.product_name?.trim() || `Barcode food ${cleanedBarcode}`

  const category =
    product.categories?.split(',')[0]?.trim() || 'Packaged Food'

  const brandName = product.brands?.split(',')[0]?.trim() || null

  const foodToInsert = {
    name,
    category,
    serving_size_grams: 100,

    calories: getNumber(nutriments['energy-kcal_100g']),
    protein: getNumber(nutriments.proteins_100g),
    carbs: getNumber(nutriments.carbohydrates_100g),
    fat: getNumber(nutriments.fat_100g),

    fiber: getNumber(nutriments.fiber_100g),
    sugar: getNumber(nutriments.sugars_100g),
    sodium: getNumber(nutriments.sodium_100g) * 1000,
    potassium: getNumber(nutriments.potassium_100g) * 1000,
    calcium: getNumber(nutriments.calcium_100g) * 1000,
    iron: getNumber(nutriments.iron_100g) * 1000,
    magnesium: getNumber(nutriments.magnesium_100g) * 1000,
    zinc: getNumber(nutriments.zinc_100g) * 1000,
    vitamin_a: getNumber(nutriments['vitamin-a_100g']) * 1000000,
    vitamin_c: getNumber(nutriments['vitamin-c_100g']) * 1000,
    vitamin_d: getNumber(nutriments['vitamin-d_100g']) * 1000000,
    vitamin_b12: getNumber(nutriments['vitamin-b12_100g']) * 1000000,
    cholesterol: getNumber(nutriments.cholesterol_100g) * 1000,
    saturated_fat: getNumber(nutriments['saturated-fat_100g']),
    trans_fat: getNumber(nutriments['trans-fat_100g']),

    source: 'Open Food Facts',
    source_id: cleanedBarcode,
    brand_name: brandName,
    barcode: cleanedBarcode,
    is_custom: false,
    user_id: null,
  }

  const { data: insertedFood, error } = await supabase
    .from('foods')
    .upsert(foodToInsert, {
      onConflict: 'source,source_id',
      ignoreDuplicates: false,
    })
    .select(`
      id,
      name,
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
    `)
    .single()

  if (error || !insertedFood) {
    throw new Error(error?.message || 'Could not import food.')
  }

  if (input.addToMeal) {
    if (!input.mealType || !input.logDate) {
      throw new Error('Missing meal or log date.')
    }

    const grams = Number(input.grams ?? 100)

    if (!grams || grams <= 0) {
      throw new Error('Please enter valid grams.')
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

    const scaledNutrition = scaleFoodNutrition(insertedFood, grams)

    const { error: itemInsertError } = await supabase
      .from('daily_log_items')
      .insert({
        daily_log_id: dailyLogId,
        food_id: insertedFood.id,
        grams,
        meal_type: input.mealType,
        ...scaledNutrition,
      })

    if (itemInsertError) {
      throw new Error(itemInsertError.message)
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/foods/barcode')

  return {
    id: insertedFood.id,
    name: insertedFood.name,
    addedToMeal: Boolean(input.addToMeal),
  }
}