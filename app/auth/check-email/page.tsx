import Link from 'next/link'

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
        <div className="w-full rounded-3xl border border-neutral-800 bg-neutral-900 p-8 text-center shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
            Check Your Email
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Verify your account.
          </h1>

          <p className="mt-4 text-neutral-400">
            We sent you a confirmation link. Open your email and click the link
            to finish creating your account.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-flex w-full justify-center rounded-xl border border-emerald-500/40 px-4 py-3 font-medium text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-500/10"
          >
            Back to login
          </Link>
        </div>
      </div>
    </main>
  )
}