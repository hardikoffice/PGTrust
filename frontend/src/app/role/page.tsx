"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

export default function RolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<"TENANT" | "OWNER" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-12">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-zinc-900">Choose your role</h1>
          <p className="text-sm text-zinc-600">
            This sets up your portal experience.
          </p>
        </div>

        {err ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-lg font-semibold">Tenant</div>
            <p className="mt-1 text-sm text-zinc-600">
              Verify your ID, search PGs, and send booking requests.
            </p>
            <Button
              className="mt-4 w-full"
              disabled={!!loading}
              onClick={async () => {
                setErr(null);
                setLoading("TENANT");
                try {
                  await apiFetch("/user/set-role", {
                    method: "POST",
                    auth: true,
                    body: JSON.stringify({ role: "TENANT" }),
                  });
                  router.push("/tenant/dashboard");
                  router.refresh();
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "Failed to set role");
                } finally {
                  setLoading(null);
                }
              }}
            >
              {loading === "TENANT" ? "Setting..." : "Continue as Tenant"}
            </Button>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-lg font-semibold">Owner</div>
            <p className="mt-1 text-sm text-zinc-600">
              List properties, review tenants, and submit feedback.
            </p>
            <Button
              className="mt-4 w-full"
              disabled={!!loading}
              onClick={async () => {
                setErr(null);
                setLoading("OWNER");
                try {
                  await apiFetch("/user/set-role", {
                    method: "POST",
                    auth: true,
                    body: JSON.stringify({ role: "OWNER" }),
                  });
                  router.push("/owner/dashboard");
                  router.refresh();
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "Failed to set role");
                } finally {
                  setLoading(null);
                }
              }}
            >
              {loading === "OWNER" ? "Setting..." : "Continue as Owner"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

