"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PgThumbnail } from "@/components/features/PgThumbnail";
import { Button } from "@/components/ui/Button";
import { apiFetch, resolveMediaUrl } from "@/lib/api";

type PGCard = {
  id: string;
  name: string;
  location: string;
  rent: number;
  rating: number;
  amenities: string[];
  image?: string | null;
};

export default function PublicSearchPage() {
  const [location, setLocation] = useState("");
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [minRating, setMinRating] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<PGCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load(p = 1) {
    setLoading(true);
    setErr(null);
    try {
      const qs = new URLSearchParams();
      if (location) qs.set("location", location);
      if (minRent) qs.set("min_rent", minRent);
      if (maxRent) qs.set("max_rent", maxRent);
      if (minRating) qs.set("min_rating", minRating);
      qs.set("page", String(p));
      const res = await apiFetch<{ page: number; total_results: number; data: PGCard[] }>(
        `/pg/search?${qs.toString()}`
      );
      setRows(res.data);
      setTotal(res.total_results);
      setPage(res.page);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">

      {/* Hero Search Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h60v60H0z\' fill=\'none\' stroke=\'white\' stroke-width=\'.5\'/%3E%3C/svg%3E")' }} />
        {/* Gradient Orbs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-5xl px-4 pb-14 pt-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-yellow-400 backdrop-blur-sm mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
              Verified Listings
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">PG Stay</span>
            </h1>
            <p className="mt-3 text-base text-zinc-400 max-w-xl mx-auto">
              Browse trusted properties with verified reviews.{" "}
              <Link href="/signup" className="font-semibold text-yellow-400 hover:text-yellow-300 underline underline-offset-4 decoration-yellow-400/30 transition-colors">
                Create an account
              </Link>{" "}
              to send booking requests.
            </p>
          </div>

          {/* Search Bar */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-1.5 backdrop-blur-xl shadow-2xl shadow-black/20">
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
              {/* Location */}
              <div className="relative lg:col-span-1">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Area or city..."
                  className="h-12 w-full rounded-xl bg-white/10 pl-10 pr-4 text-sm font-medium text-white placeholder-zinc-500 outline-none transition-all focus:bg-white/15 focus:ring-2 focus:ring-yellow-400/40"
                />
              </div>

              {/* Min Rating */}
              <div className="relative lg:col-span-1">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-yellow-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                </div>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl bg-white/10 pl-10 pr-4 text-sm font-medium text-white outline-none transition-all focus:bg-white/15 focus:ring-2 focus:ring-yellow-400/40 [&>option]:text-zinc-900"
                >
                  <option value="">Any rating</option>
                  <option value="3">3+ stars</option>
                  <option value="4">4+ stars</option>
                  <option value="4.5">4.5+ stars</option>
                </select>
              </div>

              {/* Min Rent */}
              <div className="relative lg:col-span-1">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">₹</div>
                <input
                  value={minRent}
                  onChange={(e) => setMinRent(e.target.value)}
                  placeholder="Min rent"
                  inputMode="numeric"
                  className="h-12 w-full rounded-xl bg-white/10 pl-10 pr-4 text-sm font-medium text-white placeholder-zinc-500 outline-none transition-all focus:bg-white/15 focus:ring-2 focus:ring-yellow-400/40"
                />
              </div>

              {/* Max Rent */}
              <div className="relative lg:col-span-1">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">₹</div>
                <input
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  placeholder="Max rent"
                  inputMode="numeric"
                  className="h-12 w-full rounded-xl bg-white/10 pl-10 pr-4 text-sm font-medium text-white placeholder-zinc-500 outline-none transition-all focus:bg-white/15 focus:ring-2 focus:ring-yellow-400/40"
                />
              </div>

              {/* Search Button */}
              <button
                disabled={loading}
                onClick={() => load(1)}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 font-bold text-zinc-900 shadow-lg shadow-yellow-400/20 transition-all hover:shadow-xl hover:shadow-yellow-400/30 hover:brightness-110 active:scale-[0.98] disabled:from-zinc-600 disabled:to-zinc-600 disabled:text-zinc-400 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Search
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          {total > 0 && (
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-400 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {total} {total === 1 ? "property" : "properties"} found
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8">

        {err ? (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.length === 0 && !loading ? (
            <div className="col-span-full rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center text-sm text-zinc-500">
              No properties found matching your criteria. Try adjusting your filters.
            </div>
          ) : null}

          {rows.map((pg) => (
            <div
              key={pg.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-xl hover:shadow-black/5 hover:ring-1 hover:ring-zinc-300"
            >
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-zinc-100">
                {pg.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveMediaUrl(pg.image)}
                    alt={pg.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-medium uppercase tracking-widest text-zinc-400">
                    No Photo
                  </div>
                )}
                {/* Floating Rating Badge */}
                <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-zinc-900 shadow-sm backdrop-blur-md">
                  <span className="text-yellow-500">★</span> {pg.rating.toFixed(1)}
                </div>
              </div>
              
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-zinc-900 line-clamp-1">{pg.name}</h3>
                    <p className="text-sm font-medium text-zinc-500 line-clamp-1">{pg.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-xl font-black tabular-nums tracking-tight text-zinc-900">₹{pg.rent}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">/ mo</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(pg.amenities || []).slice(0, 3).map((a) => (
                    <span
                      key={a}
                      className="rounded-lg bg-zinc-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600"
                    >
                      {a}
                    </span>
                  ))}
                  {(pg.amenities || []).length > 3 && (
                    <span className="rounded-lg bg-zinc-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      +{(pg.amenities || []).length - 3}
                    </span>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <Link href={`/pg/${pg.id}`} className="w-full">
                    <Button variant="secondary" className="w-full font-semibold">View Property</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-zinc-600">
            {total ? `Page ${page} · ${total} total` : null}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={loading || page <= 1}
              onClick={() => load(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={loading || page * 10 >= total}
              onClick={() => load(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
