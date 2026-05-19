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
  fiber: number
  sugar: number
  sodium: number
  potassium: number
  calcium: number
  iron: number
  vitamin_c: number
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('calorie_goal, protein_goal, carb_goal, fat_goal')
    .eq('id', user.id)
    .maybeSingle()

  const calorieGoal = Number(profile?.calorie_goal ?? 0)
  const proteinGoal = Number(profile?.protein_goal ?? 0)
  const carbGoal = Number(profile?.carb_goal ?? 0)
  const fatGoal = Number(profile?.fat_goal ?? 0)

  const { data: foods } = await supabase
  .from('foods')
  .select(`
    id,
    name,
    category,
    serving_size_grams,
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
    magnesium,
    zinc,
    vitamin_a,
    vitamin_c,
    vitamin_d,
    vitamin_b12,
    cholesterol,
    saturated_fat,
    trans_fat,
    source,
    source_id,
    brand_name,
    barcode
  `)
  .order('name', { ascending: true })

  const { data: selectedLog } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('user_id', user.id)
    .eq('log_date', selectedDate)
    .maybeSingle()

  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0

  let totalFiber = 0
  let totalSugar = 0
  let totalSodium = 0
  let totalPotassium = 0
  let totalCalcium = 0
  let totalIron = 0
  let totalVitaminC = 0

  let selectedItemsWithFoods: TodayItem[] = []

  if (selectedLog?.id) {
    const { data: selectedItems } = await supabase
      .from('daily_log_items')
      .select(`
        id,
        grams,
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
        meal_type,
        foods (
          name,
          category
        )
      `)
      .eq('daily_log_id', selectedLog.id)
      .order('id', { ascending: false })

    selectedItemsWithFoods =
      (selectedItems as unknown as TodayItem[]) ?? []

    for (const item of selectedItemsWithFoods) {
      totalCalories += Number(item.calories ?? 0)
      totalProtein += Number(item.protein ?? 0)
      totalCarbs += Number(item.carbs ?? 0)
      totalFat += Number(item.fat ?? 0)

      totalFiber += Number(item.fiber ?? 0)
      totalSugar += Number(item.sugar ?? 0)
      totalSodium += Number(item.sodium ?? 0)
      totalPotassium += Number(item.potassium ?? 0)
      totalCalcium += Number(item.calcium ?? 0)
      totalIron += Number(item.iron ?? 0)
      totalVitaminC += Number(item.vitamin_c ?? 0)
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

  const microCards = [
    {
      label: 'Fiber',
      value: totalFiber,
      goal: 30,
      decimals: 1,
      unit: 'g',
      type: 'goal',
    },
    {
      label: 'Sugar',
      value: totalSugar,
      goal: 50,
      decimals: 1,
      unit: 'g',
      type: 'limit',
    },
    {
      label: 'Sodium',
      value: totalSodium,
      goal: 2300,
      decimals: 0,
      unit: 'mg',
      type: 'limit',
    },
    {
      label: 'Potassium',
      value: totalPotassium,
      goal: 3400,
      decimals: 0,
      unit: 'mg',
      type: 'goal',
    },
    {
      label: 'Calcium',
      value: totalCalcium,
      goal: 1000,
      decimals: 0,
      unit: 'mg',
      type: 'goal',
    },
    {
      label: 'Iron',
      value: totalIron,
      goal: 18,
      decimals: 1,
      unit: 'mg',
      type: 'goal',
    },
    {
      label: 'Vitamin C',
      value: totalVitaminC,
      goal: 90,
      decimals: 1,
      unit: 'mg',
      type: 'goal',
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

          <p className="mt-3 text-neutral-300">
            Build your physique with precision nutrition.
          </p>
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
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="text-2xl font-semibold">Micronutrients</h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {microCards.map((card) => {
              const percent =
                card.goal > 0
                  ? Math.min((card.value / card.goal) * 100, 100)
                  : 0

              const isOverLimit =
                card.type === 'limit' && card.value > card.goal

              return (
                <div
                  key={card.label}
                  className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-neutral-400">
                      {card.label}
                    </p>

                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        card.type === 'limit'
                          ? 'bg-yellow-500/10 text-yellow-300'
                          : 'bg-emerald-500/10 text-emerald-300'
                      }`}
                    >
                      {card.type === 'limit' ? 'Limit' : 'Goal'}
                    </span>
                  </div>

                  <p className="mt-3 text-2xl font-semibold">
                    {formatNumber(card.value, card.decimals)}
                    {card.unit}
                    <span className="text-base font-normal text-neutral-400">
                      {' '}
                      / {formatNumber(card.goal, card.decimals)}
                      {card.unit}
                    </span>
                  </p>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverLimit
                          ? 'bg-red-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-8">
          <MacroPieChart
            protein={totalProtein}
            carbs={totalCarbs}
            fat={totalFat}
          />
        </div>

        <div className="mt-8">
          <AddFoodForm
            foods={foods ?? []}
            logDate={selectedDate}
          />
        </div>

        <div className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="text-2xl font-semibold">
            Entries for {formatDateLabel(selectedDate)}
          </h2>

          <div className="mt-8 space-y-8">
            {mealSections.map((meal) => {
              const items = groupedEntries[meal]

              return (
                <section key={meal}>
                  <h3 className="mb-4 text-xl font-semibold">
                    {meal}
                  </h3>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
                      >
                        <div>
                          <p className="font-medium">
                            {item.foods?.name}
                          </p>

                          <p className="text-sm text-neutral-400">
                            {formatNumber(item.grams, 0)} g
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-300">
                          <span>
                            {formatNumber(item.calories, 0)} cal
                          </span>

                          <span>
                            {formatNumber(item.protein, 1)} P
                          </span>

                          <span>
                            {formatNumber(item.carbs, 1)} C
                          </span>

                          <span>
                            {formatNumber(item.fat, 1)} F
                          </span>

                          <Link
                            href={`/entries/${item.id}`}
                            className="rounded-lg border border-neutral-700 px-3 py-1.5 transition hover:border-emerald-500 hover:text-emerald-400"
                          >
                            Edit
                          </Link>

                          <RemoveFoodButton itemId={item.id} />
                        </div>
                      </div>
                    ))}

                    {items.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950 px-4 py-4 text-sm text-neutral-500">
                        No foods logged for this meal yet.
                      </div>
                    ) : null}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}