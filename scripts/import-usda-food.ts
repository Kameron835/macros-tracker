import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

type FdcSearchFood = {
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const fdcApiKey = process.env.FDC_API_KEY

if (!supabaseUrl || !supabaseKey || !fdcApiKey) {
  throw new Error('Missing Supabase or USDA environment variables.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

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

function getNutrient(
  food: FdcSearchFood,
  nutrientIds: number[],
  fallback = 0
) {
  const nutrient = food.foodNutrients?.find((item) =>
    nutrientIds.includes(item.nutrientId)
  )

  return Number(nutrient?.value ?? fallback)
}

async function searchFoods(query: string, pageSize = 25) {
  const url = new URL('https://api.nal.usda.gov/fdc/v1/foods/search')

  url.searchParams.set('api_key', fdcApiKey!)
  url.searchParams.set('query', query)
  url.searchParams.set('pageSize', String(pageSize))
  url.searchParams.set('dataType', 'Foundation,SR Legacy,Survey (FNDDS)')

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`USDA request failed: ${response.status}`)
  }

  const data = await response.json()

  return (data.foods ?? []) as FdcSearchFood[]
}

function normalizeFood(food: FdcSearchFood) {
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

async function importFoods(query: string) {
  console.log(`Searching USDA for: ${query}`)

  const foods = await searchFoods(query)

  if (foods.length === 0) {
    console.log('No foods found.')
    return
  }

  const normalizedFoods = foods.map(normalizeFood)

  const { error } = await supabase
    .from('foods')
    .upsert(normalizedFoods, {
      onConflict: 'source,source_id',
      ignoreDuplicates: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  console.log(`Imported ${normalizedFoods.length} foods.`)
}

async function main() {
  const query = process.argv.slice(2).join(' ')

  if (!query) {
    throw new Error('Please provide a food search query.')
  }

  await importFoods(query)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})