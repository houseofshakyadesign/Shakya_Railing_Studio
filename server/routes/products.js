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

  // Content type inference if missing
  const cat = (p.category || "").toUpperCase();
  const isShowcase =
    cat.includes("GLASS") ||
    cat.includes("ENCLOSED") ||
    cat.includes("ROOM") ||
    cat.includes("GATE") ||
    cat.includes("GRILLE") ||
    cat.includes("CUSTOM") ||
    (p.id && String(p.id).toLowerCase().startsWith("mg"));

  const inferredContentType = isShowcase
    ? "SHOWCASE"
    : p.content_type || (cat.includes("RAILING") ? "PRODUCT" : "SHOWCASE");

  return {
    id: p.id,
    code: p.code || "",
    slug: p.slug || "",
    name: p.display_name || p.name || "",
    displayName: p.display_name || p.name || "",
    nepaliName: p.nepali_name || "",
    englishName: p.english_name || "",
    subtitle: p.subtitle || "",
    category: p.category || "RAILINGS",
    contentType: inferredContentType,
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
    video: p.video || "",
    gallery: typeof p.gallery === "string" ? JSON.parse(p.gallery || "[]") : p.gallery || [],
    features: typeof p.features === "string" ? JSON.parse(p.features || "[]") : p.features || [],
    applications:
      typeof p.applications === "string"
        ? JSON.parse(p.applications || "[]")
        : p.applications || [],
    isCustom: Boolean(p.is_custom || price === null),
    featured: Boolean(p.featured),
    isActive: Boolean(p.is_active),
    displayOrder: Number(p.display_order) || 0,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// GET /api/products (active published products sorted by display_order)
router.get("/", async (req, res) => {
  try {
    const rows = await query(
      "SELECT * FROM products WHERE is_active = 1 ORDER BY display_order ASC, code ASC",
    );
    return res.json(rows.map(formatProduct));
  } catch (err) {
    console.error("GET /api/products error:", err);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/all (all products including inactive/drafts, for admin)
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
    const rows = await query("SELECT * FROM products WHERE id = ? OR slug = ? LIMIT 1", [
      req.params.id,
      req.params.id,
    ]);
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
    const p = req.body || {};
    const nepaliName = (p.nepaliName || p.nepali_name || "").trim();
    const englishName = (p.englishName || p.english_name || "").trim();
    const displayName = (p.displayName || p.display_name || p.name || "").trim() || englishName || nepaliName;
    const category = (p.category || "RAILINGS").trim();
    const isRailing = category.toUpperCase().includes("RAILING");
    const contentType = p.contentType || p.content_type || (isRailing ? "PRODUCT" : "SHOWCASE");
    const application = (p.application || "").trim();

    // Server-side validation
    if (!nepaliName && !englishName && !displayName) {
      return res.status(400).json({ error: "Please enter a product name (Nepali or English)." });
    }
    if (!category) {
      return res.status(400).json({ error: "Please select a valid category." });
    }
    if (isRailing && !application) {
      return res.status(400).json({ error: "Railings require an application (Staircase or Balcony / Loft)." });
    }

    const price =
      p.pricePerSqft !== undefined
        ? p.pricePerSqft
        : p.price_per_sqft !== undefined
          ? p.price_per_sqft
          : null;
    const priceVal = price === null || price === undefined || price === "" ? null : Number(price);

    if (isRailing && (priceVal === null || isNaN(priceVal) || priceVal <= 0)) {
      return res.status(400).json({ error: "Railings require a valid price per sq.ft greater than 0." });
    }

    const id = p.id || `prod_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const code = (p.code || "").trim() || `P-${Math.floor(100 + Math.random() * 900)}`;
    const slug = (p.slug || displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();
    const subtitle = (p.subtitle || "").trim();
    const description = (p.description || "").trim();
    const material = (p.material || "").trim();
    const primer = (p.primer || "").trim();
    const finish = (p.finish || "").trim();
    const construction = (p.construction || "").trim();
    const note = (p.note || "").trim();
    const video = (p.video || "").trim();
    const gallery = JSON.stringify(p.gallery || (p.image ? [p.image] : []));
    const features = JSON.stringify(p.features || []);
    const applications = JSON.stringify(
      p.applications && p.applications.length > 0
        ? p.applications
        : application ? [application] : [],
    );
    const isCustom = Boolean(p.isCustom || p.is_custom || priceVal === null);
    const featured = Boolean(p.featured);
    const isActive = p.isActive !== undefined ? Boolean(p.isActive) : p.is_active !== undefined ? Boolean(p.is_active) : true;
    const displayOrder = Number(p.displayOrder ?? p.display_order) || 0;

    await query(
      `INSERT INTO products (id, code, slug, name, display_name, nepali_name, english_name, subtitle, category, content_type, application, primer, finish, construction, note, description, material, price_per_sqft, standard_module_width, standard_height, image, video, gallery, features, applications, is_custom, featured, is_active, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        code,
        slug,
        displayName,
        displayName,
        nepaliName,
        englishName,
        subtitle,
        category,
        contentType,
        application,
        primer,
        finish,
        construction,
        note,
        description,
        material,
        priceVal,
        Number(p.standardModuleWidth ?? p.standard_module_width) || 4.0,
        Number(p.standardHeight ?? p.standard_height) || 3.5,
        p.image || "/images/railings/r01.jpg",
        video,
        gallery,
        features,
        applications,
        isCustom ? 1 : 0,
        featured ? 1 : 0,
        isActive ? 1 : 0,
        displayOrder,
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
    const id = req.params.id;
    const existingRows = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
    if (!existingRows || existingRows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const existing = existingRows[0];
    const p = req.body || {};

    const nepaliName = p.nepaliName !== undefined ? p.nepaliName : p.nepali_name !== undefined ? p.nepali_name : existing.nepali_name || "";
    const englishName = p.englishName !== undefined ? p.englishName : p.english_name !== undefined ? p.english_name : existing.english_name || "";
    const displayName =
      p.displayName !== undefined
        ? p.displayName
        : p.display_name !== undefined
          ? p.display_name
          : p.name !== undefined
            ? p.name
            : existing.display_name || existing.name;

    const category = (p.category !== undefined ? p.category : existing.category || "RAILINGS").trim();
    const isRailing = category.toUpperCase().includes("RAILING");
    const contentType = p.contentType || p.content_type || existing.content_type || (isRailing ? "PRODUCT" : "SHOWCASE");
    const application = p.application !== undefined ? p.application : existing.application || "";

    // Server-side validation
    if (!nepaliName && !englishName && !displayName) {
      return res.status(400).json({ error: "Product name cannot be empty." });
    }
    if (isRailing && !application) {
      return res.status(400).json({ error: "Railings require an application (Staircase or Balcony / Loft)." });
    }

    const price =
      p.pricePerSqft !== undefined
        ? p.pricePerSqft
        : p.price_per_sqft !== undefined
          ? p.price_per_sqft
          : existing.price_per_sqft;
    const priceVal = price === null || price === undefined || price === "" ? null : Number(price);

    if (isRailing && (priceVal === null || isNaN(priceVal) || priceVal <= 0)) {
      return res.status(400).json({ error: "Railings require a valid price per sq.ft greater than 0." });
    }

    const code = p.code !== undefined ? p.code : existing.code;
    const slug = p.slug !== undefined ? p.slug : existing.slug || "";
    const subtitle = p.subtitle !== undefined ? p.subtitle : existing.subtitle || "";
    const primer = p.primer !== undefined ? p.primer : existing.primer || "";
    const finish = p.finish !== undefined ? p.finish : existing.finish || "";
    const construction = p.construction !== undefined ? p.construction : existing.construction || "";
    const note = p.note !== undefined ? p.note : existing.note || "";
    const description = p.description !== undefined ? p.description : existing.description || "";
    const material = p.material !== undefined ? p.material : existing.material || "";
    const video = p.video !== undefined ? p.video : existing.video || "";
    const image = p.image !== undefined ? p.image : existing.image || "";

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

    const gallery = p.gallery !== undefined ? JSON.stringify(p.gallery) : existing.gallery || "[]";
    const features = p.features !== undefined ? JSON.stringify(p.features) : existing.features || "[]";
    const applications = p.applications !== undefined ? JSON.stringify(p.applications) : existing.applications || "[]";

    const isCustom =
      p.isCustom !== undefined
        ? Boolean(p.isCustom)
        : p.is_custom !== undefined
          ? Boolean(p.is_custom)
          : priceVal === null;

    const featured =
      p.featured !== undefined
        ? Boolean(p.featured)
        : Boolean(existing.featured);

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
       SET code = ?, slug = ?, name = ?, display_name = ?, nepali_name = ?, english_name = ?, subtitle = ?, category = ?, content_type = ?, application = ?, primer = ?, finish = ?, construction = ?, note = ?, description = ?, material = ?, price_per_sqft = ?, standard_module_width = ?, standard_height = ?, image = ?, video = ?, gallery = ?, features = ?, applications = ?, is_custom = ?, featured = ?, is_active = ?, display_order = ?
       WHERE id = ?`,
      [
        code,
        slug,
        displayName,
        displayName,
        nepaliName,
        englishName,
        subtitle,
        category,
        contentType,
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
        video,
        gallery,
        features,
        applications,
        isCustom ? 1 : 0,
        featured ? 1 : 0,
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

// POST /api/products/:id/duplicate (duplicate product - admin only)
router.post("/:id/duplicate", requireAuth, async (req, res) => {
  try {
    const rows = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [req.params.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Product not found to duplicate" });
    }
    const source = rows[0];
    const newId = `prod_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const newCode = `${source.code || "ITEM"}-COPY`;
    const newName = `${source.display_name || source.name} (Copy)`;
    const newOrder = (source.display_order || 0) + 1;

    await query(
      `INSERT INTO products (id, code, slug, name, display_name, nepali_name, english_name, subtitle, category, content_type, application, primer, finish, construction, note, description, material, price_per_sqft, standard_module_width, standard_height, image, video, gallery, features, applications, is_custom, featured, is_active, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        newCode,
        `${source.slug || "item"}-copy-${Date.now().toString().slice(-4)}`,
        newName,
        newName,
        source.nepali_name || "",
        source.english_name ? `${source.english_name} (Copy)` : "",
        source.subtitle || "",
        source.category || "",
        source.content_type || "PRODUCT",
        source.application || "",
        source.primer || "",
        source.finish || "",
        source.construction || "",
        source.note || "",
        source.description || "",
        source.material || "",
        source.price_per_sqft,
        source.standard_module_width || 4.0,
        source.standard_height || 3.5,
        source.image || "",
        source.video || "",
        source.gallery || "[]",
        source.features || "[]",
        source.applications || "[]",
        source.is_custom,
        source.featured,
        0, // Duplicates start as draft (unpublished)
        newOrder,
      ],
    );

    const created = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [newId]);
    return res.status(201).json(formatProduct(created[0]));
  } catch (err) {
    console.error("POST /api/products/:id/duplicate error:", err);
    return res.status(500).json({ error: "Failed to duplicate product" });
  }
});

// DELETE /api/products/:id (admin only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    // Check if product exists
    const rows = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete from products table
    await query("DELETE FROM products WHERE id = ?", [id]);
    return res.json({ success: true, message: "Product deleted from database" });
  } catch (err) {
    console.error("DELETE /api/products/:id error:", err);
    return res.status(500).json({ error: "Failed to delete product" });
  }
});
