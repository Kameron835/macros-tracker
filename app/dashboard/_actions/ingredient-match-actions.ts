'use server'

import { createClient } from '@/lib/supabase/server'
import { importUsdaFood, searchUsdaFoods } from '@/app/dashboard/_actions/usda-actions'

type FoodMatch = {
  id: number
  name: string
  category: string | null
  serving_size_grams: number
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}

type ParsedIngredient = {
  originalText: string
  amount: number | null
  unit: string | null
  ingredientName: string
  estimatedGrams: number | null
  matches: FoodMatch[]
}

const unitGramMap: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,

  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,

  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,

  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
  pounds: 453.592,

  tsp: 4.2,
  teaspoon: 4.2,
  teaspoons: 4.2,

  tbsp: 14,
  tablespoon: 14,
  tablespoons: 14,

  cup: 240,
  cups: 240,

  clove: 3,
  cloves: 3,

  slice: 28,
  slices: 28,

  large: 50,
  medium: 45,
  small: 38,
}

function parseFraction(value: string) {
  if (value.includes('/')) {
    const [top, bottom] = value.split('/').map(Number)

    if (top && bottom) {
      return top / bottom
    }
  }

  return Number(value)
}

function parseAmount(raw: string) {
  if (raw.includes('/')) {
    const mixedMatch = raw.match(/^(\d+)\s+(\d+\/\d+)/)

    if (mixedMatch) {
      return Number(mixedMatch[1]) + parseFraction(mixedMatch[2])
    }

    const fractionMatch = raw.match(/^(\d+\/\d+)/)

    if (fractionMatch) {
      return parseFraction(fractionMatch[1])
    }
  }

  const numberMatch = raw.match(/^(\d+(\.\d+)?)/)

  if (numberMatch) {
    return Number(numberMatch[1])
  }

  return null
}

function normalizeFractions(text: string) {
  return text
    .replaceAll('¼', '1/4')
    .replaceAll('½', '1/2')
    .replaceAll('¾', '3/4')
    .replaceAll('⅓', '1/3')
    .replaceAll('⅔', '2/3')
    .replaceAll('⅛', '1/8')
    .replaceAll('⅜', '3/8')
    .replaceAll('⅝', '5/8')
    .replaceAll('⅞', '7/8')
}

function normalizeIngredientName(text: string) {
  return text
    .replace(/\([^)]*\)/g, '')
    .replace(/\bboneless\b/gi, '')
    .replace(/\bbone-in\b/gi, '')
    .replace(/\bstems?\b/gi, '')
    .replace(/\bseeds?\b/gi, '')
    .replace(/\bremoved\b/gi, '')
    .replace(/\bchopped\b/gi, '')
    .replace(/\bdiced\b/gi, '')
    .replace(/\bminced\b/gi, '')
    .replace(/\bsliced\b/gi, '')
    .replace(/\bthinly\b/gi, '')
    .replace(/\btorn\b/gi, '')
    .replace(/\bpieces\b/gi, '')
    .replace(/\bcrushed\b/gi, '')
    .replace(/\bfresh\b/gi, '')
    .replace(/\bdried\b/gi, '')
    .replace(/\bground\b/gi, '')
    .replace(/\btoasted\b/gi, '')
    .replace(/\boptional\b/gi, '')
    .replace(/\bto taste\b/gi, '')
    .replace(/\bor\b/gi, ' ')
    .replace(/["“”]/g, '')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseIngredientLine(line: string) {
  const originalText = line.trim()
  const cleaned = normalizeFractions(originalText).trim()
  const amount = parseAmount(cleaned)

  let remaining = cleaned

  if (amount !== null) {
    remaining = remaining
      .replace(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(\.\d+)?)/, '')
      .trim()
  }

  const words = remaining.split(/\s+/)
  const possibleUnit = words[0]?.toLowerCase().replace('.', '') ?? null

  let unit: string | null = null

  if (possibleUnit && unitGramMap[possibleUnit]) {
    unit = possibleUnit
    remaining = words.slice(1).join(' ')
  }

  const ingredientName = normalizeIngredientName(remaining)

  const estimatedGrams =
    amount !== null && unit && unitGramMap[unit]
      ? amount * unitGramMap[unit]
      : null

  return {
    originalText,
    amount,
    unit,
    ingredientName,
    estimatedGrams,
  }
}

function buildSearchQuery(ingredientName: string) {
  return ingredientName
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(-4)
    .join(' ')
}

async function searchLocalFoods(query: string): Promise<FoodMatch[]> {
  if (!query) {
    return []
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from('foods')
    .select(`
      id,
      name,
      category,
      serving_size_grams,
      calories,
      protein,
      carbs,
      fat
    `)
    .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
    .limit(8)

  return (data ?? []) as FoodMatch[]
}

async function searchAndImportBestUsdaFood(query: string): Promise<FoodMatch[]> {
  if (!query) {
    return []
  }

  const usdaResults = await searchUsdaFoods(query)

  if (usdaResults.length === 0) {
    return []
  }

  const bestResult = usdaResults[0]
  const importedFood = await importUsdaFood(bestResult.fdcId)

  const supabase = await createClient()

  const { data: food } = await supabase
    .from('foods')
    .select(`
      id,
      name,
      category,
      serving_size_grams,
      calories,
      protein,
      carbs,
      fat
    `)
    .eq('id', importedFood.id)
    .single()

  return food ? [(food as FoodMatch)] : []
}

export async function matchImportedIngredients(ingredientText: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in.')
  }

  const lines = ingredientText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 50)

  const results: ParsedIngredient[] = []

  for (const line of lines) {
    const parsed = parseIngredientLine(line)
    const query = buildSearchQuery(parsed.ingredientName)

    let matches = await searchLocalFoods(query)

    if (matches.length === 0) {
      matches = await searchAndImportBestUsdaFood(query)
    }

    results.push({
      ...parsed,
      matches,
    })
  }

  return results
}