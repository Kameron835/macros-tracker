import Link from 'next/link'

export default function EmailConfirmedPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
        <div className="w-full rounded-3xl border border-neutral-800 bg-neutral-900 p-8 text-center shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
            Email Verified
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Your account is ready.
          </h1>

          <p className="mt-4 text-neutral-400">
            Your email has been verified. You can now log in and start tracking
            your nutrition.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-flex w-full justify-center rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-600"
          >
            Go to login
          </Link>
        </div>
      </div>
    </main>
  )
}