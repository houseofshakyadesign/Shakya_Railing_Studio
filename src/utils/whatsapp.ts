import { formatNPR } from "./currency";
import { formatArea } from "./calculations";
import type { Enquiry } from "@/hooks/useStudio";

export function generateWhatsAppMessage(e: Enquiry, currency = "NPR"): string {
  const lines = [
    "METAL WORK NEPAL RAILING ENQUIRY",
    "",
    "Railing:",
    `${e.productCode} — ${e.productName}`,
    "",
    "Railing Type:",
    e.railingType || "Balcony Railing",
    "",
    "Length:",
    `${e.lengthFt} ft`,
    "",
    "Standard Height:",
    `${e.heightFt} ft`,
    "",
    "Estimated Area:",
    formatArea(e.estimatedAreaSqft),
    "",
  ];

  if (e.isCustom) {
    lines.push("Rate:", "Custom Quote", "", "Estimated Price:", "Pricing will be confirmed based on final design", "");
  } else {
    lines.push(
      "Rate:",
      `${formatNPR(e.rate, currency)}/sq.ft.`,
      "",
      "Estimated Price:",
      formatNPR(e.estimatedPrice || e.estimatedTotal, currency),
      "",
    );
  }

  lines.push(
    "Customer:",
    e.customerName,
    "",
    "Phone:",
    e.phone,
    "",
    "Location:",
    e.location,
    "",
    "Additional Requirements:",
    e.additionalRequirements?.trim() || "Please provide the quotation and site measurement confirmation.",
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
