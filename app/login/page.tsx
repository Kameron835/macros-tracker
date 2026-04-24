'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
        <div className="w-full rounded-3xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-emerald-400">
            Welcome Back
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Sign in to your account
          </h1>

          <p className="mt-4 text-neutral-400">
            Continue tracking your nutrition, goals, and daily progress.
          </p>

          <form onSubmit={handleLogin} className="mt-10 space-y-5">
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}