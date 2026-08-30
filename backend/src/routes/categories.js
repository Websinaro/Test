const express = require("express");
const pool = require("../config/db");

const router = express.Router();

/** GET /api/categories — list all categories */
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY name");
    res.json({ categories: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});

module.exports = router;
