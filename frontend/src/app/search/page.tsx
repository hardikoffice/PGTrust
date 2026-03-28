"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PgThumbnail } from "@/components/features/PgThumbnail";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Search PGs</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Browse listings without signing in.{" "}
            <Link href="/signup" className="font-medium text-zinc-900 underline">
              Create an account
            </Link>{" "}
            to send booking requests.
          </p>
        </div>

        <div className="mb-6 grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-5">
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Area or city..."
          />
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-700">Min rating</span>
            <select
              className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-zinc-900 outline-none focus:ring-2 focus:ring-yellow-400"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="">Any</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="4.5">4.5+</option>
            </select>
          </label>
          <Input
            label="Min rent (₹/mo)"
            value={minRent}
            onChange={(e) => setMinRent(e.target.value)}
            placeholder="5000"
            inputMode="numeric"
          />
          <Input
            label="Max rent (₹/mo)"
            value={maxRent}
            onChange={(e) => setMaxRent(e.target.value)}
            placeholder="12000"
            inputMode="numeric"
          />
          <div className="flex items-end">
            <Button className="w-full" disabled={loading} onClick={() => load(1)}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

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
