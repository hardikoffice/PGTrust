"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

type PendingPayment = {
  id: string;
  tenant_name: string;
  month: number;
  year: number;
  status: string;
  tenant_paid_at: string;
};

export default function OwnerRentVerificationsPage() {
  return (
    <RequireRole role="OWNER">
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch<{ payments: PendingPayment[] }>("/rent/owner/pending-verifications", { auth: true });
      setPayments(res.payments);
    } catch (e) {
      console.error("Failed to load pending verifications", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleVerify(id: string) {
    setVerifyingId(id);
    try {
      await apiFetch(`/rent/owner/verify/${id}`, { method: "POST", auth: true });
      await load();
      alert("Payment verified successfully!");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifyingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Rent Verifications</h1>
        <p className="text-sm text-zinc-600">Review and confirm tenant rent payments.</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading pending payments...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No pending payments to verify.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-zinc-900">Tenant</th>
                <th className="px-6 py-3 font-semibold text-zinc-900">Month</th>
                <th className="px-6 py-3 font-semibold text-zinc-900">Paid At</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 font-medium text-zinc-900">{p.tenant_name}</td>
                  <td className="px-6 py-4 text-zinc-600">
                    {new Date(p.year, p.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {new Date(p.tenant_paid_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      onClick={() => handleVerify(p.id)}
                      disabled={verifyingId === p.id}
                    >
                      {verifyingId === p.id ? "Verifying..." : "Verify Payment"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
