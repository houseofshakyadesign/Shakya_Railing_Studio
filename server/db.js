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

      if (sSql.trim().toUpperCase().startsWith("SELECT") || sSql.trim().toUpperCase().startsWith("PRAGMA")) {
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

    await query(`
      CREATE TABLE IF NOT EXISTS \`enquiries\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`customer_name\` VARCHAR(255) NOT NULL,
        \`phone\` VARCHAR(64) NOT NULL,
        \`email\` VARCHAR(255),
        \`location\` VARCHAR(255) NOT NULL,
        \`project_type\` VARCHAR(128) NOT NULL,
        \`product_id\` VARCHAR(64) NOT NULL,
        \`product_code\` VARCHAR(32) NOT NULL,
        \`product_name\` VARCHAR(255) NOT NULL,
        \`material\` VARCHAR(128) NOT NULL,
        \`is_custom\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`length_ft\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`height_ft\` DECIMAL(10, 2) NOT NULL DEFAULT 3.50,
        \`estimated_area_sqft\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`estimated_panel_quantity\` INT NOT NULL DEFAULT 1,
        \`standard_module_width_ft\` DECIMAL(5, 2) NOT NULL DEFAULT 4.00,
        \`estimated_price\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`quantity\` INT NOT NULL DEFAULT 1,
        \`area\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`total_area\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`rate\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        \`estimated_total\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`status\` ENUM('new', 'in_review', 'quoted', 'confirmed', 'archived') NOT NULL DEFAULT 'new',
        \`additional_requirements\` TEXT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

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

    await query(`
      CREATE TABLE IF NOT EXISTS \`admins\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } else {
    // SQLite Tables
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
        project_type TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_code TEXT NOT NULL,
        product_name TEXT NOT NULL,
        material TEXT NOT NULL,
        is_custom INTEGER NOT NULL DEFAULT 0,
        length_ft REAL NOT NULL DEFAULT 0.00,
        height_ft REAL NOT NULL DEFAULT 3.50,
        estimated_area_sqft REAL NOT NULL DEFAULT 0.00,
        estimated_panel_quantity INTEGER NOT NULL DEFAULT 1,
        standard_module_width_ft REAL NOT NULL DEFAULT 4.00,
        estimated_price REAL NOT NULL DEFAULT 0.00,
        quantity INTEGER NOT NULL DEFAULT 1,
        area REAL NOT NULL DEFAULT 0.00,
        total_area REAL NOT NULL DEFAULT 0.00,
        rate REAL NOT NULL DEFAULT 0.00,
        estimated_total REAL NOT NULL DEFAULT 0.00,
        status TEXT NOT NULL DEFAULT 'new',
        additional_requirements TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        company_name TEXT NOT NULL DEFAULT 'Metal Work Nepal',
        studio_name TEXT NOT NULL DEFAULT 'Architectural Studio',
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
  }
}

async function seedInitialData() {
  try {
    // 1. Seed Admin
    const admins = await query("SELECT id FROM admins LIMIT 1");
    if (!admins || admins.length === 0) {
      const passwordHash = await bcrypt.hash("ShakyaAdmin2026!", 10);
      await query(
        "INSERT INTO admins (id, email, password_hash) VALUES (?, ?, ?)",
        ["admin-01", "admin@metalworknepal.com", passwordHash]
      );
      console.log("👤 Default Admin created: admin@metalworknepal.com / ShakyaAdmin2026!");
    }

    // 2. Seed Settings
    const existingSettings = await query("SELECT id FROM settings WHERE id = 'default'");
    if (!existingSettings || existingSettings.length === 0) {
      await query(
        `INSERT INTO settings (id, company_name, studio_name, whatsapp_number, phone, email, address, currency, currency_locale, instagram, tiktok, website)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "default",
          "Metal Work Nepal",
          "Architectural Studio",
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

    // 3. Seed Products from JSON file
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
  } catch (err) {
    console.error("Error seeding initial data:", err);
  }
}
