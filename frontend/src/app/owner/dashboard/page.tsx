"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

export default function OwnerDashboardPage() {
  return (
    <RequireRole role="OWNER">
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const { profile } = useAuth();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch<{ data: Array<{ status: string }> }>("/requests/incoming", { auth: true });
        setPending(res.data.filter((x) => x.status === "PENDING").length);
      } catch {
        setPending(0);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-5xl py-12 px-6">
      <div className="mb-10">
        <div className="font-display text-sm font-bold uppercase tracking-widest text-zinc-500">
          Owner Control
        </div>
        <div className="font-display mt-1 text-4xl font-extrabold tracking-tight text-zinc-900">
          {profile?.full_name}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
          <div className="relative z-10">
            <div className="font-display text-xs font-bold uppercase tracking-widest text-zinc-500">
              Pending Requests
            </div>
            <div className="font-display mt-3 text-5xl font-black text-zinc-900">
              {pending}
            </div>
            <p className="mt-4 text-sm text-zinc-600">
              New booking requests that require your approval to proceed.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link href="/owner/requests">
                <Button className="w-full shadow-lg shadow-yellow-400/20">Review requests</Button>
              </Link>
              <Link href="/owner/move-outs">
                <Button variant="secondary" className="w-full">Move-Out Approvals</Button>
              </Link>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-400/5 group-hover:bg-yellow-400/10 transition-colors" />
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
          <div className="relative z-10">
            <div className="font-display text-xs font-bold uppercase tracking-widest text-zinc-500">
              Property Management
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              Manage your active PG listings, update availability, and set rental terms.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link href="/owner/properties/new">
                <Button className="w-full">List New Property</Button>
              </Link>
              <Link href="/owner/properties">
                <Button variant="secondary" className="w-full">Manage Existing</Button>
              </Link>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-zinc-100 group-hover:bg-zinc-200 transition-colors" />
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-md md:col-span-2">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="font-display text-xs font-bold uppercase tracking-widest text-zinc-500">
                Rent Tracking
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold text-zinc-900">Payment Verifications</h3>
              <p className="mt-2 text-sm text-zinc-600 max-w-xl">
                Track monthly rent schedules and verify payments to update your tenants' trust scores.
              </p>
            </div>
            <Link href="/owner/rent-verifications" className="shrink-0">
              <Button className="bg-zinc-900 text-white shadow-xl shadow-zinc-900/10 h-14 px-10">
                Manage Rent
              </Button>
            </Link>
          </div>
          <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-md md:col-span-2">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="font-display text-xs font-bold uppercase tracking-widest text-purple-500">
                AI Powered
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold text-zinc-900">Damage Assessment</h3>
              <p className="mt-2 text-sm text-zinc-600 max-w-xl">
                Upload move-in and move-out photos to get an AI-powered property damage analysis using Google Gemini.
              </p>
            </div>
            <Link href="/owner/damage-assessment" className="shrink-0">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-600/20 h-14 px-10 hover:from-purple-700 hover:to-indigo-700">
                Analyze Damages
              </Button>
            </Link>
          </div>
          <div className="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
        </div>
      </div>
    </div>
  );
}
