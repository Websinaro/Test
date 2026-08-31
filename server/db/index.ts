import pg from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_COUPONS } from './seed.ts';

const { Pool } = pg;

// Database status type
export interface DatabaseStatus {
  isConnected: boolean;
  type: 'postgresql' | 'in-memory';
  host?: string;
  database?: string;
  tablesReady: boolean;
  productCount: number;
  userCount: number;
  orderCount: number;
  message: string;
}

// In-memory mock store for preview resiliency when remote Postgres is being provisioned/configured
interface MemoryStore {
  users: any[];
  categories: any[];
  products: any[];
  reviews: any[];
  orders: any[];
  order_items: any[];
  cart_items: any[];
  wishlist_items: any[];
  coupons: any[];
}

const memoryStore: MemoryStore = {
  users: [],
  categories: [...INITIAL_CATEGORIES],
  products: INITIAL_PRODUCTS.map((p, idx) => ({
    id: idx + 1,
    ...p,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })),
  reviews: [
    {
      id: 1,
      product_id: 1,
      user_id: 1,
      user_name: 'Alex Vance',
      rating: 5,
      title: 'Flawless sound stage and comfort',
      comment: 'The hybrid noise cancellation on these headphones makes daily commuting silent. Audio response curve is balanced and crisp.',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 2,
      product_id: 1,
      user_id: 2,
      user_name: 'Elena Rostova',
      rating: 5,
      title: 'Battery life exceeded expectations',
      comment: 'Charged once, used all week. Mic clarity during Zoom calls is crystal clear.',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 3,
      product_id: 2,
      user_id: 1,
      user_name: 'Alex Vance',
      rating: 5,
      title: 'Unbelievable build quality',
      comment: 'The titanium finish is gorgeous. GPS lock is instant and battery holds easily for 12 days.',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    }
  ],
  orders: [],
  order_items: [],
  cart_items: [],
  wishlist_items: [],
  coupons: [...INITIAL_COUPONS.map((c, idx) => ({ id: idx + 1, ...c, created_at: new Date().toISOString() }))],
};

let pgPool: pg.Pool | null = null;
let isPostgresLive = false;
let connectionErrorMsg = '';

// Determine Postgres connection parameters
function getPostgresConfig(): pg.PoolConfig | null {
  const connString = process.env.DATABASE_URL || process.env.RENDER_POSTGRES_URL || process.env.POSTGRES_URL;
  if (connString && connString.startsWith('postgres')) {
    return {
      connectionString: connString,
      ssl: connString.includes('render.com') || connString.includes('supabase') || connString.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false,
      max: 10,
      connectionTimeoutMillis: 5000,
    };
  }

  const host = process.env.SQL_HOST || process.env.PGHOST;
  const user = process.env.SQL_USER || process.env.PGUSER;
  const database = process.env.SQL_DB_NAME || process.env.PGDATABASE;
  const password = process.env.SQL_PASSWORD || process.env.PGPASSWORD;
  const port = parseInt(process.env.PGPORT || '5432', 10);

  if (host && user && database) {
    return {
      host,
      user,
      password,
      database,
      port,
      max: 10,
      connectionTimeoutMillis: 5000,
    };
  }

  return null;
}

export async function initializeDatabase(): Promise<void> {
  // Seed default admin user in memory store
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@123456', salt);
  const customerPasswordHash = await bcrypt.hash('User@123456', salt);

  if (memoryStore.users.length === 0) {
    memoryStore.users.push(
      {
        id: 1,
        uid: 'admin-seed-uid-001',
        email: 'admin@nexuscart.com',
        password_hash: adminPasswordHash,
        name: 'System Admin',
        phone: '+1 (555) 019-2834',
        role: 'admin',
        auth_provider: 'local',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        uid: 'user-seed-uid-002',
        email: 'customer@nexuscart.com',
        password_hash: customerPasswordHash,
        name: 'Sarah Connor',
        phone: '+1 (555) 018-9942',
        role: 'customer',
        auth_provider: 'local',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
  }

  const config = getPostgresConfig();
  if (!config) {
    console.log('[Database] Running in-memory database mode with PostgreSQL schema abstraction (Set DATABASE_URL to connect to Render PostgreSQL).');
    return;
  }

  try {
    console.log('[Database] Connecting to PostgreSQL instance...');
    pgPool = new Pool(config);

    // Test connection
    const client = await pgPool.connect();
    const testResult = await client.query('SELECT NOW()');
    client.release();

    isPostgresLive = true;
    console.log('[Database] PostgreSQL connected successfully:', testResult.rows[0]);

    // Apply schema
    const schemaPath = path.join(process.cwd(), 'server', 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pgPool.query(schemaSql);
      console.log('[Database] PostgreSQL tables verified/created successfully.');
    }

    // Seed PostgreSQL if empty
    const productCheck = await pgPool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCheck.rows[0].count, 10) === 0) {
      console.log('[Database] Seeding initial PostgreSQL data...');
      
      // Categories
      for (const cat of INITIAL_CATEGORIES) {
        await pgPool.query(
          `INSERT INTO categories (slug, name, icon, description, image_url)
           VALUES ($1, $2, $3, $4, $5) ON CONFLICT (slug) DO NOTHING`,
          [cat.slug, cat.name, cat.icon, cat.description, cat.image_url]
        );
      }

      // Products
      for (const prod of INITIAL_PRODUCTS) {
        await pgPool.query(
          `INSERT INTO products (title, slug, description, price, original_price, discount_percent, rating, review_count, stock_quantity, category_slug, brand, images, features, in_stock, is_featured, badge)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) ON CONFLICT (slug) DO NOTHING`,
          [
            prod.title,
            prod.slug,
            prod.description,
            prod.price,
            prod.original_price,
            prod.discount_percent,
            prod.rating,
            prod.review_count,
            prod.stock_quantity,
            prod.category_slug,
            prod.brand,
            JSON.stringify(prod.images),
            JSON.stringify(prod.features),
            prod.in_stock,
            prod.is_featured,
            prod.badge || null,
          ]
        );
      }

      // Admin user
      await pgPool.query(
        `INSERT INTO users (uid, email, password_hash, name, phone, role, auth_provider)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (email) DO NOTHING`,
        ['admin-seed-uid-001', 'admin@nexuscart.com', adminPasswordHash, 'System Admin', '+1 (555) 019-2834', 'admin', 'local']
      );

      // Customer user
      await pgPool.query(
        `INSERT INTO users (uid, email, password_hash, name, phone, role, auth_provider)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (email) DO NOTHING`,
        ['user-seed-uid-002', 'customer@nexuscart.com', customerPasswordHash, 'Sarah Connor', '+1 (555) 018-9942', 'customer', 'local']
      );

      // Coupons
      for (const coupon of INITIAL_COUPONS) {
        await pgPool.query(
          `INSERT INTO coupons (code, discount_type, discount_value, min_purchase, max_discount, description, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (code) DO NOTHING`,
          [coupon.code, coupon.discount_type, coupon.discount_value, coupon.min_purchase, coupon.max_discount || null, coupon.description, coupon.is_active]
        );
      }

      console.log('[Database] PostgreSQL database seeded successfully.');
    }
  } catch (err: any) {
    console.error('[Database] PostgreSQL connection error:', err.message);
    connectionErrorMsg = err.message;
    isPostgresLive = false;
    console.log('[Database] Falling back seamlessly to memory-backed relational engine.');
  }
}

export function getDbStatus(): DatabaseStatus {
  return {
    isConnected: isPostgresLive,
    type: isPostgresLive ? 'postgresql' : 'in-memory',
    host: process.env.DATABASE_URL ? 'Render PostgreSQL' : (process.env.PGHOST || 'In-Memory Abstracted'),
    database: process.env.PGDATABASE || 'nexus_cart',
    tablesReady: true,
    productCount: memoryStore.products.length,
    userCount: memoryStore.users.length,
    orderCount: memoryStore.orders.length,
    message: isPostgresLive
      ? 'Connected to live PostgreSQL database.'
      : connectionErrorMsg
      ? `Using abstracted DB. Connection note: ${connectionErrorMsg}`
      : 'Ready for PostgreSQL Render connection string via DATABASE_URL.',
  };
}

export const db = {
  // Query abstraction that uses real PostgreSQL when online or memoryStore when offline
  async query(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> {
    if (isPostgresLive && pgPool) {
      try {
        const res = await pgPool.query(text, params);
        return { rows: res.rows, rowCount: res.rowCount || 0 };
      } catch (err) {
        console.error('PostgreSQL query error, falling back to memory layer:', err);
      }
    }
    return { rows: [], rowCount: 0 };
  },

  // USERS
  async findUserByEmail(email: string) {
    const normalized = email.toLowerCase().trim();
    if (isPostgresLive && pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [normalized]);
        if (res.rows.length > 0) return res.rows[0];
      } catch (e) {
        console.error('findUserByEmail PG error:', e);
      }
    }
    return memoryStore.users.find(u => u.email.toLowerCase() === normalized) || null;
  },

  async findUserByUid(uid: string) {
    if (isPostgresLive && pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM users WHERE uid = $1 LIMIT 1', [uid]);
        if (res.rows.length > 0) return res.rows[0];
      } catch (e) {
        console.error('findUserByUid PG error:', e);
      }
    }
    return memoryStore.users.find(u => u.uid === uid) || null;
  },

  async findUserById(id: number) {
    if (isPostgresLive && pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
        if (res.rows.length > 0) return res.rows[0];
      } catch (e) {
        console.error('findUserById PG error:', e);
      }
    }
    return memoryStore.users.find(u => u.id === id) || null;
  },

  async createUser(userData: {
    uid: string;
    email: string;
    password_hash?: string | null;
    name: string;
    phone?: string | null;
    role?: string;
    auth_provider?: string;
    avatar_url?: string | null;
  }) {
    const normalizedEmail = userData.email.toLowerCase().trim();
    const newUser = {
      id: memoryStore.users.length + 1,
      uid: userData.uid,
      email: normalizedEmail,
      password_hash: userData.password_hash || null,
      name: userData.name,
      phone: userData.phone || null,
      role: userData.role || 'customer',
      auth_provider: userData.auth_provider || 'local',
      avatar_url: userData.avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isPostgresLive && pgPool) {
      try {
        const res = await pgPool.query(
          `INSERT INTO users (uid, email, password_hash, name, phone, role, auth_provider, avatar_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            newUser.uid,
            newUser.email,
            newUser.password_hash,
            newUser.name,
            newUser.phone,
            newUser.role,
            newUser.auth_provider,
            newUser.avatar_url,
          ]
        );
        memoryStore.users.push(res.rows[0]);
        return res.rows[0];
      } catch (e) {
        console.error('createUser PG error:', e);
      }
    }

    memoryStore.users.push(newUser);
    return newUser;
  },

  async updateUser(id: number, data: Partial<{ name: string; phone: string; avatar_url: string }>) {
    if (isPostgresLive && pgPool) {
      try {
        const res = await pgPool.query(
          `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), avatar_url = COALESCE($3, avatar_url), updated_at = NOW()
           WHERE id = $4 RETURNING *`,
          [data.name, data.phone, data.avatar_url, id]
        );
        if (res.rows.length > 0) return res.rows[0];
      } catch (e) {
        console.error('updateUser PG error:', e);
      }
    }

    const user = memoryStore.users.find(u => u.id === id);
    if (user) {
      if (data.name !== undefined) user.name = data.name;
      if (data.phone !== undefined) user.phone = data.phone;
      if (data.avatar_url !== undefined) user.avatar_url = data.avatar_url;
      user.updated_at = new Date().toISOString();
      return user;
    }
    return null;
  },

  // CATEGORIES
  async getCategories() {
    if (isPostgresLive && pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM categories ORDER BY name ASC');
        if (res.rows.length > 0) return res.rows;
      } catch (e) {
        console.error('getCategories PG error:', e);
      }
    }
    return memoryStore.categories;
  },

  // PRODUCTS
  async getProducts(filter?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    featured?: boolean;
  }) {
    let list = [...memoryStore.products];

    if (isPostgresLive && pgPool) {
      try {
        let sql = 'SELECT * FROM products WHERE in_stock = true';
        const params: any[] = [];
        let idx = 1;

        if (filter?.category && filter.category !== 'all') {
          sql += ` AND category_slug = $${idx++}`;
          params.push(filter.category);
        }
        if (filter?.search) {
          sql += ` AND (LOWER(title) LIKE $${idx} OR LOWER(description) LIKE $${idx} OR LOWER(brand) LIKE $${idx})`;
          params.push(`%${filter.search.toLowerCase()}%`);
          idx++;
        }
        if (filter?.minPrice !== undefined) {
          sql += ` AND price >= $${idx++}`;
          params.push(filter.minPrice);
        }
        if (filter?.maxPrice !== undefined) {
          sql += ` AND price <= $${idx++}`;
          params.push(filter.maxPrice);
        }
        if (filter?.featured) {
          sql += ` AND is_featured = true`;
        }

        if (filter?.sortBy === 'price-asc') sql += ' ORDER BY price ASC';
        else if (filter?.sortBy === 'price-desc') sql += ' ORDER BY price DESC';
        else if (filter?.sortBy === 'rating') sql += ' ORDER BY rating DESC';
        else if (filter?.sortBy === 'discount') sql += ' ORDER BY discount_percent DESC';
        else sql += ' ORDER BY is_featured DESC, id ASC';

        const res = await pgPool.query(sql, params);
        if (res.rows.length > 0) return res.rows;
      } catch (e) {
        console.error('getProducts PG error:', e);
      }
    }

    // Memory filter
    if (filter?.category && filter.category !== 'all') {
      list = list.filter(p => p.category_slug === filter.category);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }
    if (filter?.minPrice !== undefined) {
      list = list.filter(p => p.price >= filter.minPrice!);
    }
    if (filter?.maxPrice !== undefined) {
      list = list.filter(p => p.price <= filter.maxPrice!);
    }
    if (filter?.featured) {
      list = list.filter(p => p.is_featured);
    }

    if (filter?.sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (filter?.sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (filter?.sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (filter?.sortBy === 'discount') {
      list.sort((a, b) => b.discount_percent - a.discount_percent);
    } else {
      list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return list;
  },

  async getProductByIdOrSlug(idOrSlug: string | number) {
    if (isPostgresLive && pgPool) {
      try {
        const isNum = !isNaN(Number(idOrSlug));
        const query = isNum
          ? 'SELECT * FROM products WHERE id = $1'
          : 'SELECT * FROM products WHERE slug = $1';
        const res = await pgPool.query(query, [idOrSlug]);
        if (res.rows.length > 0) return res.rows[0];
      } catch (e) {
        console.error('getProductByIdOrSlug PG error:', e);
      }
    }

    return (
      memoryStore.products.find(
        p => p.id === Number(idOrSlug) || p.slug === String(idOrSlug)
      ) || null
    );
  },

  async createProduct(productData: any) {
    const newProduct = {
      id: memoryStore.products.length + 1,
      ...productData,
      slug: productData.slug || productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isPostgresLive && pgPool) {
      try {
        const res = await pgPool.query(
          `INSERT INTO products (title, slug, description, price, original_price, discount_percent, rating, review_count, stock_quantity, category_slug, brand, images, features, in_stock, is_featured, badge)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           RETURNING *`,
          [
            newProduct.title,
            newProduct.slug,
            newProduct.description,
            newProduct.price,
            newProduct.original_price || newProduct.price,
            newProduct.discount_percent || 0,
            newProduct.rating || 5.0,
            0,
            newProduct.stock_quantity || 50,
            newProduct.category_slug,
            newProduct.brand || 'Nexus',
            JSON.stringify(newProduct.images || []),
            JSON.stringify(newProduct.features || []),
            newProduct.in_stock ?? true,
            newProduct.is_featured ?? false,
            newProduct.badge || null,
          ]
        );
        memoryStore.products.push(res.rows[0]);
        return res.rows[0];
      } catch (e) {
        console.error('createProduct PG error:', e);
      }
    }

    memoryStore.products.push(newProduct);
    return newProduct;
  },

  async updateProduct(id: number, data: any) {
    if (isPostgresLive && pgPool) {
      try {
        const res = await pgPool.query(
          `UPDATE products SET 
            title = COALESCE($1, title),
            price = COALESCE($2, price),
            stock_quantity = COALESCE($3, stock_quantity),
            in_stock = COALESCE($4, in_stock),
            description = COALESCE($5, description),
            updated_at = NOW()
           WHERE id = $6 RETURNING *`,
          [data.title, data.price, data.stock_quantity, data.in_stock, data.description, id]
        );
        if (res.rows.length > 0) return res.rows[0];
      } catch (e) {
        console.error('updateProduct PG error:', e);
      }
    }

    const product = memoryStore.products.find(p => p.id === id);
    if (product) {
      Object.assign(product, data, { updated_at: new Date().toISOString() });
      return product;
    }
    return null;
  },

  async deleteProduct(id: number) {
    if (isPostgresLive && pgPool) {
      try {
        await pgPool.query('DELETE FROM products WHERE id = $1', [id]);
      } catch (e) {
        console.error('deleteProduct PG error:', e);
      }
    }
    const idx = memoryStore.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      memoryStore.products.splice(idx, 1);
      return true;
    }
    return false;
  },

  // REVIEWS
  async getReviews(productId: number) {
    if (isPostgresLive && pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC', [productId]);
        if (res.rows.length > 0) return res.rows;
      } catch (e) {
        console.error('getReviews PG error:', e);
      }
    }
    return memoryStore.reviews.filter(r => r.product_id === productId);
  },

  async addReview(reviewData: { productId: number; userId: number; userName: string; rating: number; title?: string; comment: string }) {
    const newRev = {
      id: memoryStore.reviews.length + 1,
      product_id: reviewData.productId,
      user_id: reviewData.userId,
      user_name: reviewData.userName,
      rating: reviewData.rating,
      title: reviewData.title || '',
      comment: reviewData.comment,
      created_at: new Date().toISOString(),
    };

    if (isPostgresLive && pgPool) {
      try {
        const res = await pgPool.query(
          `INSERT INTO reviews (product_id, user_id, user_name, rating, title, comment)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [newRev.product_id, newRev.user_id, newRev.user_name, newRev.rating, newRev.title, newRev.comment]
        );
        // Update product rating and review count
        await pgPool.query(
          `UPDATE products SET
            review_count = review_count + 1,
            rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE product_id = $1)
           WHERE id = $1`,
          [newRev.product_id]
        );
        memoryStore.reviews.push(res.rows[0]);
        return res.rows[0];
      } catch (e) {
        console.error('addReview PG error:', e);
      }
    }

    memoryStore.reviews.push(newRev);
    const prod = memoryStore.products.find(p => p.id === reviewData.productId);
    if (prod) {
      prod.review_count = (prod.review_count || 0) + 1;
      const allRevs = memoryStore.reviews.filter(r => r.product_id === prod.id);
      const avg = allRevs.reduce((sum, r) => sum + r.rating, 0) / allRevs.length;
      prod.rating = parseFloat(avg.toFixed(2));
    }
    return newRev;
  },

  // CART
  async getCart(userId: number) {
    const userCart = memoryStore.cart_items.filter(c => c.user_id === userId);
    return userCart.map(c => {
      const product = memoryStore.products.find(p => p.id === c.product_id);
      return {
        ...c,
        product,
      };
    }).filter(c => c.product != null);
  },

  async addToCart(userId: number, productId: number, quantity: number = 1) {
    let item = memoryStore.cart_items.find(c => c.user_id === userId && c.product_id === productId);
    if (item) {
      item.quantity += quantity;
      item.updated_at = new Date().toISOString();
    } else {
      item = {
        id: memoryStore.cart_items.length + 1,
        user_id: userId,
        product_id: productId,
        quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      memoryStore.cart_items.push(item);
    }
    return this.getCart(userId);
  },

  async updateCartItem(userId: number, productId: number, quantity: number) {
    if (quantity <= 0) {
      return this.removeFromCart(userId, productId);
    }
    const item = memoryStore.cart_items.find(c => c.user_id === userId && c.product_id === productId);
    if (item) {
      item.quantity = quantity;
      item.updated_at = new Date().toISOString();
    }
    return this.getCart(userId);
  },

  async removeFromCart(userId: number, productId: number) {
    const idx = memoryStore.cart_items.findIndex(c => c.user_id === userId && c.product_id === productId);
    if (idx !== -1) {
      memoryStore.cart_items.splice(idx, 1);
    }
    return this.getCart(userId);
  },

  async clearCart(userId: number) {
    memoryStore.cart_items = memoryStore.cart_items.filter(c => c.user_id !== userId);
    return [];
  },

  // WISHLIST
  async getWishlist(userId: number) {
    const list = memoryStore.wishlist_items.filter(w => w.user_id === userId);
    return list
      .map(w => memoryStore.products.find(p => p.id === w.product_id))
      .filter(p => p != null);
  },

  async toggleWishlist(userId: number, productId: number) {
    const idx = memoryStore.wishlist_items.findIndex(w => w.user_id === userId && w.product_id === productId);
    if (idx !== -1) {
      memoryStore.wishlist_items.splice(idx, 1);
      return { isWishlisted: false, wishlist: await this.getWishlist(userId) };
    } else {
      memoryStore.wishlist_items.push({
        id: memoryStore.wishlist_items.length + 1,
        user_id: userId,
        product_id: productId,
        created_at: new Date().toISOString(),
      });
      return { isWishlisted: true, wishlist: await this.getWishlist(userId) };
    }
  },

  // COUPONS
  async getCouponByCode(code: string) {
    const normalized = code.toUpperCase().trim();
    if (isPostgresLive && pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM coupons WHERE UPPER(code) = $1 AND is_active = true LIMIT 1', [normalized]);
        if (res.rows.length > 0) return res.rows[0];
      } catch (e) {
        console.error('getCouponByCode PG error:', e);
      }
    }
    return memoryStore.coupons.find(c => c.code.toUpperCase() === normalized && c.is_active) || null;
  },

  // ORDERS
  async createOrder(orderData: {
    userId?: number | null;
    userEmail: string;
    userName: string;
    userPhone?: string;
    totalAmount: number;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    shippingFee: number;
    paymentMethod: string;
    shippingAddress: any;
    couponCode?: string;
    items: Array<{ productId: number; title: string; image: string; price: number; quantity: number }>;
  }) {
    const orderNumber = `NEXUS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const trackingNumber = `TRK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const newOrder = {
      id: memoryStore.orders.length + 1,
      order_number: orderNumber,
      user_id: orderData.userId || null,
      user_email: orderData.userEmail,
      user_name: orderData.userName,
      user_phone: orderData.userPhone || null,
      total_amount: orderData.totalAmount,
      subtotal: orderData.subtotal,
      discount_amount: orderData.discountAmount,
      tax_amount: orderData.taxAmount,
      shipping_fee: orderData.shippingFee,
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: orderData.paymentMethod,
      shipping_address: orderData.shippingAddress,
      coupon_code: orderData.couponCode || null,
      tracking_number: trackingNumber,
      estimated_delivery: new Date(Date.now() + 86400000 * 3).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: orderData.items.map((item, idx) => ({
        id: memoryStore.order_items.length + idx + 1,
        product_id: item.productId,
        product_title: item.title,
        product_image: item.image,
        price: item.price,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
      })),
    };

    if (isPostgresLive && pgPool) {
      try {
        const res = await pgPool.query(
          `INSERT INTO orders (order_number, user_id, user_email, user_name, user_phone, total_amount, subtotal, discount_amount, tax_amount, shipping_fee, status, payment_status, payment_method, shipping_address, coupon_code, tracking_number, estimated_delivery)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
           RETURNING *`,
          [
            newOrder.order_number,
            newOrder.user_id,
            newOrder.user_email,
            newOrder.user_name,
            newOrder.user_phone,
            newOrder.total_amount,
            newOrder.subtotal,
            newOrder.discount_amount,
            newOrder.tax_amount,
            newOrder.shipping_fee,
            newOrder.status,
            newOrder.payment_status,
            newOrder.payment_method,
            JSON.stringify(newOrder.shipping_address),
            newOrder.coupon_code,
            newOrder.tracking_number,
            newOrder.estimated_delivery,
          ]
        );

        const createdDbOrder = res.rows[0];

        for (const item of orderData.items) {
          await pgPool.query(
            `INSERT INTO order_items (order_id, product_id, product_title, product_image, price, quantity, total_price)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              createdDbOrder.id,
              item.productId,
              item.title,
              item.image,
              item.price,
              item.quantity,
              item.price * item.quantity,
            ]
          );
        }
      } catch (e) {
        console.error('createOrder PG error:', e);
      }
    }

    memoryStore.orders.unshift(newOrder);
    for (const item of newOrder.items) {
      memoryStore.order_items.push({ ...item, order_id: newOrder.id });
    }

    // Decrement product inventory
    for (const item of orderData.items) {
      const prod = memoryStore.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
        if (prod.stock_quantity === 0) prod.in_stock = false;
      }
    }

    // Clear cart if user is logged in
    if (orderData.userId) {
      await this.clearCart(orderData.userId);
    }

    return newOrder;
  },

  async getOrders(userId?: number | null, userEmail?: string | null) {
    if (userId) {
      return memoryStore.orders.filter(o => o.user_id === userId || (userEmail && o.user_email.toLowerCase() === userEmail.toLowerCase()));
    }
    return memoryStore.orders;
  },

  async getAllOrdersForAdmin() {
    return memoryStore.orders;
  },

  async updateOrderStatus(orderId: number, status: string) {
    const order = memoryStore.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updated_at = new Date().toISOString();
      return order;
    }
    return null;
  },
};
