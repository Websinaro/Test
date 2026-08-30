const express = require("express");
const pool = require("../config/db");
const { requireDevSecret } = require("../middleware/devAuth");

const router = express.Router();

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** GET /api/products — list all products, optional ?category=slug&featured=true */
router.get("/", async (req, res) => {
  const { category, featured } = req.query;
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
  if (clauses.length) query += ` WHERE ${clauses.join(" AND ")}`;
  query += " ORDER BY p.created_at DESC";

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

/**
 * POST /api/products — dev-panel only (requires x-dev-secret header).
 * Body: { name, description, price, comparePrice, imageUrl, categoryId, stock, isFeatured }
 */
router.post("/", requireDevSecret, async (req, res) => {
  const {
    name,
    description,
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
        (name, slug, description, price, compare_price, image_url, category_id, stock, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        slug,
        description || null,
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
