import express from "express";
import { query } from "../db.js";
import { requireAuth } from "./auth.js";

const router = express.Router();

// Helper to attach media array to projects
async function attachMediaToProjects(projects) {
  if (!projects || projects.length === 0) return [];
  const projectIds = projects.map((p) => p.id);
  const placeholders = projectIds.map(() => "?").join(",");
  const mediaRows = await query(
    `SELECT * FROM project_media WHERE project_id IN (${placeholders}) ORDER BY display_order ASC, created_at ASC`,
    projectIds,
  );

  const mediaMap = {};
  for (const m of mediaRows) {
    if (!mediaMap[m.project_id]) mediaMap[m.project_id] = [];
    mediaMap[m.project_id].push({
      id: m.id,
      projectId: m.project_id,
      mediaType: m.media_type,
      mediaUrl: m.media_url,
      thumbnailUrl: m.thumbnail_url || m.media_url,
      caption: m.caption || "",
      displayOrder: m.display_order,
      createdAt: m.created_at,
    });
  }

  return projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    location: p.location || "",
    projectType: p.project_type,
    railingType: p.railing_type,
    description: p.description || "",
    coverImage: p.cover_image,
    featured: Boolean(p.featured),
    displayOrder: p.display_order,
    isActive: Boolean(p.is_active),
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    media: mediaMap[p.id] || [],
  }));
}

// 1. GET /api/projects — List all active projects with media
router.get("/", async (req, res) => {
  try {
    const includeInactive = req.query.all === "true" && req.headers.authorization;
    const sql = includeInactive
      ? "SELECT * FROM projects ORDER BY display_order ASC, created_at DESC"
      : "SELECT * FROM projects WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC";
    const rows = await query(sql);
    const projects = await attachMediaToProjects(rows);
    res.json(projects);
  } catch (err) {
    /* silent */
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// 2. GET /api/projects/:slug — Get single project by slug or ID
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const rows = await query("SELECT * FROM projects WHERE slug = ? OR id = ? LIMIT 1", [
      slug,
      slug,
    ]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    const projects = await attachMediaToProjects(rows);
    res.json(projects[0]);
  } catch (err) {
    /* silent */
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// 3. POST /api/projects — Create Project (Admin)
router.post("/", requireAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const title = body.title || "";
    const coverImage = body.coverImage || body.cover_image || "";

    if (!title || !coverImage) {
      return res.status(400).json({ error: "Title and coverImage are required" });
    }

    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = body.slug || baseSlug || `project-${Date.now()}`;
    const id = body.id || `proj-${Date.now()}`;
    const location = body.location || "";
    const projectType = body.projectType || body.project_type || "Residential";
    const railingType = body.railingType || body.railing_type || "Balcony Railing";
    const description = body.description || "";
    const featured = Boolean(body.featured);
    const displayOrder = Number(body.displayOrder ?? body.display_order) || 0;
    const isActive =
      body.isActive !== undefined
        ? Boolean(body.isActive)
        : body.is_active !== undefined
          ? Boolean(body.is_active)
          : true;
    const media = Array.isArray(body.media) ? body.media : [];

    await query(
      `INSERT INTO projects (id, slug, title, location, project_type, railing_type, description, cover_image, featured, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        slug,
        title,
        location,
        projectType,
        railingType,
        description,
        coverImage,
        featured ? 1 : 0,
        displayOrder,
        isActive ? 1 : 0,
      ],
    );

    // Insert media if provided
    if (media.length > 0) {
      for (let i = 0; i < media.length; i++) {
        const m = media[i];
        const mediaUrl = m.mediaUrl || m.media_url;
        if (!mediaUrl) continue;
        const mediaId = m.id || `pm-${id}-${i + 1}-${Date.now()}`;
        await query(
          `INSERT INTO project_media (id, project_id, media_type, media_url, thumbnail_url, caption, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            mediaId,
            id,
            m.mediaType || m.media_type || "image",
            mediaUrl,
            m.thumbnailUrl || m.thumbnail_url || mediaUrl,
            m.caption || "",
            m.displayOrder ?? m.display_order ?? i + 1,
          ],
        );
      }
    }

    const createdRows = await query("SELECT * FROM projects WHERE id = ? LIMIT 1", [id]);
    const created = await attachMediaToProjects(createdRows);
    res.status(201).json(created[0]);
  } catch (err) {
    console.error("POST /api/projects error:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// 4. PUT /api/projects/:id — Update Project (Admin)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const existingRows = await query("SELECT * FROM projects WHERE id = ? LIMIT 1", [id]);
    if (!existingRows || existingRows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    const existing = existingRows[0];

    const title = body.title !== undefined ? body.title : existing.title;
    const slug = body.slug !== undefined ? body.slug : existing.slug;
    const location = body.location !== undefined ? body.location : existing.location;
    const projectType =
      body.projectType !== undefined
        ? body.projectType
        : body.project_type !== undefined
          ? body.project_type
          : existing.project_type;

    const railingType =
      body.railingType !== undefined
        ? body.railingType
        : body.railing_type !== undefined
          ? body.railing_type
          : existing.railing_type;

    const description = body.description !== undefined ? body.description : existing.description;

    const coverImage =
      body.coverImage !== undefined
        ? body.coverImage
        : body.cover_image !== undefined
          ? body.cover_image
          : existing.cover_image;

    const featured =
      body.featured !== undefined ? Boolean(body.featured) : Boolean(existing.featured);

    const displayOrder =
      body.displayOrder !== undefined
        ? Number(body.displayOrder)
        : body.display_order !== undefined
          ? Number(body.display_order)
          : Number(existing.display_order) || 0;

    const isActive =
      body.isActive !== undefined
        ? Boolean(body.isActive)
        : body.is_active !== undefined
          ? Boolean(body.is_active)
          : Boolean(existing.is_active);

    await query(
      `UPDATE projects
       SET title = ?, slug = ?, location = ?, project_type = ?, railing_type = ?, description = ?, cover_image = ?, featured = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [
        title,
        slug,
        location,
        projectType,
        railingType,
        description,
        coverImage,
        featured ? 1 : 0,
        displayOrder,
        isActive ? 1 : 0,
        id,
      ],
    );

    // Sync media if media array is supplied
    if (Array.isArray(body.media)) {
      await query("DELETE FROM project_media WHERE project_id = ?", [id]);
      for (let i = 0; i < body.media.length; i++) {
        const m = body.media[i];
        const mediaUrl = m.mediaUrl || m.media_url;
        if (!mediaUrl) continue;
        const mediaId = m.id || `pm-${id}-${i + 1}-${Date.now()}`;
        await query(
          `INSERT INTO project_media (id, project_id, media_type, media_url, thumbnail_url, caption, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            mediaId,
            id,
            m.mediaType || m.media_type || "image",
            mediaUrl,
            m.thumbnailUrl || m.thumbnail_url || mediaUrl,
            m.caption || "",
            m.displayOrder ?? m.display_order ?? i + 1,
          ],
        );
      }
    }

    const rows = await query("SELECT * FROM projects WHERE id = ? LIMIT 1", [id]);
    const updated = await attachMediaToProjects(rows);
    res.json(updated[0]);
  } catch (err) {
    console.error("PUT /api/projects/:id error:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// 5. DELETE /api/projects/:id — Delete Project (Admin)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM project_media WHERE project_id = ?", [id]);
    await query("DELETE FROM projects WHERE id = ?", [id]);
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/projects/:id error:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// 6. POST /api/projects/:id/media — Add Single Media to Project (Admin)
router.post("/:id/media", requireAuth, async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const body = req.body || {};
    const mediaUrl = body.mediaUrl || body.media_url;
    const mediaType = body.mediaType || body.media_type || "image";
    const thumbnailUrl = body.thumbnailUrl || body.thumbnail_url || mediaUrl;
    const caption = body.caption || "";
    const displayOrder = Number(body.displayOrder ?? body.display_order) || 0;

    if (!mediaUrl) return res.status(400).json({ error: "mediaUrl is required" });

    const mediaId = `pm-${projectId}-${Date.now()}`;
    await query(
      `INSERT INTO project_media (id, project_id, media_type, media_url, thumbnail_url, caption, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [mediaId, projectId, mediaType, mediaUrl, thumbnailUrl, caption, displayOrder],
    );

    res.status(201).json({
      id: mediaId,
      projectId,
      mediaType,
      mediaUrl,
      thumbnailUrl,
      caption,
      displayOrder,
    });
  } catch (err) {
    console.error("POST /api/projects/:id/media error:", err);
    res.status(500).json({ error: "Failed to add media" });
  }
});

// 7. DELETE /api/projects/media/:mediaId — Delete Single Media (Admin)
router.delete("/media/:mediaId", requireAuth, async (req, res) => {
  try {
    const { mediaId } = req.params;
    await query("DELETE FROM project_media WHERE id = ?", [mediaId]);
    res.json({ success: true, message: "Media deleted successfully" });
  } catch (err) {
    /* silent */
    res.status(500).json({ error: "Failed to delete media" });
  }
});

export default router;
