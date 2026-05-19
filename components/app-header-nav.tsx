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
  { href: '/foods/manage', label: 'Manage' },
  { href: '/foods/barcode', label: 'Barcode' },
]

export default function AppHeaderNav({
  isSignedIn,
}: AppHeaderNavProps) {
  const pathname = usePathname()

  const hideNav =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/auth')

  if (hideNav) {
    return null
  }

  return (
    <>
      {/* Desktop nav */}
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

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-neutral-800 bg-neutral-950/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {navLinks.map((link) => {
            const active = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center px-2 py-3 text-[11px] font-medium transition ${
                  active
                    ? 'text-emerald-400'
                    : 'text-neutral-300'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}