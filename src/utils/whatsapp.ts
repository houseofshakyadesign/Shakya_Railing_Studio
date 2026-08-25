import { formatNPR } from "./currency";
import { formatArea, formatPanels } from "./calculations";
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

  if (e.lengthFt > 0) {
    lines.push("LENGTH", `${e.lengthFt} ft`, "");
    lines.push("HEIGHT", `${e.heightFt} ft`, "");
    lines.push("ESTIMATED AREA", formatArea(e.estimatedAreaSqft), "");
    lines.push("ESTIMATED PANELS", formatPanels(e.estimatedPanelQuantity), "");
  } else if (e.area > 0) {
    lines.push("ESTIMATED AREA", `${e.area} sq.ft.`, "");
  }

  if (e.isCustom) {
    lines.push("ESTIMATED PRICE", "Custom Quote (to be confirmed)", "");
  } else {
    lines.push(
      "RATE",
      `${formatNPR(e.rate, currency)} / sq.ft.`,
      "",
      "ESTIMATED PRICE",
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

export function openWhatsApp(e: Enquiry, number: string, currency = "NPR"): boolean {
  if (typeof window === "undefined") return false;
  const url = buildWhatsAppUrl(e, number, currency);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  return Boolean(win);
}
