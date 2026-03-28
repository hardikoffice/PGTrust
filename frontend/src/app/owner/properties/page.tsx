"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PgThumbnail } from "@/components/features/PgThumbnail";
import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

type PG = {
  id: string;
  name: string;
  location: string;
  rent: number;
  rating: number;
  active: boolean;
  coverImage?: string | null;
};

type PGDetailResponse = {
  id: string;
  name: string;
  location: string;
  rent: number;
  rating: number;
  active: boolean;
  images?: string[] | null;
};

export default function OwnerPropertiesPage() {
  return (
    <RequireRole role="OWNER">
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [rows, setRows] = useState<PG[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const res = await apiFetch<PGDetailResponse[]>("/pg/mine", { auth: true });
      setRows(
        res.map((x) => ({
          id: x.id,
          name: x.name,
          location: x.location,
          rent: x.rent,
          rating: x.rating,
          active: x.active,
          coverImage: x.images?.[0] ?? null,
        }))
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function removePg(id: string, name: string) {
    if (
      !confirm(
        `Remove “${name}” from listings? It will no longer appear in search. You can still see it here as removed.`
      )
    ) {
      return;
    }
    setErr(null);
    setRemovingId(id);
    try {
      await apiFetch<{ message: string }>(`/pg/${id}`, { method: "DELETE", auth: true });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to remove");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold text-zinc-900">Properties</div>
          <div className="text-sm text-zinc-600">Your PG listings.</div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={load}>
            Refresh
          </Button>
          <Link href="/owner/properties/new">
            <Button>Add new</Button>
          </Link>
        </div>
      </div>

      {err ? (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
          No properties yet.{" "}
          <Link className="font-medium text-zinc-900 underline" href="/owner/properties/new">
            Create your first listing
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map((pg) => (
            <div
              key={pg.id}
              className={`rounded-xl border bg-white p-4 ${
                pg.active ? "border-zinc-200" : "border-zinc-200 opacity-75"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <PgThumbnail src={pg.coverImage} alt={pg.name} />
                  <div className="min-w-0">
                    <Link href={`/owner/properties/${pg.id}/residents`} className="hover:underline">
                      <div className="truncate text-lg font-semibold text-zinc-900">{pg.name}</div>
                    </Link>
                    <div className="text-sm text-zinc-600">{pg.location}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 sm:shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-zinc-900">₹{pg.rent}</div>
                    <div className="text-xs text-amber-800">★ {pg.rating.toFixed(1)}</div>
                    <div className="text-xs text-zinc-500">
                      {pg.active ? (
                        <span className="text-emerald-700">Live</span>
                      ) : (
                        <span className="text-zinc-600">Removed</span>
                      )}
                    </div>
                  </div>
                  {pg.active ? (
                    <Button
                      variant="secondary"
                      className="border-red-200 text-red-800 hover:bg-red-50"
                      disabled={removingId === pg.id}
                      onClick={() => void removePg(pg.id, pg.name)}
                    >
                      {removingId === pg.id ? "Removing…" : "Remove listing"}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

