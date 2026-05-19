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

  return recipe.id as number
}