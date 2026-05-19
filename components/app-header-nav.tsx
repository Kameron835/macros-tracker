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

  if (!isSignedIn || pathname === '/') {
    return null
  }

  return (
    <div className="relative">
      <nav className="hidden items-center gap-6 md:flex">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-neutral-300 transition hover:text-emerald-400"
          >
            {link.label}
          </Link>
        ))}

        <SignOutButton />
      </nav>

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="inline-flex items-center rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-emerald-500 hover:text-emerald-300 md:hidden"
      >
        Menu
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-neutral-800 bg-neutral-950 p-3 shadow-2xl md:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-neutral-300 transition hover:bg-neutral-900 hover:text-emerald-400"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2">
              <SignOutButton />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}