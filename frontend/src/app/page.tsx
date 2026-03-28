import Link from "next/link";

import { HomePgSearch } from "@/components/features/HomePgSearch";
import { LandingHero } from "@/components/features/LandingHero";
import { LandingNav } from "@/components/layout/LandingNav";
import { TrustScoreHomeCard } from "@/components/features/TrustScoreHomeCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <LandingNav />

      <main className="mx-auto max-w-5xl px-4 py-12">
        <LandingHero />

        <div className="mt-10 grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
              A Trust Score for PG rentals.
            </h2>
            <p className="text-lg leading-8 text-zinc-600">
              PG Trust helps owners vet tenants and helps tenants build a verified
              reputation through identity verification, booking requests, and
              post-stay feedback.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                href="/signup?next=/"
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
                href="/login?next=/"
              >
                I already have an account
              </Link>
            </div>
          </div>

          <TrustScoreHomeCard />
        </div>

        <HomePgSearch />
      </main>
    </div>
  );
}
