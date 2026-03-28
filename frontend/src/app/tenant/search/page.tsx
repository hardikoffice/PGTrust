"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PgThumbnail } from "@/components/features/PgThumbnail";
import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
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

export default function TenantSearchPage() {
  return (
    <RequireRole role="TENANT">
      <TenantSearchInner />
    </RequireRole>
  );
}

function TenantSearchInner() {
  const { profile } = useAuth();
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

  const verified = profile?.tenant_data?.verification_status === "VERIFIED";

  return (
    <div className="grid gap-6">
      <div>
        <div className="text-2xl font-semibold text-zinc-900">Search PGs</div>
        <div className="text-sm text-zinc-600">
          Filter by location and budget. Requests require verification.
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-5">
        <Input
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Koramangala..."
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
          label="Min rent (₹)"
          value={minRent}
          onChange={(e) => setMinRent(e.target.value)}
          placeholder="5000"
          inputMode="numeric"
        />
        <Input
          label="Max rent (₹)"
          value={maxRent}
          onChange={(e) => setMaxRent(e.target.value)}
          placeholder="12000"
          inputMode="numeric"
        />
        <div className="flex items-end gap-2">
          <Button
            className="w-full"
            disabled={loading}
            onClick={() => load(1)}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {err ? (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <div className="grid gap-3">
        {rows.length === 0 && !loading ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            No PGs found. Try adjusting filters.
          </div>
        ) : null}

        {rows.map((pg) => (
          <div
            key={pg.id}
            className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex min-w-0 gap-3">
              <Link href={`/tenant/pg/${pg.id}`} className="shrink-0">
                <PgThumbnail src={pg.image} alt={pg.name} />
              </Link>
              <div className="min-w-0">
              <Link
                href={`/tenant/pg/${pg.id}`}
                className="text-lg font-semibold text-zinc-900 hover:underline"
              >
                {pg.name}
              </Link>
              <div className="text-sm text-zinc-600">{pg.location}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-900">
                <span>₹{pg.rent}/month</span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-900 ring-1 ring-amber-200">
                  ★ {pg.rating.toFixed(1)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(pg.amenities || []).slice(0, 3).map((a) => (
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

            <div className="flex gap-2">
              <Link href={`/tenant/pg/${pg.id}`}>
                <Button variant="secondary">View</Button>
              </Link>
              <Button
                disabled={!verified}
                onClick={async () => {
                  try {
                    await apiFetch("/requests/create", {
                      method: "POST",
                      auth: true,
                      body: JSON.stringify({
                        pg_id: pg.id,
                        move_in_date: new Date().toISOString().slice(0, 10),
                      }),
                    });
                    alert("Request sent (PENDING).");
                  } catch (e) {
                    alert(e instanceof Error ? e.message : "Failed");
                  }
                }}
              >
                Request
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-600">
          {total ? `Showing page ${page}. Total: ${total}` : null}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={loading || page <= 1}
            onClick={() => load(page - 1)}
          >
            Prev
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
    </div>
  );
}

