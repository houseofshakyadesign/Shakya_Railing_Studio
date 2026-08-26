import express from "express";
import { query } from "../db.js";

export const router = express.Router();

function formatRailingType(t) {
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    standardHeightFt: Number(t.standard_height_ft) || (t.slug === "staircase" ? 2.8 : 3.0),
    description: t.description || "",
  };
}

// GET /api/railing-types
router.get("/", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM railing_types ORDER BY id ASC");
    if (!rows || rows.length === 0) {
      return res.json([
        { id: "balcony", name: "Balcony Railing", slug: "balcony", standardHeightFt: 3.0, description: "Standard height: 3 ft" },
        { id: "staircase", name: "Staircase Railing", slug: "staircase", standardHeightFt: 2.8, description: "Standard height: 2.8 ft" },
      ]);
    }
    return res.json(rows.map(formatRailingType));
  } catch (err) {
    console.error("GET /api/railing-types error:", err);
    return res.json([
      { id: "balcony", name: "Balcony Railing", slug: "balcony", standardHeightFt: 3.0, description: "Standard height: 3 ft" },
      { id: "staircase", name: "Staircase Railing", slug: "staircase", standardHeightFt: 2.8, description: "Standard height: 2.8 ft" },
    ]);
  }
});
