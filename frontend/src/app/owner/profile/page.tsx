"use client";

import { useState } from "react";
import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

export default function OwnerProfilePage() {
  return (
    <RequireRole role="OWNER">
      <OwnerProfileInner />
    </RequireRole>
  );
}

function OwnerProfileInner() {
  const { profile, refresh } = useAuth();
  const [phone, setPhone] = useState(profile?.owner_data?.phone ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-4xl py-12 px-6">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-zinc-900">
          Owner Profile
        </h1>
        <p className="mt-2 text-lg text-zinc-600">Manage your contact information and property settings.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-8">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="font-display mb-6 text-xl font-bold text-zinc-900">Public Details</h2>
            <div className="space-y-6">
              <Input
                label="Full Name"
                value={profile?.full_name ?? ""}
                disabled
              />
              <Input
                label="Business Email"
                value={profile?.email ?? ""}
                disabled
              />
              <Input
                label="Contact Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91..."
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
                    await apiFetch("/owner/profile", {
                      method: "PATCH",
                      auth: true,
                      body: JSON.stringify({
                        phone: phone || null,
                      }),
                    });
                    setMsg("Profile details updated successfully.");
                    await refresh();
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
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h3 className="font-display text-lg font-bold text-zinc-900">Property Stats</h3>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                <span className="text-zinc-600">Active Listings</span>
                <span className="font-bold text-zinc-900">0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                <span className="text-zinc-600">Total Requests</span>
                <span className="font-bold text-zinc-900">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
