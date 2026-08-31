export type RailingTypeSlug = "balcony" | "staircase";

export type RailingTypeConfig = {
  id: string;
  name: string;
  slug: RailingTypeSlug;
  standardHeightFt: number;
  description: string;
};

export const DEFAULT_RAILING_TYPES: RailingTypeConfig[] = [
  {
    id: "balcony",
    name: "Balcony Railing",
    slug: "balcony",
    standardHeightFt: 3.0,
    description: "Standard height: 3 ft",
  },
  {
    id: "staircase",
    name: "Staircase Railing",
    slug: "staircase",
    standardHeightFt: 2.8,
    description: "Standard height: 2.8 ft",
  },
];

export type RailingEstimate = {
  length: number;
  height: number;
  area: number;
  rate: number;
  total: number;
  isCustom: boolean;
  railingType: string;
};

/** Formats square footage cleanly without trailing zeroes (e.g. 60 sq.ft., 56 sq.ft., 62.5 sq.ft.). */
export function formatArea(sqft: number): string {
  if (!Number.isFinite(sqft) || sqft <= 0) return "0 sq.ft.";
  const formatted = Math.round(sqft * 100) / 100;
  return `${formatted} sq.ft.`;
}

export const VAT_RATE = 0.13;

/**
 * Single source of truth for railing calculations.
 *
 * 1. Estimated Area = Length (ft) × Standard Height (ft)
 * 2. Estimated Total Amount = Estimated Area (sq.ft) × Unit Price / Rate (NPR / sq.ft)
 */
export function calculateRailingEstimate(
  length: number,
  height: number,
  rate: number,
  isCustom = false,
  railingType = "Balcony Railing",
): RailingEstimate {
  const l = Number.isFinite(length) && length > 0 ? Number(length.toFixed(2)) : 0;
  const defaultHeight = railingType === "Staircase Railing" ? 2.8 : 3.0;
  const h = Number.isFinite(height) && height > 0 ? Number(height.toFixed(2)) : defaultHeight;
  const r = Number.isFinite(rate) && rate > 0 ? rate : 0;

  const rawArea = l * h;
  const area = Number(rawArea.toFixed(2));
  const total = isCustom ? 0 : Math.round(area * r);

  return {
    length: l,
    height: h,
    area,
    rate: r,
    total,
    isCustom,
    railingType,
  };
}
