import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditCustomFoodForm from '@/components/dashboard/edit-custom-food-form'

type ManageFoodEditPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function ManageFoodEditPage({
  params,
}: ManageFoodEditPageProps) {
  const { id } = await params
  const foodId = Number(id)

  if (!foodId) {
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
    .select(`
      id,
      name,
      category,
      serving_size_grams,
      calories,
      protein,
      carbs,
      fat,
      user_id,
      is_custom,
      source,
      source_id
    `)
    .eq('id', foodId)
    .single()

  if (error || !food) {
    notFound()
  }

  if (food.user_id !== user.id || food.is_custom !== true) {
    notFound()
  }

  const isRecipeFood = food.source === 'recipe' && food.source_id
  const recipeId = food.source_id

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
              Foods
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              {isRecipeFood ? 'Recipe Food' : 'Edit Custom Food'}
            </h1>

            <p className="mt-3 text-neutral-300">
              {isRecipeFood
                ? 'This saved food was generated from a recipe.'
                : 'Update your saved custom food values.'}
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
              className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        {isRecipeFood ? (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-2xl font-semibold text-white">{food.name}</h2>

            <p className="mt-2 text-sm text-neutral-400">
              This food was created from a recipe. To change its ingredients or
              serving-based nutrition, edit the original recipe instead of
              editing it like a custom food.
            </p>

            <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
              Estimated nutrition values. Actual values may vary depending on
              ingredient brands, substitutions, cooking methods, cooking loss,
              and serving sizes.
            </div>

            <Link
              href={`/recipes/${recipeId}`}
              className="mt-6 inline-block rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-600"
            >
              Edit recipe ingredients
            </Link>
          </div>
        ) : (
          <EditCustomFoodForm
            foodId={food.id}
            initialName={food.name}
            initialCategory={food.category ?? ''}
            initialServingSizeGrams={Number(food.serving_size_grams ?? 100)}
            initialCalories={Number(food.calories ?? 0)}
            initialProtein={Number(food.protein ?? 0)}
            initialCarbs={Number(food.carbs ?? 0)}
            initialFat={Number(food.fat ?? 0)}
          />
        )}
      </div>
    </main>
  )
}