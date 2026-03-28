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
    <div className="grid gap-6">
      <div>
        <div className="text-2xl font-semibold text-zinc-900">Profile</div>
        <div className="text-sm text-zinc-600">{hint}</div>
      </div>

      <div className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-medium text-zinc-700">Personal details</div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Date of birth"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Your permanent address"
          />
        </div>
        <div className="flex gap-2">
          <Button
            disabled={loading}
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
                setMsg("Profile updated.");
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Failed to update profile");
              } finally {
                setLoading(false);
              }
            }}
          >
            Save
          </Button>
          <Button variant="secondary" onClick={refresh}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-zinc-700">
              Identity verification
            </div>
            <div className="text-sm text-zinc-600">
              Status: <span className="font-medium text-zinc-900">{status}</span>
            </div>
          </div>
          <div className="text-xs text-zinc-500">
            {canRequest ? "Requests enabled" : "Requests locked"}
          </div>
        </div>

        <label className="grid gap-1 text-sm">
          <span className="text-zinc-700">Govt ID (PNG/JPG/PDF, max 5MB)</span>
          <input
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="flex flex-wrap gap-2">
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
                setMsg("Document uploaded. Status set to PENDING.");
                await refresh();
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Upload failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            Upload document
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
                setMsg("Marked VERIFIED (local MVP helper).");
                await refresh();
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            Mark verified (dev)
          </Button>
        </div>

        {msg ? (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {msg}
          </div>
        ) : null}
        {err ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        ) : null}
      </div>
    </div>
  );
}

