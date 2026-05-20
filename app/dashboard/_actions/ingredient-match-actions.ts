'use server'

import { createClient } from '@/lib/supabase/server'

type ParsedIngredient = {
  originalText: string
  amount: number | null
  unit: string | null
  ingredientName: string
  estimatedGrams: number | null
  matches: {
    id: number
    name: string
    category: string | null
    serving_size_grams: number
    calories: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
  }[]
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
  const cleaned = raw
    .replace('¼', '1/4')
    .replace('½', '1/2')
    .replace('¾', '3/4')
    .replace('⅓', '1/3')
    .replace('⅔', '2/3')
    .replace('⅛', '1/8')
    .replace('⅜', '3/8')
    .replace('⅝', '5/8')
    .replace('⅞', '7/8')

  const mixedMatch = cleaned.match(/^(\d+)\s+(\d+\/\d+)/)

  if (mixedMatch) {
    return Number(mixedMatch[1]) + parseFraction(mixedMatch[2])
  }

  const fractionMatch = cleaned.match(/^(\d+\/\d+)/)

  if (fractionMatch) {
    return parseFraction(fractionMatch[1])
  }

  const numberMatch = cleaned.match(/^(\d+(\.\d+)?)/)

  if (numberMatch) {
    return Number(numberMatch[1])
  }

  return null
}

function normalizeIngredientName(text: string) {
  return text
    .replace(/\([^)]*\)/g, '')
    .replace(/\bchopped\b/gi, '')
    .replace(/\bdiced\b/gi, '')
    .replace(/\bminced\b/gi, '')
    .replace(/\bsliced\b/gi, '')
    .replace(/\bcrushed\b/gi, '')
    .replace(/\bfresh\b/gi, '')
    .replace(/\bdried\b/gi, '')
    .replace(/\bground\b/gi, '')
    .replace(/\boptional\b/gi, '')
    .replace(/\bto taste\b/gi, '')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseIngredientLine(line: string) {
  const originalText = line.trim()

  const cleaned = originalText
    .replace('¼', '1/4')
    .replace('½', '1/2')
    .replace('¾', '3/4')
    .replace('⅓', '1/3')
    .replace('⅔', '2/3')
    .replace('⅛', '1/8')
    .replace('⅜', '3/8')
    .replace('⅝', '5/8')
    .replace('⅞', '7/8')
    .trim()

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
      : amount !== null && !unit
        ? null
        : null

  return {
    originalText,
    amount,
    unit,
    ingredientName,
    estimatedGrams,
  }
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

    const searchTerms = parsed.ingredientName
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .slice(-4)

    const query = searchTerms.join(' ')

    let matches: ParsedIngredient['matches'] = []

    if (query) {
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

      matches = data ?? []
    }

    results.push({
      ...parsed,
      matches,
    })
  }

  return results
}