'use client'

import { useMemo, useState, useTransition } from 'react'
import { addFoodToToday } from '@/app/dashboard/_actions/food-actions'

type FoodOption = {
  id: number
  name: string
  category: string | null
  serving_size_grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

type AddFoodFormProps = {
  foods: FoodOption[]
  logDate: string
}

const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const

export default function AddFoodForm({ foods, logDate }: AddFoodFormProps) {
  const [query, setQuery] = useState('')
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null)
  const [mealType, setMealType] =
    useState<(typeof mealOptions)[number]>('Breakfast')
  const [grams, setGrams] = useState('100')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, startTransition] = useTransition()

  const filteredFoods = useMemo(() => {
    const trimmed = query.trim().toLowerCase()

    if (!trimmed) {
      return []
    }

    const queryWords = trimmed.split(/\s+/).filter(Boolean)

    return foods
      .filter((food) => {
        const haystack = `${food.name} ${food.category ?? ''}`.toLowerCase()
        return queryWords.every((word) => haystack.includes(word))
      })
      .slice(0, 12)
  }, [foods, query])

  const selectedFood =
    foods.find((food) => food.id === selectedFoodId) ?? null

  function handleSearchChange(value: string) {
    setQuery(value)
    setSelectedFoodId(null)
    setError('')
    setSuccess('')
  }

  function handleSelectFood(food: FoodOption) {
    setSelectedFoodId(food.id)
    setQuery(food.name)
    setError('')
    setSuccess('')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedFoodId) {
      setError('Please choose a food from the search results.')
      return
    }

    const gramsNumber = Number(grams)

    if (!gramsNumber || gramsNumber <= 0) {
      setError('Please enter a valid gram amount.')
      return
    }

    startTransition(async () => {
      try {
        await addFoodToToday({
          foodId: selectedFoodId,
          grams: gramsNumber,
          mealType,
          logDate,
        })

        setSuccess('Food added to selected day.')
        setGrams('100')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-2xl font-semibold">Add food</h2>
      <p className="mt-2 text-sm text-neutral-400">
        Search your imported food database and add a serving by grams.
      </p>

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
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-white"
          >
            {mealOptions.map((meal) => (
              <option key={meal} value={meal}>
                {meal}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">
            Search foods
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search rice, chicken, oats..."
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">
            Search results
          </label>

          <div className="max-h-64 overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950">
            {query.trim() === '' ? (
              <p className="px-4 py-3 text-sm text-neutral-400">
                Start typing to search foods.
              </p>
            ) : filteredFoods.length === 0 ? (
              <p className="px-4 py-3 text-sm text-neutral-400">
                No foods found.
              </p>
            ) : (
              filteredFoods.map((food) => {
                const isSelected = selectedFoodId === food.id

                return (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => handleSelectFood(food)}
                    className={`flex w-full flex-col border-b border-neutral-800 px-4 py-3 text-left last:border-b-0 ${
                      isSelected
                        ? 'bg-white text-black'
                        : 'bg-transparent text-white hover:bg-neutral-900'
                    }`}
                  >
                    <span className="font-medium">{food.name}</span>
                    <span
                      className={`text-sm ${
                        isSelected ? 'text-neutral-800' : 'text-neutral-400'
                      }`}
                    >
                      {food.category ?? 'Uncategorized'} •{' '}
                      {food.serving_size_grams} g
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {selectedFood ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
            <p className="font-medium text-white">{selectedFood.name}</p>
            <p className="mt-2">
              Base serving: {selectedFood.serving_size_grams} g
            </p>
            <p className="mt-1">
              {selectedFood.calories} cal • {selectedFood.protein} P •{' '}
              {selectedFood.carbs} C • {selectedFood.fat} F
            </p>
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
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-white"
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-400">{success}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {isPending ? 'Adding food...' : 'Add to selected day'}
        </button>
      </form>
    </div>
  )
}