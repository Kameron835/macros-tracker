'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

function getNumber(value: number | string | undefined) {
  return Number(value ?? 0)
}

export async function importFoodByBarcode(barcode: string) {
  const cleanedBarcode = barcode.trim()

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

  const name =
    product.product_name?.trim() ||
    `Barcode food ${cleanedBarcode}`

  const category =
    product.categories?.split(',')[0]?.trim() ||
    'Packaged Food'

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
    .select('id, name')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/foods/barcode')

  return insertedFood
}