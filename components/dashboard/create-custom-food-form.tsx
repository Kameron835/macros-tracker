'use client'

import { useState, useTransition } from 'react'
import { createCustomFood } from '@/app/dashboard/_actions/food-actions'

function numberValue(value: string) {
  return Number(value || 0)
}

export default function CreateCustomFoodForm() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Custom')
  const [servingSizeGrams, setServingSizeGrams] = useState('100')

  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')

  const [fiber, setFiber] = useState('')
  const [sugar, setSugar] = useState('')
  const [sodium, setSodium] = useState('')
  const [potassium, setPotassium] = useState('')
  const [calcium, setCalcium] = useState('')
  const [iron, setIron] = useState('')
  const [magnesium, setMagnesium] = useState('')
  const [zinc, setZinc] = useState('')
  const [vitaminA, setVitaminA] = useState('')
  const [vitaminC, setVitaminC] = useState('')
  const [vitaminD, setVitaminD] = useState('')
  const [vitaminB12, setVitaminB12] = useState('')
  const [cholesterol, setCholesterol] = useState('')
  const [saturatedFat, setSaturatedFat] = useState('')
  const [transFat, setTransFat] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, startTransition] = useTransition()

  function resetForm() {
    setName('')
    setCategory('Custom')
    setServingSizeGrams('100')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
    setFiber('')
    setSugar('')
    setSodium('')
    setPotassium('')
    setCalcium('')
    setIron('')
    setMagnesium('')
    setZinc('')
    setVitaminA('')
    setVitaminC('')
    setVitaminD('')
    setVitaminB12('')
    setCholesterol('')
    setSaturatedFat('')
    setTransFat('')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError('')
    setSuccess('')

    startTransition(async () => {
      try {
        await createCustomFood({
          name,
          category,
          servingSizeGrams: numberValue(servingSizeGrams),
          calories: numberValue(calories),
          protein: numberValue(protein),
          carbs: numberValue(carbs),
          fat: numberValue(fat),
          fiber: numberValue(fiber),
          sugar: numberValue(sugar),
          sodium: numberValue(sodium),
          potassium: numberValue(potassium),
          calcium: numberValue(calcium),
          iron: numberValue(iron),
          magnesium: numberValue(magnesium),
          zinc: numberValue(zinc),
          vitaminA: numberValue(vitaminA),
          vitaminC: numberValue(vitaminC),
          vitaminD: numberValue(vitaminD),
          vitaminB12: numberValue(vitaminB12),
          cholesterol: numberValue(cholesterol),
          saturatedFat: numberValue(saturatedFat),
          transFat: numberValue(transFat),
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
        Add a custom food with macros and optional micronutrients.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Basic info</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Food name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Homemade chicken bowl"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Category
              </label>

              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Custom"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Serving size grams
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={servingSizeGrams}
                onChange={(e) => setServingSizeGrams(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Macros</h3>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Calories
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Protein (g)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Carbs (g)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Fat (g)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Micronutrients
            </h3>

            <p className="mt-1 text-sm text-neutral-400">
              Optional. Leave unknown values blank.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              ['Fiber (g)', fiber, setFiber],
              ['Sugar (g)', sugar, setSugar],
              ['Sodium (mg)', sodium, setSodium],
              ['Potassium (mg)', potassium, setPotassium],
              ['Calcium (mg)', calcium, setCalcium],
              ['Iron (mg)', iron, setIron],
              ['Magnesium (mg)', magnesium, setMagnesium],
              ['Zinc (mg)', zinc, setZinc],
              ['Vitamin A (mcg)', vitaminA, setVitaminA],
              ['Vitamin C (mg)', vitaminC, setVitaminC],
              ['Vitamin D (mcg)', vitaminD, setVitaminD],
              ['Vitamin B12 (mcg)', vitaminB12, setVitaminB12],
              ['Cholesterol (mg)', cholesterol, setCholesterol],
              ['Saturated fat (g)', saturatedFat, setSaturatedFat],
              ['Trans fat (g)', transFat, setTransFat],
            ].map(([label, value, setter]) => (
              <div key={label as string}>
                <label className="mb-2 block text-sm text-neutral-300">
                  {label as string}
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={value as string}
                  onChange={(e) =>
                    (setter as React.Dispatch<React.SetStateAction<string>>) (
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                />
              </div>
            ))}
          </div>
        </section>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-400">{success}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {isPending ? 'Creating food...' : 'Create custom food'}
        </button>
      </form>
    </div>
  )
}