import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RecipeUrlImportForm from '@/components/recipes/recipe-url-import-form'

export default async function ImportRecipePage() {
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
              Import Recipe
            </h1>

            <p className="mt-3 text-neutral-300">
              Extract recipe details from a URL, then review and save.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/recipes/new"
              className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-500/10"
            >
              New recipe
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        <RecipeUrlImportForm />
      </div>
    </main>
  )
}