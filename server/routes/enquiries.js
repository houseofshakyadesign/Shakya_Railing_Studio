import express from "express";
import { query } from "../db.js";
import { requireAuth } from "./auth.js";

export const router = express.Router();

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
    console.error("GET /api/enquiries error:", err);
    return res.status(500).json({ error: "Failed to fetch enquiries" });
  }
});

// POST /api/enquiries (public customer quotation submission)
router.post("/", async (req, res) => {
  try {
    const e = req.body;
    const id = e.id || `enq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const estimatedPrice = Number(e.estimatedPrice || e.estimatedTotal) || 0;

    await query(
      `INSERT INTO enquiries (
        id, customer_name, phone, email, location, project_type, railing_type,
        product_id, product_code, product_name, material, is_custom,
        length_ft, height_ft, estimated_area_sqft,
        rate, estimated_price, estimated_total, status, additional_requirements
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        e.customerName || "Anonymous Customer",
        e.phone || "",
        e.email || null,
        e.location || "",
        e.projectType || "Residential",
        e.railingType || "Balcony Railing",
        e.productId || "",
        e.productCode || "",
        e.productName || "",
        e.material || "",
        e.isCustom ? 1 : 0,
        e.lengthFt || 0,
        e.heightFt || 3.0,
        e.estimatedAreaSqft || 0,
        e.rate || 0,
        estimatedPrice,
        estimatedPrice,
        e.status || "new",
        e.additionalRequirements || "",
      ]
    );

    const created = await query("SELECT * FROM enquiries WHERE id = ? LIMIT 1", [id]);
    return res.status(201).json(formatEnquiry(created[0]));
  } catch (err) {
    console.error("POST /api/enquiries error:", err);
    return res.status(500).json({ error: err.message || "Failed to record enquiry" });
  }
});

// PATCH /api/enquiries/:id/status (admin only)
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
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
