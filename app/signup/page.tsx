'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirmed`,
        data: {
          display_name: displayName,
        },
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    if (data.user) {
      router.push('/auth/check-email')
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
        <div className="w-full rounded-3xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-emerald-400">
            Create Account
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Start your nutrition journey
          </h1>

          <p className="mt-4 text-neutral-400">
            Build your profile and begin tracking your macros with precision.
          </p>

          <form onSubmit={handleSignup} className="mt-10 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Display name
              </label>

              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                placeholder="Kam"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition focus:border-emerald-500"
              />
            </div>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-neutral-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}