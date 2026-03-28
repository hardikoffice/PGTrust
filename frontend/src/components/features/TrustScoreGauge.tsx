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

function arcPath(startPercent: number, endPercent: number) {
  const cx = 100;
  const cy = 100;
  const R = 80;
  // Sweep from left Pi to right 0
  const startAngle = Math.PI - (startPercent * Math.PI);
  const endAngle = Math.PI - (endPercent * Math.PI);
  
  const x1 = cx + R * Math.cos(startAngle);
  const y1 = cy - R * Math.sin(startAngle);
  const x2 = cx + R * Math.cos(endAngle);
  const y2 = cy - R * Math.sin(endAngle);
  
  return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
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

        <div className="relative flex flex-col items-center justify-end w-64 h-40 shrink-0">
          <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-sm overflow-visible">
            {/* Tracks */}
            <path d={arcPath(0, 0.5)} fill="none" stroke="#ef4444" strokeWidth="16" strokeLinecap="round" />
            <path d={arcPath(0.5, 0.65)} fill="none" stroke="#f59e0b" strokeWidth="16" />
            <path d={arcPath(0.65, 0.75)} fill="none" stroke="#22c55e" strokeWidth="16" />
            <path d={arcPath(0.75, 1)} fill="none" stroke="#047857" strokeWidth="16" strokeLinecap="round" />
            
            {/* Ticks */}
            {[0.5, 0.65, 0.75].map(tick => {
              const angle = Math.PI - (tick * Math.PI);
              const x1 = 100 + 72 * Math.cos(angle);
              const y1 = 100 - 72 * Math.sin(angle);
              const x2 = 100 + 88 * Math.cos(angle);
              const y2 = 100 - 88 * Math.sin(angle);
              return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="3" />;
            })}

            {/* Needle */}
            <g 
              style={{
                transformOrigin: '100px 100px',
                transform: `rotate(${fillRatio * 180 - 90}deg)`
              }}
              className="transition-transform duration-75 ease-out"
            >
              <polygon points="96,100 104,100 100,25" fill="#27272a" />
              <circle cx="100" cy="100" r="10" fill="#27272a" />
              <circle cx="100" cy="100" r="4" fill="#ffffff" />
            </g>
          </svg>

          {/* Center Content */}
          <div className="absolute -bottom-2 flex flex-col items-center">
            <div className="font-display text-5xl font-black tabular-nums tracking-tighter text-zinc-900">
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
