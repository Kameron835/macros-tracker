'use server'

import { createClient } from '@/lib/supabase/server'

type UsdaSearchFood = {
  fdcId: number
  description: string
  dataType?: string
  brandOwner?: string
  brandName?: string
  gtinUpc?: string
  foodNutrients?: {
    nutrientId: number
    nutrientName: string
    unitName: string
    value: number
  }[]
}

const nutrientMap = {
  calories: [1008],
  protein: [1003],
  fat: [1004],
  carbs: [1005],
  fiber: [1079],
  sugar: [2000],
  sodium: [1093],
  potassium: [1092],
  calcium: [1087],
  iron: [1089],
  magnesium: [1090],
  zinc: [1095],
  vitamin_a: [1106],
  vitamin_c: [1162],
  vitamin_d: [1114],
  vitamin_b12: [1178],
  cholesterol: [1253],
  saturated_fat: [1258],
  trans_fat: [1257],
}

function getNutrient(food: UsdaSearchFood, nutrientIds: number[]) {
  const nutrient = food.foodNutrients?.find((item) =>
    nutrientIds.includes(item.nutrientId)
  )

  return Number(nutrient?.value ?? 0)
}

function normalizeUsdaFood(food: UsdaSearchFood) {
  return {
    name: food.description,
    category: food.dataType ?? 'USDA',
    serving_size_grams: 100,

    calories: getNutrient(food, nutrientMap.calories),
    protein: getNutrient(food, nutrientMap.protein),
    carbs: getNutrient(food, nutrientMap.carbs),
    fat: getNutrient(food, nutrientMap.fat),

    fiber: getNutrient(food, nutrientMap.fiber),
    sugar: getNutrient(food, nutrientMap.sugar),
    sodium: getNutrient(food, nutrientMap.sodium),
    potassium: getNutrient(food, nutrientMap.potassium),
    calcium: getNutrient(food, nutrientMap.calcium),
    iron: getNutrient(food, nutrientMap.iron),
    magnesium: getNutrient(food, nutrientMap.magnesium),
    zinc: getNutrient(food, nutrientMap.zinc),
    vitamin_a: getNutrient(food, nutrientMap.vitamin_a),
    vitamin_c: getNutrient(food, nutrientMap.vitamin_c),
    vitamin_d: getNutrient(food, nutrientMap.vitamin_d),
    vitamin_b12: getNutrient(food, nutrientMap.vitamin_b12),
    cholesterol: getNutrient(food, nutrientMap.cholesterol),
    saturated_fat: getNutrient(food, nutrientMap.saturated_fat),
    trans_fat: getNutrient(food, nutrientMap.trans_fat),

    source: 'USDA FoodData Central',
    source_id: String(food.fdcId),
    brand_name: food.brandName ?? food.brandOwner ?? null,
    barcode: food.gtinUpc ?? null,
    is_custom: false,
    user_id: null,
  }
}

export async function searchUsdaFoods(query: string) {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    throw new Error('Please enter a search term.')
  }

  const apiKey = process.env.FDC_API_KEY

  if (!apiKey) {
    throw new Error('Missing USDA API key.')
  }

  const url = new URL('https://api.nal.usda.gov/fdc/v1/foods/search')

  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('query', trimmedQuery)
  url.searchParams.set('pageSize', '10')
  url.searchParams.set('dataType', 'Foundation,SR Legacy,Survey (FNDDS)')

  const response = await fetch(url, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('USDA search failed.')
  }

  const data = await response.json()
  const foods = (data.foods ?? []) as UsdaSearchFood[]

  return foods.map((food) => ({
    fdcId: food.fdcId,
    name: food.description,
    category: food.dataType ?? 'USDA',
    brandName: food.brandName ?? food.brandOwner ?? null,
    calories: getNutrient(food, nutrientMap.calories),
    protein: getNutrient(food, nutrientMap.protein),
    carbs: getNutrient(food, nutrientMap.carbs),
    fat: getNutrient(food, nutrientMap.fat),
  }))
}

export async function importUsdaFood(fdcId: number) {
  if (!fdcId) {
    throw new Error('Missing USDA food ID.')
  }

  const apiKey = process.env.FDC_API_KEY

  if (!apiKey) {
    throw new Error('Missing USDA API key.')
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in.')
  }

  const sourceId = String(fdcId)

  const { data: existingFood, error: existingFoodError } = await supabase
    .from('foods')
    .select('id, name')
    .eq('source', 'USDA FoodData Central')
    .eq('source_id', sourceId)
    .maybeSingle()

  if (existingFoodError) {
    throw new Error(existingFoodError.message)
  }

  if (existingFood) {
    return existingFood
  }

  const response = await fetch(
    `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`,
    {
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    throw new Error('Could not fetch USDA food details.')
  }

  const food = (await response.json()) as UsdaSearchFood
  const normalizedFood = normalizeUsdaFood(food)

  const { data: insertedFood, error } = await supabase
    .from('foods')
    .insert(normalizedFood)
    .select('id, name')
    .single()

  if (error || !insertedFood) {
    throw new Error(error?.message || 'Could not import USDA food.')
  }

  return insertedFood
}