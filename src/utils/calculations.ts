export type RailingEstimate = {
  length: number;
  height: number;
  area: number;
  panels: number;
  rate: number;
  total: number;
  standardModuleWidth: number;
  isCustom: boolean;
};

export type Estimate = {
  quantity: number;
  area: number;
  totalArea: number;
  rate: number;
  total: number;
};

/** Formats square footage cleanly without trailing zeroes (e.g., 70, 70.5, 125.75). */
export function formatArea(sqft: number): string {
  if (!Number.isFinite(sqft) || sqft <= 0) return "0 sq.ft.";
  const formatted = Number(sqft.toFixed(2));
  return `${formatted} sq.ft.`;
}

/** Formats panel count with approximate tilde symbol (e.g. ~5 panels). */
export function formatPanels(panels: number): string {
  if (!Number.isFinite(panels) || panels <= 0) return "~0 panels";
  return `~${Math.ceil(panels)} panels`;
}

export const VAT_RATE = 0.13; // 13% standard VAT

/**
 * Single source of truth for House of Shakya boundary railing calculations.
 *
 * 1. Area = Length × Height
 * 2. Panels = Ceiling(Length ÷ Standard Module Width)
 * 3. Total = (Area × Rate) + 13% VAT (for non-custom)
 */
export function calculateRailingEstimate(
  length: number,
  height: number,
  rate: number,
  standardModuleWidth = 4,
  isCustom = false,
): RailingEstimate {
  const l = Number.isFinite(length) && length > 0 ? Number(length.toFixed(2)) : 0;
  const h = Number.isFinite(height) && height > 0 ? Number(height.toFixed(2)) : 3.5;
  const r = Number.isFinite(rate) && rate > 0 ? rate : 0;
  const modWidth =
    Number.isFinite(standardModuleWidth) && standardModuleWidth > 0
      ? standardModuleWidth
      : 4;

  const rawArea = l * h;
  const area = Number(rawArea.toFixed(2));
  const panels = l > 0 ? Math.ceil(l / modWidth) : 0;
  const subtotal = area * r;
  const total = isCustom ? 0 : Math.round(subtotal * (1 + VAT_RATE));

  return {
    length: l,
    height: h,
    area,
    panels,
    rate: r,
    total,
    standardModuleWidth: modWidth,
    isCustom,
  };
}

/** Legacy estimation function maintained for compatibility. */
export function calculateEstimate(quantity: number, area: number, rate: number): Estimate {
  const q = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0;
  const a = Number.isFinite(area) && area > 0 ? area : 0;
  const r = Number.isFinite(rate) && rate > 0 ? rate : 0;
  const totalArea = q * a;
  const subtotal = totalArea * r;
  const total = Math.round(subtotal * (1 + VAT_RATE));
  return { quantity: q, area: a, totalArea, rate: r, total };
}
