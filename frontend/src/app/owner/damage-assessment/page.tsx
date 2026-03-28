"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

type DamageResult = {
  score: number;
  damages: string[];
  reasoning: string;
};

type TenantOption = {
  id: string;
  tenant_id: string;
  full_name: string;
  status: string;
};

export default function DamageAssessmentPage() {
  return (
    <RequireRole role="OWNER">
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [moveInFile, setMoveInFile] = useState<File | null>(null);
  const [moveOutFile, setMoveOutFile] = useState<File | null>(null);
  const [moveInPreview, setMoveInPreview] = useState<string | null>(null);
  const [moveOutPreview, setMoveOutPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DamageResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Tenant selector
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch<{ data: Array<{id: string; tenant_id?: string; tenant_name?: string; status: string}> }>("/requests/incoming", { auth: true });
        const accepted = res.data.filter((r) => r.status === "ACCEPTED" && r.tenant_id);
        const unique = new Map<string, TenantOption>();
        for (const r of accepted) {
          if (r.tenant_id && !unique.has(r.tenant_id)) {
            unique.set(r.tenant_id, { id: r.id, tenant_id: r.tenant_id!, full_name: r.tenant_name || "Unknown", status: r.status });
          }
        }
        setTenants(Array.from(unique.values()));
      } catch { /* ignore */ }
    })();
  }, []);

  function handleFile(type: "in" | "out", file: File | null) {
    if (!file) return;
    if (type === "in") {
      setMoveInFile(file);
      setMoveInPreview(URL.createObjectURL(file));
    } else {
      setMoveOutFile(file);
      setMoveOutPreview(URL.createObjectURL(file));
    }
    setResult(null);
    setApplyResult(null);
  }

  function handleDrop(type: "in" | "out") {
    return (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(type, file);
    };
  }

  async function analyze() {
    if (!moveInFile || !moveOutFile) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    setApplyResult(null);
    try {
      const fd = new FormData();
      fd.append("moveInImage", moveInFile);
      fd.append("moveOutImage", moveOutFile);
      const res = await apiFetch<DamageResult>("/damages/evaluate", {
        method: "POST",
        auth: true,
        body: fd,
      });
      setResult(res);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function applyScore() {
    if (!result || !selectedTenant) return;
    setApplying(true);
    setApplyResult(null);
    try {
      const fd = new FormData();
      fd.append("tenant_id", selectedTenant);
      fd.append("score", String(result.score));
      const res = await apiFetch<{ message: string; new_trust_score: number; points_applied: number }>("/damages/apply-score", {
        method: "POST",
        auth: true,
        body: fd,
      });
      setApplyResult(`${res.message} New score: ${res.new_trust_score}`);
    } catch (e) {
      setApplyResult(e instanceof Error ? e.message : "Failed to apply score");
    } finally {
      setApplying(false);
    }
  }

  function scoreColor(score: number) {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  }

  function scoreBg(score: number) {
    if (score >= 80) return "from-emerald-500/10 to-emerald-500/5";
    if (score >= 60) return "from-yellow-500/10 to-yellow-500/5";
    if (score >= 40) return "from-orange-500/10 to-orange-500/5";
    return "from-red-500/10 to-red-500/5";
  }

  return (
    <div className="mx-auto max-w-6xl py-12 px-6">
      {/* Header */}
      <div className="mb-10">
        <Link href="/owner/dashboard" className="text-sm font-medium text-emerald-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-zinc-900">
          AI Damage Assessment
        </h1>
        <p className="mt-2 text-zinc-600 max-w-2xl">
          Upload move-in and move-out photos to get an AI-powered damage analysis using Google Gemini. The result can be applied directly to a tenant&apos;s Trust Score.
        </p>
      </div>

      {err && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 mb-8 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Upload Section */}
      <div className="grid gap-6 md:grid-cols-2 mb-10">
        {/* Move-In */}
        <div
          onDrop={handleDrop("in")}
          onDragOver={(e) => e.preventDefault()}
          className="group relative rounded-3xl border-2 border-dashed border-zinc-300 bg-white p-6 transition-all hover:border-emerald-400 hover:shadow-lg"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <h3 className="font-display text-lg font-bold text-zinc-900">Move-In Photo</h3>
            <p className="mt-1 text-sm text-zinc-500">Drag & drop or click to upload</p>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => handleFile("in", e.target.files?.[0] || null)}
            />
          </div>
          {moveInPreview && (
            <div className="mt-4 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={moveInPreview} alt="Move-in preview" className="w-full h-48 object-cover rounded-2xl border border-zinc-200" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setMoveInFile(null); setMoveInPreview(null); setResult(null); }}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center text-sm hover:bg-black/80 transition-colors"
              >✕</button>
              <div className="absolute bottom-2 left-2 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase text-white tracking-wider">
                Before
              </div>
            </div>
          )}
        </div>

        {/* Move-Out */}
        <div
          onDrop={handleDrop("out")}
          onDragOver={(e) => e.preventDefault()}
          className="group relative rounded-3xl border-2 border-dashed border-zinc-300 bg-white p-6 transition-all hover:border-orange-400 hover:shadow-lg"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-100">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <h3 className="font-display text-lg font-bold text-zinc-900">Move-Out Photo</h3>
            <p className="mt-1 text-sm text-zinc-500">Drag & drop or click to upload</p>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => handleFile("out", e.target.files?.[0] || null)}
            />
          </div>
          {moveOutPreview && (
            <div className="mt-4 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={moveOutPreview} alt="Move-out preview" className="w-full h-48 object-cover rounded-2xl border border-zinc-200" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setMoveOutFile(null); setMoveOutPreview(null); setResult(null); }}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center text-sm hover:bg-black/80 transition-colors"
              >✕</button>
              <div className="absolute bottom-2 left-2 rounded-full bg-orange-600 px-3 py-1 text-[10px] font-bold uppercase text-white tracking-wider">
                After
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analyze Button */}
      <div className="flex justify-center mb-10">
        <Button
          onClick={analyze}
          disabled={!moveInFile || !moveOutFile || loading}
          className="h-14 px-12 text-base bg-gradient-to-r from-zinc-900 to-zinc-800 text-white shadow-2xl shadow-zinc-900/20 hover:from-zinc-800 hover:to-zinc-700 disabled:from-zinc-300 disabled:to-zinc-200 disabled:text-zinc-500 disabled:shadow-none"
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              Analyzing with Gemini AI…
            </span>
          ) : (
            "🔍 Analyze Damages"
          )}
        </Button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm mb-10">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-zinc-100" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-32 rounded-full bg-zinc-100" />
                <div className="h-8 w-24 rounded-full bg-zinc-100" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-zinc-100" />
              <div className="h-3 w-3/4 rounded-full bg-zinc-100" />
              <div className="h-3 w-1/2 rounded-full bg-zinc-100" />
            </div>
          </div>
        </div>
      )}

      {/* Results Card */}
      {result && !loading && (
        <div className="rounded-3xl border border-zinc-200 bg-white shadow-lg overflow-hidden mb-10">
          {/* Score Header */}
          <div className={`bg-gradient-to-br ${scoreBg(result.score)} p-8`}>
            <div className="flex items-center gap-6">
              <div className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-lg ${scoreColor(result.score)}`}>
                <span className="font-display text-4xl font-black">{result.score}</span>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">AI Condition Score</div>
                <div className={`mt-1 font-display text-2xl font-extrabold ${scoreColor(result.score)}`}>
                  {result.score >= 80 ? "Excellent Condition" : result.score >= 60 ? "Good Condition" : result.score >= 40 ? "Fair Condition" : "Poor Condition"}
                </div>
                <div className="mt-1 text-sm text-zinc-500">
                  Powered by Google Gemini AI
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-8 space-y-8">
            {/* Damages */}
            {result.damages.length > 0 && (
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Damages Identified</h3>
                <div className="grid gap-2">
                  {result.damages.map((d, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 p-4">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold">{i + 1}</span>
                      <span className="text-sm text-red-800">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.damages.length === 0 && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6 text-center">
                <div className="text-3xl mb-2">✨</div>
                <p className="font-semibold text-emerald-800">No damages detected!</p>
                <p className="text-sm text-emerald-600 mt-1">The property appears to be in excellent condition.</p>
              </div>
            )}

            {/* Reasoning */}
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">AI Reasoning</h3>
              <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-6">
                <p className="text-sm leading-relaxed text-zinc-700">{result.reasoning}</p>
              </div>
            </div>

            {/* Apply to Trust Score */}
            <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-6 bg-zinc-50/50">
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Apply to Trust Score</h3>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Select Tenant</label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-4 text-zinc-900 shadow-sm outline-none transition-all focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10"
                  >
                    <option value="">Choose a tenant...</option>
                    {tenants.map((t) => (
                      <option key={t.tenant_id} value={t.tenant_id}>{t.full_name}</option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={applyScore}
                  disabled={!selectedTenant || applying}
                  className="h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 shrink-0"
                >
                  {applying ? "Applying..." : "Apply to Score"}
                </Button>
              </div>
              {applyResult && (
                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 font-medium">
                  {applyResult}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
