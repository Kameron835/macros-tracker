'use client'

import { useState, useTransition } from 'react'
import { matchImportedIngredients } from '@/app/dashboard/_actions/ingredient-match-actions'
import { addRecipeIngredient } from '@/app/dashboard/_actions/recipe-actions'

type MatchResult = {
  originalText: string
  amount: number | null
  unit: string | null
  ingredientName: string
  estimatedGrams: number | null
  matches: {
    id: number
    name: string
    category: string | null
    serving_size_grams: number
    calories: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
  }[]
}

type IngredientMatchReviewProps = {
  recipeId: number
  initialIngredientText: string
}

export default function IngredientMatchReview({
  recipeId,
  initialIngredientText,
}: IngredientMatchReviewProps) {
  const [ingredientText, setIngredientText] = useState(initialIngredientText)
  const [results, setResults] = useState<MatchResult[]>([])
  const [selectedFoodIds, setSelectedFoodIds] = useState<Record<number, string>>(
    {}
  )
  const [gramsByIndex, setGramsByIndex] = useState<Record<number, string>>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleMatch() {
    setMessage('')
    setError('')

    startTransition(async () => {
      try {
        const matched = await matchImportedIngredients(ingredientText)

        const initialSelections: Record<number, string> = {}
        const initialGrams: Record<number, string> = {}

        matched.forEach((item, index) => {
          if (item.matches[0]) {
            initialSelections[index] = String(item.matches[0].id)
          }

          if (item.estimatedGrams) {
            initialGrams[index] = String(Math.round(item.estimatedGrams))
          } else {
            initialGrams[index] = '100'
          }
        })

        setResults(matched)
        setSelectedFoodIds(initialSelections)
        setGramsByIndex(initialGrams)
        setMessage('Ingredient matching complete. Review before adding.')
      } catch (err) {
        setError(
          err instanceof Error
            ? `Ingredient matching failed: ${err.message}`
            : 'Ingredient matching failed.'
        )
      }
    })
  }

  function handleAddIngredient(index: number) {
    const foodId = Number(selectedFoodIds[index])
    const grams = Number(gramsByIndex[index])

    setMessage('')
    setError('')

    if (!foodId) {
      setError('Please select a food match first.')
      return
    }

    if (!grams || grams <= 0) {
      setError('Please enter valid grams.')
      return
    }

    startTransition(async () => {
      try {
        await addRecipeIngredient({
          recipeId,
          foodId,
          grams,
          notes: results[index]?.originalText,
        })

        setMessage(`Added: ${results[index]?.originalText}`)
      } catch (err) {
        setError(
          err instanceof Error
            ? `Could not add ingredient: ${err.message}`
            : 'Could not add ingredient.'
        )
      }
    })
  }

  function handleAddAll() {
    setMessage('')
    setError('')

    startTransition(async () => {
      try {
        let addedCount = 0

        for (let index = 0; index < results.length; index++) {
          const foodId = Number(selectedFoodIds[index])
          const grams = Number(gramsByIndex[index])

          if (!foodId || !grams || grams <= 0) {
            continue
          }

          await addRecipeIngredient({
            recipeId,
            foodId,
            grams,
            notes: results[index]?.originalText,
          })

          addedCount += 1
        }

        setMessage(`Added ${addedCount} matched ingredients.`)
      } catch (err) {
        setError(
          err instanceof Error
            ? `Could not add matched ingredients: ${err.message}`
            : 'Could not add matched ingredients.'
        )
      }
    })
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-2xl font-semibold text-white">
        Match imported ingredients
      </h2>

      <p className="mt-2 text-sm text-neutral-400">
        Review extracted ingredients, choose the closest food match, and confirm
        grams before adding them to the recipe.
      </p>

      <div className="mt-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
        Ingredient matching and gram estimates are approximate. Always review
        matches and serving amounts before adding.
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm text-neutral-300">
            Imported ingredient lines
          </label>

          <textarea
            value={ingredientText}
            onChange={(e) => setIngredientText(e.target.value)}
            rows={8}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
          />
        </div>

        <button
          type="button"
          onClick={handleMatch}
          disabled={isPending}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {isPending ? 'Matching ingredients...' : 'Match ingredients'}
        </button>
      </div>

      {results.length > 0 ? (
        <div className="mt-8 space-y-4 border-t border-neutral-800 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-white">
              Review matches
            </h3>

            <button
              type="button"
              onClick={handleAddAll}
              disabled={isPending}
              className="rounded-xl border border-emerald-500/50 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500 hover:text-white disabled:opacity-50"
            >
              Add all valid matches
            </button>
          </div>

          {results.map((item, index) => (
            <div
              key={`${item.originalText}-${index}`}
              className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
            >
              <p className="font-medium text-white">{item.originalText}</p>

              <p className="mt-1 text-sm text-neutral-400">
                Parsed as:{' '}
                <span className="text-neutral-200">
                  {item.ingredientName || 'Unknown'}
                </span>
                {item.amount ? ` • ${item.amount}` : ''}
                {item.unit ? ` ${item.unit}` : ''}
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_140px_auto]">
                <div>
                  <label className="mb-2 block text-xs text-neutral-400">
                    Food match
                  </label>

                  <select
                    value={selectedFoodIds[index] ?? ''}
                    onChange={(e) =>
                      setSelectedFoodIds((current) => ({
                        ...current,
                        [index]: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-white outline-none focus:border-emerald-500"
                  >
                    <option value="">No match selected</option>

                    {item.matches.map((match) => (
                      <option key={match.id} value={match.id}>
                        {match.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs text-neutral-400">
                    Grams
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={gramsByIndex[index] ?? '100'}
                    onChange={(e) =>
                      setGramsByIndex((current) => ({
                        ...current,
                        [index]: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => handleAddIngredient(index)}
                    disabled={isPending}
                    className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {item.matches.length === 0 ? (
                <p className="mt-3 text-sm text-red-400">
                  No automatic match found. Add this ingredient manually using
                  the regular ingredient form.
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {message ? (
        <p className="mt-4 text-sm text-emerald-400">{message}</p>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
    </div>
  )
}