import express from "express";
import crypto from "crypto";
import { query } from "../db.js";
import { requireAuth } from "./auth.js";

export const router = express.Router();

function formatProduct(p) {
  const price =
    p.price_per_sqft === null || p.price_per_sqft === undefined || p.is_custom
      ? null
      : Number(p.price_per_sqft);
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
    applications:
      typeof p.applications === "string"
        ? JSON.parse(p.applications || "[]")
        : p.applications || [],
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
    const rows = await query(
      "SELECT * FROM products WHERE is_active = 1 ORDER BY display_order ASC, code ASC",
    );
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
    const rows = await query("SELECT * FROM products WHERE id = ? OR slug = ? LIMIT 1", [
      req.params.id,
      req.params.id,
    ]);
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
    const p = req.body || {};
    const id = p.id || `prod_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const gallery = JSON.stringify(p.gallery || []);
    const features = JSON.stringify(p.features || []);
    const applications = JSON.stringify(p.applications || []);
    const name = p.displayName || p.display_name || p.name || "";
    const price =
      p.pricePerSqft !== undefined
        ? p.pricePerSqft
        : p.price_per_sqft !== undefined
          ? p.price_per_sqft
          : null;
    const priceVal = price === null || price === undefined ? null : Number(price);
    const isCustom =
      p.isCustom !== undefined
        ? Boolean(p.isCustom)
        : p.is_custom !== undefined
          ? Boolean(p.is_custom)
          : priceVal === null;
    const isActive =
      p.isActive !== undefined
        ? Boolean(p.isActive)
        : p.is_active !== undefined
          ? Boolean(p.is_active)
          : true;

    await query(
      `INSERT INTO products (id, code, slug, name, display_name, nepali_name, english_name, category, application, primer, finish, construction, note, description, material, price_per_sqft, standard_module_width, standard_height, image, gallery, features, applications, is_custom, is_active, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        p.code || "",
        p.slug || "",
        name,
        name,
        p.nepaliName || p.nepali_name || "",
        p.englishName || p.english_name || "",
        p.category || "",
        p.application || "",
        p.primer || "",
        p.finish || "",
        p.construction || "",
        p.note || "",
        p.description || "",
        p.material || "",
        priceVal,
        Number(p.standardModuleWidth ?? p.standard_module_width) || 4.0,
        Number(p.standardHeight ?? p.standard_height) || 3.5,
        p.image || "",
        gallery,
        features,
        applications,
        isCustom ? 1 : 0,
        isActive ? 1 : 0,
        Number(p.displayOrder ?? p.display_order) || 0,
      ],
    );

    const created = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
    return res.status(201).json(formatProduct(created[0]));
  } catch (err) {
    console.error("POST /api/products error:", err);
    return res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id (update product - admin only)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const p = req.body || {};
    const id = req.params.id;

    const existingRows = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
    if (!existingRows || existingRows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const existing = existingRows[0];

    const code = p.code !== undefined ? p.code : existing.code;
    const slug = p.slug !== undefined ? p.slug : existing.slug || "";
    const name =
      p.displayName !== undefined
        ? p.displayName
        : p.display_name !== undefined
          ? p.display_name
          : p.name !== undefined
            ? p.name
            : existing.display_name || existing.name;

    const nepaliName =
      p.nepaliName !== undefined
        ? p.nepaliName
        : p.nepali_name !== undefined
          ? p.nepali_name
          : existing.nepali_name || "";

    const englishName =
      p.englishName !== undefined
        ? p.englishName
        : p.english_name !== undefined
          ? p.english_name
          : existing.english_name || "";

    const category = p.category !== undefined ? p.category : existing.category || "";
    const application = p.application !== undefined ? p.application : existing.application || "";
    const primer = p.primer !== undefined ? p.primer : existing.primer || "";
    const finish = p.finish !== undefined ? p.finish : existing.finish || "";
    const construction =
      p.construction !== undefined ? p.construction : existing.construction || "";
    const note = p.note !== undefined ? p.note : existing.note || "";
    const description = p.description !== undefined ? p.description : existing.description || "";
    const material = p.material !== undefined ? p.material : existing.material || "";

    const price =
      p.pricePerSqft !== undefined
        ? p.pricePerSqft
        : p.price_per_sqft !== undefined
          ? p.price_per_sqft
          : existing.price_per_sqft;
    const priceVal = price === null || price === undefined ? null : Number(price);

    const standardModuleWidth =
      p.standardModuleWidth !== undefined
        ? Number(p.standardModuleWidth)
        : p.standard_module_width !== undefined
          ? Number(p.standard_module_width)
          : Number(existing.standard_module_width) || 4.0;

    const standardHeight =
      p.standardHeight !== undefined
        ? Number(p.standardHeight)
        : p.standard_height !== undefined
          ? Number(p.standard_height)
          : Number(existing.standard_height) || 3.5;

    const image = p.image !== undefined ? p.image : existing.image || "";

    const gallery = p.gallery !== undefined ? JSON.stringify(p.gallery) : existing.gallery || "[]";

    const features =
      p.features !== undefined ? JSON.stringify(p.features) : existing.features || "[]";

    const applications =
      p.applications !== undefined ? JSON.stringify(p.applications) : existing.applications || "[]";

    const isCustom =
      p.isCustom !== undefined
        ? Boolean(p.isCustom)
        : p.is_custom !== undefined
          ? Boolean(p.is_custom)
          : priceVal === null;

    const isActive =
      p.isActive !== undefined
        ? Boolean(p.isActive)
        : p.is_active !== undefined
          ? Boolean(p.is_active)
          : Boolean(existing.is_active);

    const displayOrder =
      p.displayOrder !== undefined
        ? Number(p.displayOrder)
        : p.display_order !== undefined
          ? Number(p.display_order)
          : Number(existing.display_order) || 0;

    await query(
      `UPDATE products 
       SET code = ?, slug = ?, name = ?, display_name = ?, nepali_name = ?, english_name = ?, category = ?, application = ?, primer = ?, finish = ?, construction = ?, note = ?, description = ?, material = ?, price_per_sqft = ?, standard_module_width = ?, standard_height = ?, image = ?, gallery = ?, features = ?, applications = ?, is_custom = ?, is_active = ?, display_order = ?
       WHERE id = ?`,
      [
        code,
        slug,
        name,
        name,
        nepaliName,
        englishName,
        category,
        application,
        primer,
        finish,
        construction,
        note,
        description,
        material,
        priceVal,
        standardModuleWidth,
        standardHeight,
        image,
        gallery,
        features,
        applications,
        isCustom ? 1 : 0,
        isActive ? 1 : 0,
        displayOrder,
        id,
      ],
    );

    const updated = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
    return res.json(formatProduct(updated[0]));
  } catch (err) {
    console.error("PUT /api/products/:id error:", err);
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
