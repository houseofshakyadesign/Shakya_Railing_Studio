import express from "express";
import crypto from "crypto";
import { query } from "../db.js";
import { requireAuth } from "./auth.js";

export const router = express.Router();

function formatProduct(p) {
  const price = p.price_per_sqft === null || p.price_per_sqft === undefined || p.is_custom ? null : Number(p.price_per_sqft);
  return {
    id: p.id,
    code: p.code,
    slug: p.slug || "",
    name: p.display_name || p.name,
    displayName: p.display_name || p.name,
    nepaliName: p.nepali_name || "",
    englishName: p.english_name || "",
    category: p.category || "",
    application: p.application || "",
    description: p.description || "",
    material: p.material || "",
    primer: p.primer || "",
    finish: p.finish || "",
    construction: p.construction || "",
    note: p.note || "",
    pricePerSqft: price,
    standardModuleWidth: Number(p.standard_module_width) || 4.0,
    standardHeight: Number(p.standard_height) || 3.5,
    image: p.image || "",
    gallery: typeof p.gallery === "string" ? JSON.parse(p.gallery || "[]") : p.gallery || [],
    features: typeof p.features === "string" ? JSON.parse(p.features || "[]") : p.features || [],
    applications: typeof p.applications === "string" ? JSON.parse(p.applications || "[]") : p.applications || [],
    isCustom: Boolean(p.is_custom || price === null),
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
    /* silent */
    return res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/all (all products including inactive, for admin)
router.get("/all", requireAuth, async (req, res) => {
  try {
    const rows = await query("SELECT * FROM products ORDER BY display_order ASC, code ASC");
    return res.json(rows.map(formatProduct));
  } catch (err) {
    /* silent */
    return res.status(500).json({ error: "Failed to fetch all products" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM products WHERE id = ? OR slug = ? LIMIT 1", [req.params.id, req.params.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json(formatProduct(rows[0]));
  } catch (err) {
    /* silent */
    return res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/products (create product - admin only)
router.post("/", requireAuth, async (req, res) => {
  try {
    const p = req.body;
    const id = p.id || `prod_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const gallery = JSON.stringify(p.gallery || []);
    const features = JSON.stringify(p.features || []);
    const applications = JSON.stringify(p.applications || []);

    await query(
      `INSERT INTO products (id, code, slug, name, display_name, nepali_name, english_name, category, application, primer, finish, construction, note, description, material, price_per_sqft, standard_module_width, standard_height, image, gallery, features, applications, is_custom, is_active, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        p.code,
        p.slug || "",
        p.displayName || p.name || "",
        p.displayName || p.name || "",
        p.nepaliName || "",
        p.englishName || "",
        p.category || "",
        p.application || "",
        p.primer || "",
        p.finish || "",
        p.construction || "",
        p.note || "",
        p.description || "",
        p.material || "",
        p.pricePerSqft === null || p.pricePerSqft === undefined ? null : Number(p.pricePerSqft),
        p.standardModuleWidth || 4.0,
        p.standardHeight || 3.5,
        p.image || "",
        gallery,
        features,
        applications,
        p.isCustom || p.pricePerSqft === null ? 1 : 0,
        p.isActive !== undefined ? (p.isActive ? 1 : 0) : 1,
        p.displayOrder || 0,
      ]
    );

    const created = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
    return res.status(201).json(formatProduct(created[0]));
  } catch (err) {
    /* silent */
    return res.status(500).json({ error: "Failed to create product" });
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
       SET code = ?, slug = ?, name = ?, display_name = ?, nepali_name = ?, english_name = ?, category = ?, application = ?, primer = ?, finish = ?, construction = ?, note = ?, description = ?, material = ?, price_per_sqft = ?, standard_module_width = ?, standard_height = ?, image = ?, gallery = ?, features = ?, applications = ?, is_custom = ?, is_active = ?, display_order = ?
       WHERE id = ?`,
      [
        p.code,
        p.slug || "",
        p.displayName || p.name || "",
        p.displayName || p.name || "",
        p.nepaliName || "",
        p.englishName || "",
        p.category || "",
        p.application || "",
        p.primer || "",
        p.finish || "",
        p.construction || "",
        p.note || "",
        p.description || "",
        p.material || "",
        p.pricePerSqft === null || p.pricePerSqft === undefined ? null : Number(p.pricePerSqft),
        p.standardModuleWidth || 4.0,
        p.standardHeight || 3.5,
        p.image || "",
        gallery,
        features,
        applications,
        p.isCustom || p.pricePerSqft === null ? 1 : 0,
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
    return res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id (admin only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await query("DELETE FROM products WHERE id = ?", [req.params.id]);
    return res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    /* silent */
    return res.status(500).json({ error: "Failed to delete product" });
  }
});
