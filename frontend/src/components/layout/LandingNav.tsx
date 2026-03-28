import Link from "next/link";

const linkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-400";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-zinc-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg"
        >
          PG Trust
        </Link>

        <nav
          className="flex flex-1 flex-wrap items-center justify-center gap-1 sm:justify-end md:justify-center"
          aria-label="Main"
        >
          <Link href="/search" className={linkClass}>
            PG Search
          </Link>
          <Link href="/tenant/dashboard" className={linkClass}>
            My Trust Score
          </Link>
          <Link href="/owner/properties" className={linkClass}>
            PG List
          </Link>
        </nav>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-black hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
