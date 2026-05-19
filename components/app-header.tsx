import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AppHeaderNav from '@/components/app-header-nav'

export default async function AppHeader() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/brand/header-logo.svg"
            alt="Strong Man Dam's Nutrition"
            width={260}
            height={100}
            className="h-20 w-auto object-contain"
            priority
          />
        </Link>

        <AppHeaderNav isSignedIn={!!user} />
      </div>
    </header>
  )
}