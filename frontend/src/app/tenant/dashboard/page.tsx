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
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-zinc-600">Welcome</div>
          <div className="text-2xl font-semibold text-zinc-900">
            {profile?.full_name}
          </div>
        </div>
        <Button variant="secondary" onClick={refresh}>
          Refresh
        </Button>
      </div>

      <TrustScoreGauge score={t?.trust_score ?? 500} />

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-medium text-zinc-700">
          Verification status
        </div>
        <div className="mt-1 text-lg font-semibold text-zinc-900">
          {t?.verification_status ?? "UNVERIFIED"}
        </div>
        <p className="mt-2 text-sm text-zinc-600">
          You must be <span className="font-medium">VERIFIED</span> to send PG
          requests.
        </p>
        <div className="mt-4 flex gap-2">
          <Link href="/tenant/profile">
            <Button>Go to profile</Button>
          </Link>
          <Link href="/tenant/search">
            <Button variant="secondary">Search PGs</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

