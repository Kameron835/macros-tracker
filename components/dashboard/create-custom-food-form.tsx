'use client'

import { useState, useTransition } from 'react'
import { createCustomFood } from '@/app/dashboard/_actions/food-actions'

export default function CreateCustomFoodForm() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Custom')
  const [servingSizeGrams, setServingSizeGrams] = useState('100')
  const [calories, setCalories] = useState('0')
  const [protein, setProtein] = useState('0')
  const [carbs, setCarbs] = useState('0')
  const [fat, setFat] = useState('0')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, startTransition] = useTransition()

  function resetForm() {
    setName('')
    setCategory('Custom')
    setServingSizeGrams('100')
    setCalories('0')
    setProtein('0')
    setCarbs('0')
    setFat('0')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const servingSizeGramsNumber = Number(servingSizeGrams)
    const caloriesNumber = Number(calories)
    const proteinNumber = Number(protein)
    const carbsNumber = Number(carbs)
    const fatNumber = Number(fat)

    if (!name.trim()) {
      setError('Food name is required.')
      return
    }

    if (
      !servingSizeGramsNumber ||
      servingSizeGramsNumber <= 0 ||
      caloriesNumber < 0 ||
      proteinNumber < 0 ||
      carbsNumber < 0 ||
      fatNumber < 0
    ) {
      setError('Please enter valid values.')
      return
    }

    startTransition(async () => {
      try {
        await createCustomFood({
          name,
          category,
          servingSizeGrams: servingSizeGramsNumber,
          calories: caloriesNumber,
          protein: proteinNumber,
          carbs: carbsNumber,
          fat: fatNumber,
        })

        setSuccess('Custom food created.')
        resetForm()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-2xl font-semibold text-white">Create custom food</h2>
      <p className="mt-2 text-sm text-neutral-400">
        Add a food that is not in the main database. It will only be visible to your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-neutral-300">Food name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Homemade turkey chili"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Dinner"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">
            Base serving (g)
          </label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={servingSizeGrams}
            onChange={(e) => setServingSizeGrams(e.target.value)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">Calories</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">Protein (g)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">Carbs (g)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">Fat (g)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
          />
        </div>

        <div className="md:col-span-2">
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-400">{success}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {isPending ? 'Creating custom food...' : 'Create custom food'}
          </button>
        </div>
      </form>
    </div>
  )
}