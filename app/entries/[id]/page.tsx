import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditLogEntryForm from '@/components/dashboard/edit-log-entry-form'

function formatNumber(value: number, decimals = 0) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

type EntryPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EntryPage({ params }: EntryPageProps) {
  const { id } = await params
  const itemId = Number(id)

  if (!itemId) {
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
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      potassium,
      calcium,
      iron,
      vitamin_c,
      daily_logs (
        log_date
      ),
      foods (
        id,
        name,
        category,
        source
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

  const food = Array.isArray(item.foods)
    ? item.foods[0]
    : item.foods

  if (!dailyLog || !food) {
    notFound()
  }

  const logDate = dailyLog.log_date

  const isRecipe =
    food.category === 'Recipe' || food.source === 'recipe'

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
              {isRecipe ? 'Recipe Entry' : 'Food Entry'}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              {food.name}
            </h1>

            <p className="mt-3 text-neutral-300">
              Logged under {item.meal_type}
            </p>
          </div>

          <Link
            href={`/dashboard?date=${logDate}`}
            className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-500/10"
          >
            Back to dashboard
          </Link>
        </div>

        {isRecipe ? (
          <div className="mb-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
            Recipe nutrition values are estimated and depend on recipe
            ingredients, preparation methods, substitutions, cooking loss,
            and serving size assumptions.
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm text-neutral-400">
              {isRecipe ? 'Servings' : 'Grams'}
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {formatNumber(item.grams, 2)}
              {isRecipe ? '' : 'g'}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm text-neutral-400">Calories</p>

            <p className="mt-3 text-2xl font-semibold">
              {formatNumber(item.calories ?? 0, 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm text-neutral-400">Protein</p>

            <p className="mt-3 text-2xl font-semibold">
              {formatNumber(item.protein ?? 0, 1)}g
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm text-neutral-400">Carbs</p>

            <p className="mt-3 text-2xl font-semibold">
              {formatNumber(item.carbs ?? 0, 1)}g
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-2xl font-semibold">
              Nutrition breakdown
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-neutral-950 p-4">
                <p className="text-sm text-neutral-400">Fat</p>

                <p className="mt-2 text-xl font-semibold">
                  {formatNumber(item.fat ?? 0, 1)}g
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-950 p-4">
                <p className="text-sm text-neutral-400">Fiber</p>

                <p className="mt-2 text-xl font-semibold">
                  {formatNumber(item.fiber ?? 0, 1)}g
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-950 p-4">
                <p className="text-sm text-neutral-400">Sugar</p>

                <p className="mt-2 text-xl font-semibold">
                  {formatNumber(item.sugar ?? 0, 1)}g
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-950 p-4">
                <p className="text-sm text-neutral-400">Sodium</p>

                <p className="mt-2 text-xl font-semibold">
                  {formatNumber(item.sodium ?? 0, 0)}mg
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-950 p-4">
                <p className="text-sm text-neutral-400">Potassium</p>

                <p className="mt-2 text-xl font-semibold">
                  {formatNumber(item.potassium ?? 0, 0)}mg
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-950 p-4">
                <p className="text-sm text-neutral-400">Vitamin C</p>

                <p className="mt-2 text-xl font-semibold">
                  {formatNumber(item.vitamin_c ?? 0, 1)}mg
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-950 p-4">
                <p className="text-sm text-neutral-400">Calcium</p>

                <p className="mt-2 text-xl font-semibold">
                  {formatNumber(item.calcium ?? 0, 0)}mg
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-950 p-4">
                <p className="text-sm text-neutral-400">Iron</p>

                <p className="mt-2 text-xl font-semibold">
                  {formatNumber(item.iron ?? 0, 1)}mg
                </p>
              </div>
            </div>
          </div>

          <EditLogEntryForm
            itemId={item.id}
            initialGrams={item.grams}
            initialMealType={item.meal_type}
            foodName={food.name}
            foodCategory={food.category}
            foodSource={food.source}
            logDate={logDate}
          />
        </div>
      </div>
    </main>
  )
}