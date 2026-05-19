'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addFavoriteFood(foodId: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in.')
  }

  const { error } = await supabase.from('favorite_foods').insert({
    user_id: user.id,
    food_id: foodId,
  })

  if (error && !error.message.includes('duplicate')) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

export async function removeFavoriteFood(foodId: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in.')
  }

  const { error } = await supabase
    .from('favorite_foods')
    .delete()
    .eq('user_id', user.id)
    .eq('food_id', foodId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}