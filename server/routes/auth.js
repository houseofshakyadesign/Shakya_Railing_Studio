import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db.js";
import { rateLimit } from "../rateLimit.js";

export const router = express.Router();
const getJwtSecret = () => process.env.JWT_SECRET || "metalwork_nepal_jwt_secret_key_2026";

// Middleware to protect admin routes
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
}

export const requireAdmin = requireAuth;

// POST /api/auth/login
router.post(
  "/login",
  rateLimit({
    windowMs: 60000,
    max: 10,
    message: "Too many login attempts. Try again in a minute.",
  }),
  async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const rows = await query("SELECT * FROM admins WHERE email = ? LIMIT 1", [
        email.toLowerCase().trim(),
      ]);
      if (!rows || rows.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const admin = rows[0];
      const isMatch = await bcrypt.compare(password, admin.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: admin.id, email: admin.email }, getJwtSecret(), {
        expiresIn: "1h",
      });

      return res.json({
        token,
        admin: {
          id: admin.id,
          email: admin.email,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Server error during login" });
    }
  },
);

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  return res.json({ admin: req.admin });
});
