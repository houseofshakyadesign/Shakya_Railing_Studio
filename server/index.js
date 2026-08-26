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

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend clients
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Static file serving for uploads directory
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use("/uploads", express.static(uploadsPath));

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
