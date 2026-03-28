"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

type Resident = {
  id: string; // request internal id
  tenant_id: string;
  full_name: string;
  phone_number: string | null;
  email: string;
  status: string;
  joined_at: string;
};

type PGDetail = {
  name: string;
};

export default function PGResidentsPage({ params }: { params: { id: string } }) {
  return (
    <RequireRole role="OWNER">
      <Inner pgId={params.id} />
    </RequireRole>
  );
}

function Inner({ pgId }: { pgId: string }) {
  const [pgName, setPgName] = useState("Loading...");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setErr(null);
        const [pgRes, residentRes] = await Promise.all([
          apiFetch<PGDetail>(`/pg/${pgId}`, { auth: true }),
          apiFetch<Resident[]>(`/pg/${pgId}/residents`, { auth: true }),
        ]);
        setPgName(pgRes.name);
        setResidents(residentRes);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load residents");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pgId]);

  return (
    <div className="mx-auto max-w-4xl py-12 px-6">
      <div className="mb-8">
        <Link href="/owner/properties" className="text-sm font-medium text-emerald-600 hover:underline">
          &larr; Back to Properties
        </Link>
        <div className="mt-4 font-display text-sm font-bold uppercase tracking-widest text-zinc-500">
          Residents List
        </div>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-zinc-900">
          {pgName}
        </h1>
      </div>

      {err && (
        <div className="rounded-lg bg-red-50 p-4 mb-6 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-16 rounded-xl bg-zinc-100"></div>
          <div className="h-16 rounded-xl bg-zinc-100"></div>
        </div>
      ) : residents.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
          <p className="text-zinc-600">There are currently no verified residents in this property.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-zinc-900">Tenant Name</th>
                <th className="px-6 py-4 font-semibold text-zinc-900">Contact</th>
                <th className="px-6 py-4 font-semibold text-zinc-900">Joined On</th>
                <th className="px-6 py-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {residents.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-zinc-50/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900">{r.full_name}</div>
                    <div className="mt-0.5 text-xs text-zinc-500">Status: {r.status}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-600">{r.email}</div>
                    <div className="text-zinc-500 text-xs">{r.phone_number || "No phone provided"}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-xs">
                    {new Date(r.joined_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/owner/tenant/${r.tenant_id}`}>
                      <Button variant="secondary">View Profile</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
