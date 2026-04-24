'use client'

import { useTransition } from 'react'
import { removeFoodFromToday } from '@/app/dashboard/_actions/food-actions'

type RemoveFoodButtonProps = {
  itemId: number
}

export default function RemoveFoodButton({ itemId }: RemoveFoodButtonProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await removeFoodFromToday(itemId)
        })
      }}
      disabled={isPending}
      className="rounded-lg border border-red-500 px-3 py-1.5 text-sm font-medium text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
    >
      {isPending ? 'Removing...' : 'Remove'}
    </button>
  )
}