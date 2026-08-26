/**
 * Metal Work Nepal
 * Central configuration.
 */

export const WHATSAPP_NUMBER = "9779843935689";

export type Settings = {
  companyName: string;
  studioName: string;
  whatsappNumber: string;
  currency: string;
  currencyLocale: string;
  email: string;
  phone: string;
  address: string;
  instagram: string;
  tiktok: string;
  website: string;
  adminPassword: string;
};

export const DEFAULT_SETTINGS: Settings = {
  companyName: "Metal Work Nepal",
  studioName: "Architectural Studio",
  whatsappNumber: WHATSAPP_NUMBER,
  currency: "NPR",
  currencyLocale: "en-IN",
  email: "info@metalworknepal.com",
  phone: "+977 984-3935689",
  address: "Imadole, Mahalaxmi, Nepal",
  instagram: "https://www.instagram.com/metalwork.nepal?igsi=MWg2cTdxNzY1NmFnag==",
  tiktok: "https://www.tiktok.com/@metalworknepal?_r=1&_t=ZS-99CUIO2Y89o",
  website: "https://metalworknepal.com",
  adminPassword: "shakya2026",
};

export const STORAGE_KEYS = {
  products: "metalWorkNepal_products",
  enquiries: "metalWorkNepal_enquiries",
  selected: "metalWorkNepal_selectedRailing",
  settings: "metalWorkNepal_settings",
  admin: "metalWorkNepal_adminSession",
  length: "metalWorkNepal_length",
  height: "metalWorkNepal_height",
} as const;
