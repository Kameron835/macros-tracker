'use client'

import { useTransition } from 'react'
import { removeRecipeIngredient } from '@/app/dashboard/_actions/recipe-actions'

type RemoveRecipeIngredientButtonProps = {
  ingredientId: number
}

export default function RemoveRecipeIngredientButton({
  ingredientId,
}: RemoveRecipeIngredientButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    startTransition(async () => {
      await removeRecipeIngredient(ingredientId)
    })
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isPending}
      className="rounded-lg border border-red-500/50 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
    >
      {isPending ? 'Removing...' : 'Remove'}
    </button>
  )
}