"use client";

import { useEffect, useState } from "react";

import {
  TRUST_MAX,
  TRUST_MIN,
  clampTrustScore,
  getTrustTier,
  trustScoreToRatio,
} from "@/lib/trustScore";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function TrustScoreGauge({ score }: { score: number }) {
  const target = clampTrustScore(score);
  const [display, setDisplay] = useState(0);
  const [fillRatio, setFillRatio] = useState(0);
  const tier = getTrustTier(target);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const to = target;
    const duration = 1100;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(p);
      const v = Math.round(from + (to - from) * eased);
      setDisplay(v);
      setFillRatio(trustScoreToRatio(v));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const pct = Math.round(fillRatio * 100);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm font-medium text-zinc-600">Trust Score</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums tracking-tight text-zinc-900">
              {display}
            </span>
            <span className="text-sm text-zinc-500">/ {TRUST_MAX}</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            Range {TRUST_MIN}–{TRUST_MAX}
          </div>
        </div>
        <div
          className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200"
          title={tier.recommendation}
        >
          {tier.band}
        </div>
      </div>

      {/* Meter: animated fill over red → dark green gradient */}
      <div className="mt-5">
        <div className="mb-1 flex justify-between text-xs text-zinc-500">
          <span>{TRUST_MIN}</span>
          <span>{TRUST_MAX}</span>
        </div>
        <div
          className="relative h-4 overflow-hidden rounded-full bg-zinc-200 ring-1 ring-zinc-200/80"
          role="progressbar"
          aria-valuemin={TRUST_MIN}
          aria-valuemax={TRUST_MAX}
          aria-valuenow={display}
          aria-label={`Trust score ${display} out of ${TRUST_MAX}`}
        >
          <div
            className="absolute inset-y-0 left-0 overflow-hidden rounded-full transition-[width] duration-75 ease-out"
            style={{ width: `${pct}%` }}
            aria-hidden
          >
            <div
              className="h-full w-full min-w-[28rem] max-w-none"
              style={{
                background:
                  "linear-gradient(90deg, #b91c1c 0%, #ef4444 18%, #f59e0b 42%, #22c55e 72%, #14532d 100%)",
              }}
            />
          </div>
          {/* Shine */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/25 to-transparent" />
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
        <span className="font-medium text-zinc-900">{tier.band}</span>
        <span className="text-zinc-400"> · </span>
        <span className="text-zinc-600">{tier.recommendation}</span>
      </div>

      <div className="mt-4 border-t border-zinc-100 pt-3">
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Reference bands
        </div>
        <ul className="mt-2 grid gap-2 text-xs text-zinc-600 sm:grid-cols-2">
          <li>
            <span className="font-medium text-emerald-800">750 – 1000</span> · Excellent
          </li>
          <li>
            <span className="font-medium text-green-700">650 – 749</span> · Good
          </li>
          <li>
            <span className="font-medium text-amber-700">500 – 649</span> · Average
          </li>
          <li>
            <span className="font-medium text-red-700">0 – 499</span> · Risky
          </li>
        </ul>
      </div>
    </div>
  );
}
