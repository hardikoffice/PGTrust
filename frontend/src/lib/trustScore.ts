/** Trust score scale (matches backend). */
export const TRUST_MIN = 0;
export const TRUST_MAX = 1000;

export function clampTrustScore(score: number): number {
  return Math.max(TRUST_MIN, Math.min(TRUST_MAX, score));
}

export type TrustTier = {
  band: "Excellent" | "Good" | "Average" | "Risky";
  rangeLabel: string;
  recommendation: string;
};

/**
 * Tier bands on 0–1000 scale (aligned with product spec).
 */
export function getTrustTier(score: number): TrustTier {
  const s = clampTrustScore(score);
  if (s >= 750) {
    return {
      band: "Excellent",
      rangeLabel: "750 – 1000",
      recommendation: "Accept immediately. Minimal deposit required.",
    };
  }
  if (s >= 650) {
    return {
      band: "Good",
      rangeLabel: "650 – 749",
      recommendation: "Safe to accept. Standard background terms.",
    };
  }
  if (s >= 500) {
    return {
      band: "Average",
      rangeLabel: "500 – 649",
      recommendation: "Acceptable, but review historic feedback notes carefully.",
    };
  }
  return {
    band: "Risky",
    rangeLabel: "0 – 499",
    recommendation: "High chance of default or conflict. Rejection advised or require heavy deposit.",
  };
}

/** Position 0–1 for meter fill */
export function trustScoreToRatio(score: number): number {
  return clampTrustScore(score) / TRUST_MAX;
}
