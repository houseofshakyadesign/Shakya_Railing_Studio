import express from "express";
import crypto from "crypto";
import { query } from "../db.js";
import { requireAuth } from "./auth.js";
import { rateLimit } from "../rateLimit.js";

export const router = express.Router();

const ALLOWED_STATUSES = ["new", "in_review", "quoted", "confirmed", "archived"];

function formatEnquiry(e) {
  return {
    id: e.id,
    customerName: e.customer_name,
    phone: e.phone,
    email: e.email || "",
    location: e.location,
    projectType: e.project_type || "Residential",
    railingType: e.railing_type || "Balcony Railing",
    productId: e.product_id,
    productCode: e.product_code,
    productName: e.product_name,
    material: e.material,
    isCustom: Boolean(e.is_custom),
    lengthFt: Number(e.length_ft) || 0,
    heightFt: Number(e.height_ft) || 3.0,
    estimatedAreaSqft: Number(e.estimated_area_sqft) || 0,
    rate: Number(e.rate) || 0,
    estimatedPrice: Number(e.estimated_price) || 0,
    estimatedTotal: Number(e.estimated_total || e.estimated_price) || 0,
    status: e.status || "new",
    additionalRequirements: e.additional_requirements || "",
    createdAt: e.created_at,
  };
}

// GET /api/enquiries (admin only)
router.get("/", requireAuth, async (req, res) => {
  try {
    const rows = await query("SELECT * FROM enquiries ORDER BY created_at DESC");
    return res.json(rows.map(formatEnquiry));
  } catch (err) {
    /* silent */
    return res.status(500).json({ error: "Failed to fetch enquiries" });
  }
});

// POST /api/enquiries (public customer quotation submission)
router.post(
  "/",
  rateLimit({ windowMs: 60000, max: 20, message: "Too many enquiries. Please try again later." }),
  async (req, res) => {
    try {
      const e = req.body || {};
      const id = e.id || `enq_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;
      const estimatedPrice =
        Number(e.estimatedPrice ?? e.estimated_price ?? e.estimatedTotal ?? e.estimated_total) || 0;
      const customerName = e.customerName || e.customer_name || "Anonymous Customer";
      const phone = e.phone || "";
      const email = e.email || null;
      const location = e.location || "";
      const projectType = e.projectType || e.project_type || "Residential";
      const railingType = e.railingType || e.railing_type || "Balcony Railing";
      const productId = e.productId || e.product_id || "";
      const productCode = e.productCode || e.product_code || "";
      const productName = e.productName || e.product_name || "";
      const material = e.material || "";
      const isCustom = (e.isCustom !== undefined ? e.isCustom : e.is_custom) ? 1 : 0;
      const lengthFt = Number(e.lengthFt ?? e.length_ft) || 0;
      const heightFt = Number(e.heightFt ?? e.height_ft) || 3.0;
      const estimatedAreaSqft = Number(e.estimatedAreaSqft ?? e.estimated_area_sqft) || 0;
      const rate = Number(e.rate) || 0;
      const status = e.status || "new";
      const additionalRequirements = e.additionalRequirements || e.additional_requirements || "";

      await query(
        `INSERT INTO enquiries (
        id, customer_name, phone, email, location, project_type, railing_type,
        product_id, product_code, product_name, material, is_custom,
        length_ft, height_ft, estimated_area_sqft,
        rate, estimated_price, estimated_total, status, additional_requirements
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          customerName,
          phone,
          email,
          location,
          projectType,
          railingType,
          productId,
          productCode,
          productName,
          material,
          isCustom,
          lengthFt,
          heightFt,
          estimatedAreaSqft,
          rate,
          estimatedPrice,
          estimatedPrice,
          status,
          additionalRequirements,
        ],
      );

      const created = await query("SELECT * FROM enquiries WHERE id = ? LIMIT 1", [id]);
      return res.status(201).json(formatEnquiry(created[0]));
    } catch (err) {
      console.error("POST /api/enquiries error:", err);
      return res.status(500).json({ error: "Failed to record enquiry" });
    }
  },
);

// PATCH /api/enquiries/:id/status (admin only)
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}` });
    }

    await query("UPDATE enquiries SET status = ? WHERE id = ?", [status, req.params.id]);
    const updated = await query("SELECT * FROM enquiries WHERE id = ? LIMIT 1", [req.params.id]);
    if (!updated || updated.length === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }
    return res.json(formatEnquiry(updated[0]));
  } catch (err) {
    console.error("PATCH /api/enquiries/:id/status error:", err);
    return res.status(500).json({ error: "Failed to update status" });
  }
});

// DELETE /api/enquiries/:id (admin only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await query("DELETE FROM enquiries WHERE id = ?", [req.params.id]);
    return res.json({ success: true, message: "Enquiry deleted" });
  } catch (err) {
    console.error("DELETE /api/enquiries/:id error:", err);
    return res.status(500).json({ error: "Failed to delete enquiry" });
  }
});
