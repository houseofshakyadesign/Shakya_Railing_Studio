import express from "express";
import { query } from "../db.js";
import { requireAuth } from "./auth.js";

export const router = express.Router();

function formatSettings(s) {
  return {
    companyName: s.company_name,
    studioName: s.studio_name,
    whatsappNumber: s.whatsapp_number,
    phone: s.phone,
    email: s.email,
    address: s.address,
    currency: s.currency,
    currencyLocale: s.currency_locale,
    instagram: s.instagram,
    tiktok: s.tiktok,
    website: s.website,
    updatedAt: s.updated_at,
  };
}

// GET /api/settings
router.get("/", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM settings WHERE id = 'default' LIMIT 1");
    if (!rows || rows.length === 0) {
      return res.json({
        companyName: "Metal Work Nepal",
        studioName: "Architectural Studio",
        whatsappNumber: "9779843935689",
        phone: "+977 984-3935689",
        email: "info@metalworknepal.com",
        address: "Imadole, Mahalaxmi, Nepal",
        currency: "NPR",
        currencyLocale: "en-IN",
        instagram: "https://www.instagram.com/metalwork.nepal?igsi=MWg2cTdxNzY1NmFnag==",
        tiktok: "https://www.tiktok.com/@metalworknepal?_r=1&_t=ZS-99CUIO2Y89o",
        website: "https://metalworknepal.com",
      });
    }
    return res.json(formatSettings(rows[0]));
  } catch (err) {
    console.error("GET /api/settings error:", err);
    return res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// PUT /api/settings (admin only)
router.put("/", requireAuth, async (req, res) => {
  try {
    const s = req.body || {};
    const existingRows = await query("SELECT * FROM settings WHERE id = 'default' LIMIT 1");
    const existing = existingRows && existingRows.length > 0 ? existingRows[0] : {};

    const companyName =
      s.companyName !== undefined
        ? s.companyName
        : s.company_name !== undefined
          ? s.company_name
          : existing.company_name || "Metal Work Nepal";

    const studioName =
      s.studioName !== undefined
        ? s.studioName
        : s.studio_name !== undefined
          ? s.studio_name
          : existing.studio_name || "Architectural Studio";

    const whatsappNumber =
      s.whatsappNumber !== undefined
        ? s.whatsappNumber
        : s.whatsapp_number !== undefined
          ? s.whatsapp_number
          : existing.whatsapp_number || "9779843935689";

    const phone = s.phone !== undefined ? s.phone : existing.phone || "+977 984-3935689";

    const email = s.email !== undefined ? s.email : existing.email || "info@metalworknepal.com";

    const address =
      s.address !== undefined ? s.address : existing.address || "Imadole, Mahalaxmi, Nepal";

    const currency = s.currency !== undefined ? s.currency : existing.currency || "NPR";

    const currencyLocale =
      s.currencyLocale !== undefined
        ? s.currencyLocale
        : s.currency_locale !== undefined
          ? s.currency_locale
          : existing.currency_locale || "en-IN";

    const instagram = s.instagram !== undefined ? s.instagram : existing.instagram || "";

    const tiktok = s.tiktok !== undefined ? s.tiktok : existing.tiktok || "";

    const website = s.website !== undefined ? s.website : existing.website || "";

    await query(
      `UPDATE settings 
       SET company_name = ?, studio_name = ?, whatsapp_number = ?, phone = ?, email = ?, address = ?, currency = ?, currency_locale = ?, instagram = ?, tiktok = ?, website = ?
       WHERE id = 'default'`,
      [
        companyName,
        studioName,
        whatsappNumber,
        phone,
        email,
        address,
        currency,
        currencyLocale,
        instagram,
        tiktok,
        website,
      ],
    );

    const updated = await query("SELECT * FROM settings WHERE id = 'default' LIMIT 1");
    return res.json(formatSettings(updated[0]));
  } catch (err) {
    console.error("PUT /api/settings error:", err);
    return res.status(500).json({ error: "Failed to update settings" });
  }
});
