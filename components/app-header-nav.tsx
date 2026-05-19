'use client'

import { useState, useEffect } from 'react'
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

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const hideNav =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/auth')

  if (hideNav) return null

  return (
    <div className="relative flex items-center gap-3">
      <Link
        href="/foods/barcode"
        className="rounded-xl border border-emerald-500 px-4 py-2 text-sm font-medium text-emerald-300"
      >
        Barcode
      </Link>

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="rounded-xl border border-emerald-500 px-4 py-2 text-sm font-medium text-emerald-300"
      >
        {isOpen ? 'Close' : 'Menu'}
      </button>

      {isOpen && (
        <>
          {/* Full-screen backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer panel anchored to top of viewport */}
          <div className="fixed left-0 right-0 top-0 z-50 rounded-b-2xl border-b border-neutral-800 bg-neutral-950 p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-400">Navigation</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300"
              >
                Close
              </button>
            </div>

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
        </>
      )}
    </div>
  )
}