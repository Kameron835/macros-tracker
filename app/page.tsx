import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-70"
        style={{
          backgroundImage: "url('/brand/login-bg.svg')",
        }}
      />

      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-emerald-400">
            Macro Tracker
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Build your physique with precision nutrition.
          </h1>

          <p className="mt-6 text-lg text-neutral-300">
            Build your nutrition dashboard with saved profiles, daily food logs,
            and professional progress tracking.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-emerald-500 px-5 py-3 font-medium text-white transition hover:bg-emerald-600"
            >
              Create account
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-emerald-500/40 px-5 py-3 font-medium text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-500/10"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}