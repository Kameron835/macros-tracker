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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/brand/header-logo.svg"
            alt="Strong Man Dam's Nutrition"
            width={260}
            height={100}
            className="h-20 w-auto object-contain sm:h-24"
            priority
          />
        </Link>

        <AppHeaderNav isSignedIn={!!user} />
      </div>
    </header>
  )
}