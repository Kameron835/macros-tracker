import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DeleteCustomFoodButton from '@/components/dashboard/delete-custom-food-button'

function formatNumber(value: number, decimals = 0) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export default async function ManageFoodsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: customFoods, error } = await supabase
    .from('foods')
    .select(
      'id, name, category, serving_size_grams, calories, protein, carbs, fat'
    )
    .eq('user_id', user.id)
    .eq('is_custom', true)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
              Foods
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Manage Custom Foods
            </h1>

            <p className="mt-3 text-neutral-300">
              View, edit, and delete the foods you created.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/foods/new"
              className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-500/10"
            >
              Create custom food
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-500/10"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          {customFoods == null || customFoods.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950 px-4 py-6 text-neutral-400">
              You have not created any custom foods yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-sm text-neutral-400">
                    <th className="px-4 py-2">Food</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Base Serving</th>
                    <th className="px-4 py-2">Calories</th>
                    <th className="px-4 py-2">Protein</th>
                    <th className="px-4 py-2">Carbs</th>
                    <th className="px-4 py-2">Fat</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customFoods.map((food) => (
                    <tr
                      key={food.id}
                      className="rounded-2xl bg-neutral-950 text-sm"
                    >
                      <td className="rounded-l-2xl px-4 py-3 font-medium text-white">
                        {food.name}
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        {food.category ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        {formatNumber(Number(food.serving_size_grams), 2)} g
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        {formatNumber(Number(food.calories), 0)}
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        {formatNumber(Number(food.protein), 1)} g
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        {formatNumber(Number(food.carbs), 1)} g
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        {formatNumber(Number(food.fat), 1)} g
                      </td>
                      <td className="rounded-r-2xl px-4 py-3 text-neutral-300">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/foods/manage/${food.id}`}
                            className="rounded-lg border border-emerald-500 px-3 py-1.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500 hover:text-white"
                          >
                            Edit
                          </Link>

                          <DeleteCustomFoodButton foodId={food.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}