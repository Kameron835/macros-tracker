'use client'

import { useState, useTransition } from 'react'
import { updateMacroGoals } from '@/app/dashboard/_actions/profile-actions'

type MacroGoalsFormProps = {
  initialCalorieGoal: number
  initialProteinGoal: number
  initialCarbGoal: number
  initialFatGoal: number
}

export default function MacroGoalsForm({
  initialCalorieGoal,
  initialProteinGoal,
  initialCarbGoal,
  initialFatGoal,
}: MacroGoalsFormProps) {
  const [calorieGoal, setCalorieGoal] = useState(String(initialCalorieGoal))
  const [proteinGoal, setProteinGoal] = useState(String(initialProteinGoal))
  const [carbGoal, setCarbGoal] = useState(String(initialCarbGoal))
  const [fatGoal, setFatGoal] = useState(String(initialFatGoal))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const calorieGoalNumber = Number(calorieGoal)
    const proteinGoalNumber = Number(proteinGoal)
    const carbGoalNumber = Number(carbGoal)
    const fatGoalNumber = Number(fatGoal)

    if (
      calorieGoalNumber < 0 ||
      proteinGoalNumber < 0 ||
      carbGoalNumber < 0 ||
      fatGoalNumber < 0
    ) {
      setError('Goals must be zero or greater.')
      return
    }

    startTransition(async () => {
      try {
        await updateMacroGoals({
          calorieGoal: calorieGoalNumber,
          proteinGoal: proteinGoalNumber,
          carbGoal: carbGoalNumber,
          fatGoal: fatGoalNumber,
        })

        setSuccess('Goals updated.')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-2xl font-semibold text-white">Macro goals</h2>
      <p className="mt-2 text-sm text-neutral-400">
        Set your daily targets for calories, protein, carbs, and fat.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-neutral-300">Calories</label>
          <input
            type="number"
            min="0"
            step="1"
            value={calorieGoal}
            onChange={(e) => setCalorieGoal(e.target.value)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">Protein (g)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={proteinGoal}
            onChange={(e) => setProteinGoal(e.target.value)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">Carbs (g)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={carbGoal}
            onChange={(e) => setCarbGoal(e.target.value)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-neutral-300">Fat (g)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={fatGoal}
            onChange={(e) => setFatGoal(e.target.value)}
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
            {isPending ? 'Saving goals...' : 'Save goals'}
          </button>
        </div>
      </form>
    </div>
  )
}