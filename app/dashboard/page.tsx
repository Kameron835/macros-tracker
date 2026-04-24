import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AddFoodForm from '@/components/dashboard/add-food-form'
import RemoveFoodButton from '@/components/dashboard/remove-food-button'
import MacroPieChart from '@/components/dashboard/macro-pie-chart'

function formatNumber(value: number, decimals = 0) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

function clampPercent(consumed: number, goal: number) {
  if (goal <= 0) return 0
  return Math.min((consumed / goal) * 100, 100)
}

function formatDateLabel(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function shiftDate(dateString: string, days: number) {
  const date = new Date(`${dateString}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

const mealSections = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const

type MealSection = (typeof mealSections)[number]

type TodayItem = {
  id: number
  grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  meal_type: MealSection | string | null
  foods: {
    name: string
    category: string | null
  } | null
}

type DashboardPageProps = {
  searchParams?: Promise<{
    date?: string
  }>
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = (await searchParams) ?? {}
  const todayString = new Date().toISOString().split('T')[0]
  const selectedDate =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : todayString

  const previousDate = shiftDate(selectedDate, -1)
  const nextDate = shiftDate(selectedDate, 1)

  const displayName =
    user.user_metadata?.display_name ||
    user.email?.split('@')[0] ||
    'User'

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('calorie_goal, protein_goal, carb_goal, fat_goal')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(profileError.message)
  }

  const calorieGoal = Number(profile?.calorie_goal ?? 0)
  const proteinGoal = Number(profile?.protein_goal ?? 0)
  const carbGoal = Number(profile?.carb_goal ?? 0)
  const fatGoal = Number(profile?.fat_goal ?? 0)

  const { data: foods, error: foodsError } = await supabase
    .from('foods')
    .select(
      'id, name, category, serving_size_grams, calories, protein, carbs, fat'
    )
    .order('name', { ascending: true })

  if (foodsError) {
    throw new Error(foodsError.message)
  }

  const { data: selectedLog, error: selectedLogError } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('user_id', user.id)
    .eq('log_date', selectedDate)
    .maybeSingle()

  if (selectedLogError) {
    throw new Error(selectedLogError.message)
  }

  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0

  let selectedItemsWithFoods: TodayItem[] = []

  if (selectedLog?.id) {
    const { data: selectedItems, error: selectedItemsError } = await supabase
      .from('daily_log_items')
      .select(`
        id,
        grams,
        calories,
        protein,
        carbs,
        fat,
        meal_type,
        foods (
          name,
          category
        )
      `)
      .eq('daily_log_id', selectedLog.id)
      .order('id', { ascending: false })

    if (selectedItemsError) {
      throw new Error(selectedItemsError.message)
    }

    selectedItemsWithFoods = (selectedItems as TodayItem[]) ?? []

    for (const item of selectedItemsWithFoods) {
      totalCalories += Number(item.calories ?? 0)
      totalProtein += Number(item.protein ?? 0)
      totalCarbs += Number(item.carbs ?? 0)
      totalFat += Number(item.fat ?? 0)
    }
  }

  const groupedEntries: Record<MealSection, TodayItem[]> = {
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snacks: [],
  }

  for (const item of selectedItemsWithFoods) {
    const mealType = item.meal_type

    if (
      mealType === 'Breakfast' ||
      mealType === 'Lunch' ||
      mealType === 'Dinner' ||
      mealType === 'Snacks'
    ) {
      groupedEntries[mealType].push(item)
    } else {
      groupedEntries.Breakfast.push(item)
    }
  }

  const macroCards = [
    {
      label: 'Calories',
      consumed: totalCalories,
      goal: calorieGoal,
      decimals: 0,
      unit: '',
    },
    {
      label: 'Protein',
      consumed: totalProtein,
      goal: proteinGoal,
      decimals: 1,
      unit: 'g',
    },
    {
      label: 'Carbs',
      consumed: totalCarbs,
      goal: carbGoal,
      decimals: 1,
      unit: 'g',
    },
    {
      label: 'Fat',
      consumed: totalFat,
      goal: fatGoal,
      decimals: 1,
      unit: 'g',
    },
  ]

  const isToday = selectedDate === todayString

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
            Dashboard
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            {displayName}&apos;s Macros
          </h1>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <p className="text-neutral-300">
              Track your daily intake, compare it to your targets, and visualize
              your macro breakdown.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/goals"
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-white transition hover:border-neutral-500"
              >
                Edit goals
              </Link>

              <Link
                href="/foods/new"
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-white transition hover:border-neutral-500"
              >
                Create custom food
              </Link>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-400">Selected date</p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {formatDateLabel(selectedDate)}
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/dashboard?date=${previousDate}`}
                  className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-white transition hover:border-neutral-500"
                >
                  Previous day
                </Link>

                {!isToday ? (
                  <Link
                    href="/dashboard"
                    className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-white transition hover:border-neutral-500"
                  >
                    Today
                  </Link>
                ) : null}

                <Link
                  href={`/dashboard?date=${nextDate}`}
                  className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-white transition hover:border-neutral-500"
                >
                  Next day
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {macroCards.map((card) => {
            const remaining = Math.max(card.goal - card.consumed, 0)
            const percent = clampPercent(card.consumed, card.goal)

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
              >
                <p className="text-sm text-neutral-400">{card.label}</p>

                <p className="mt-3 text-2xl font-semibold">
                  {formatNumber(card.consumed, card.decimals)}
                  {card.unit}
                  <span className="text-base font-normal text-neutral-400">
                    {' '}
                    / {formatNumber(card.goal, card.decimals)}
                    {card.unit}
                  </span>
                </p>

                <p className="mt-2 text-sm text-neutral-400">
                  Remaining: {formatNumber(remaining, card.decimals)}
                  {card.unit}
                </p>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-neutral-500">
                  {formatNumber(percent, 0)}% of goal
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-8">
          <MacroPieChart
            protein={totalProtein}
            carbs={totalCarbs}
            fat={totalFat}
          />
        </div>

        <div className="mt-8">
          <AddFoodForm foods={foods ?? []} logDate={selectedDate} />
        </div>

        <div className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Entries for {formatDateLabel(selectedDate)}
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                Foods logged for the selected day, organized by meal.
              </p>
            </div>
          </div>

          {selectedItemsWithFoods.length === 0 ? (
            <p className="mt-6 text-neutral-400">
              No foods added for this date yet.
            </p>
          ) : (
            <div className="mt-6 space-y-8">
              {mealSections.map((meal) => {
                const items = groupedEntries[meal]

                const mealCalories = items.reduce(
                  (sum, item) => sum + Number(item.calories ?? 0),
                  0
                )
                const mealProtein = items.reduce(
                  (sum, item) => sum + Number(item.protein ?? 0),
                  0
                )
                const mealCarbs = items.reduce(
                  (sum, item) => sum + Number(item.carbs ?? 0),
                  0
                )
                const mealFat = items.reduce(
                  (sum, item) => sum + Number(item.fat ?? 0),
                  0
                )

                return (
                  <section key={meal}>
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {meal}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-400">
                          {items.length} {items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>

                      <div className="text-sm text-neutral-400">
                        {formatNumber(mealCalories, 0)} cal •{' '}
                        {formatNumber(mealProtein, 1)} P •{' '}
                        {formatNumber(mealCarbs, 1)} C •{' '}
                        {formatNumber(mealFat, 1)} F
                      </div>
                    </div>

                    {items.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950 px-4 py-4 text-sm text-neutral-500">
                        No foods logged for {meal.toLowerCase()} yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-separate border-spacing-y-2">
                          <thead>
                            <tr className="text-left text-sm text-neutral-400">
                              <th className="px-4 py-2">Food</th>
                              <th className="px-4 py-2">Category</th>
                              <th className="px-4 py-2">Grams</th>
                              <th className="px-4 py-2">Calories</th>
                              <th className="px-4 py-2">Protein</th>
                              <th className="px-4 py-2">Carbs</th>
                              <th className="px-4 py-2">Fat</th>
                              <th className="px-4 py-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item) => (
                              <tr
                                key={item.id}
                                className="rounded-2xl bg-neutral-950 text-sm"
                              >
                                <td className="rounded-l-2xl px-4 py-3 font-medium text-white">
                                  {item.foods?.name ?? 'Unknown food'}
                                </td>
                                <td className="px-4 py-3 text-neutral-300">
                                  {item.foods?.category ?? '-'}
                                </td>
                                <td className="px-4 py-3 text-neutral-300">
                                  {formatNumber(Number(item.grams), 2)} g
                                </td>
                                <td className="px-4 py-3 text-neutral-300">
                                  {formatNumber(Number(item.calories), 0)}
                                </td>
                                <td className="px-4 py-3 text-neutral-300">
                                  {formatNumber(Number(item.protein), 1)} g
                                </td>
                                <td className="px-4 py-3 text-neutral-300">
                                  {formatNumber(Number(item.carbs), 1)} g
                                </td>
                                <td className="px-4 py-3 text-neutral-300">
                                  {formatNumber(Number(item.fat), 1)} g
                                </td>
                                <td className="rounded-r-2xl px-4 py-3 text-neutral-300">
                                   <div className="flex flex-wrap gap-2">
                                     <Link
                                     href={`/entries/${item.id}`}
                                     className="rounded-lg border border-neutral-600 px-3 py-1.5 text-sm font-medium text-white transition hover:border-neutral-400"
                                     >
                                      Edit
                                     </Link>

                                     <RemoveFoodButton itemId={item.id} />
                                   </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}