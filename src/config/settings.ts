/**
 * House of Shakya — Railing Studio
 * Central configuration. Replace these values to go live.
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
  website: string;
  adminPassword: string;
};

export const DEFAULT_SETTINGS: Settings = {
  companyName: "House of Shakya",
  studioName: "Railing Studio",
  whatsappNumber: WHATSAPP_NUMBER,
  currency: "NPR",
  currencyLocale: "en-IN",
  email: "studio@houseofshakya.com",
  phone: "+977 984-3935689",
  address: "Imadole, Mahalaxmi, Nepal",
  instagram: "https://instagram.com/houseofshakya",
  website: "https://houseofshakya.com",
  // Prototype-only gate. Replace with real auth when a backend is added.
  adminPassword: "shakya2026",
};

export const STORAGE_KEYS = {
  products: "houseOfShakya_products",
  enquiries: "houseOfShakya_enquiries",
  selected: "houseOfShakya_selectedRailing",
  settings: "houseOfShakya_settings",
  admin: "houseOfShakya_adminSession",
  length: "houseOfShakya_length",
  height: "houseOfShakya_height",
} as const;
