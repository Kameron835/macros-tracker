'use client'

import { useState, useTransition } from 'react'
import { updateLoggedEntry } from '@/app/dashboard/_actions/food-actions'

const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const

type EditLogEntryFormProps = {
  itemId: number
  foodName: string
  initialGrams: number
  initialMealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'
}

export default function EditLogEntryForm({
  itemId,
  foodName,
  initialGrams,
  initialMealType,
}: EditLogEntryFormProps) {
  const [grams, setGrams] = useState(String(initialGrams))
  const [mealType, setMealType] =
    useState<(typeof mealOptions)[number]>(initialMealType)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const gramsNumber = Number(grams)

    if (!gramsNumber || gramsNumber <= 0) {
      setError('Please enter a valid gram amount.')
      return
    }

    startTransition(async () => {
      try {
        await updateLoggedEntry({
          itemId,
          grams: gramsNumber,
          mealType,
        })

        setSuccess('Entry updated.')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-2xl font-semibold text-white">Edit log entry</h2>
      <p className="mt-2 text-sm text-neutral-400">
        Update the grams or meal section for this food entry.
      </p>

      <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
        <p className="text-sm text-neutral-400">Food</p>
        <p className="mt-1 text-lg font-medium text-white">{foodName}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm text-neutral-300">
            Meal section
          </label>
          <select
            value={mealType}
            onChange={(e) =>
              setMealType(e.target.value as (typeof mealOptions)[number])
            }
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
          >
            {mealOptions.map((meal) => (
              <option key={meal} value={meal}>
                {meal}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">Grams</label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-400">{success}</p> : null}

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