/** Indian/Nepalese comma grouping: 362500 -> "3,62,500" */
export function groupIndian(amount: number): string {
  const rounded = Math.round(Number.isFinite(amount) ? amount : 0);
  const sign = rounded < 0 ? "-" : "";
  const digits = String(Math.abs(rounded));
  if (digits.length <= 3) return sign + digits;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  return sign + rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
}

/** formatNPR(362500) -> "NPR 3,62,500" */
export function formatNPR(amount: number | null | undefined, currency = "NPR"): string {
  const value = Number.isFinite(amount) ? (amount as number) : 0;
  return `${currency} ${groupIndian(value)}`;
}

export function formatRate(amount: number, currency = "NPR"): string {
  return `${formatNPR(amount, currency)} / sq.ft.`;
}
