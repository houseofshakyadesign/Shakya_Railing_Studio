-- Metal Work Nepal MySQL Database Schema

CREATE DATABASE IF NOT EXISTS `metalwork_nepal` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `metalwork_nepal`;

-- 1. Products Table
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

-- 2. Enquiries Table
CREATE TABLE IF NOT EXISTS `enquiries` (
  `id` VARCHAR(64) PRIMARY KEY,
  `customer_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(64) NOT NULL,
  `email` VARCHAR(255),
  `location` VARCHAR(255) NOT NULL,
  `project_type` VARCHAR(128) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `product_code` VARCHAR(32) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `material` VARCHAR(128) NOT NULL,
  `is_custom` BOOLEAN NOT NULL DEFAULT FALSE,
  `length_ft` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `height_ft` DECIMAL(10, 2) NOT NULL DEFAULT 3.50,
  `estimated_area_sqft` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `estimated_panel_quantity` INT NOT NULL DEFAULT 1,
  `standard_module_width_ft` DECIMAL(5, 2) NOT NULL DEFAULT 4.00,
  `estimated_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `quantity` INT NOT NULL DEFAULT 1,
  `area` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `total_area` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `rate` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `estimated_total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('new', 'in_review', 'quoted', 'confirmed', 'archived') NOT NULL DEFAULT 'new',
  `additional_requirements` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Settings Table
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

-- 4. Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(64) PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
