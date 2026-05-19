'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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