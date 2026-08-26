import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { requireAuth } from "./auth.js";

export const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || (file.mimetype.startsWith("video/") ? ".mp4" : ".jpg");
    const cleanName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    const uniqueSuffix = Date.now() + "-" + crypto.randomUUID().slice(0, 8);
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
const ALLOWED_VIDEO_EXTS = [".mp4", ".mov", ".webm", ".m4v", ".mkv"];
const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];
const ALLOWED_VIDEO_MIMES = ["video/mp4", "video/quicktime", "video/webm", "video/x-matroska"];

const upload = multer({
  storage: storage,
  limits: { fileSize: 250 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_IMAGE_MIMES.includes(file.mimetype) && ALLOWED_IMAGE_EXTS.includes(ext)) {
      return cb(null, true);
    }
    if (ALLOWED_VIDEO_MIMES.includes(file.mimetype) && ALLOWED_VIDEO_EXTS.includes(ext)) {
      return cb(null, true);
    }
    if (ext && [...ALLOWED_IMAGE_EXTS, ...ALLOWED_VIDEO_EXTS].includes(ext)) {
      return cb(null, true);
    }
    cb(new Error("Only image and video files are allowed"), false);
  },
});

// POST /api/upload (admin only, supports 'file', 'image', or 'video' fields)
router.post(
  "/",
  requireAuth,
  (req, res, next) => {
    // Flexible handler for file, image, or video field names
    const uploadSingle = upload.any();
    uploadSingle(req, res, (err) => {
      if (err) {
        /* silent */
        return res.status(400).json({ error: err.message || "File upload failed" });
      }
      next();
    });
  },
  (req, res) => {
    try {
      const file = req.files && req.files.length > 0 ? req.files[0] : req.file;
      if (!file) {
        return res.status(400).json({ error: "No media file provided" });
      }

      const host = req.get("host");
      const protocol = req.protocol;
      const mediaUrl = `${protocol}://${host}/uploads/${file.filename}`;
      const isVideo = file.mimetype.startsWith("video/") || [".mp4", ".mov", ".webm", ".m4v"].includes(path.extname(file.filename).toLowerCase());

      return res.json({
        success: true,
        filename: file.filename,
        url: mediaUrl,
        mediaType: isVideo ? "video" : "image",
      });
    } catch (err) {
      /* silent */
      return res.status(500).json({ error: "Failed to upload media file" });
    }
  }
);
