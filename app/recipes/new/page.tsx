import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreateRecipeForm from '@/components/recipes/create-recipe-form'

export default async function NewRecipePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
              Recipes
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              New Recipe
            </h1>

            <p className="mt-3 text-neutral-300">
              Create a recipe first, then add ingredients and calculate
              estimated nutrition.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/recipes/import"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
            >
              Import from URL
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-500/10"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        <CreateRecipeForm />
      </div>
    </main>
  )
}