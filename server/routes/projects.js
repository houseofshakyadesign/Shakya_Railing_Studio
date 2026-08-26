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
    projectIds
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
    const includeInactive = req.query.all === "true";
    const sql = includeInactive
      ? "SELECT * FROM projects ORDER BY display_order ASC, created_at DESC"
      : "SELECT * FROM projects WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC";
    const rows = await query(sql);
    const projects = await attachMediaToProjects(rows);
    res.json(projects);
  } catch (err) {
    console.error("GET /api/projects error:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// 2. GET /api/projects/:slug — Get single project by slug or ID
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const rows = await query("SELECT * FROM projects WHERE slug = ? OR id = ? LIMIT 1", [slug, slug]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    const projects = await attachMediaToProjects(rows);
    res.json(projects[0]);
  } catch (err) {
    console.error("GET /api/projects/:slug error:", err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// 3. POST /api/projects — Create Project (Admin)
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      title,
      location = "",
      projectType = "Residential",
      railingType = "Balcony Railing",
      description = "",
      coverImage,
      featured = false,
      displayOrder = 0,
      isActive = true,
      media = [],
    } = req.body;

    if (!title || !coverImage) {
      return res.status(400).json({ error: "Title and coverImage are required" });
    }

    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = req.body.slug || baseSlug || `project-${Date.now()}`;
    const id = `proj-${Date.now()}`;

    await query(
      `INSERT INTO projects (id, slug, title, location, project_type, railing_type, description, cover_image, featured, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, slug, title, location, projectType, railingType, description, coverImage, featured ? 1 : 0, displayOrder, isActive ? 1 : 0]
    );

    // Insert media if provided
    if (Array.isArray(media) && media.length > 0) {
      for (let i = 0; i < media.length; i++) {
        const m = media[i];
        const mediaId = m.id || `pm-${id}-${i + 1}-${Date.now()}`;
        await query(
          `INSERT INTO project_media (id, project_id, media_type, media_url, thumbnail_url, caption, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [mediaId, id, m.mediaType || "image", m.mediaUrl, m.thumbnailUrl || m.mediaUrl, m.caption || "", m.displayOrder ?? i + 1]
        );
      }
    }

    const created = await attachMediaToProjects([{ id, slug, title, location, project_type: projectType, railing_type: railingType, description, cover_image: coverImage, featured, display_order: displayOrder, is_active: isActive }]);
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
    const {
      title,
      slug,
      location = "",
      projectType = "Residential",
      railingType = "Balcony Railing",
      description = "",
      coverImage,
      featured = false,
      displayOrder = 0,
      isActive = true,
      media,
    } = req.body;

    await query(
      `UPDATE projects
       SET title = ?, slug = ?, location = ?, project_type = ?, railing_type = ?, description = ?, cover_image = ?, featured = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [title, slug, location, projectType, railingType, description, coverImage, featured ? 1 : 0, displayOrder, isActive ? 1 : 0, id]
    );

    // Sync media if media array is supplied
    if (Array.isArray(media)) {
      await query("DELETE FROM project_media WHERE project_id = ?", [id]);
      for (let i = 0; i < media.length; i++) {
        const m = media[i];
        const mediaId = m.id || `pm-${id}-${i + 1}-${Date.now()}`;
        await query(
          `INSERT INTO project_media (id, project_id, media_type, media_url, thumbnail_url, caption, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [mediaId, id, m.mediaType || "image", m.mediaUrl, m.thumbnailUrl || m.mediaUrl, m.caption || "", m.displayOrder ?? i + 1]
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
    const { mediaType = "image", mediaUrl, thumbnailUrl, caption = "", displayOrder = 0 } = req.body;
    if (!mediaUrl) return res.status(400).json({ error: "mediaUrl is required" });

    const mediaId = `pm-${projectId}-${Date.now()}`;
    await query(
      `INSERT INTO project_media (id, project_id, media_type, media_url, thumbnail_url, caption, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [mediaId, projectId, mediaType, mediaUrl, thumbnailUrl || mediaUrl, caption, displayOrder]
    );

    res.status(201).json({
      id: mediaId,
      projectId,
      mediaType,
      mediaUrl,
      thumbnailUrl: thumbnailUrl || mediaUrl,
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
    console.error("DELETE /api/projects/media/:mediaId error:", err);
    res.status(500).json({ error: "Failed to delete media" });
  }
});

export default router;
