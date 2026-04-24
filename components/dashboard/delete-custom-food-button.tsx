'use client'

import { useTransition } from 'react'
import { deleteCustomFood } from '@/app/dashboard/_actions/food-actions'

type DeleteCustomFoodButtonProps = {
  foodId: number
}

export default function DeleteCustomFoodButton({
  foodId,
}: DeleteCustomFoodButtonProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      onClick={() => {
        const confirmed = window.confirm(
          'Are you sure you want to delete this custom food?'
        )

        if (!confirmed) return

        startTransition(async () => {
          await deleteCustomFood(foodId)
        })
      }}
      disabled={isPending}
      className="rounded-lg border border-red-500 px-3 py-1.5 text-sm font-medium text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}