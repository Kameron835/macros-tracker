'use client'

import { useState, useTransition } from 'react'
import { autoGenerateRecipeNutrition } from '@/app/dashboard/_actions/auto-recipe-actions'

type AutoRecipeNutritionFormProps = {
  recipeId: number
  initialIngredientText: string
}

export default function AutoRecipeNutritionForm({
  recipeId,
  initialIngredientText,
}: AutoRecipeNutritionFormProps) {
  const [ingredientText, setIngredientText] = useState(initialIngredientText)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleGenerate() {
    setMessage('')
    setError('')

    if (!ingredientText.trim()) {
      setError('Paste or enter ingredients first.')
      return
    }

    startTransition(async () => {
      try {
        const result = await autoGenerateRecipeNutrition({
          recipeId,
          ingredientText,
        })

        setMessage(
          `Added ${result.addedCount} ingredients. Skipped ${result.skippedCount}.`
        )
      } catch (err) {
        setError(
            err instanceof Error 
            ? `Auto-generation failed: ${err.message}`
            : 'Something went wrong.'
        )
      }
    })
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-2xl font-semibold text-white">
        Auto-generate nutrition
      </h2>

      <p className="mt-2 text-sm text-neutral-400">
        Paste recipe ingredients and let the app estimate food matches and grams.
      </p>

      <div className="mt-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
        Automatic nutrition is approximate. Always review ingredient matches and
        amounts before relying on totals.
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm text-neutral-300">
            Ingredient list
          </label>

          <textarea
            value={ingredientText}
            onChange={(e) => setIngredientText(e.target.value)}
            rows={8}
            placeholder="2 lb chuck roast&#10;1 lb short ribs&#10;12 corn tortillas"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
          />
        </div>

        {message ? (
          <p className="text-sm text-emerald-400">{message}</p>
        ) : null}

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {isPending
            ? 'Generating nutrition...'
            : 'Auto-generate recipe nutrition'}
        </button>
      </div>
    </div>
  )
}