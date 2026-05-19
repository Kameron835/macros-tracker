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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/brand/header-logo.svg"
            alt="Strong Man Dam's Nutrition"
            width={220}
            height={90}
            className="h-12 w-auto max-w-[160px] object-contain sm:h-20 sm:max-w-none"
            priority
          />
        </Link>

        <AppHeaderNav isSignedIn={!!user} />
      </div>
    </header>
  )
}