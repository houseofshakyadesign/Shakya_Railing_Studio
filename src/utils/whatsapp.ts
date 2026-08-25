import { formatNPR } from "./currency";
import type { Enquiry } from "@/hooks/useStudio";

export function generateWhatsAppMessage(e: Enquiry, currency = "NPR"): string {
  const lines = [
    "Hello House of Shakya,",
    "I would like to enquire about a railing.",
    "",
    "RAILING",
    `${e.productCode} — ${e.productName}`,
    "",
    "MATERIAL",
    e.material,
    "",
  ];

  if (e.isCustom) {
    lines.push("REQUIREMENT", "Custom quote request", "");
    if (e.quantity > 0) lines.push("QUANTITY", String(e.quantity), "");
    if (e.area > 0) lines.push("APPROX. AREA / UNIT", `${e.area} sq.ft.`, "");
  } else {
    lines.push(
      "QUANTITY",
      String(e.quantity),
      "",
      "AREA PER UNIT",
      `${e.area} sq.ft.`,
      "",
      "TOTAL AREA",
      `${e.totalArea} sq.ft.`,
      "",
      "RATE",
      `${formatNPR(e.rate, currency)} / sq.ft.`,
      "",
      "ESTIMATED TOTAL",
      formatNPR(e.estimatedTotal, currency),
      "",
    );
  }

  lines.push(
    "CUSTOMER",
    e.customerName,
    "",
    "PHONE",
    e.phone,
    "",
    "PROJECT LOCATION",
    e.location,
    "",
    "PROJECT TYPE",
    e.projectType,
    "",
    "ADDITIONAL REQUIREMENTS",
    e.additionalRequirements?.trim() ||
      "Please provide the final quotation and installation details.",
    "",
    "Thank you.",
  );

  return lines.join("\n");
}

export function buildWhatsAppUrl(e: Enquiry, number: string, currency = "NPR"): string {
  const digits = (number || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(
    generateWhatsAppMessage(e, currency),
  )}`;
}

/** Returns false when the window could not be opened (popup blocked / unavailable). */
export function openWhatsApp(e: Enquiry, number: string, currency = "NPR"): boolean {
  const digits = (number || "").replace(/\D/g, "");
  if (!digits || digits.length < 8) return false;
  const win = window.open(buildWhatsAppUrl(e, number, currency), "_blank", "noopener,noreferrer");
  return Boolean(win);
}
