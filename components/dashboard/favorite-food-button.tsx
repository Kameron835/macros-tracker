'use client'

import { useState, useTransition } from 'react'
import {
  addFavoriteFood,
  removeFavoriteFood,
} from '@/app/dashboard/_actions/favorite-actions'

type FavoriteFoodButtonProps = {
  foodId: number
  isFavorite: boolean
}

export default function FavoriteFoodButton({
  foodId,
  isFavorite,
}: FavoriteFoodButtonProps) {
  const [favorite, setFavorite] = useState(isFavorite)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      if (favorite) {
        await removeFavoriteFood(foodId)
        setFavorite(false)
      } else {
        await addFavoriteFood(foodId)
        setFavorite(true)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
        favorite
          ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/20'
          : 'border-neutral-700 text-neutral-300 hover:border-yellow-400 hover:text-yellow-300'
      }`}
    >
      {favorite ? 'Pinned' : 'Pin'}
    </button>
  )
}