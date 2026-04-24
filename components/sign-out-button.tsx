'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-lg border border-red-500/50 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500 hover:text-white"
    >
      Sign out
    </button>
  )
}