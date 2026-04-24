'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type UpdateGoalsInput = {
  calorieGoal: number
  proteinGoal: number
  carbGoal: number
  fatGoal: number
}

export async function updateMacroGoals(input: UpdateGoalsInput) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('You must be logged in to update goals.')
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      calorie_goal: input.calorieGoal,
      protein_goal: input.proteinGoal,
      carb_goal: input.carbGoal,
      fat_goal: input.fatGoal,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}