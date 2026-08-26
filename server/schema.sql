-- Metal Work Nepal MySQL Database Schema

CREATE DATABASE IF NOT EXISTS `metalwork_nepal` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `metalwork_nepal`;

-- 1. Railing Installation Types Table (Balcony: 3 ft / Staircase: 2.8 ft)
CREATE TABLE IF NOT EXISTS `railing_types` (
  `id` VARCHAR(32) PRIMARY KEY,
  `name` VARCHAR(128) NOT NULL,
  `slug` VARCHAR(64) NOT NULL UNIQUE,
  `standard_height_ft` DECIMAL(4, 2) NOT NULL DEFAULT 3.00,
  `description` VARCHAR(255) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Railing Types
INSERT INTO `railing_types` (`id`, `name`, `slug`, `standard_height_ft`, `description`)
VALUES 
  ('balcony', 'Balcony Railing', 'balcony', 3.00, 'Standard height: 3 ft'),
  ('staircase', 'Staircase Railing', 'staircase', 2.80, 'Standard height: 2.8 ft')
ON DUPLICATE KEY UPDATE `standard_height_ft` = VALUES(`standard_height_ft`);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(64) PRIMARY KEY,
  `code` VARCHAR(32) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `material` VARCHAR(128) NOT NULL,
  `price_per_sqft` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `standard_module_width` DECIMAL(5, 2) NOT NULL DEFAULT 4.00,
  `standard_height` DECIMAL(5, 2) NOT NULL DEFAULT 3.50,
  `image` TEXT NOT NULL,
  `gallery` JSON,
  `features` JSON,
  `applications` JSON,
  `is_custom` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Enquiries Table (No quantity fields)
CREATE TABLE IF NOT EXISTS `enquiries` (
  `id` VARCHAR(64) PRIMARY KEY,
  `customer_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(64) NOT NULL,
  `email` VARCHAR(255),
  `location` VARCHAR(255) NOT NULL,
  `project_type` VARCHAR(128) NOT NULL DEFAULT 'Residential',
  `railing_type` VARCHAR(64) NOT NULL DEFAULT 'Balcony Railing',
  `product_id` VARCHAR(64) NOT NULL,
  `product_code` VARCHAR(32) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `material` VARCHAR(128) NOT NULL,
  `is_custom` BOOLEAN NOT NULL DEFAULT FALSE,
  `length_ft` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `height_ft` DECIMAL(10, 2) NOT NULL DEFAULT 3.00,
  `estimated_area_sqft` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `rate` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `estimated_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `estimated_total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('new', 'in_review', 'quoted', 'confirmed', 'archived') NOT NULL DEFAULT 'new',
  `additional_requirements` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Settings Table
CREATE TABLE IF NOT EXISTS `settings` (
  `id` VARCHAR(32) PRIMARY KEY DEFAULT 'default',
  `company_name` VARCHAR(255) NOT NULL DEFAULT 'Metal Work Nepal',
  `studio_name` VARCHAR(255) NOT NULL DEFAULT 'Architectural Studio',
  `whatsapp_number` VARCHAR(32) NOT NULL DEFAULT '9779843935689',
  `phone` VARCHAR(64) NOT NULL DEFAULT '+977 984-3935689',
  `email` VARCHAR(255) NOT NULL DEFAULT 'info@metalworknepal.com',
  `address` VARCHAR(255) NOT NULL DEFAULT 'Imadole, Mahalaxmi, Nepal',
  `currency` VARCHAR(16) NOT NULL DEFAULT 'NPR',
  `currency_locale` VARCHAR(32) NOT NULL DEFAULT 'en-IN',
  `instagram` TEXT,
  `tiktok` TEXT,
  `website` TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(64) PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
