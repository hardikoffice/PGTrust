"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { setToken } from "@/lib/api";

const linkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-400";

export function LandingNav() {
  const router = useRouter();
  const { profile, loading, logout } = useAuth();

  const authed = !!profile;
  const unassigned = profile?.role === "UNASSIGNED";
  const tenant = profile?.role === "TENANT";
  const owner = profile?.role === "OWNER";

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/50 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
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
          {!tenant && (
            <Link
              href={
                authed
                  ? owner
                    ? "/owner/properties"
                    : "/role"
                  : "/signup?next=/owner/properties"
              }
              className={linkClass}
            >
              List PG
            </Link>
          )}
          <Link
            href={
              authed
                ? tenant
                  ? "/tenant/dashboard"
                  : owner
                    ? "/owner/dashboard"
                    : "/role"
                : "/signup?next=/tenant/dashboard"
            }
            className={linkClass}
          >
            My Trust Score
          </Link>
          {authed && (
            <Link
              href={tenant ? "/tenant/profile" : "/owner/profile"}
              className={linkClass}
            >
              Profile
            </Link>
          )}
        </nav>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          {loading ? (
            <span className="text-sm text-zinc-400">…</span>
          ) : authed ? (
            <>
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                onClick={() => {
                  logout();
                  router.push("/");
                  router.refresh();
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
