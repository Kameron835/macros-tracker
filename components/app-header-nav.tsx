'use client'

import { useState } from 'react'
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
  const [isOpen, setIsOpen] = useState(false)

  const hideNav =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/auth')

  if (hideNav) {
    return null
  }

  return (
    <div className="relative">
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

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="rounded-xl border border-emerald-500/50 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10"
        >
          {isOpen ? 'Close' : 'Menu'}
        </button>

        {isOpen ? (
          <div className="absolute right-0 top-12 z-[9999] w-64 rounded-2xl border border-neutral-800 bg-neutral-950 p-3 shadow-2xl">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  pathname === link.href
                    ? 'bg-emerald-500 text-white'
                    : 'text-neutral-300 hover:bg-neutral-900 hover:text-emerald-400'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 border-t border-neutral-800 pt-3">
              <SignOutButton />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}