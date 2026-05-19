'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createRecipe } from '@/app/dashboard/_actions/recipe-actions'

export default function CreateRecipeForm() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [servings, setServings] = useState('1')
  const [sourceUrl, setSourceUrl] = useState('')
  const [instructions, setInstructions] = useState('')
  const [error, setError] = useState('')

  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError('')

    startTransition(async () => {
      try {
        const recipeId = await createRecipe({
          name,
          description,
          servings: Number(servings),
          sourceUrl,
          instructions,
        })

        router.push(`/recipes/${recipeId}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-2xl font-semibold text-white">Create recipe</h2>

      <p className="mt-2 text-sm text-neutral-400">
        Build a reusable recipe. Nutrition values are estimates and will depend
        on the ingredients and serving size you enter.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm text-neutral-300">
            Recipe name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Birria queso tacos"
            required
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
            placeholder="Short description of the recipe..."
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
            required
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">
            Source URL
          </label>

          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://example.com/recipe"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">
            Instructions / notes
          </label>

          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Optional cooking instructions or notes..."
            rows={5}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
          />
        </div>

        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          Estimated nutrition values. Actual values may vary depending on
          ingredient brands, substitutions, cooking methods, cooking loss, and
          serving sizes.
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {isPending ? 'Creating recipe...' : 'Create recipe'}
        </button>
      </form>
    </div>
  )
}