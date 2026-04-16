-- ============================================================
--  VAKIF SHOP — Database Schema
--  Database: vakifshop  |  Table: orders_collection
-- ============================================================

CREATE DATABASE IF NOT EXISTS vakifshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vakifshop;

-- Orders Table
CREATE TABLE IF NOT EXISTS orders_collection (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  order_id        VARCHAR(20)  NOT NULL UNIQUE,
  customer_name   VARCHAR(100) NOT NULL,
  customer_email  VARCHAR(150) NOT NULL,
  customer_phone  VARCHAR(15)  NOT NULL,
  delivery_address TEXT        NOT NULL,
  special_instructions TEXT,
  items           JSON         NOT NULL,
  subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  delivery_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  grand_total     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status          ENUM('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  payment_method  VARCHAR(50)  DEFAULT 'COD',
  payment_status  ENUM('unpaid','paid') DEFAULT 'unpaid',
  invoice_number  VARCHAR(30),
  invoice_generated TINYINT(1) DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  email      VARCHAR(150),
  full_name  VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default admin  (password: vakif@admin123)
INSERT IGNORE INTO admin_users (username, password, email, full_name)
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vakif@gmail.com', 'Vakif Admin');

-- Products snapshot (optional cache)
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  category    VARCHAR(100),
  image_url   VARCHAR(500),
  description TEXT,
  stock       INT DEFAULT 100,
  active      TINYINT(1) DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
