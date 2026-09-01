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
  `slug` VARCHAR(64),
  `name` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(255),
  `nepali_name` VARCHAR(255),
  `english_name` VARCHAR(255),
  `subtitle` VARCHAR(255),
  `category` VARCHAR(128) NOT NULL DEFAULT 'Railings',
  `content_type` VARCHAR(32) NOT NULL DEFAULT 'PRODUCT',
  `is_calculable` BOOLEAN NOT NULL DEFAULT TRUE,
  `application` VARCHAR(64) DEFAULT 'balcony',
  `description` TEXT,
  `material` VARCHAR(128) NOT NULL,
  `primer` VARCHAR(255),
  `finish` VARCHAR(255),
  `construction` TEXT,
  `note` TEXT,
  `price_per_sqft` DECIMAL(10, 2) DEFAULT NULL,
  `standard_module_width` DECIMAL(5, 2) NOT NULL DEFAULT 4.00,
  `standard_height` DECIMAL(5, 2) NOT NULL DEFAULT 3.50,
  `image` TEXT NOT NULL,
  `video` TEXT,
  `gallery` JSON,
  `features` JSON,
  `applications` JSON,
  `is_custom` BOOLEAN NOT NULL DEFAULT FALSE,
  `featured` BOOLEAN NOT NULL DEFAULT FALSE,
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

-- 6. Projects Table
CREATE TABLE IF NOT EXISTS `projects` (
  `id` VARCHAR(64) PRIMARY KEY,
  `slug` VARCHAR(128) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL DEFAULT '',
  `project_type` VARCHAR(128) NOT NULL DEFAULT 'Residential',
  `railing_type` VARCHAR(128) NOT NULL DEFAULT 'Balcony Railing',
  `description` TEXT,
  `cover_image` TEXT NOT NULL,
  `featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Project Media Table (Images & Videos belonging strictly to project_id)
CREATE TABLE IF NOT EXISTS `project_media` (
  `id` VARCHAR(64) PRIMARY KEY,
  `project_id` VARCHAR(64) NOT NULL,
  `media_type` ENUM('image', 'video') NOT NULL DEFAULT 'image',
  `media_url` TEXT NOT NULL,
  `thumbnail_url` TEXT,
  `caption` VARCHAR(255) DEFAULT '',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Authoritative 6 Projects
INSERT INTO `projects` (`id`, `slug`, `title`, `location`, `project_type`, `railing_type`, `description`, `cover_image`, `featured`, `display_order`)
VALUES
  ('proj-01', 'bhaisepati-railing', 'Bhaisepati Railing', 'Bhaisepati', 'Residential', 'Balcony & Staircase Railing', 'Precision architectural metalwork railing installation executed for a private modern residence in Bhaisepati. Featuring clean geometric lines, concealed mounting, and matte charcoal protective coating.', '/images/railings/r01.jpg', TRUE, 1),
  ('proj-02', 'budhanilkantha-railing', 'Budhanilkantha Railing', 'Budhanilkantha', 'Residential', 'Balcony Railing', 'Custom-engineered balcony railing system with minimalist vertical bars and weather-resistant architectural bronze finish overlooking the Kathmandu valley.', '/images/railings/r02.jpg', FALSE, 2),
  ('proj-03', 'naxal-railing', 'Naxal Railing', 'Naxal', 'Commercial / Residential', 'Balcony & Glass Railing', 'Contemporary architectural metalwork and tempered glass railing system fabricated for a high-traffic urban project in Naxal.', '/images/railings/r03.jpg', FALSE, 3),
  ('proj-04', 'dhapasi-railing', 'Dhapasi Railing', 'Dhapasi', 'Residential', 'Staircase Railing', 'Precision continuous handrail and geometric balustrade detailing manufactured for a multi-story modern residence in Dhapasi.', '/images/railings/r04.jpg', FALSE, 4),
  ('proj-05', 'imadole-railing', 'Imadole Railing', 'Imadole', 'Residential', 'Boundary & Balcony Railing', 'Complete residential boundary and terrace railing installation crafted with laser-cut detailing and structural steel anchor points.', '/images/railings/r05.jpg', FALSE, 5),
  ('proj-06', 'skylight-time', 'Skylight Time', '', 'Architectural Metalwork', 'Custom Metalwork & Skylight Structure', 'Bespoke structural steel fabrication and architectural metalwork designed to frame natural light in a contemporary architectural setting.', '/images/railings/r06.jpg', FALSE, 6)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `location` = VALUES(`location`), `display_order` = VALUES(`display_order`);

-- Seed Initial Project Media
INSERT INTO `project_media` (`id`, `project_id`, `media_type`, `media_url`, `thumbnail_url`, `caption`, `display_order`)
VALUES
  ('pm-01-1', 'proj-01', 'image', '/images/railings/r01.jpg', '/images/railings/r01.jpg', 'Terrace Balcony Installation Overview', 1),
  ('pm-01-2', 'proj-01', 'image', '/images/railings/r07.jpg', '/images/railings/r07.jpg', 'Corner Joinery & Handrail Detail', 2),
  ('pm-01-3', 'proj-01', 'image', '/images/railings/r08.jpg', '/images/railings/r08.jpg', 'Side Profile & Architectural Framing', 3),
  ('pm-02-1', 'proj-02', 'image', '/images/railings/r02.jpg', '/images/railings/r02.jpg', 'Balcony Railing Elevation', 1),
  ('pm-02-2', 'proj-02', 'image', '/images/railings/r09.jpg', '/images/railings/r09.jpg', 'Post Base Anchor Detail', 2),
  ('pm-03-1', 'proj-03', 'image', '/images/railings/r03.jpg', '/images/railings/r03.jpg', 'Facade Railing Architecture', 1),
  ('pm-03-2', 'proj-03', 'image', '/images/railings/r10.jpg', '/images/railings/r10.jpg', 'Metal Framing with Glass Integration', 2),
  ('pm-04-1', 'proj-04', 'image', '/images/railings/r04.jpg', '/images/railings/r04.jpg', 'Staircase Balustrade Running Length', 1),
  ('pm-04-2', 'proj-04', 'image', '/images/railings/r11.jpg', '/images/railings/r11.jpg', 'Stair Landing Handrail Return', 2),
  ('pm-05-1', 'proj-05', 'image', '/images/railings/r05.jpg', '/images/railings/r05.jpg', 'Boundary Railing Perimeter', 1),
  ('pm-05-2', 'proj-05', 'image', '/images/railings/r12.jpg', '/images/railings/r12.jpg', 'Gate & Balcony Alignment Detail', 2),
  ('pm-06-1', 'proj-06', 'image', '/images/railings/r06.jpg', '/images/railings/r06.jpg', 'Skylight Structural Steel Framing', 1),
  ('pm-06-2', 'proj-06', 'image', '/images/railings/r13.jpg', '/images/railings/r13.jpg', 'Precision Welded Light Frame', 2)
ON DUPLICATE KEY UPDATE `media_url` = VALUES(`media_url`);

