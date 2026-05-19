'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateLoggedEntry } from '@/app/dashboard/_actions/food-actions'

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'

type EditLogEntryFormProps = {
  itemId: number
  initialGrams: number
  initialMealType: MealType
  foodName: string
  foodCategory: string | null
  foodSource: string | null
  logDate: string
}

const mealOptions: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

function formatNumber(value: number, decimals = 0) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export default function EditLogEntryForm({
  itemId,
  initialGrams,
  initialMealType,
  foodName,
  foodCategory,
  foodSource,
  logDate,
}: EditLogEntryFormProps) {
  const router = useRouter()

  const isRecipe = foodCategory === 'Recipe' || foodSource === 'recipe'

  const [amount, setAmount] = useState(String(initialGrams))
  const [mealType, setMealType] = useState<MealType>(initialMealType)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError('')

    const amountNumber = Number(amount)

    if (!amountNumber || amountNumber <= 0) {
      setError(
        isRecipe
          ? 'Please enter a valid serving amount.'
          : 'Please enter a valid gram amount.'
      )
      return
    }

    startTransition(async () => {
      try {
        await updateLoggedEntry({
          itemId,
          grams: amountNumber,
          mealType,
        })

        router.push(`/dashboard?date=${logDate}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-2xl font-semibold">
        {isRecipe ? 'Edit recipe entry' : 'Edit food entry'}
      </h2>

      <p className="mt-2 text-sm text-neutral-400">
        {isRecipe
          ? 'Update the number of recipe servings logged and the meal section.'
          : 'Update the gram amount and meal section for this logged food.'}
      </p>

      <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
        <p className="text-sm text-neutral-400">
          {isRecipe ? 'Recipe' : 'Food'}
        </p>

        <p className="mt-1 text-lg font-semibold text-white">{foodName}</p>

        <p className="mt-1 text-sm text-neutral-500">
          {foodCategory ?? 'Uncategorized'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm text-neutral-300">
            {isRecipe ? 'Servings logged' : 'Grams'}
          </label>

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
          />

          <p className="mt-2 text-xs text-neutral-500">
            Current value: {formatNumber(initialGrams, 2)}{' '}
            {isRecipe ? 'servings' : 'g'}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">Meal</label>

          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
          >
            {mealOptions.map((meal) => (
              <option key={meal} value={meal}>
                {meal}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {isPending ? 'Saving changes...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}