"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, resolveMediaUrl } from "@/lib/api";

type PGDetail = {
  id: string;
  owner_id: string;
  name: string;
  location: string;
  rent: number;
  rating: number;
  amenities: string[];
  images: string[];
  description?: string | null;
  gender_preference?: string | null;
  active: boolean;
};

export default function TenantPgDetailPage() {
  return (
    <RequireRole role="TENANT">
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const verified = profile?.tenant_data?.verification_status === "VERIFIED";
  const [pg, setPg] = useState<PGDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch<PGDetail>(`/pg/${id}`);
        setPg(res);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed");
      }
    })();
  }, [id]);

  if (err) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-red-700">
        {err}
      </div>
    );
  }

  if (!pg) {
    return <div className="text-sm text-zinc-600">Loading...</div>;
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold text-zinc-900">{pg.name}</div>
          <div className="text-sm text-zinc-600">{pg.location}</div>
        </div>
        <Link href="/tenant/search">
          <Button variant="secondary">Back</Button>
        </Link>
      </div>

      {pg.images.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {pg.images.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={resolveMediaUrl(src)}
              alt=""
              className="h-48 w-64 shrink-0 rounded-xl border border-zinc-200 object-cover"
            />
          ))}
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="text-sm text-zinc-600">Rent</div>
            <div className="text-2xl font-semibold text-zinc-900">₹{pg.rent}/month</div>
          </div>
          <div>
            <div className="text-sm text-zinc-600">Listing rating</div>
            <div className="text-lg font-semibold text-zinc-900">★ {pg.rating.toFixed(1)} / 5</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {pg.amenities.map((a) => (
            <span key={a} className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700">
              {a}
            </span>
          ))}
        </div>
        {pg.description ? (
          <p className="mt-4 text-sm leading-7 text-zinc-600">{pg.description}</p>
        ) : null}
        <div className="mt-4 flex gap-2">
          <Button
            disabled={!verified}
            onClick={async () => {
              try {
                await apiFetch("/requests/create", {
                  method: "POST",
                  auth: true,
                  body: JSON.stringify({
                    pg_id: pg.id,
                    move_in_date: new Date().toISOString().slice(0, 10),
                  }),
                });
                router.push("/tenant/requests");
              } catch (e) {
                alert(e instanceof Error ? e.message : "Failed");
              }
            }}
          >
            Request this PG
          </Button>
          {!verified ? (
            <Link href="/tenant/profile">
              <Button variant="secondary">Verify first</Button>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

