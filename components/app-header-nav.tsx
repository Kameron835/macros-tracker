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
    // 👇 Add `relative` here so the dropdown anchors to this element
    <div className="relative flex items-center gap-3">
      <Link
        href="/foods/barcode"
        className="rounded-xl border border-emerald-500 px-4 py-2 text-sm font-medium text-emerald-300"
      >
        Barcode
      </Link>

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="rounded-xl border border-emerald-500 px-4 py-2 text-sm font-medium text-emerald-300"
      >
        Menu
      </button>

      {isOpen ? (
        // 👇 Replace `left-6 right-6 top-28` with `right-0 top-full mt-2`
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-neutral-800 bg-neutral-950 p-3 shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-neutral-300 hover:bg-neutral-900 hover:text-emerald-400"
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
  )
}