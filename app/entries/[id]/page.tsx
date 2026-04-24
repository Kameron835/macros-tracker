import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditLogEntryForm from '@/components/dashboard/edit-log-entry-form'

type EntryEditPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EntryEditPage({ params }: EntryEditPageProps) {
  const { id } = await params
  const itemId = Number(id)

  if (!itemId || Number.isNaN(itemId)) {
    notFound()
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: item, error } = await supabase
    .from('daily_log_items')
    .select(`
      id,
      grams,
      meal_type,
      foods (
        name
      ),
      daily_logs (
        user_id,
        log_date
      )
    `)
    .eq('id', itemId)
    .single()

  if (error || !item) {
    notFound()
  }

  const dailyLog = Array.isArray(item.daily_logs)
    ? item.daily_logs[0]
    : item.daily_logs

  if (!dailyLog || dailyLog.user_id !== user.id) {
    notFound()
  }

  const food = Array.isArray(item.foods) ? item.foods[0] : item.foods

  const mealType =
    item.meal_type === 'Breakfast' ||
    item.meal_type === 'Lunch' ||
    item.meal_type === 'Dinner' ||
    item.meal_type === 'Snacks'
      ? item.meal_type
      : 'Breakfast'

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
              Entries
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Edit Logged Entry
            </h1>

            <p className="mt-3 text-neutral-300">
              Update a previously logged food entry.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dashboard?date=${dailyLog.log_date}`}
              className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-500/10"
            >
              Back to selected day
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-500/10"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        <EditLogEntryForm
          itemId={item.id}
          foodName={food?.name ?? 'Unknown food'}
          initialGrams={Number(item.grams)}
          initialMealType={mealType}
        />
      </div>
    </main>
  )
}