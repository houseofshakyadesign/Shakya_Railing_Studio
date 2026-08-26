import mysql from "mysql2/promise";
import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MYSQL_HOST = process.env.MYSQL_HOST || "localhost";
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || "3306", 10);
const MYSQL_USER = process.env.MYSQL_USER || "root";
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "";
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "metalwork_nepal";

export let dbType = "mysql"; // "mysql" or "sqlite"
let pool = null;
let sqliteDb = null;

// Helper to run queries uniformly across MySQL and SQLite
export async function query(sql, params = []) {
  if (dbType === "mysql" && pool) {
    const [rows] = await pool.query(sql, params);
    return rows;
  } else if (sqliteDb) {
    return new Promise((resolve, reject) => {
      // Transform MySQL SQL dialect to SQLite where applicable
      let sSql = sql
        .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/gi, "DATETIME DEFAULT CURRENT_TIMESTAMP")
        .replace(/ENGINE=InnoDB DEFAULT CHARSET=utf8mb4/gi, "")
        .replace(/JSON/gi, "TEXT")
        .replace(/BOOLEAN/gi, "INTEGER")
        .replace(/DECIMAL\(\d+,\s*\d+\)/gi, "REAL")
        .replace(/ENUM\([^)]+\)/gi, "TEXT");

      if (sSql.trim().toUpperCase().startsWith("SELECT") || sSql.trim().toUpperCase().startsWith("PRAGMA") || sSql.trim().toUpperCase().startsWith("SHOW")) {
        sqliteDb.all(sSql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      } else {
        sqliteDb.run(sSql, params, function (err) {
          if (err) return reject(err);
          resolve({ insertId: this.lastID, affectedRows: this.changes });
        });
      }
    });
  } else {
    throw new Error("No database connection available");
  }
}

// Auto Initialize Database & Tables
export async function initDatabase() {
  console.log("Initializing database connection...");

  // 1. Try connecting to MySQL
  try {
    const rootConnection = await mysql.createConnection({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConnection.end();

    pool = mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test query
    await pool.query("SELECT 1");
    dbType = "mysql";
    console.log(`✅ Connected successfully to MySQL database '${MYSQL_DATABASE}' on ${MYSQL_HOST}:${MYSQL_PORT}`);
  } catch (mysqlErr) {
    console.warn(`⚠️ MySQL not reachable (${mysqlErr.message}).`);
    console.warn("🔄 Automatically enabling high-performance embedded SQLite database as fallback...");

    const sqlitePath = path.join(__dirname, "metalwork_nepal.sqlite");
    sqliteDb = new sqlite3.Database(sqlitePath);
    dbType = "sqlite";
    console.log(`✅ Embedded database ready at ${sqlitePath}`);
  }

  // 2. Create tables
  await createTables();

  // 3. Seed data
  await seedInitialData();
}

async function createTables() {
  if (dbType === "mysql") {
    // 1. Railing Types Table
    await query(`
      CREATE TABLE IF NOT EXISTS \`railing_types\` (
        \`id\` VARCHAR(32) PRIMARY KEY,
        \`name\` VARCHAR(128) NOT NULL,
        \`slug\` VARCHAR(64) NOT NULL UNIQUE,
        \`standard_height_ft\` DECIMAL(4, 2) NOT NULL DEFAULT 3.00,
        \`description\` VARCHAR(255) DEFAULT '',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Products Table
    await query(`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`code\` VARCHAR(32) NOT NULL UNIQUE,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`material\` VARCHAR(128) NOT NULL,
        \`price_per_sqft\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`standard_module_width\` DECIMAL(5, 2) NOT NULL DEFAULT 4.00,
        \`standard_height\` DECIMAL(5, 2) NOT NULL DEFAULT 3.50,
        \`image\` TEXT NOT NULL,
        \`gallery\` JSON,
        \`features\` JSON,
        \`applications\` JSON,
        \`is_custom\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`display_order\` INT NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Enquiries Table
    await query(`
      CREATE TABLE IF NOT EXISTS \`enquiries\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`customer_name\` VARCHAR(255) NOT NULL,
        \`phone\` VARCHAR(64) NOT NULL,
        \`email\` VARCHAR(255),
        \`location\` VARCHAR(255) NOT NULL,
        \`project_type\` VARCHAR(128) NOT NULL DEFAULT 'Residential',
        \`railing_type\` VARCHAR(64) NOT NULL DEFAULT 'Balcony Railing',
        \`product_id\` VARCHAR(64) NOT NULL,
        \`product_code\` VARCHAR(32) NOT NULL,
        \`product_name\` VARCHAR(255) NOT NULL,
        \`material\` VARCHAR(128) NOT NULL,
        \`is_custom\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`length_ft\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`height_ft\` DECIMAL(10, 2) NOT NULL DEFAULT 3.00,
        \`estimated_area_sqft\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`rate\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`estimated_price\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`estimated_total\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`status\` ENUM('new', 'in_review', 'quoted', 'confirmed', 'archived') NOT NULL DEFAULT 'new',
        \`additional_requirements\` TEXT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Add railing_type column if upgrading existing table
    try {
      await query("ALTER TABLE `enquiries` ADD COLUMN IF NOT EXISTS `railing_type` VARCHAR(64) NOT NULL DEFAULT 'Balcony Railing'");
    } catch {
      /* ignore column exists error */
    }

    // 4. Settings Table
    await query(`
      CREATE TABLE IF NOT EXISTS \`settings\` (
        \`id\` VARCHAR(32) PRIMARY KEY DEFAULT 'default',
        \`company_name\` VARCHAR(255) NOT NULL DEFAULT 'Metal Work Nepal',
        \`studio_name\` VARCHAR(255) NOT NULL DEFAULT 'Architectural Studio',
        \`whatsapp_number\` VARCHAR(32) NOT NULL DEFAULT '9779843935689',
        \`phone\` VARCHAR(64) NOT NULL DEFAULT '+977 984-3935689',
        \`email\` VARCHAR(255) NOT NULL DEFAULT 'info@metalworknepal.com',
        \`address\` VARCHAR(255) NOT NULL DEFAULT 'Imadole, Mahalaxmi, Nepal',
        \`currency\` VARCHAR(16) NOT NULL DEFAULT 'NPR',
        \`currency_locale\` VARCHAR(32) NOT NULL DEFAULT 'en-IN',
        \`instagram\` TEXT,
        \`tiktok\` TEXT,
        \`website\` TEXT,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Admins Table
    await query(`
      CREATE TABLE IF NOT EXISTS \`admins\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    // 6. Projects Table
    await query(`
      CREATE TABLE IF NOT EXISTS \`projects\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`slug\` VARCHAR(128) NOT NULL UNIQUE,
        \`title\` VARCHAR(255) NOT NULL,
        \`location\` VARCHAR(255) NOT NULL DEFAULT '',
        \`project_type\` VARCHAR(128) NOT NULL DEFAULT 'Residential',
        \`railing_type\` VARCHAR(128) NOT NULL DEFAULT 'Balcony Railing',
        \`description\` TEXT,
        \`cover_image\` TEXT NOT NULL,
        \`featured\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`display_order\` INT NOT NULL DEFAULT 0,
        \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Project Media Table
    await query(`
      CREATE TABLE IF NOT EXISTS \`project_media\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`project_id\` VARCHAR(64) NOT NULL,
        \`media_type\` ENUM('image', 'video') NOT NULL DEFAULT 'image',
        \`media_url\` TEXT NOT NULL,
        \`thumbnail_url\` TEXT,
        \`caption\` VARCHAR(255) DEFAULT '',
        \`display_order\` INT NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } else {
    // SQLite Tables
    await query(`
      CREATE TABLE IF NOT EXISTS railing_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        standard_height_ft REAL NOT NULL DEFAULT 3.00,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        material TEXT NOT NULL,
        price_per_sqft REAL NOT NULL DEFAULT 0.00,
        standard_module_width REAL NOT NULL DEFAULT 4.00,
        standard_height REAL NOT NULL DEFAULT 3.50,
        image TEXT NOT NULL,
        gallery TEXT,
        features TEXT,
        applications TEXT,
        is_custom INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        location TEXT NOT NULL,
        project_type TEXT NOT NULL DEFAULT 'Residential',
        railing_type TEXT NOT NULL DEFAULT 'Balcony Railing',
        product_id TEXT NOT NULL,
        product_code TEXT NOT NULL,
        product_name TEXT NOT NULL,
        material TEXT NOT NULL,
        is_custom INTEGER NOT NULL DEFAULT 0,
        length_ft REAL NOT NULL DEFAULT 0.00,
        height_ft REAL NOT NULL DEFAULT 3.00,
        estimated_area_sqft REAL NOT NULL DEFAULT 0.00,
        rate REAL NOT NULL DEFAULT 0.00,
        estimated_price REAL NOT NULL DEFAULT 0.00,
        estimated_total REAL NOT NULL DEFAULT 0.00,
        status TEXT NOT NULL DEFAULT 'new',
        additional_requirements TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        company_name TEXT NOT NULL DEFAULT 'House of Shakya',
        studio_name TEXT NOT NULL DEFAULT 'Railing Studio',
        whatsapp_number TEXT NOT NULL DEFAULT '9779843935689',
        phone TEXT NOT NULL DEFAULT '+977 984-3935689',
        email TEXT NOT NULL DEFAULT 'info@metalworknepal.com',
        address TEXT NOT NULL DEFAULT 'Imadole, Mahalaxmi, Nepal',
        currency TEXT NOT NULL DEFAULT 'NPR',
        currency_locale TEXT NOT NULL DEFAULT 'en-IN',
        instagram TEXT,
        tiktok TEXT,
        website TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        location TEXT NOT NULL DEFAULT '',
        project_type TEXT NOT NULL DEFAULT 'Residential',
        railing_type TEXT NOT NULL DEFAULT 'Balcony Railing',
        description TEXT,
        cover_image TEXT NOT NULL,
        featured INTEGER NOT NULL DEFAULT 0,
        display_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS project_media (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        media_type TEXT NOT NULL DEFAULT 'image',
        media_url TEXT NOT NULL,
        thumbnail_url TEXT,
        caption TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
}

async function seedInitialData() {
  try {
    // 1. Seed Railing Types (Balcony: 3 ft / Staircase: 2.8 ft)
    const existingTypes = await query("SELECT id FROM railing_types LIMIT 1");
    if (!existingTypes || existingTypes.length === 0) {
      await query(
        "INSERT INTO railing_types (id, name, slug, standard_height_ft, description) VALUES (?, ?, ?, ?, ?)",
        ["balcony", "Balcony Railing", "balcony", 3.0, "Standard height: 3 ft"]
      );
      await query(
        "INSERT INTO railing_types (id, name, slug, standard_height_ft, description) VALUES (?, ?, ?, ?, ?)",
        ["staircase", "Staircase Railing", "staircase", 2.8, "Standard height: 2.8 ft"]
      );
      console.log("📏 Seeded Railing Types: Balcony (3 ft) & Staircase (2.8 ft)");
    }

    // 2. Seed Admin
    const admins = await query("SELECT id FROM admins LIMIT 1");
    if (!admins || admins.length === 0) {
      const passwordHash = await bcrypt.hash("ShakyaAdmin2026!", 10);
      await query(
        "INSERT INTO admins (id, email, password_hash) VALUES (?, ?, ?)",
        ["admin-01", "admin@metalworknepal.com", passwordHash]
      );
      console.log("👤 Default Admin created: admin@metalworknepal.com / ShakyaAdmin2026!");
    }

    // 3. Seed Settings
    const existingSettings = await query("SELECT id FROM settings WHERE id = 'default'");
    if (!existingSettings || existingSettings.length === 0) {
      await query(
        `INSERT INTO settings (id, company_name, studio_name, whatsapp_number, phone, email, address, currency, currency_locale, instagram, tiktok, website)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "default",
          "House of Shakya",
          "Railing Studio",
          "9779843935689",
          "+977 984-3935689",
          "info@metalworknepal.com",
          "Imadole, Mahalaxmi, Nepal",
          "NPR",
          "en-IN",
          "https://www.instagram.com/metalwork.nepal?igsi=MWg2cTdxNzY1NmFnag==",
          "https://www.tiktok.com/@metalworknepal?_r=1&_t=ZS-99CUIO2Y89o",
          "https://metalworknepal.com",
        ]
      );
      console.log("⚙️ Default settings initialized.");
    }

    // 4. Seed Products from JSON file
    const existingProducts = await query("SELECT id FROM products LIMIT 1");
    if (!existingProducts || existingProducts.length === 0) {
      const seedFile = path.join(__dirname, "seedProducts.json");
      if (fs.existsSync(seedFile)) {
        const seedProducts = JSON.parse(fs.readFileSync(seedFile, "utf-8"));
        for (const p of seedProducts) {
          await query(
            `INSERT INTO products (id, code, name, description, material, price_per_sqft, standard_module_width, standard_height, image, gallery, features, applications, is_custom, is_active, display_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              p.id,
              p.code,
              p.name,
              p.description,
              p.material,
              p.price_per_sqft || 0,
              p.standard_module_width || 4.0,
              p.standard_height || 3.5,
              p.image,
              JSON.stringify(p.gallery || []),
              JSON.stringify(p.features || []),
              JSON.stringify(p.applications || []),
              p.is_custom ? 1 : 0,
              p.is_active ? 1 : 0,
              p.display_order || 0,
            ]
          );
        }
        console.log(`📦 Seeded ${seedProducts.length} products into database.`);
      }
    }

    // 5. Seed Authoritative 6 Projects & Project Media
    const existingProjects = await query("SELECT id FROM projects LIMIT 1");
    if (!existingProjects || existingProjects.length === 0) {
      const projectsData = [
        {
          id: "proj-01",
          slug: "bhaisepati-railing",
          title: "Bhaisepati Railing",
          location: "Bhaisepati",
          project_type: "Residential",
          railing_type: "Balcony & Staircase Railing",
          description: "Precision architectural metalwork railing installation executed for a private modern residence in Bhaisepati. Featuring clean geometric lines, concealed mounting, and matte charcoal protective coating.",
          cover_image: "/images/railings/r01.jpg",
          featured: 1,
          display_order: 1,
        },
        {
          id: "proj-02",
          slug: "budhanilkantha-railing",
          title: "Budhanilkantha Railing",
          location: "Budhanilkantha",
          project_type: "Residential",
          railing_type: "Balcony Railing",
          description: "Custom-engineered balcony railing system with minimalist vertical bars and weather-resistant architectural bronze finish overlooking the Kathmandu valley.",
          cover_image: "/images/railings/r02.jpg",
          featured: 0,
          display_order: 2,
        },
        {
          id: "proj-03",
          slug: "naxal-railing",
          title: "Naxal Railing",
          location: "Naxal",
          project_type: "Commercial / Residential",
          railing_type: "Balcony & Glass Railing",
          description: "Contemporary architectural metalwork and tempered glass railing system fabricated for a high-traffic urban project in Naxal.",
          cover_image: "/images/railings/r03.jpg",
          featured: 0,
          display_order: 3,
        },
        {
          id: "proj-04",
          slug: "dhapasi-railing",
          title: "Dhapasi Railing",
          location: "Dhapasi",
          project_type: "Residential",
          railing_type: "Staircase Railing",
          description: "Precision continuous handrail and geometric balustrade detailing manufactured for a multi-story modern residence in Dhapasi.",
          cover_image: "/images/railings/r04.jpg",
          featured: 0,
          display_order: 4,
        },
        {
          id: "proj-05",
          slug: "imadole-railing",
          title: "Imadole Railing",
          location: "Imadole",
          project_type: "Residential",
          railing_type: "Boundary & Balcony Railing",
          description: "Complete residential boundary and terrace railing installation crafted with laser-cut detailing and structural steel anchor points.",
          cover_image: "/images/railings/r05.jpg",
          featured: 0,
          display_order: 5,
        },
        {
          id: "proj-06",
          slug: "skylight-time",
          title: "Skylight Time",
          location: "",
          project_type: "Architectural Metalwork",
          railing_type: "Custom Metalwork & Skylight Structure",
          description: "Bespoke structural steel fabrication and architectural metalwork designed to frame natural light in a contemporary architectural setting.",
          cover_image: "/images/railings/r06.jpg",
          featured: 0,
          display_order: 6,
        },
      ];

      for (const pr of projectsData) {
        await query(
          `INSERT INTO projects (id, slug, title, location, project_type, railing_type, description, cover_image, featured, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pr.id,
            pr.slug,
            pr.title,
            pr.location,
            pr.project_type,
            pr.railing_type,
            pr.description,
            pr.cover_image,
            pr.featured,
            pr.display_order,
          ]
        );
      }

      const mediaData = [
        { id: "pm-01-v", project_id: "proj-01", media_type: "video", media_url: "/videos/railings/bhaisepati railing 4k.mp4", thumbnail_url: "/images/railings/r01.jpg", caption: "Bhaisepati Railing 4K Walkthrough", display_order: 0 },
        { id: "pm-01-1", project_id: "proj-01", media_type: "image", media_url: "/images/railings/r01.jpg", thumbnail_url: "/images/railings/r01.jpg", caption: "Terrace Balcony Installation Overview", display_order: 1 },
        { id: "pm-01-2", project_id: "proj-01", media_type: "image", media_url: "/images/railings/r07.jpg", thumbnail_url: "/images/railings/r07.jpg", caption: "Corner Joinery & Handrail Detail", display_order: 2 },
        { id: "pm-01-3", project_id: "proj-01", media_type: "image", media_url: "/images/railings/r08.jpg", thumbnail_url: "/images/railings/r08.jpg", caption: "Side Profile & Architectural Framing", display_order: 3 },
        { id: "pm-02-v", project_id: "proj-02", media_type: "video", media_url: "/videos/railings/budhanilkantha railing.mp4", thumbnail_url: "/images/railings/r02.jpg", caption: "Budhanilkantha Railing Installation Video", display_order: 0 },
        { id: "pm-02-1", project_id: "proj-02", media_type: "image", media_url: "/images/railings/r02.jpg", thumbnail_url: "/images/railings/r02.jpg", caption: "Balcony Railing Elevation", display_order: 1 },
        { id: "pm-02-2", project_id: "proj-02", media_type: "image", media_url: "/images/railings/r09.jpg", thumbnail_url: "/images/railings/r09.jpg", caption: "Post Base Anchor Detail", display_order: 2 },
        { id: "pm-03-v", project_id: "proj-03", media_type: "video", media_url: "/videos/railings/naxal railing 4k.mp4", thumbnail_url: "/images/railings/r03.jpg", caption: "Naxal 4K Installation Video", display_order: 0 },
        { id: "pm-03-1", project_id: "proj-03", media_type: "image", media_url: "/images/railings/r03.jpg", thumbnail_url: "/images/railings/r03.jpg", caption: "Facade Railing Architecture", display_order: 1 },
        { id: "pm-03-2", project_id: "proj-03", media_type: "image", media_url: "/images/railings/r10.jpg", thumbnail_url: "/images/railings/r10.jpg", caption: "Metal Framing with Glass Integration", display_order: 2 },
        { id: "pm-04-v", project_id: "proj-04", media_type: "video", media_url: "/videos/railings/dhapasi railing.mp4", thumbnail_url: "/images/railings/r04.jpg", caption: "Dhapasi Staircase Railing Video", display_order: 0 },
        { id: "pm-04-1", project_id: "proj-04", media_type: "image", media_url: "/images/railings/r04.jpg", thumbnail_url: "/images/railings/r04.jpg", caption: "Staircase Balustrade Running Length", display_order: 1 },
        { id: "pm-04-2", project_id: "proj-04", media_type: "image", media_url: "/images/railings/r11.jpg", thumbnail_url: "/images/railings/r11.jpg", caption: "Stair Landing Handrail Return", display_order: 2 },
        { id: "pm-05-v", project_id: "proj-05", media_type: "video", media_url: "/videos/railings/imadol railing arju .mp4", thumbnail_url: "/images/railings/r05.jpg", caption: "Imadole Installation Video", display_order: 0 },
        { id: "pm-05-1", project_id: "proj-05", media_type: "image", media_url: "/images/railings/r05.jpg", thumbnail_url: "/images/railings/r05.jpg", caption: "Boundary Railing Perimeter", display_order: 1 },
        { id: "pm-05-2", project_id: "proj-05", media_type: "image", media_url: "/images/railings/r12.jpg", thumbnail_url: "/images/railings/r12.jpg", caption: "Gate & Balcony Alignment Detail", display_order: 2 },
        { id: "pm-06-v", project_id: "proj-06", media_type: "video", media_url: "/videos/railings/skylight time.mov", thumbnail_url: "/images/railings/r06.jpg", caption: "Skylight Structural Steel Video", display_order: 0 },
        { id: "pm-06-1", project_id: "proj-06", media_type: "image", media_url: "/images/railings/r06.jpg", thumbnail_url: "/images/railings/r06.jpg", caption: "Skylight Structural Steel Framing", display_order: 1 },
        { id: "pm-06-2", project_id: "proj-06", media_type: "image", media_url: "/images/railings/r13.jpg", thumbnail_url: "/images/railings/r13.jpg", caption: "Precision Welded Light Frame", display_order: 2 },
      ];

      for (const m of mediaData) {
        await query(
          `INSERT INTO project_media (id, project_id, media_type, media_url, thumbnail_url, caption, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE media_url = VALUES(media_url), caption = VALUES(caption), display_order = VALUES(display_order)`,
          [m.id, m.project_id, m.media_type, m.media_url, m.thumbnail_url, m.caption, m.display_order]
        );
      }

      console.log(`🏛️ Seeded ${projectsData.length} authoritative House of Shakya projects with ${mediaData.length} media records.`);
    }
  } catch (err) {
    console.error("Error seeding initial data:", err);
  }
}

