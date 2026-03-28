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

  // Dash array for a circle with radius 45 (circumference ~283)
  const dashArray = `${fillRatio * 283} 283`;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-4">
          <div>
            <div className="font-display text-xs font-bold uppercase tracking-widest text-zinc-500">
              Verified Reputation
            </div>
            <h2 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-zinc-900">
              Your Trust Score
            </h2>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-emerald-700">Live Rating</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-600">
              This score is calculated based on your profile verification, booking history, and behavioral events.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-800 ring-1 ring-zinc-200">
            {tier.band}
          </div>
        </div>

        <div className="relative flex h-64 w-64 items-center justify-center shrink-0">
          {/* Inner Shadow / Background */}
          <div className="absolute inset-4 rounded-full bg-zinc-50 shadow-inner" />
          
          {/* SVGs for Gauge */}
          <svg className="h-full w-full -rotate-90 transform drop-shadow-sm">
            {/* Background Circle */}
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-zinc-100"
            />
            {/* Progress Circle */}
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={dashArray}
              strokeLinecap="round"
              className="text-yellow-400 transition-all duration-500 ease-out"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
            <div className="font-display text-6xl font-black tabular-nums tracking-tighter text-zinc-900 md:text-7xl">
              {display}
            </div>
            <div className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Out of {TRUST_MAX}
            </div>
          </div>
        </div>
      </div>

      {/* Tier Legend */}
      <div className="mt-10 grid grid-cols-2 gap-4 border-t border-zinc-100 pt-8 md:grid-cols-4">
        {[
          { label: 'Excellent', range: '750+', color: 'text-emerald-600' },
          { label: 'Good', range: '650-749', color: 'text-green-600' },
          { label: 'Average', range: '500-649', color: 'text-amber-600' },
          { label: 'Risky', range: '<500', color: 'text-red-600' },
        ].map((item) => (
          <div key={item.label} className="space-y-1">
            <div className={`text-xs font-bold uppercase tracking-wider ${item.color}`}>
              {item.label}
            </div>
            <div className="text-sm font-semibold text-zinc-500 font-mono">
              {item.range}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
