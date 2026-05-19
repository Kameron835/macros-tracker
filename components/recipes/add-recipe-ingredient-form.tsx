'use client'

import { useMemo, useState, useTransition } from 'react'
import { addRecipeIngredient } from '@/app/dashboard/_actions/recipe-actions'

type FoodOption = {
  id: number
  name: string
  category: string | null
  serving_size_grams: number
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}

type AddRecipeIngredientFormProps = {
  recipeId: number
  foods: FoodOption[]
}

export default function AddRecipeIngredientForm({
  recipeId,
  foods,
}: AddRecipeIngredientFormProps) {
  const [query, setQuery] = useState('')
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null)
  const [grams, setGrams] = useState('100')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const filteredFoods = useMemo(() => {
    const trimmed = query.trim().toLowerCase()

    if (!trimmed) return []

    return foods
      .filter((food) =>
        [food.name, food.category ?? '']
          .join(' ')
          .toLowerCase()
          .includes(trimmed)
      )
      .slice(0, 12)
  }, [foods, query])

  const selectedFood = foods.find((food) => food.id === selectedFoodId)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!selectedFoodId) {
      setError('Please choose an ingredient.')
      return
    }

    const gramsNumber = Number(grams)

    if (!gramsNumber || gramsNumber <= 0) {
      setError('Please enter valid grams.')
      return
    }

    startTransition(async () => {
      try {
        await addRecipeIngredient({
          recipeId,
          foodId: selectedFoodId,
          grams: gramsNumber,
          notes,
        })

        setQuery('')
        setSelectedFoodId(null)
        setGrams('100')
        setNotes('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-2xl font-semibold">Add ingredient</h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm text-neutral-300">
            Search food database
          </label>

          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedFoodId(null)
            }}
            placeholder="Search beef, tortilla, cheese..."
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div className="max-h-72 overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950">
          {query.trim() === '' ? (
            <p className="px-4 py-4 text-sm text-neutral-400">
              Start typing to search ingredients.
            </p>
          ) : filteredFoods.length === 0 ? (
            <p className="px-4 py-4 text-sm text-neutral-400">
              No ingredients found.
            </p>
          ) : (
            filteredFoods.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => {
                  setSelectedFoodId(food.id)
                  setQuery(food.name)
                }}
                className={`block w-full border-b border-neutral-800 px-4 py-3 text-left text-sm transition last:border-b-0 ${
                  selectedFoodId === food.id
                    ? 'bg-emerald-500/15 text-white'
                    : 'text-neutral-300 hover:bg-neutral-900'
                }`}
              >
                <span className="font-medium">{food.name}</span>
                <span className="block text-xs text-neutral-500">
                  {food.category ?? 'Uncategorized'}
                </span>
              </button>
            ))
          )}
        </div>

        {selectedFood ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-neutral-300">
            Selected: <span className="text-white">{selectedFood.name}</span>
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm text-neutral-300">Grams</label>

          <input
            type="number"
            min="1"
            step="0.01"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">
            Notes
          </label>

          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional: cooked, drained, divided, etc."
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          disabled={isPending}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {isPending ? 'Adding ingredient...' : 'Add ingredient'}
        </button>
      </form>
    </div>
  )
}