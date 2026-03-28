"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

type MoveOutRequest = {
  id: string;
  pg_id: string;
  pg_name: string;
  tenant_id: string;
  tenant_name: string;
  tenant_trust_score: number;
  status: string;
  move_in_date: string;
  is_moving_out: boolean;
};

export default function MoveOutApprovalsPage() {
  return (
    <RequireRole role="OWNER">
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [requests, setRequests] = useState<MoveOutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Modal State
  const [selectedReq, setSelectedReq] = useState<MoveOutRequest | null>(null);
  const [form, setForm] = useState({ payment: 50, behavior: 50, property: 50, stability: 50, comments: "" });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setErr(null);
    try {
      const res = await apiFetch<{ data: MoveOutRequest[] }>("/requests/owner/move-outs", { auth: true });
      setRequests(res.data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load move-out requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedReq) return;
    setSubmitting(true);
    setErr(null);
    try {
      await apiFetch(`/requests/${selectedReq.id}/complete-move-out`, {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          payment_rating: Number(form.payment),
          behavior_rating: Number(form.behavior),
          property_rating: Number(form.property),
          stability_rating: Number(form.stability),
          comments: form.comments || null
        })
      });
      alert("Move-out approved and feedback submitted!");
      setSelectedReq(null);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to approve move-out");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl py-12 px-6">
      <div className="mb-8">
        <Link href="/owner/dashboard" className="text-sm font-medium text-emerald-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-zinc-900">
          Move-Out Approvals
        </h1>
        <p className="mt-2 text-zinc-600 max-w-2xl">
          Tenants who have requested to leave your property. Providing feedback on their stay affects their decentralized Trust Score.
        </p>
      </div>

      {err && (
        <div className="rounded-lg bg-red-50 p-4 mb-6 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-24 rounded-2xl bg-zinc-100"></div>
          <div className="h-24 rounded-2xl bg-zinc-100"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-medium text-zinc-900">No pending move-outs</p>
          <p className="mt-2 text-zinc-500">You currently have no tenants actively requesting to leave.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((r) => (
            <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <div className="text-xl font-bold text-zinc-900">{r.tenant_name}</div>
                  <div className="rounded-full bg-orange-100 text-orange-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
                    Move-Out Requested
                  </div>
                </div>
                <div className="mt-2 text-sm text-zinc-600">
                  <span className="font-semibold text-zinc-900">Property:</span> {r.pg_name}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                  <span>Current Trust Score: <strong className="text-emerald-700">{r.tenant_trust_score}</strong></span>
                  <span>•</span>
                  <span>Moved in: {new Date(r.move_in_date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <Link href={`/owner/tenant/${r.tenant_id}`}>
                  <Button variant="secondary">Profile</Button>
                </Link>
                <Button onClick={() => setSelectedReq(r)}>Approve & Rate</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm shadow-2xl">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 max-h-[90vh] overflow-y-auto">
            <div className="mb-6 border-b border-zinc-100 pb-6">
              <h2 className="font-display text-2xl font-bold text-zinc-900">Evaluate {selectedReq.tenant_name}</h2>
              <p className="mt-1 text-sm text-zinc-600">Your feedback determines their Trust Score adjustment.</p>
            </div>

            <form onSubmit={handleApprove} className="space-y-6">
              {/* Sliders */}
              {[
                { id: 'payment', label: 'Payment Punctuality', val: form.payment },
                { id: 'behavior', label: 'Behavior & Conduct', val: form.behavior },
                { id: 'property', label: 'Property Care', val: form.property },
                { id: 'stability', label: 'Stability & Notice Period', val: form.stability }
              ].map((criteria) => (
                <div key={criteria.id}>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-zinc-900">{criteria.label}</label>
                    <span className="text-sm font-bold text-emerald-600">{criteria.val}/100</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={criteria.val} 
                    onChange={e => setForm({...form, [criteria.id]: e.target.value})}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between mt-1 text-[10px] uppercase font-bold text-zinc-400">
                    <span>Poor</span><span>Good</span><span>Excellent</span>
                  </div>
                </div>
              ))}

              {/* Textarea */}
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">Additional Comments (Optional)</label>
                <textarea
                  className="w-full rounded-xl border border-zinc-200 p-4 text-sm focus:border-zinc-400 focus:outline-none"
                  rows={3}
                  placeholder="How was your experience?"
                  value={form.comments}
                  onChange={e => setForm({...form, comments: e.target.value})}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="secondary" onClick={() => setSelectedReq(null)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/20 text-white shadow-xl">
                  {submitting ? "Submitting..." : "Submit Feedback & Complete"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
