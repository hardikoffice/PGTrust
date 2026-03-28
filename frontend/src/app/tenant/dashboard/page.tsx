"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { TrustScoreGauge } from "@/components/features/TrustScoreGauge";
import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

type RentStatus = {
  month: number;
  year: number;
  due_day: number | null;
  status: string;
  tenant_paid_at: string | null;
  owner_verified_at: string | null;
};

export default function TenantDashboardPage() {
  return (
    <RequireRole role="TENANT">
      <TenantDashboardInner />
    </RequireRole>
  );
}

function TenantDashboardInner() {
  const { profile, refresh } = useAuth();
  const [currentPg, setCurrentPg] = useState<{ id: string; name: string; location: string; rent: number; status: string; request_id: string; is_moving_out: boolean } | null>(null);
  const [rentStatus, setRentStatus] = useState<RentStatus | null>(null);
  const [loadingPg, setLoadingPg] = useState(true);
  const [paying, setPaying] = useState(false);

  async function loadRentStatus() {
    try {
      const res = await apiFetch<RentStatus>("/rent/status", { auth: true });
      setRentStatus(res);
    } catch (e) {
      console.error("Failed to load rent status", e);
    }
  }

  useEffect(() => {
    async function loadPg() {
      try {
        const res = await apiFetch<{ pg: any }>("/tenant/current-pg", { auth: true });
        setCurrentPg(res.pg);
      } catch (e) {
        console.error("Failed to load current PG", e);
      } finally {
        setLoadingPg(false);
      }
    }
    loadPg();
    loadRentStatus();
  }, []);

  async function handlePay() {
    setPaying(true);
    try {
      await apiFetch("/rent/pay", { method: "POST", auth: true });
      await loadRentStatus();
      alert("Rent marked as paid. Waiting for owner verification.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to mark as paid");
    } finally {
      setPaying(false);
    }
  }

  async function handleMoveOut() {
    if (!currentPg || !confirm("Are you sure you want to request a move-out? Your owner will need to approve and review your stay.")) return;
    try {
      await apiFetch(`/requests/${currentPg.request_id}/move-out`, { method: "POST", auth: true });
      setCurrentPg(prev => prev ? { ...prev, is_moving_out: true } : null);
      alert("Move-out requested. Waiting for owner approval.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to request move-out");
    }
  }

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

          {currentPg && (
            <div className="grid gap-6 mt-8 sm:grid-cols-2">
              {/* PG Info */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Current Stay</div>
                    <h2 className="mt-1 font-display text-2xl font-bold text-zinc-900">{currentPg.name}</h2>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Location</div>
                      <div className="text-sm font-semibold text-zinc-900">{currentPg.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Monthly Rent</div>
                      <div className="text-sm font-semibold text-zinc-900">₹{currentPg.rent.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Link href={`/pg?id=${currentPg.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full">View Details</Button>
                  </Link>
                  {currentPg.status === "ACCEPTED" && !currentPg.is_moving_out && (
                    <Button variant="danger" className="flex-1" onClick={handleMoveOut}>
                      Request Move-Out
                    </Button>
                  )}
                  {currentPg.is_moving_out && currentPg.status === "ACCEPTED" && (
                    <div className="flex-1 flex items-center justify-center rounded-lg bg-orange-50 text-xs font-semibold text-orange-700 text-center px-4 py-2 border border-orange-200">
                      Move-Out Pending Approval
                    </div>
                  )}
                </div>
              </div>

              {/* Rent Card */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
                <div className="mb-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Monthly Rent</div>
                  <h2 className="mt-1 font-display text-2xl font-bold text-zinc-900">
                    {new Date().toLocaleString('default', { month: 'long' })}
                  </h2>
                </div>

                {rentStatus ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Due Date:</span>
                      <span className="text-sm font-bold text-zinc-900">
                        {rentStatus.due_day ? `${rentStatus.due_day}${getOrdinal(rentStatus.due_day)} of month` : "Not set by owner"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Status:</span>
                      <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        rentStatus.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' :
                        rentStatus.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                        rentStatus.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {rentStatus.status}
                      </div>
                    </div>

                    {rentStatus.status !== 'VERIFIED' && rentStatus.status !== 'PAID' && (
                      <Button onClick={handlePay} disabled={paying} className="w-full">
                        {paying ? "Processing..." : "Mark as Paid"}
                      </Button>
                    )}
                    
                    {rentStatus.status === 'PAID' && (
                      <p className="text-center text-xs text-zinc-500 italic">Waiting for owner confirmation</p>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-zinc-500">Loading rent status...</div>
                )}
              </div>
            </div>
          )}
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
              Payments are verified by owners to maintain your trust score.
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

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
