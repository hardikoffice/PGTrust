"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

type TenantProfile = {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  role: string;
  tenant_data: {
    verification_status: string;
    trust_score: number;
  } | null;
};

export default function OwnerTenantProfilePage() {
  return (
    <RequireRole role="OWNER">
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch<TenantProfile>(`/tenant/${id}/profile`, { auth: true });
        setProfile(res);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading profile...</div>;
  if (err) return <div className="p-8 text-center text-red-600">Error: {err}</div>;
  if (!profile) return <div className="p-8 text-center text-zinc-500">Profile not found.</div>;

  const score = profile.tenant_data?.trust_score ?? 0;
  const status = profile.tenant_data?.verification_status ?? "UNVERIFIED";

  return (
    <div className="mx-auto max-w-3xl py-12 px-6">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="secondary" onClick={() => router.back()}>
          Back to Requests
        </Button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50">
        <div className="bg-zinc-900 p-10 text-white">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Tenant Profile</div>
              <h1 className="mt-2 font-display text-4xl font-black">{profile.full_name}</h1>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  status === "VERIFIED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                }`}>
                  {status}
                </span>
                <span className="text-sm text-zinc-400">{profile.email}</span>
                {profile.phone_number && <span className="text-sm text-zinc-400">• {profile.phone_number}</span>}
              </div>
            </div>

            <div className="relative h-32 w-32 border-4 border-zinc-800 rounded-full flex items-center justify-center bg-zinc-800/50">
                <div 
                  className="absolute inset-0 rounded-full border-4 border-yellow-400" 
                  style={{ clipPath: `inset(0 0 ${Math.max(0, 100 - (score / 10))}% 0)` }}
                />
                <div className="flex flex-col items-center">
                  <span className="font-display text-4xl font-black text-yellow-400">{score}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Trust Score</span>
                </div>
            </div>
          </div>
        </div>

        <div className="p-10">
          <section className="space-y-6">
            <h2 className="font-display text-xl font-bold text-zinc-900">Verification Details</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Account Status</div>
                <div className="mt-1 font-semibold text-zinc-900">{status}</div>
              </div>
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Member Since</div>
                <div className="mt-1 font-semibold text-zinc-900">Joined PG Trust</div>
              </div>
            </div>
          </section>

          <section className="mt-10 space-y-6">
              <div className="rounded-2xl bg-yellow-50 p-6 border border-yellow-100">
                  <h3 className="font-bold text-yellow-900">Owner Insight</h3>
                  <p className="mt-2 text-sm text-yellow-800 leading-relaxed">
                      A trust score of <span className="font-bold">{score}</span> indicates 
                      {score > 700 ? " a highly reliable tenant with a proven track record." : 
                       score > 500 ? " a standard tenant profile. Consider verification details." : 
                       " a new or unverified profile. Proceed with standard background checks."}
                  </p>
              </div>
          </section>
        </div>
      </div>
    </div>
  );
}
