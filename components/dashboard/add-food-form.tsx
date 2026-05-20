'use client'

import { useMemo, useState, useTransition } from 'react'
import { addFoodToToday } from '@/app/dashboard/_actions/food-actions'
import {
  importUsdaFood,
  searchUsdaFoods,
} from '@/app/dashboard/_actions/usda-actions'
import FavoriteFoodButton from '@/components/dashboard/favorite-food-button'

type FoodOption = {
  id: number
  name: string
  category: string | null
  serving_size_grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number | null
  sugar: number | null
  sodium: number | null
  potassium: number | null
  calcium: number | null
  iron: number | null
  magnesium: number | null
  zinc: number | null
  vitamin_a: number | null
  vitamin_c: number | null
  vitamin_d: number | null
  vitamin_b12: number | null
  cholesterol: number | null
  saturated_fat: number | null
  trans_fat: number | null
  source: string | null
  source_id: string | null
  brand_name: string | null
  barcode: string | null
}

type UsdaResult = {
  fdcId: number
  name: string
  category: string
  brandName: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
}

type AddFoodFormProps = {
  foods: FoodOption[]
  favoriteFoods: FoodOption[]
  favoriteFoodIds: number[]
  recentFoods: FoodOption[]
  logDate: string
}

const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const

function formatNumber(value: number | null | undefined, decimals = 0) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value ?? 0))
}

function getSourceLabel(food: FoodOption) {
  if (food.source === 'USDA FoodData Central') {
    return 'USDA'
  }

  if (food.source === 'custom') {
    return 'Custom'
  }

  if (food.source === 'recipe') {
    return 'Recipe'
  }

  return food.source ?? 'Manual'
}

function FoodResultCard({
  food,
  isSelected,
  badge,
  isFavorite,
  onSelect,
}: {
  food: FoodOption
  isSelected: boolean
  badge: string
  isFavorite: boolean
  onSelect: () => void
}) {
  return (
    <div
      className={`border-b border-neutral-800 px-4 py-4 last:border-b-0 transition ${
        isSelected ? 'bg-emerald-500/15' : 'bg-transparent hover:bg-neutral-900'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <button type="button" onClick={onSelect} className="flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-white">{food.name}</span>

            <span
              className={`rounded-full px-2 py-1 text-xs ${
                isSelected
                  ? 'bg-emerald-500 text-white'
                  : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              {badge}
            </span>

            <span className="rounded-full bg-neutral-800 px-2 py-1 text-xs text-neutral-300">
              {getSourceLabel(food)}
            </span>
          </div>

          <p className="mt-1 text-sm text-neutral-400">
            {food.category ?? 'Uncategorized'}
            {food.brand_name ? ` • ${food.brand_name}` : ''}
          </p>

          <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-neutral-400">
            <div className="rounded-lg bg-neutral-900 px-2 py-2">
              <p className="text-neutral-500">Protein</p>
              <p className="font-medium text-neutral-200">
                {formatNumber(food.protein, 1)}g
              </p>
            </div>

            <div className="rounded-lg bg-neutral-900 px-2 py-2">
              <p className="text-neutral-500">Carbs</p>
              <p className="font-medium text-neutral-200">
                {formatNumber(food.carbs, 1)}g
              </p>
            </div>

            <div className="rounded-lg bg-neutral-900 px-2 py-2">
              <p className="text-neutral-500">Fat</p>
              <p className="font-medium text-neutral-200">
                {formatNumber(food.fat, 1)}g
              </p>
            </div>

            <div className="rounded-lg bg-neutral-900 px-2 py-2">
              <p className="text-neutral-500">Fiber</p>
              <p className="font-medium text-neutral-200">
                {formatNumber(food.fiber, 1)}g
              </p>
            </div>
          </div>
        </button>

        <div className="flex flex-col items-end gap-3">
          <div className="text-right text-sm text-neutral-300">
            <p>{formatNumber(food.calories, 0)} cal</p>

            <p className="text-xs text-neutral-500">
              per {formatNumber(food.serving_size_grams, 0)}g
            </p>
          </div>

          <FavoriteFoodButton foodId={food.id} isFavorite={isFavorite} />
        </div>
      </div>
    </div>
  )
}

export default function AddFoodForm({
  foods,
  favoriteFoods,
  favoriteFoodIds,
  recentFoods,
  logDate,
}: AddFoodFormProps) {
  const [query, setQuery] = useState('')
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null)

  const [mealType, setMealType] =
    useState<(typeof mealOptions)[number]>('Breakfast')

  const [grams, setGrams] = useState('100')

  const [usdaResults, setUsdaResults] = useState<UsdaResult[]>([])
  const [usdaMessage, setUsdaMessage] = useState('')

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
        const haystack = [
          food.name,
          food.category ?? '',
          food.brand_name ?? '',
          food.source ?? '',
        ]
          .join(' ')
          .toLowerCase()

        return queryWords.every((word) => haystack.includes(word))
      })
      .sort((a, b) => {
        const aName = a.name.toLowerCase()
        const bName = b.name.toLowerCase()

        const aStarts = aName.startsWith(trimmed)
        const bStarts = bName.startsWith(trimmed)

        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1

        return aName.localeCompare(bName)
      })
      .slice(0, 15)
  }, [foods, query])

  const selectedFood =
    foods.find((food) => food.id === selectedFoodId) ??
    favoriteFoods.find((food) => food.id === selectedFoodId) ??
    recentFoods.find((food) => food.id === selectedFoodId) ??
    null

  function handleSearchChange(value: string) {
    setQuery(value)
    setSelectedFoodId(null)
    setError('')
    setSuccess('')
    setUsdaMessage('')
    setUsdaResults([])
  }

  function handleSelectFood(food: FoodOption) {
    setSelectedFoodId(food.id)
    setQuery(food.name)
    setError('')
    setSuccess('')
    setUsdaMessage('')
  }

  function handleSearchUsda() {
    const trimmed = query.trim()

    if (!trimmed) {
      setError('Enter a food name before searching USDA.')
      return
    }

    setError('')
    setSuccess('')
    setUsdaMessage('')

    startTransition(async () => {
      try {
        const results = await searchUsdaFoods(trimmed)

        setUsdaResults(results)

        if (results.length === 0) {
          setUsdaMessage('No USDA foods found for that search.')
        } else {
          setUsdaMessage('USDA results found. Import one to use it.')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'USDA search failed.')
      }
    })
  }

  function handleImportUsdaFood(fdcId: number) {
    setError('')
    setSuccess('')
    setUsdaMessage('')

    startTransition(async () => {
      try {
        const importedFood = await importUsdaFood(fdcId)

        setSuccess(`${importedFood.name} was imported. Refreshing search...`)
        setQuery(importedFood.name)
        setUsdaResults([])
        setSelectedFoodId(importedFood.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not import USDA food.')
      }
    })
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
        Search your nutrition database or import foods from USDA.
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
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-emerald-500"
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
            placeholder="Search chicken, rice, chuck roast..."
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">
            Search results
          </label>

          <div className="max-h-96 overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950">
            {query.trim() === '' ? (
              <>
                {favoriteFoods.length > 0 ? (
                  <div>
                    <div className="border-b border-neutral-800 px-4 py-3">
                      <p className="text-sm font-medium text-white">
                        Favorite foods
                      </p>

                      <p className="text-xs text-neutral-500">
                        Your pinned foods for quick logging.
                      </p>
                    </div>

                    {favoriteFoods.map((food) => (
                      <FoodResultCard
                        key={food.id}
                        food={food}
                        badge="Pinned"
                        isFavorite={true}
                        isSelected={selectedFoodId === food.id}
                        onSelect={() => handleSelectFood(food)}
                      />
                    ))}
                  </div>
                ) : null}

                {recentFoods.length > 0 ? (
                  <div>
                    <div className="border-b border-neutral-800 px-4 py-3">
                      <p className="text-sm font-medium text-white">
                        Recent foods
                      </p>

                      <p className="text-xs text-neutral-500">
                        Quickly add foods you have logged before.
                      </p>
                    </div>

                    {recentFoods.map((food) => (
                      <FoodResultCard
                        key={food.id}
                        food={food}
                        badge="Recent"
                        isFavorite={favoriteFoodIds.includes(food.id)}
                        isSelected={selectedFoodId === food.id}
                        onSelect={() => handleSelectFood(food)}
                      />
                    ))}
                  </div>
                ) : null}

                {favoriteFoods.length === 0 && recentFoods.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-neutral-400">
                    Start typing to search foods.
                  </p>
                ) : null}
              </>
            ) : filteredFoods.length === 0 ? (
              <div className="px-4 py-4">
                <p className="text-sm text-neutral-400">
                  No local foods found.
                </p>

                <button
                  type="button"
                  onClick={handleSearchUsda}
                  disabled={isPending}
                  className="mt-3 rounded-xl border border-emerald-500/50 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500 hover:text-white disabled:opacity-50"
                >
                  {isPending ? 'Searching USDA...' : 'Search USDA'}
                </button>
              </div>
            ) : (
              filteredFoods.map((food) => (
                <FoodResultCard
                  key={food.id}
                  food={food}
                  badge="Result"
                  isFavorite={favoriteFoodIds.includes(food.id)}
                  isSelected={selectedFoodId === food.id}
                  onSelect={() => handleSelectFood(food)}
                />
              ))
            )}
          </div>
        </div>

        {usdaMessage ? (
          <p className="text-sm text-neutral-400">{usdaMessage}</p>
        ) : null}

        {usdaResults.length > 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950">
            <div className="border-b border-neutral-800 px-4 py-3">
              <p className="text-sm font-medium text-white">USDA results</p>

              <p className="text-xs text-neutral-500">
                Import a result to save it into your food database.
              </p>
            </div>

            {usdaResults.map((food) => (
              <div
                key={food.fdcId}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 px-4 py-4 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-white">{food.name}</p>

                  <p className="mt-1 text-sm text-neutral-400">
                    {food.category}
                    {food.brandName ? ` • ${food.brandName}` : ''}
                  </p>

                  <p className="mt-2 text-xs text-neutral-500">
                    {formatNumber(food.calories, 0)} cal •{' '}
                    {formatNumber(food.protein, 1)}g P •{' '}
                    {formatNumber(food.carbs, 1)}g C •{' '}
                    {formatNumber(food.fat, 1)}g F / 100g
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleImportUsdaFood(food.fdcId)}
                  disabled={isPending}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  Import
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {selectedFood ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-neutral-300">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{selectedFood.name}</p>

                <p className="mt-1 text-neutral-400">
                  Selected from {getSourceLabel(selectedFood)}
                </p>
              </div>

              <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">
                Selected
              </span>
            </div>

            <p className="mt-3">
              Base serving: {formatNumber(selectedFood.serving_size_grams, 0)} g
            </p>

            <p className="mt-1">
              {formatNumber(selectedFood.calories, 0)} cal •{' '}
              {formatNumber(selectedFood.protein, 1)}g protein •{' '}
              {formatNumber(selectedFood.carbs, 1)}g carbs •{' '}
              {formatNumber(selectedFood.fat, 1)}g fat
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
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-emerald-500"
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {success ? (
          <p className="text-sm text-emerald-400">{success}</p>
        ) : null}

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