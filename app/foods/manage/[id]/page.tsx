import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditCustomFoodForm from '@/components/dashboard/edit-custom-food-form'

type EditFoodPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditFoodPage({ params }: EditFoodPageProps) {
  const { id } = await params
  const foodId = Number(id)

  if (!foodId || Number.isNaN(foodId)) {
    notFound()
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: food, error } = await supabase
    .from('foods')
    .select(
      'id, name, category, serving_size_grams, calories, protein, carbs, fat, user_id, is_custom'
    )
    .eq('id', foodId)
    .single()

  if (error || !food) {
    notFound()
  }

  if (food.user_id !== user.id || food.is_custom !== true) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
              Foods
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Edit Custom Food
            </h1>

            <p className="mt-3 text-neutral-300">
              Update the food information for your custom item.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/foods/manage"
              className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-500/10"
            >
              Back to manage foods
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-500/10"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        <EditCustomFoodForm
          foodId={food.id}
          initialName={food.name}
          initialCategory={food.category ?? 'Custom'}
          initialServingSizeGrams={Number(food.serving_size_grams)}
          initialCalories={Number(food.calories)}
          initialProtein={Number(food.protein)}
          initialCarbs={Number(food.carbs)}
          initialFat={Number(food.fat)}
        />
      </div>
    </main>
  )
}