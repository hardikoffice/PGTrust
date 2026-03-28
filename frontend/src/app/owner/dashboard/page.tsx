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
            <Link href="/owner/requests">
              <Button className="mt-8 w-full shadow-lg shadow-yellow-400/20">Review all requests</Button>
            </Link>
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
      </div>
    </div>
  );
}
