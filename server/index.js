import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initDatabase, dbType } from "./db.js";
import { router as authRouter } from "./routes/auth.js";
import { router as productsRouter } from "./routes/products.js";
import { router as enquiriesRouter } from "./routes/enquiries.js";
import { router as settingsRouter } from "./routes/settings.js";
import { router as uploadRouter } from "./routes/upload.js";
import { router as railingTypesRouter } from "./routes/railingTypes.js";
import projectsRouter from "./routes/projects.js";
import { rateLimit } from "./rateLimit.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend clients
const ALLOWED_ORIGINS = (
  process.env.CORS_ORIGINS ||
  "http://localhost:8080,http://localhost:5173,http://localhost:3000,http://127.0.0.1:8080,http://127.0.0.1:5173,https://shakya-railing-studio.vercel.app"
)
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);

      // Allow any localhost/127.0.0.1 during development
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview/production deployments
      if (origin.endsWith(".vercel.app") || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, true); // Permissive fallback for API accessibility
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true,
    maxAge: 86400,
  }),
);

app.options("*", cors());

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.enable("trust proxy");

// Static file serving for uploads directory with CORS headers
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use(
  "/uploads",
  (_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsPath, { maxAge: "7d" }),
);

// Health check & status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Metal Work Nepal API",
    database: dbType,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/enquiries", enquiriesRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/railing-types", railingTypesRouter);
app.use("/api/projects", projectsRouter);

// Start server
async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Metal Work Nepal Express Backend running on http://localhost:${PORT}`);
      console.log(`📡 API Endpoints available at http://localhost:${PORT}/api/`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
