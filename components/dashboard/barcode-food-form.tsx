'use client'

import { useState, useTransition } from 'react'
import { importFoodByBarcode } from '@/app/dashboard/_actions/barcode-actions'

export default function BarcodeFoodForm() {
  const [barcode, setBarcode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setMessage('')
    setError('')

    startTransition(async () => {
      try {
        const food = await importFoodByBarcode(barcode)

        setMessage(`${food.name} was added to your food database.`)
        setBarcode('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-2xl font-semibold text-white">Barcode lookup</h2>

      <p className="mt-2 text-sm text-neutral-400">
        Enter a UPC or EAN barcode to import packaged food nutrition data.
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

        {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {isPending ? 'Looking up barcode...' : 'Import food'}
        </button>
      </form>
    </div>
  )
}