/**
 * Lightweight gate for the dev panel. This is NOT a real admin/role system —
 * it just checks a shared secret so a solo dev/small team can add products
 * without wiring up a full back-office. Swap for real role-based auth
 * (e.g. a `role` column on `users`) before shipping to real customers.
 */
function requireDevSecret(req, res, next) {
  const provided = req.headers["x-dev-secret"];
  const expected = process.env.DEV_SECRET;

  if (!expected) {
    return res.status(500).json({ error: "DEV_SECRET is not configured on the server." });
  }
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: "Invalid dev key." });
  }
  next();
}

module.exports = { requireDevSecret };
