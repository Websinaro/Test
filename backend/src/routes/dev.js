const express = require("express");
const pool = require("../config/db");

const router = express.Router();

/**
 * Dev panel auth — a single hard-coded developer identity lives in
 * DEV_EMAIL / DEV_PASSWORD (backend .env). This is NOT a real multi-user
 * admin system: it just adds a friendlier "sign up once, log in after"
 * flow on top of the same shared-secret idea. `dev_admins` only remembers
 * whether the one-time signup has happened yet.
 */
function checkCredentials(email, password) {
  const expectedEmail = process.env.DEV_EMAIL;
  const expectedPassword = process.env.DEV_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    return { ok: false, error: "DEV_EMAIL / DEV_PASSWORD are not configured on the server." };
  }
  if (email !== expectedEmail || password !== expectedPassword) {
    return { ok: false, error: "Incorrect dev email or password." };
  }
  return { ok: true };
}

/** POST /api/dev/signup — first-time setup, body: { email, password } */
router.post("/signup", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const check = checkCredentials(email, password);
  if (!check.ok) return res.status(401).json({ error: check.error });

  try {
    const existing = await pool.query("SELECT id FROM dev_admins WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "A dev account already exists for this email — please log in instead." });
    }

    await pool.query("INSERT INTO dev_admins (email) VALUES ($1)", [email]);
    res.status(201).json({ token: process.env.DEV_SECRET, email });
  } catch (err) {
    console.error("Dev signup error:", err.message);
    res.status(500).json({ error: "Failed to create dev account." });
  }
});

/** POST /api/dev/login — body: { email, password } */
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const check = checkCredentials(email, password);
  if (!check.ok) return res.status(401).json({ error: check.error });

  try {
    const existing = await pool.query("SELECT id FROM dev_admins WHERE email = $1", [email]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "No dev account yet — sign up first." });
    }
    res.json({ token: process.env.DEV_SECRET, email });
  } catch (err) {
    console.error("Dev login error:", err.message);
    res.status(500).json({ error: "Failed to log in." });
  }
});

module.exports = router;
