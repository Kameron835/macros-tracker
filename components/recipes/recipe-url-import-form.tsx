'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createRecipe } from '@/app/dashboard/_actions/recipe-actions'
import { extractRecipeFromUrl } from '@/app/dashboard/_actions/recipe-url-actions'

export default function RecipeUrlImportForm() {
  const router = useRouter()

  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [servings, setServings] = useState('1')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleExtract(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError('')
    setMessage('')

    startTransition(async () => {
      try {
        const recipe = await extractRecipeFromUrl(url)

        setTitle(recipe.title)
        setDescription(recipe.description)
        setIngredients(recipe.ingredients.join('\n'))
        setInstructions(recipe.instructions.join('\n\n'))
        setMessage(
          'Recipe extracted. Review and edit the details before saving.'
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  function handleSave() {
    setError('')
    setMessage('')

    startTransition(async () => {
      try {
        const recipeId = await createRecipe({
          name: title,
          description,
          servings: Number(servings),
          sourceUrl: url,
          instructions: [
            ingredients ? `Ingredients:\n${ingredients}` : '',
            instructions ? `Instructions:\n${instructions}` : '',
          ]
            .filter(Boolean)
            .join('\n\n'),
        })

        router.push(`/recipes/${recipeId}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-2xl font-semibold text-white">Import recipe URL</h2>

      <p className="mt-2 text-sm text-neutral-400">
        Paste a recipe link to extract a title, ingredients, and instructions.
        Review everything before saving.
      </p>

      <div className="mt-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
        Recipe extraction is approximate. Website formatting varies, so always
        review ingredients, servings, and instructions before saving.
      </div>

      <form onSubmit={handleExtract} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm text-neutral-300">
            Recipe URL
          </label>

          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.example.com/recipe"
            required
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {isPending ? 'Extracting recipe...' : 'Extract recipe'}
        </button>
      </form>

      {title ? (
        <div className="mt-8 space-y-5 border-t border-neutral-800 pt-6">
          <div>
            <label className="mb-2 block text-sm text-neutral-300">
              Recipe title
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">
              Servings
            </label>

            <input
              type="number"
              min="1"
              step="0.01"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">
              Extracted ingredients
            </label>

            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={10}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">
              Extracted instructions
            </label>

            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={10}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {isPending ? 'Saving recipe...' : 'Save extracted recipe'}
          </button>
        </div>
      ) : null}

      {message ? <p className="mt-4 text-sm text-emerald-400">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
    </div>
  )
}