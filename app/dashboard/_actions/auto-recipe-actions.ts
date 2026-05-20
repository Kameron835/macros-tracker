'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { matchImportedIngredients } from '@/app/dashboard/_actions/ingredient-match-actions'
import { addRecipeIngredient } from '@/app/dashboard/_actions/recipe-actions'

type AutoGenerateRecipeNutritionInput = {
  recipeId: number
  ingredientText: string
}

export async function autoGenerateRecipeNutrition({
  recipeId,
  ingredientText,
}: AutoGenerateRecipeNutritionInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in.')
  }

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('id, user_id')
    .eq('id', recipeId)
    .single()

  if (recipeError || !recipe) {
    throw new Error(recipeError?.message || 'Recipe not found.')
  }

  if (recipe.user_id !== user.id) {
    throw new Error('You can only update your own recipes.')
  }

  const matches = await matchImportedIngredients(ingredientText)

  let addedCount = 0
  let skippedCount = 0

  for (const item of matches) {
    const bestMatch = item.matches[0]
    const grams = item.estimatedGrams ?? 100

    if (!bestMatch || !grams || grams <= 0) {
      skippedCount += 1
      continue
    }

    await addRecipeIngredient({
      recipeId,
      foodId: bestMatch.id,
      grams,
      notes: item.originalText,
    })

    addedCount += 1
  }

  revalidatePath(`/recipes/${recipeId}`)

  return {
    addedCount,
    skippedCount,
    totalCount: matches.length,
  }
}