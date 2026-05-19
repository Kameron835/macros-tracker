return (
  <div className="flex items-center gap-3">
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
      <div className="absolute left-6 right-6 top-28 z-50 rounded-2xl border border-neutral-800 bg-neutral-950 p-3 shadow-2xl">
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