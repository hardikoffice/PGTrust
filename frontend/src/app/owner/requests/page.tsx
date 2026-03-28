"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

type Item = {
  id: string;
  pg_id: string;
  pg_name: string;
  tenant_id: string;
  tenant_name: string;
  tenant_trust_score: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
  move_in_date: string;
  is_moving_out?: boolean;
  move_in_image?: string | null;
  move_out_image?: string | null;
  move_in_image_verified?: boolean;
  move_out_image_verified?: boolean;
};

export default function OwnerRequestsPage() {
  return (
    <RequireRole role="OWNER">
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [rows, setRows] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [verifying, setVerifying] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const res = await apiFetch<{ data: Item[] }>("/requests/incoming", { auth: true });
      setRows(res.data);
      if (selected) {
        const next = res.data.find((r) => r.id === selected.id) ?? null;
        setSelected(next);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!selected || selected.status !== "PENDING") {
      setCooldown(0);
      return;
    }
    setCooldown(2);
    const t = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [selected?.id, selected?.status]);

  const pendingCount = useMemo(
    () => rows.filter((r) => r.status === "PENDING").length,
    [rows]
  );

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_420px]">
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold text-zinc-900">Tenant requests</div>
            <div className="text-sm text-zinc-600">
              Pending: {pendingCount}. Select a request to act.
            </div>
          </div>
          <Button variant="secondary" onClick={load}>
            Refresh
          </Button>
        </div>

        {err ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>
        ) : null}

        {rows.map((r) => (
          <button
            key={r.id}
            className={`w-full rounded-xl border p-4 text-left transition ${
              selected?.id === r.id
                ? "border-yellow-300 bg-yellow-50"
                : "border-zinc-200 bg-white hover:bg-zinc-50"
            }`}
            onClick={() => setSelected(r)}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold text-zinc-900">
                  {r.pg_name}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <span>{r.tenant_name}</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-300" />
                  <span className="font-medium text-emerald-600">Score: {r.tenant_trust_score}</span>
                </div>
                <div className="text-sm text-zinc-500 mt-1">Move-in: {r.move_in_date}</div>
              </div>
              <div className="text-xs font-medium text-zinc-700">{r.status}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-medium text-zinc-700">Review</div>
        {!selected ? (
          <div className="mt-2 text-sm text-zinc-600">Select a request on the left.</div>
        ) : (
          <div className="mt-3 grid gap-3">
            <div>
              <div className="text-lg font-semibold text-zinc-900">{selected.pg_name}</div>
              <div className="text-sm text-zinc-600">Status: {selected.status}</div>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-100">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Tenant Information</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-zinc-900">{selected.tenant_name}</div>
                  <div className="text-sm text-emerald-600 font-semibold">Trust Score: {selected.tenant_trust_score}</div>
                </div>
                <Link 
                  href={`/owner/tenant/${selected.tenant_id}`}
                  className="text-xs font-bold text-yellow-600 hover:text-yellow-700 underline underline-offset-4"
                >
                  View Profile
                </Link>
              </div>
            </div>

            {selected.status === "PENDING" ? (
              <div className="grid gap-2">
                <div className="text-xs text-zinc-500">
                  Accept is enabled after {cooldown}s (deliberate friction).
                </div>
                <div className="flex gap-2">
                  <Button
                    disabled={cooldown > 0}
                    onClick={async () => {
                      await apiFetch(`/requests/${selected.id}/status`, {
                        method: "PATCH",
                        auth: true,
                        body: JSON.stringify({ status: "ACCEPTED" }),
                      });
                      await load();
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      await apiFetch(`/requests/${selected.id}/status`, {
                        method: "PATCH",
                        auth: true,
                        body: JSON.stringify({ status: "REJECTED" }),
                      });
                      await load();
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Image Verification Section */}
            {selected.status === "ACCEPTED" && (selected.move_in_image || selected.move_out_image) && (
              <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-100">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">📸 Property Images</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {selected.move_in_image && (
                    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
                      <div className="relative h-32 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selected.move_in_image} alt="Move-in" className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">Move-In</div>
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        {selected.move_in_image_verified ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">✓ Verified</span>
                        ) : (
                          <Button
                            variant="secondary"
                            className="text-xs py-1 px-3"
                            disabled={verifying === 'move_in'}
                            onClick={async () => {
                              setVerifying('move_in');
                              try {
                                const fd = new FormData();
                                fd.append('image_type', 'move_in');
                                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests/${selected.id}/verify-image`, {
                                  method: 'POST',
                                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                  body: fd,
                                }).then(async r => {
                                  const data = await r.json();
                                  if (!r.ok) throw new Error(data.detail || 'Failed');
                                  alert(data.message);
                                });
                                await load();
                              } catch (e) {
                                alert(e instanceof Error ? e.message : 'Failed');
                              } finally {
                                setVerifying(null);
                              }
                            }}
                          >
                            {verifying === 'move_in' ? 'Verifying...' : 'Verify'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  {selected.move_out_image && (
                    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
                      <div className="relative h-32 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selected.move_out_image} alt="Move-out" className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">Move-Out</div>
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        {selected.move_out_image_verified ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">✓ Verified</span>
                        ) : (
                          <Button
                            variant="secondary"
                            className="text-xs py-1 px-3"
                            disabled={verifying === 'move_out'}
                            onClick={async () => {
                              setVerifying('move_out');
                              try {
                                const fd = new FormData();
                                fd.append('image_type', 'move_out');
                                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests/${selected.id}/verify-image`, {
                                  method: 'POST',
                                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                  body: fd,
                                }).then(async r => {
                                  const data = await r.json();
                                  if (!r.ok) throw new Error(data.detail || 'Failed');
                                  alert(data.message);
                                });
                                await load();
                              } catch (e) {
                                alert(e instanceof Error ? e.message : 'Failed');
                              } finally {
                                setVerifying(null);
                              }
                            }}
                          >
                            {verifying === 'move_out' ? 'Verifying...' : 'Verify'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {selected.move_in_image_verified && selected.move_out_image_verified && (
                  <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 text-center">🤖 AI Damage Assessment completed automatically!</div>
                )}
              </div>
            )}

            {selected.status === "ACCEPTED" ? (
              <div className="grid gap-2">
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await apiFetch(`/requests/${selected.id}/status`, {
                      method: "PATCH",
                      auth: true,
                      body: JSON.stringify({ status: "COMPLETED" }),
                    });
                    await load();
                  }}
                >
                  Mark completed
                </Button>
                <div className="text-xs text-zinc-500">
                  After completion, submit feedback in the Feedback tab.
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

