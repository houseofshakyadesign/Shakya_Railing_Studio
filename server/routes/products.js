import express from "express";
import { query } from "../db.js";
import { requireAuth } from "./auth.js";

export const router = express.Router();

function formatProduct(p) {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description || "",
    material: p.material || "",
    pricePerSqft: Number(p.price_per_sqft) || 0,
    standardModuleWidth: Number(p.standard_module_width) || 4.0,
    standardHeight: Number(p.standard_height) || 3.5,
    image: p.image || "",
    gallery: typeof p.gallery === "string" ? JSON.parse(p.gallery || "[]") : p.gallery || [],
    features: typeof p.features === "string" ? JSON.parse(p.features || "[]") : p.features || [],
    applications: typeof p.applications === "string" ? JSON.parse(p.applications || "[]") : p.applications || [],
    isCustom: Boolean(p.is_custom),
    isActive: Boolean(p.is_active),
    displayOrder: p.display_order || 0,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// GET /api/products (active products sorted by display_order)
router.get("/", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM products WHERE is_active = 1 ORDER BY display_order ASC, code ASC");
    return res.json(rows.map(formatProduct));
  } catch (err) {
    console.error("GET /api/products error:", err);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/all (all products including inactive, for admin)
router.get("/all", requireAuth, async (req, res) => {
  try {
    const rows = await query("SELECT * FROM products ORDER BY display_order ASC, code ASC");
    return res.json(rows.map(formatProduct));
  } catch (err) {
    console.error("GET /api/products/all error:", err);
    return res.status(500).json({ error: "Failed to fetch all products" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [req.params.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json(formatProduct(rows[0]));
  } catch (err) {
    console.error("GET /api/products/:id error:", err);
    return res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/products (create product - admin only)
router.post("/", requireAuth, async (req, res) => {
  try {
    const p = req.body;
    const id = p.id || `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const gallery = JSON.stringify(p.gallery || []);
    const features = JSON.stringify(p.features || []);
    const applications = JSON.stringify(p.applications || []);

    await query(
      `INSERT INTO products (id, code, name, description, material, price_per_sqft, standard_module_width, standard_height, image, gallery, features, applications, is_custom, is_active, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        p.code,
        p.name,
        p.description || "",
        p.material || "",
        p.pricePerSqft || 0,
        p.standardModuleWidth || 4.0,
        p.standardHeight || 3.5,
        p.image || "",
        gallery,
        features,
        applications,
        p.isCustom ? 1 : 0,
        p.isActive !== undefined ? (p.isActive ? 1 : 0) : 1,
        p.displayOrder || 0,
      ]
    );

    const created = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
    return res.status(201).json(formatProduct(created[0]));
  } catch (err) {
    console.error("POST /api/products error:", err);
    return res.status(500).json({ error: err.message || "Failed to create product" });
  }
});

// PUT /api/products/:id (update product - admin only)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const p = req.body;
    const id = req.params.id;
    const gallery = JSON.stringify(p.gallery || []);
    const features = JSON.stringify(p.features || []);
    const applications = JSON.stringify(p.applications || []);

    await query(
      `UPDATE products 
       SET code = ?, name = ?, description = ?, material = ?, price_per_sqft = ?, standard_module_width = ?, standard_height = ?, image = ?, gallery = ?, features = ?, applications = ?, is_custom = ?, is_active = ?, display_order = ?
       WHERE id = ?`,
      [
        p.code,
        p.name,
        p.description || "",
        p.material || "",
        p.pricePerSqft || 0,
        p.standardModuleWidth || 4.0,
        p.standardHeight || 3.5,
        p.image || "",
        gallery,
        features,
        applications,
        p.isCustom ? 1 : 0,
        p.isActive !== undefined ? (p.isActive ? 1 : 0) : 1,
        p.displayOrder || 0,
        id,
      ]
    );

    const updated = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
    if (!updated || updated.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json(formatProduct(updated[0]));
  } catch (err) {
    console.error("PUT /api/products/:id error:", err);
    return res.status(500).json({ error: err.message || "Failed to update product" });
  }
});

// DELETE /api/products/:id (admin only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await query("DELETE FROM products WHERE id = ?", [req.params.id]);
    return res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("DELETE /api/products/:id error:", err);
    return res.status(500).json({ error: "Failed to delete product" });
  }
});
