'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SignOutButton from '@/components/sign-out-button'

type AppHeaderNavProps = {
  isSignedIn: boolean
}

export default function AppHeaderNav({ isSignedIn }: AppHeaderNavProps) {
  const pathname = usePathname()

  if (!isSignedIn || pathname === '/') {
    return null
  }

  return (
    <nav className="hidden items-center gap-6 md:flex">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-neutral-300 transition hover:text-emerald-400"
      >
        Dashboard
      </Link>

      <Link
        href="/goals"
        className="text-sm font-medium text-neutral-300 transition hover:text-emerald-400"
      >
        Goals
      </Link>

      <Link
        href="/foods/new"
        className="text-sm font-medium text-neutral-300 transition hover:text-emerald-400"
      >
        New Food
      </Link>

      <Link
        href="/foods/manage"
        className="text-sm font-medium text-neutral-300 transition hover:text-emerald-400"
      >
        Manage Foods
      </Link>

      <SignOutButton />
    </nav>
  )
}