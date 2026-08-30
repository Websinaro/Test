const express = require("express");
const pool = require("../config/db");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * POST /api/auth/sync
 * Called by the frontend right after Firebase signup/login (including Google).
 * Creates the user row on first login, or returns the existing profile.
 * Body: { name, phone } — used only on first insert (Google users may not have phone).
 */
router.post("/sync", requireAuth, async (req, res) => {
  const { uid, email, name: tokenName, picture, firebase } = req.firebaseUser;
  const { name, phone } = req.body || {};
  const provider = firebase?.sign_in_provider === "google.com" ? "google" : "password";

  try {
    const existing = await pool.query("SELECT * FROM users WHERE firebase_uid = $1", [uid]);

    if (existing.rows.length > 0) {
      return res.json({ user: existing.rows[0] });
    }

    const inserted = await pool.query(
      `INSERT INTO users (firebase_uid, name, email, phone, photo_url, provider)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [uid, name || tokenName || "New User", email, phone || null, picture || null, provider]
    );

    res.status(201).json({ user: inserted.rows[0] });
  } catch (err) {
    console.error("Auth sync error:", err.message);
    res.status(500).json({ error: "Failed to sync user profile." });
  }
});

/** GET /api/auth/me — returns the current user's profile row */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE firebase_uid = $1", [
      req.firebaseUser.uid,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found. Call /api/auth/sync first." });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

module.exports = router;
