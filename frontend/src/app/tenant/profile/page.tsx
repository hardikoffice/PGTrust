"use client";

import { useMemo, useState } from "react";

import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

export default function TenantProfilePage() {
  return (
    <RequireRole role="TENANT">
      <TenantProfileInner />
    </RequireRole>
  );
}

function TenantProfileInner() {
  const { profile, refresh } = useAuth();
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const status = profile?.tenant_data?.verification_status ?? "UNVERIFIED";

  const canRequest = status === "VERIFIED";

  const hint = useMemo(() => {
    if (status === "UNVERIFIED") return "Upload your Govt ID to start verification.";
    if (status === "PENDING") return "Your document is pending review.";
    return "You’re verified and can request PGs.";
  }, [status]);

  return (
    <div className="mx-auto max-w-4xl py-12 px-6">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-zinc-900">
          My Profile
        </h1>
        <p className="mt-2 text-lg text-zinc-600">{hint}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-8">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="font-display mb-6 text-xl font-bold text-zinc-900">Personal Details</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
              <Input
                label="Current City/Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Bangalore, KA"
              />
            </div>
            <div className="mt-8 flex gap-3">
              <Button
                disabled={loading}
                className="shadow-lg shadow-yellow-400/20"
                onClick={async () => {
                  setErr(null);
                  setMsg(null);
                  setLoading(true);
                  try {
                    await apiFetch("/tenant/profile", {
                      method: "PATCH",
                      auth: true,
                      body: JSON.stringify({
                        date_of_birth: dob || null,
                        address: address || null,
                      }),
                    });
                    setMsg("Profile details updated successfully.");
                  } catch (e) {
                    setErr(e instanceof Error ? e.message : "Failed to update profile");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="secondary" onClick={refresh}>
                Refresh
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-zinc-900">
                Identity Verification
              </h2>
              <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${canRequest ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {canRequest ? "Verified" : "Action Required"}
              </div>
            </div>

            <div className="mb-8 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
              <p className="text-sm font-medium text-zinc-700 leading-relaxed">
                Status: <span className="font-bold text-zinc-900">{status}</span>
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {canRequest ? "You can now send booking requests to PG owners." : "You must be verified to start booking."}
              </p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-zinc-700">Govt ID Proof (PNG/JPG)</span>
                <input
                  type="file"
                  className="mt-2 block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                  accept="image/png,image/jpeg,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  disabled={loading || !file}
                  onClick={async () => {
                    if (!file) return;
                    setErr(null);
                    setMsg(null);
                    setLoading(true);
                    try {
                      const form = new FormData();
                      form.append("file", file);
                      form.append("document_type", "AADHAAR");
                      await apiFetch("/tenant/verify", {
                        method: "POST",
                        auth: true,
                        body: form,
                        headers: {},
                      });
                      setMsg("Document uploaded. Our team is reviewing it.");
                      await refresh();
                    } catch (e) {
                      setErr(e instanceof Error ? e.message : "Upload failed");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Upload for Review
                </Button>

                <Button
                  variant="secondary"
                  disabled={loading}
                  onClick={async () => {
                    setErr(null);
                    setMsg(null);
                    setLoading(true);
                    try {
                      await apiFetch("/tenant/verify/mark-verified", { method: "POST", auth: true });
                      setMsg("Verified successfully (Instant verification enabled).");
                      await refresh();
                    } catch (e) {
                      setErr(e instanceof Error ? e.message : "Verification failed");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Mark Verified (Demo Only)
                </Button>
              </div>
            </div>
          </div>

          {msg && (
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 border border-emerald-100">
              ✓ {msg}
            </div>
          )}
          {err && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-100">
              ⚠️ {err}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-3xl bg-zinc-900 p-8 text-white shadow-xl">
            <h3 className="font-display text-lg font-bold">Trust Badge</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Higher trust scores unlock premium PG listings and lower security deposits.
            </p>
            <div className="mt-10 flex justify-center">
              <div className="relative h-32 w-32">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                <div 
                  className="absolute inset-0 rounded-full border-4 border-yellow-400" 
                  style={{ clipPath: `inset(0 0 ${(100 - (profile?.tenant_data?.trust_score ?? 500) / 10)}% 0)` }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-3xl font-black">{profile?.tenant_data?.trust_score ?? 500}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
