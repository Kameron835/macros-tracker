'use client'

import { useState, useTransition } from 'react'
import { logRecipeToMeal } from '@/app/dashboard/_actions/recipe-actions'

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'

type LogRecipeFormProps = {
  recipeId: number
}

const mealOptions: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

export default function LogRecipeForm({ recipeId }: LogRecipeFormProps) {
  const todayString = new Date().toISOString().split('T')[0]

  const [servings, setServings] = useState('1')
  const [mealType, setMealType] = useState<MealType>('Dinner')
  const [logDate, setLogDate] = useState(todayString)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setMessage('')
    setError('')

    const servingCount = Number(servings)

    if (!servingCount || servingCount <= 0) {
      setError('Please enter a valid serving amount.')
      return
    }

    startTransition(async () => {
      try {
        await logRecipeToMeal({
          recipeId,
          servings: servingCount,
          mealType,
          logDate,
        })

        setMessage('Recipe added to your daily log.')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-2xl font-semibold">Log recipe</h2>

      <p className="mt-2 text-sm text-neutral-400">
        Add this recipe to one of your meals by serving amount.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm text-neutral-300">
            Servings eaten
          </label>

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">Meal</label>

          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
          >
            {mealOptions.map((meal) => (
              <option key={meal} value={meal}>
                {meal}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">Date</label>

          <input
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
        </div>

        {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {isPending ? 'Logging recipe...' : 'Log recipe to meal'}
        </button>
      </form>
    </div>
  )
}