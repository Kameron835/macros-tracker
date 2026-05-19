'use client'

import { useState, useTransition } from 'react'
import { importFoodByBarcode } from '@/app/dashboard/_actions/barcode-actions'
import BarcodeScanner from '@/components/dashboard/barcode-scanner'

const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const

export default function BarcodeFoodForm() {
  const todayString = new Date().toISOString().split('T')[0]

  const [barcode, setBarcode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [addToMeal, setAddToMeal] = useState(false)
  const [mealType, setMealType] =
    useState<(typeof mealOptions)[number]>('Breakfast')
  const [grams, setGrams] = useState('100')
  const [logDate, setLogDate] = useState(todayString)

  const [isPending, startTransition] = useTransition()

  function handleImport(inputBarcode?: string) {
    const barcodeToUse = inputBarcode ?? barcode

    setMessage('')
    setError('')

    startTransition(async () => {
      try {
        const food = await importFoodByBarcode({
          barcode: barcodeToUse,
          addToMeal,
          mealType,
          grams: Number(grams),
          logDate,
        })

        setMessage(
          food.addedToMeal
            ? `${food.name} was imported and added to ${mealType}.`
            : `${food.name} was added to your food database.`
        )

        setBarcode('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    handleImport()
  }

  function handleDetected(scannedBarcode: string) {
    setBarcode(scannedBarcode)
    handleImport(scannedBarcode)
  }

  return (
    <div className="space-y-6">
      <BarcodeScanner onDetected={handleDetected} />

      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="text-2xl font-semibold text-white">Barcode lookup</h2>

        <p className="mt-2 text-sm text-neutral-400">
          Type or scan a UPC/EAN barcode to import packaged food nutrition data.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-neutral-300">
              Barcode number
            </label>

            <input
              type="text"
              inputMode="numeric"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Example: 737628064502"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={addToMeal}
              onChange={(e) => setAddToMeal(e.target.checked)}
              className="h-4 w-4"
            />

            <span>Import and add directly to a meal</span>
          </label>

          {addToMeal ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Meal
                </label>

                <select
                  value={mealType}
                  onChange={(e) =>
                    setMealType(e.target.value as (typeof mealOptions)[number])
                  }
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
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
                  Grams
                </label>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Date
                </label>

                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                />
              </div>
            </div>
          ) : null}

          {message ? (
            <p className="text-sm text-emerald-400">{message}</p>
          ) : null}

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {isPending
              ? addToMeal
                ? 'Importing and logging food...'
                : 'Looking up barcode...'
              : addToMeal
                ? 'Import and add to meal'
                : 'Import food'}
          </button>
        </form>
      </div>
    </div>
  )
}