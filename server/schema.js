import { query } from './db.js';

export async function ensureSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255),
      first_name VARCHAR(120),
      last_name VARCHAR(120),
      role ENUM('user','admin') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      image_url LONGTEXT,
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description LONGTEXT,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      discount INT DEFAULT 0,
      sizes JSON,
      colors JSON,
      stock INT DEFAULT 0,
      sku VARCHAR(255),
      category_id CHAR(36),
      images JSON,
      video_url LONGTEXT,
      is_featured TINYINT(1) DEFAULT 0,
      is_trending TINYINT(1) DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      rating DECIMAL(2,1) DEFAULT 0,
      review_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_products_category (category_id),
      INDEX idx_products_slug (slug)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS banners (
      id CHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255),
      image_url LONGTEXT NOT NULL,
      link LONGTEXT,
      position VARCHAR(50) NOT NULL DEFAULT 'hero',
      is_active TINYINT(1) DEFAULT 1,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id CHAR(36) PRIMARY KEY,
      announcement_text TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id CHAR(36) PRIMARY KEY,
      customer_name VARCHAR(255) NOT NULL,
      city VARCHAR(255),
      rating INT NOT NULL DEFAULT 5,
      comment TEXT NOT NULL,
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36),
      product_id CHAR(36) NOT NULL,
      rating INT NOT NULL,
      comment TEXT,
      is_approved TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_reviews_product (product_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36),
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
      payment_method VARCHAR(50),
      subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
      discount_amount DECIMAL(10,2) DEFAULT 0,
      shipping_amount DECIMAL(10,2) DEFAULT 0,
      tax_amount DECIMAL(10,2) DEFAULT 0,
      total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      shipping_address JSON,
      coupon_code VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_orders_user (user_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id CHAR(36) PRIMARY KEY,
      order_id CHAR(36) NOT NULL,
      product_id CHAR(36),
      product_name VARCHAR(255) NOT NULL,
      product_image LONGTEXT,
      size VARCHAR(50),
      color VARCHAR(50),
      quantity INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_order_items_order (order_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS chatbot_messages (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36),
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      page_url TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_chatbot_created (created_at)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id CHAR(36) PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      description TEXT,
      discount_type VARCHAR(50) NOT NULL DEFAULT 'percentage',
      discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
      min_order_amount DECIMAL(10,2) DEFAULT 0,
      max_uses INT,
      used_count INT DEFAULT 0,
      expires_at TIMESTAMP NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS blogs (
      id CHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      content LONGTEXT NOT NULL,
      excerpt TEXT,
      image_url LONGTEXT,
      author VARCHAR(120),
      is_published TINYINT(1) DEFAULT 0,
      published_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_blogs_slug (slug)
    )
  `);

  // Seed site_settings row if empty
  const rows = await query('SELECT COUNT(*) as c FROM site_settings');
  if (Number(rows?.[0]?.c || 0) === 0) {
    await query(
      'INSERT INTO site_settings (id, announcement_text) VALUES (UUID(), ?)',
      ['FREE SHIPPING ON ORDERS OVER ₹4,999 · USE CODE CHIC15']
    );
  }

  // Add missing columns (idempotent)
  await query('ALTER TABLE products ADD COLUMN video_url LONGTEXT');
  await query('ALTER TABLE users ADD COLUMN first_name VARCHAR(120)');
  await query('ALTER TABLE users ADD COLUMN last_name VARCHAR(120)');
  await query('ALTER TABLE users ADD COLUMN role ENUM("user","admin") NOT NULL DEFAULT "user"');
  await query('ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(100)');
  await query('ALTER TABLE orders ADD COLUMN carrier VARCHAR(100)');
  await query('ALTER TABLE orders ADD COLUMN shipped_at TIMESTAMP NULL');
  await query('ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP NULL');
  await query('ALTER TABLE site_settings ADD COLUMN free_shipping_threshold DECIMAL(10,2) DEFAULT 4999');
  await query('ALTER TABLE site_settings ADD COLUMN flat_shipping_rate DECIMAL(10,2) DEFAULT 100');

  // Ensure created_at and updated_at have correct defaults for orders
  await query('ALTER TABLE orders MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  await query('ALTER TABLE orders MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  await query(`
    CREATE TABLE IF NOT EXISTS search_history (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36),
      query VARCHAR(255) NOT NULL,
      count INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_search_user (user_id),
      INDEX idx_search_query (query)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id CHAR(36) PRIMARY KEY,
      order_id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      provider VARCHAR(50) NOT NULL DEFAULT 'phonepe',
      provider_transaction_id VARCHAR(255),
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT 'INR',
      payment_method_type VARCHAR(50),
      payment_method_provider VARCHAR(100),
      provider_response LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_transactions_order (order_id),
      INDEX idx_transactions_user (user_id),
      INDEX idx_transactions_provider_id (provider_transaction_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS payment_complaints (
      id CHAR(36) PRIMARY KEY,
      order_id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      utr_number VARCHAR(100),
      transaction_id VARCHAR(255),
      complaint_reason TEXT,
      image_url LONGTEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      admin_remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_complaints_order (order_id),
      INDEX idx_complaints_user (user_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_addresses (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      address_line1 VARCHAR(255) NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      postal_code VARCHAR(20) NOT NULL,
      country VARCHAR(100) NOT NULL DEFAULT 'India',
      is_default TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_addresses_user (user_id)
    )
  `);
}

