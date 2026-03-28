"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { PgThumbnail } from "@/components/features/PgThumbnail";
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

function RatingBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200">
      <span className="text-amber-500" aria-hidden>
        ★
      </span>
      {value.toFixed(1)} / 5
    </span>
  );
}

export function HomePgSearch() {
  const [query, setQuery] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [minRent, setMinRent] = useState("");
  const [minRating, setMinRating] = useState<string>("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<PGCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(
    async (p = 1) => {
      setLoading(true);
      setErr(null);
      try {
        const qs = new URLSearchParams();
        const loc = query.trim();
        if (loc) qs.set("location", loc);
        if (minRent.trim()) qs.set("min_rent", minRent.trim());
        if (maxRent.trim()) qs.set("max_rent", maxRent.trim());
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
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [query, minRent, maxRent, minRating]
  );

  useEffect(() => {
    void load(1);
    // Initial fetch only; further searches use the Search button or pagination.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900">Find a PG</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Search listed PGs by area, minimum rating, and monthly rent.
        </p>
      </div>

      <div className="grid gap-4">
        <Input
          label="Search (location or area)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Koramangala, Bangalore"
          onKeyDown={(e) => {
            if (e.key === "Enter") load(1);
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-700">Minimum rating</span>
            <select
              className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-zinc-900 outline-none focus:ring-2 focus:ring-yellow-400"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="">Any</option>
              <option value="3">3+ stars</option>
              <option value="3.5">3.5+ stars</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </label>
          <Input
            label="Min monthly rent (₹)"
            value={minRent}
            onChange={(e) => setMinRent(e.target.value)}
            placeholder="5000"
            inputMode="numeric"
          />
          <Input
            label="Max monthly rent (₹)"
            value={maxRent}
            onChange={(e) => setMaxRent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") load(1);
            }}
            placeholder="20000"
            inputMode="numeric"
          />
          <div className="flex items-end">
            <Button className="w-full" disabled={loading} type="button" onClick={() => load(1)}>
              {loading ? "Searching…" : "Search"}
            </Button>
          </div>
        </div>
      </div>

      {err ? (
        <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>
      ) : null}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium text-zinc-700">Results</div>
          {total > 0 ? (
            <div className="text-sm text-zinc-500">
              {total} listing{total === 1 ? "" : "s"}
            </div>
          ) : null}
        </div>

        {loading && rows.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-600">
            Loading listings…
          </p>
        ) : rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600">
            No PGs match your filters. Try widening location or rent range.
          </p>
        ) : (
          <ul className="grid gap-3">
            {rows.map((pg) => (
              <li
                key={pg.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  <PgThumbnail src={pg.image} alt={pg.name} />
                  <div className="min-w-0">
                  <div className="font-semibold text-zinc-900">{pg.name}</div>
                  <div className="text-sm text-zinc-600">{pg.location}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-medium text-zinc-900">₹{pg.rent}/mo</span>
                    <RatingBadge value={pg.rating} />
                  </div>
                  {(pg.amenities || []).length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {pg.amenities.slice(0, 5).map((a) => (
                        <span
                          key={a}
                          className="rounded-full bg-white px-2 py-0.5 text-xs text-zinc-600 ring-1 ring-zinc-200"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link href="/signup">
                    <Button variant="secondary" type="button">
                      Sign up to request
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        {rows.length > 0 ? (
          <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
            <Button
              variant="secondary"
              type="button"
              disabled={loading || page <= 1}
              onClick={() => load(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-zinc-500">Page {page}</span>
            <Button
              variant="secondary"
              type="button"
              disabled={loading || page * 10 >= total}
              onClick={() => load(page + 1)}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
