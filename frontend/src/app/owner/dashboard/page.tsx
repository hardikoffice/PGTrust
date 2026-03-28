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
    <div className="grid gap-6">
      <div>
        <div className="text-sm text-zinc-600">Welcome</div>
        <div className="text-2xl font-semibold text-zinc-900">{profile?.full_name}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium text-zinc-700">Pending requests</div>
          <div className="mt-1 text-3xl font-semibold text-zinc-900">{pending}</div>
          <Link href="/owner/requests">
            <Button className="mt-4 w-full">Review requests</Button>
          </Link>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium text-zinc-700">Your properties</div>
          <p className="mt-1 text-sm text-zinc-600">
            Add and manage PG listings.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/owner/properties">
              <Button variant="secondary">View properties</Button>
            </Link>
            <Link href="/owner/properties/new">
              <Button>Add new</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

