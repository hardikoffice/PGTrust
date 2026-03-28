import Link from "next/link";

import { HomePgSearch } from "@/components/features/HomePgSearch";
import { LandingNav } from "@/components/layout/LandingNav";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <LandingNav />

      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
              A Trust Score for PG rentals.
            </h1>
            <p className="text-lg leading-8 text-zinc-600">
              PG Trust helps owners vet tenants and helps tenants build a verified
              reputation through identity verification, booking requests, and
              post-stay feedback.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                href="/signup"
              >
                Get started
              </Link>
              <Link
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                href="/search"
              >
                Browse PGs
              </Link>
              <Link
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                href="/login"
              >
                I already have an account
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-zinc-600">
              Trust Score ranges from
            </div>
            <div className="mt-2 text-5xl font-semibold tracking-tight text-zinc-900">
              0–1000
            </div>
            <div className="mt-4 grid gap-2 text-sm text-zinc-600">
              <div>
                <span className="font-medium text-zinc-900">Verified ID</span>{" "}
                unlocks booking requests.
              </div>
              <div>
                <span className="font-medium text-zinc-900">Owners</span>{" "}
                evaluate stays with 0–100 ratings.
              </div>
              <div>
                <span className="font-medium text-zinc-900">Scores</span>{" "}
                update instantly when feedback is submitted.
              </div>
            </div>
          </div>
        </div>

        <HomePgSearch />
      </main>
    </div>
  );
}
