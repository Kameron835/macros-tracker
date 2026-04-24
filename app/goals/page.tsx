import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MacroGoalsForm from '@/components/dashboard/macro-goals-form'

export default async function GoalsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('calorie_goal, protein_goal, carb_goal, fat_goal')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
              Goals
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Daily Macro Goals
            </h1>
            <p className="mt-3 text-neutral-300">
              Set and update your calorie and macro targets here.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-500/10"
          >
            Back to dashboard
          </Link>
        </div>

        <MacroGoalsForm
          initialCalorieGoal={Number(profile?.calorie_goal ?? 0)}
          initialProteinGoal={Number(profile?.protein_goal ?? 0)}
          initialCarbGoal={Number(profile?.carb_goal ?? 0)}
          initialFatGoal={Number(profile?.fat_goal ?? 0)}
        />
      </div>
    </main>
  )
}