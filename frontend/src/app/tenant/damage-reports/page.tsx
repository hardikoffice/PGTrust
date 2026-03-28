"use client";

import { useEffect, useState } from "react";

import { RequireRole } from "@/components/layout/RequireRole";
import { apiFetch } from "@/lib/api";

type DamageReport = {
  id: string;
  score: number;
  damages: string[];
  reasoning: string;
  points_applied: number;
  created_at: string | null;
};

export default function TenantDamageReportsPage() {
  return (
    <RequireRole role="TENANT">
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch<{ reports: DamageReport[] }>("/damages/my-reports", { auth: true });
        setReports(res.reports);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load reports");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function scoreColor(score: number) {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  }

  function scoreBg(score: number) {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    if (score >= 40) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  }

  function scoreLabel(score: number) {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-16 px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded-full bg-zinc-100" />
          <div className="h-4 w-96 rounded-full bg-zinc-100" />
          <div className="h-48 rounded-3xl bg-zinc-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-12 px-6">
      <div className="mb-10">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Transparency</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-zinc-900">
          Damage Assessment Reports
        </h1>
        <p className="mt-2 text-zinc-600 max-w-2xl">
          These are AI-powered damage assessments conducted by your property owners during move-out inspections. Each report affects your Trust Score.
        </p>
      </div>

      {err && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 mb-8 text-sm text-red-700">
          {err}
        </div>
      )}

      {reports.length === 0 && !err && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="font-display text-xl font-bold text-zinc-900">No Reports Yet</h3>
          <p className="mt-2 text-sm text-zinc-500">
            You don&apos;t have any damage assessment reports. Reports are generated when an owner conducts a move-out inspection.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {reports.map((report) => (
          <div key={report.id} className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <div className="flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 ${scoreBg(report.score)}`}>
                  <span className={`font-display text-2xl font-black ${scoreColor(report.score)}`}>{report.score}</span>
                </div>
                <div>
                  <div className={`font-display text-lg font-bold ${scoreColor(report.score)}`}>
                    {scoreLabel(report.score)} Condition
                  </div>
                  <div className="text-xs text-zinc-500">
                    {report.created_at ? new Date(report.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Date unknown"}
                  </div>
                </div>
              </div>
              <div className={`rounded-full px-4 py-1.5 text-xs font-bold ${
                report.points_applied > 0
                  ? "bg-emerald-100 text-emerald-700"
                  : report.points_applied < 0
                  ? "bg-red-100 text-red-700"
                  : "bg-zinc-100 text-zinc-700"
              }`}>
                {report.points_applied > 0 ? "+" : ""}{report.points_applied} pts
              </div>
            </div>

            {/* Damages */}
            <div className="p-6 space-y-6">
              {report.damages.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Damages Identified</h3>
                  <div className="grid gap-2">
                    {report.damages.map((d, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold">{i + 1}</span>
                        <span className="text-sm text-red-800">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.damages.length === 0 && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                  <p className="text-sm font-semibold text-emerald-800">✨ No damages detected</p>
                </div>
              )}

              {/* Reasoning */}
              {report.reasoning && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">AI Analysis</h3>
                  <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-4">
                    <p className="text-sm leading-relaxed text-zinc-700">{report.reasoning}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
