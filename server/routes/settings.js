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
    const s = req.body;
    await query(
      `UPDATE settings 
       SET company_name = ?, studio_name = ?, whatsapp_number = ?, phone = ?, email = ?, address = ?, currency = ?, currency_locale = ?, instagram = ?, tiktok = ?, website = ?
       WHERE id = 'default'`,
      [
        s.companyName,
        s.studioName,
        s.whatsappNumber,
        s.phone,
        s.email,
        s.address,
        s.currency,
        s.currencyLocale,
        s.instagram,
        s.tiktok,
        s.website,
      ]
    );

    const updated = await query("SELECT * FROM settings WHERE id = 'default' LIMIT 1");
    return res.json(formatSettings(updated[0]));
  } catch (err) {
    console.error("PUT /api/settings error:", err);
    return res.status(500).json({ error: "Failed to update settings" });
  }
});
