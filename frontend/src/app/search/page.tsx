"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PgThumbnail } from "@/components/features/PgThumbnail";
import { LandingNav } from "@/components/layout/LandingNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";

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
      <LandingNav />

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

        <div className="grid gap-3">
          {rows.length === 0 && !loading ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
              No PGs found. Try different filters.
            </div>
          ) : null}

          {rows.map((pg) => (
            <div
              key={pg.id}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex min-w-0 gap-3">
                <PgThumbnail src={pg.image} alt={pg.name} />
                <div className="min-w-0">
                <div className="text-lg font-semibold text-zinc-900">{pg.name}</div>
                <div className="text-sm text-zinc-600">{pg.location}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-900">
                  <span>₹{pg.rent}/month</span>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-900 ring-1 ring-amber-200">
                    ★ {pg.rating.toFixed(1)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(pg.amenities || []).slice(0, 4).map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link href={`/pg/${pg.id}`}>
                  <Button variant="secondary">View Details</Button>
                </Link>
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
