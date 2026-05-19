'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SignOutButton from '@/components/sign-out-button'

type AppHeaderNavProps = {
  isSignedIn: boolean
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/goals', label: 'Goals' },
  { href: '/foods/new', label: 'New Food' },
  { href: '/foods/manage', label: 'Manage Foods' },
  { href: '/foods/barcode', label: 'Barcode Lookup' },
]

export default function AppHeaderNav({ isSignedIn }: AppHeaderNavProps) {
  const pathname = usePathname()

  const hideNav =
    !isSignedIn ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/auth')

  if (hideNav) {
    return null
  }

  return (
    <nav className="hidden items-center gap-6 lg:flex">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-medium transition ${
            pathname === link.href
              ? 'text-emerald-400'
              : 'text-neutral-300 hover:text-emerald-400'
          }`}
        >
          {link.label}
        </Link>
      ))}

      <SignOutButton />
    </nav>
  )
}