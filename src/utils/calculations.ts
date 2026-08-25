export type Estimate = { quantity: number; area: number; totalArea: number; rate: number; total: number };

/** Single source of truth for pricing math. */
export function calculateEstimate(quantity: number, area: number, rate: number): Estimate {
  const q = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0;
  const a = Number.isFinite(area) && area > 0 ? area : 0;
  const r = Number.isFinite(rate) && rate > 0 ? rate : 0;
  const totalArea = q * a;
  return { quantity: q, area: a, totalArea, rate: r, total: Math.round(totalArea * r) };
}
