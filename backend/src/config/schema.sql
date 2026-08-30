-- Nexura e-commerce database schema

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  firebase_uid  VARCHAR(128) UNIQUE NOT NULL,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(180) UNIQUE NOT NULL,
  phone         VARCHAR(30),
  photo_url     TEXT,
  provider      VARCHAR(30) DEFAULT 'password',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(80) UNIQUE NOT NULL,
  slug  VARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id                    SERIAL PRIMARY KEY,
  name                  VARCHAR(160) NOT NULL,
  slug                  VARCHAR(160) UNIQUE NOT NULL,
  description           TEXT,
  detailed_description  TEXT,
  price                 NUMERIC(10, 2) NOT NULL,
  compare_price         NUMERIC(10, 2),
  image_url             TEXT NOT NULL,
  category_id           INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  rating                NUMERIC(2, 1) DEFAULT 4.5,
  stock                 INTEGER DEFAULT 100,
  is_featured           BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- Add the column if this schema is re-run against an older database
ALTER TABLE products ADD COLUMN IF NOT EXISTS detailed_description TEXT;

CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(120) NOT NULL,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_questions (
  id            SERIAL PRIMARY KEY,
  product_id    INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  author_name   VARCHAR(120) NOT NULL,
  question      TEXT NOT NULL,
  answer        TEXT,
  answered_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Tracks who has completed the one-time dev signup (credentials themselves
-- live in DEV_EMAIL / DEV_PASSWORD env vars, this just records "already set up")
CREATE TABLE IF NOT EXISTS dev_admins (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(180) UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status      VARCHAR(30) DEFAULT 'pending',
  total       NUMERIC(10, 2) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES products(id),
  quantity    INTEGER NOT NULL DEFAULT 1,
  unit_price  NUMERIC(10, 2) NOT NULL
);

-- Seed a couple of categories + demo products so the storefront isn't empty
INSERT INTO categories (name, slug) VALUES
  ('Audio', 'audio'),
  ('Wearables', 'wearables'),
  ('Bags', 'bags'),
  ('Home', 'home')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_price, image_url, category_id, rating, is_featured)
VALUES
  ('Aurora Wireless Headphones', 'aurora-wireless-headphones', 'Studio-tuned over-ear headphones with adaptive noise cancellation.', 179.00, 219.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 1, 4.8, true),
  ('Pulse Fitness Watch', 'pulse-fitness-watch', 'AMOLED fitness watch with 14-day battery and heart-rate tracking.', 129.00, 159.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 2, 4.6, true),
  ('Voyage Canvas Backpack', 'voyage-canvas-backpack', 'Water-resistant 22L backpack with padded laptop sleeve.', 89.00, NULL, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', 3, 4.7, true),
  ('Lumen Desk Lamp', 'lumen-desk-lamp', 'Minimal dimmable LED desk lamp with wireless charging base.', 59.00, 75.00, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800', 4, 4.5, false),
  ('Nimbus Bluetooth Speaker', 'nimbus-bluetooth-speaker', 'Portable 360° speaker with 20-hour playtime, IPX7 rated.', 69.00, NULL, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800', 1, 4.4, false),
  ('Orbit Sunglasses', 'orbit-sunglasses', 'Polarized UV400 sunglasses with a lightweight titanium frame.', 45.00, 60.00, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800', 2, 4.3, false),
  ('Drift Crossbody Bag', 'drift-crossbody-bag', 'Compact vegan-leather crossbody with anti-theft zip.', 55.00, NULL, 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800', 3, 4.2, false),
  ('Haven Ceramic Mug Set', 'haven-ceramic-mug-set', 'Set of 2 hand-glazed stoneware mugs, 350ml each.', 32.00, 40.00, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800', 4, 4.9, true)
ON CONFLICT (slug) DO NOTHING;

-- A couple of seed reviews so the product page isn't empty on first run
INSERT INTO reviews (product_id, author_name, rating, comment)
SELECT id, 'Morgan T.', 5, 'Exactly as described — build quality feels premium and shipping was fast.'
FROM products WHERE slug = 'aurora-wireless-headphones'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (product_id, author_name, rating, comment)
SELECT id, 'Priya K.', 4, 'Great sound, battery life is a little shorter than advertised but still solid.'
FROM products WHERE slug = 'aurora-wireless-headphones'
ON CONFLICT DO NOTHING;

INSERT INTO product_questions (product_id, author_name, question, answer, answered_at)
SELECT id, 'Sam R.', 'Does this come with a carrying case?', 'Yes, a soft zip case is included in the box.', now()
FROM products WHERE slug = 'aurora-wireless-headphones'
ON CONFLICT DO NOTHING;
