"use client";

import { useEffect, useMemo, useState } from "react";

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

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-zinc-700">{label}</span>
        <span className="text-zinc-900 font-medium">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export default function OwnerFeedbackPage() {
  return (
    <RequireRole role="OWNER">
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [rows, setRows] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [payment, setPayment] = useState(90);
  const [behavior, setBehavior] = useState(85);
  const [property, setProperty] = useState(80);
  const [stability, setStability] = useState(100);
  const [comments, setComments] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setErr(null);
    try {
      const res = await apiFetch<{ data: Item[] }>("/requests/incoming", { auth: true });
      setRows(res.data);
      if (selected) {
        setSelected(res.data.find((x) => x.id === selected.id) ?? null);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const completed = useMemo(
    () => rows.filter((r) => r.status === "COMPLETED"),
    [rows]
  );

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_420px]">
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold text-zinc-900">Feedback</div>
            <div className="text-sm text-zinc-600">
              Submit post-stay ratings (0–100) to update the tenant’s Trust Score.
            </div>
          </div>
          <Button variant="secondary" onClick={load}>
            Refresh
          </Button>
        </div>

        {err ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>
        ) : null}

        {completed.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            No completed stays available yet. Mark an accepted request as completed first.
          </div>
        ) : (
          completed.map((r) => (
            <button
              key={r.id}
              className={`w-full rounded-xl border p-4 text-left transition ${
                selected?.id === r.id
                  ? "border-yellow-300 bg-yellow-50"
                  : "border-zinc-200 bg-white hover:bg-zinc-50"
              }`}
              onClick={() => {
                setSelected(r);
                setMsg(null);
                setErr(null);
              }}
            >
              <div className="text-lg font-semibold text-zinc-900">{r.pg_name}</div>
              <div className="text-sm text-zinc-600">Request: {r.id}</div>
            </button>
          ))
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-medium text-zinc-700">Submit feedback</div>
        {!selected ? (
          <div className="mt-2 text-sm text-zinc-600">Select a completed request.</div>
        ) : (
          <div className="mt-3 grid gap-4">
            <div className="text-sm text-zinc-600">
              For: <span className="font-medium text-zinc-900">{selected.pg_name}</span>
            </div>

            <Slider label="Payment rating" value={payment} onChange={setPayment} />
            <Slider label="Behavior rating" value={behavior} onChange={setBehavior} />
            <Slider label="Property condition" value={property} onChange={setProperty} />
            <Slider label="Stability rating" value={stability} onChange={setStability} />

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-700">Comments (optional)</span>
              <textarea
                className="min-h-20 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-yellow-400"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </label>

            {msg ? (
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</div>
            ) : null}
            {err ? (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>
            ) : null}

            <Button
              disabled={loading}
              onClick={async () => {
                if (!selected) return;
                setLoading(true);
                setMsg(null);
                setErr(null);
                try {
                  const res = await apiFetch<{ new_trust_score: number }>("/feedback/submit", {
                    method: "POST",
                    auth: true,
                    body: JSON.stringify({
                      request_id: selected.id,
                      payment_rating: payment,
                      behavior_rating: behavior,
                      property_rating: property,
                      stability_rating: stability,
                      comments: comments || null,
                    }),
                  });
                  setMsg(`Submitted. New trust score: ${res.new_trust_score}`);
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "Failed");
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Submitting..." : "Submit feedback"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

