import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BarcodeFoodForm from '@/components/dashboard/barcode-food-form'

export default async function BarcodeLookupPage() {
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
              Foods
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Barcode Lookup
            </h1>

            <p className="mt-3 text-neutral-300">
              Import packaged foods using a UPC or EAN barcode.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-500/10"
          >
            Back to dashboard
          </Link>
        </div>

        <BarcodeFoodForm />
      </div>
    </main>
  )
}