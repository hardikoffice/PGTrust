"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

type Item = {
  id: string;
  pg_id: string;
  pg_name: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
  move_in_date: string;
};

function statusBadge(s: Item["status"]) {
  const base = "rounded-full px-2 py-1 text-xs font-medium";
  if (s === "PENDING") return `${base} bg-zinc-100 text-zinc-700`;
  if (s === "ACCEPTED") return `${base} bg-emerald-100 text-emerald-800`;
  if (s === "REJECTED") return `${base} bg-red-100 text-red-800`;
  return `${base} bg-blue-100 text-blue-800`;
}

export default function TenantRequestsPage() {
  return (
    <RequireRole role="TENANT">
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [rows, setRows] = useState<Item[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const res = await apiFetch<{ data: Item[] }>("/requests/my", { auth: true });
      setRows(res.data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold text-zinc-900">My requests</div>
          <div className="text-sm text-zinc-600">
            Track status (Pending / Accepted / Rejected).
          </div>
        </div>
        <Button variant="secondary" onClick={load}>
          Refresh
        </Button>
      </div>

      {err ? (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
          You haven&apos;t requested any PGs yet.{" "}
          <Link className="font-medium text-zinc-900 underline" href="/tenant/search">
            Click here to start searching
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold text-zinc-900">
                    {r.pg_name}
                  </div>
                  <div className="text-sm text-zinc-600">Move-in: {r.move_in_date}</div>
                </div>
                <span className={statusBadge(r.status)}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

