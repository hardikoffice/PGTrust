"use client";

import Link from "next/link";

import { TrustScoreGauge } from "@/components/features/TrustScoreGauge";
import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function TenantDashboardPage() {
  return (
    <RequireRole role="TENANT">
      <TenantDashboardInner />
    </RequireRole>
  );
}

function TenantDashboardInner() {
  const { profile, refresh } = useAuth();
  const t = profile?.tenant_data;

  return (
    <div className="mx-auto max-w-5xl py-12 px-6">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <div className="font-display text-sm font-bold uppercase tracking-widest text-zinc-500">
            My Profile
          </div>
          <div className="font-display mt-1 text-4xl font-extrabold tracking-tight text-zinc-900">
            Welcome back, {profile?.full_name?.split(' ')[0]}
          </div>
        </div>
        <Button variant="secondary" onClick={refresh} className="rounded-full px-6">
          Refresh Data
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrustScoreGauge score={t?.trust_score ?? 500} />
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="font-display text-xs font-bold uppercase tracking-widest text-zinc-500">
              Verification status
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${t?.verification_status === 'VERIFIED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <div className="font-display text-2xl font-bold text-zinc-900">
                {t?.verification_status ?? "UNVERIFIED"}
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              You must be <span className="font-bold text-emerald-700 underline decoration-emerald-200 decoration-2 underline-offset-2">VERIFIED</span> to send booking requests to PG owners.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link href="/tenant/profile">
                <Button className="w-full">Update My Profile</Button>
              </Link>
              <Link href="/search">
                <Button variant="secondary" className="w-full">Browse verified PGs</Button>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-yellow-400 p-8 shadow-lg shadow-yellow-400/10">
            <h3 className="font-display text-lg font-bold text-black">Need Help?</h3>
            <p className="mt-2 text-sm font-medium text-black/80">
              Check our tenant guide to learn how to improve your trust score.
            </p>
            <Button className="mt-6 w-full bg-black text-white hover:bg-zinc-800">
              View Guide
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
