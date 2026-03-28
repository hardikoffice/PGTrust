"use client";

import { useAuth } from "@/hooks/useAuth";
import { TrustScoreGauge } from "./TrustScoreGauge";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function TrustScoreHomeCard() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-[280px] animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50" />
    );
  }

  const isTenant = profile?.role === "TENANT";
  const trustScore = profile?.tenant_data?.trust_score ?? 0;

  if (isTenant) {
    return <TrustScoreGauge score={trustScore} />;
  }

  return (
    <div className="relative overflow-hidden group">
      {/* Blurred Gauge Background */}
      <div className={cn(
        "pointer-events-none transition-all duration-700",
        "blur-[6px] opacity-40 grayscale-[0.2]"
      )}>
        <TrustScoreGauge score={750} />
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white/40 backdrop-blur-[4px] rounded-3xl border border-dashed border-zinc-200 shadow-inner">
        <div className="mb-6 space-y-3">
          <h3 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900">
            View your Trust Score
          </h3>
          <p className="max-w-[280px] text-sm text-zinc-600 leading-relaxed mx-auto font-medium">
            Owners use this score to evaluate your booking requests instantly. Sign up to unlock your verified reputation.
          </p>
        </div>
        <Link
          href="/signup?next=/"
          className="inline-flex items-center justify-center rounded-lg bg-yellow-400 px-6 py-2.5 text-sm font-semibold text-black hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all shadow-md active:scale-95"
        >
          View your Trust Score
        </Link>
      </div>
    </div>
  );
}
