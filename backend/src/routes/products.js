const express = require("express");
const pool = require("../config/db");
const { requireDevSecret } = require("../middleware/devAuth");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** GET /api/products — list all products, optional ?category=slug&featured=true&search=term */
router.get("/", async (req, res) => {
  const { category, featured, search } = req.query;
  const clauses = [];
  const values = [];

  let query = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
  `;

  if (category) {
    values.push(category);
    clauses.push(`c.slug = $${values.length}`);
  }
  if (featured === "true") {
    clauses.push(`p.is_featured = true`);
  }
  if (search && search.trim()) {
    values.push(`%${search.trim()}%`);
    const idx = values.length;
    clauses.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx} OR c.name ILIKE $${idx})`);
  }
  if (clauses.length) query += ` WHERE ${clauses.join(" AND ")}`;
  query += search ? " ORDER BY p.is_featured DESC, p.created_at DESC" : " ORDER BY p.created_at DESC";

  try {
    const result = await pool.query(query, values);
    res.json({ products: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch products." });
  }
});

/** GET /api/products/:slug — single product detail */
router.get("/:slug", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.slug = $1`,
      [req.params.slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch product." });
  }
});

/** GET /api/products/:slug/related — up to 4 other products in the same category */
router.get("/:slug/related", async (req, res) => {
  try {
    const current = await pool.query("SELECT id, category_id FROM products WHERE slug = $1", [
      req.params.slug,
    ]);
    if (current.rows.length === 0) return res.json({ products: [] });

    const { id, category_id } = current.rows[0];
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id != $1 AND (p.category_id = $2 OR $2 IS NULL)
       ORDER BY p.is_featured DESC, p.created_at DESC
       LIMIT 4`,
      [id, category_id]
    );
    res.json({ products: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch related products." });
  }
});

/** GET /api/products/:slug/reviews */
router.get("/:slug/reviews", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.* FROM reviews r
       JOIN products p ON p.id = r.product_id
       WHERE p.slug = $1 ORDER BY r.created_at DESC`,
      [req.params.slug]
    );
    res.json({ reviews: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
});

/** POST /api/products/:slug/reviews — body: { rating, comment } (requires login) */
router.post("/:slug/reviews", requireAuth, async (req, res) => {
  const { rating, comment } = req.body || {};
  const stars = Number(rating);
  if (!stars || stars < 1 || stars > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }

  try {
    const product = await pool.query("SELECT id FROM products WHERE slug = $1", [req.params.slug]);
    if (product.rows.length === 0) return res.status(404).json({ error: "Product not found." });

    const userResult = await pool.query("SELECT id, name FROM users WHERE firebase_uid = $1", [
      req.firebaseUser.uid,
    ]);
    const author = userResult.rows[0];

    const inserted = await pool.query(
      `INSERT INTO reviews (product_id, user_id, author_name, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [product.rows[0].id, author?.id || null, author?.name || "Verified buyer", stars, comment || null]
    );

    // Keep the product's aggregate rating roughly in sync
    await pool.query(
      `UPDATE products SET rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE product_id = $1)
       WHERE id = $1`,
      [product.rows[0].id]
    );

    res.status(201).json({ review: inserted.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to submit review." });
  }
});

/** GET /api/products/:slug/qna */
router.get("/:slug/qna", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT q.* FROM product_questions q
       JOIN products p ON p.id = q.product_id
       WHERE p.slug = $1 ORDER BY q.created_at DESC`,
      [req.params.slug]
    );
    res.json({ questions: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch Q&A." });
  }
});

/** POST /api/products/:slug/qna — body: { question } (requires login) */
router.post("/:slug/qna", requireAuth, async (req, res) => {
  const { question } = req.body || {};
  if (!question || !question.trim()) {
    return res.status(400).json({ error: "Question text is required." });
  }

  try {
    const product = await pool.query("SELECT id FROM products WHERE slug = $1", [req.params.slug]);
    if (product.rows.length === 0) return res.status(404).json({ error: "Product not found." });

    const userResult = await pool.query("SELECT id, name FROM users WHERE firebase_uid = $1", [
      req.firebaseUser.uid,
    ]);
    const author = userResult.rows[0];

    const inserted = await pool.query(
      `INSERT INTO product_questions (product_id, user_id, author_name, question)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [product.rows[0].id, author?.id || null, author?.name || "Customer", question.trim()]
    );

    res.status(201).json({ question: inserted.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to submit question." });
  }
});

/**
 * POST /api/products — dev-panel only (requires x-dev-secret header).
 * Body: { name, description, detailedDescription, price, comparePrice, imageUrl, categoryId, stock, isFeatured }
 */
router.post("/", requireDevSecret, async (req, res) => {
  const {
    name,
    description,
    detailedDescription,
    price,
    comparePrice,
    imageUrl,
    categoryId,
    stock,
    isFeatured,
  } = req.body || {};

  if (!name || !price || !imageUrl) {
    return res.status(400).json({ error: "name, price, and imageUrl are required." });
  }

  const baseSlug = slugify(name);

  try {
    // Ensure slug uniqueness by suffixing -2, -3, etc. if needed
    let slug = baseSlug;
    let attempt = 1;
    while (true) {
      const clash = await pool.query("SELECT id FROM products WHERE slug = $1", [slug]);
      if (clash.rows.length === 0) break;
      attempt += 1;
      slug = `${baseSlug}-${attempt}`;
    }

    const result = await pool.query(
      `INSERT INTO products
        (name, slug, description, detailed_description, price, compare_price, image_url, category_id, stock, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        name,
        slug,
        description || null,
        detailedDescription || null,
        price,
        comparePrice || null,
        imageUrl,
        categoryId || null,
        stock ?? 100,
        Boolean(isFeatured),
      ]
    );

    res.status(201).json({ product: result.rows[0] });
  } catch (err) {
    console.error("Create product error:", err.message);
    res.status(500).json({ error: "Failed to create product." });
  }
});

module.exports = router;
