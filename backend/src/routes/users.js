const express = require("express");
const pool = require("../config/db");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

/** PATCH /api/users/me — update name / phone */
router.patch("/me", requireAuth, async (req, res) => {
  const { name, phone } = req.body || {};

  try {
    const result = await pool.query(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), updated_at = now()
       WHERE firebase_uid = $3 RETURNING *`,
      [name, phone, req.firebaseUser.uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found." });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

module.exports = router;
