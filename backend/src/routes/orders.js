const express = require("express");
const pool = require("../config/db");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

async function getUserId(firebaseUid) {
  const result = await pool.query("SELECT id FROM users WHERE firebase_uid = $1", [firebaseUid]);
  return result.rows[0]?.id || null;
}

/** POST /api/orders — body: { items: [{ productId, quantity, unitPrice }] } */
router.post("/", requireAuth, async (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order must contain at least one item." });
  }

  const client = await pool.connect();
  try {
    const userId = await getUserId(req.firebaseUser.uid);
    if (!userId) return res.status(404).json({ error: "User profile not found." });

    const total = items.reduce((sum, i) => sum + Number(i.unitPrice) * Number(i.quantity), 0);

    await client.query("BEGIN");
    const orderResult = await client.query(
      "INSERT INTO orders (user_id, total, status) VALUES ($1, $2, 'pending') RETURNING *",
      [userId, total.toFixed(2)]
    );
    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
        [order.id, item.productId, item.quantity, item.unitPrice]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ order });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err.message);
    res.status(500).json({ error: "Failed to create order." });
  } finally {
    client.release();
  }
});

/** GET /api/orders — order history for the logged-in user */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = await getUserId(req.firebaseUser.uid);
    if (!userId) return res.status(404).json({ error: "User profile not found." });

    const result = await pool.query(
      `SELECT o.*, json_agg(json_build_object(
          'productId', oi.product_id, 'quantity', oi.quantity, 'unitPrice', oi.unit_price
        )) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id ORDER BY o.created_at DESC`,
      [userId]
    );
    res.json({ orders: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

module.exports = router;
