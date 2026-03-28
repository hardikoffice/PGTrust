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

        <div className="relative flex flex-col items-center w-64 shrink-0 mt-6">
          <svg viewBox="0 0 200 125" className="w-full h-auto drop-shadow-sm overflow-visible">
            {/* Tracks */}
            <path d={arcPath(0, 0.5)} fill="none" stroke="#ef4444" strokeWidth="16" />
            <path d={arcPath(0.5, 0.65)} fill="none" stroke="#f59e0b" strokeWidth="16" />
            <path d={arcPath(0.65, 0.75)} fill="none" stroke="#22c55e" strokeWidth="16" />
            <path d={arcPath(0.75, 1)} fill="none" stroke="#047857" strokeWidth="16" />

            {/* End Caps to make outside edges rounded without internal bleeding */}
            <circle cx="20" cy="100" r="8" fill="#ef4444" />
            <circle cx="180" cy="100" r="8" fill="#047857" />
            
            {/* Ticks */}
            {[0.5, 0.65, 0.75].map(tick => {
              const angle = Math.PI - (tick * Math.PI);
              const x1 = 100 + 72 * Math.cos(angle);
              const y1 = 100 - 72 * Math.sin(angle);
              const x2 = 100 + 88 * Math.cos(angle);
              const y2 = 100 - 88 * Math.sin(angle);
              return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="3" opacity="0.8" />;
            })}

            {/* Needle */}
            <g 
              style={{
                transformOrigin: '100px 100px',
                transform: `rotate(${fillRatio * 180 - 90}deg)`
              }}
              className="transition-transform duration-1000 ease-out"
            >
              <polygon points="97,100 103,100 100,18" fill="#18181b" />
              <circle cx="100" cy="100" r="12" fill="#18181b" />
              <circle cx="100" cy="100" r="6" fill="#ffffff" />
              <circle cx="100" cy="100" r="2" fill="#18181b" />
            </g>
          </svg>

          {/* Center Content */}
          <div className="flex flex-col items-center -mt-8 z-10 bg-white px-8 pb-4 rounded-t-[3rem]">
            <div className="font-display text-6xl font-black tabular-nums tracking-tighter text-zinc-900 drop-shadow-sm">
              {display}
            </div>
            <div className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-1">
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

      {/* How to Improve & Significance */}
      <div className="mt-10 rounded-2xl bg-zinc-50 p-6 sm:p-8">
        <h3 className="font-display text-lg font-bold text-zinc-900">How Trust Score Works</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Your Trust Score is a decentralized reputation indicator shared across the PG Trust network. A higher score unlocks priority approvals, instant bookings, and better rental terms from property owners.
        </p>
        
        <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm border-t border-zinc-200/60 pt-6">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-bold text-zinc-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">↑</span>
              How to improve it
            </h4>
            <ul className="space-y-2 text-zinc-600">
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Pay your rent on or before the due date</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Maintain the property and respect house rules</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Complete your KYC profile verification</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Serve proper notice period before moving out</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-bold text-zinc-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs text-red-700">↓</span>
              What lowers it
            </h4>
            <ul className="space-y-2 text-zinc-600">
              <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> Consistently late rent payments</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> Causing property damage or disturbances</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> Vacating the PG without notifying the owner</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> Consistently poor move-out feedback ratings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
