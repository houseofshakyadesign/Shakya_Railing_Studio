import type { Enquiry } from "@/hooks/useStudio";

const HEADERS = [
  "Date",
  "Customer Name",
  "Phone",
  "Email",
  "Location",
  "Project Type",
  "Railing Code",
  "Railing Name",
  "Length (ft)",
  "Height (ft)",
  "Estimated Area (sq.ft.)",
  "Estimated Panels",
  "Rate",
  "Estimated Total",
  "Status",
  "Additional Requirements",
];

function cell(v: string | number): string {
  const s = String(v ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

export function enquiriesToCSV(enquiries: Enquiry[]): string {
  const rows = enquiries.map((e) =>
    [
      new Date(e.createdAt).toLocaleString(),
      e.customerName,
      e.phone,
      e.email,
      e.location,
      e.projectType,
      e.productCode,
      e.productName,
      e.lengthFt ? e.lengthFt : "—",
      e.heightFt ? e.heightFt : "—",
      e.estimatedAreaSqft ? e.estimatedAreaSqft : (e.area ? e.area : "—"),
      e.estimatedPanelQuantity ? `~${e.estimatedPanelQuantity}` : "—",
      e.isCustom ? "CUSTOM" : e.rate,
      e.isCustom ? "CUSTOM" : e.estimatedTotal,
      e.status,
      e.additionalRequirements,
    ]
      .map(cell)
      .join(","),
  );
  return [HEADERS.map(cell).join(","), ...rows].join("\r\n");
}

export function downloadCSV(enquiries: Enquiry[], filename = "house-of-shakya-enquiries.csv") {
  const blob = new Blob(["\uFEFF" + enquiriesToCSV(enquiries)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
