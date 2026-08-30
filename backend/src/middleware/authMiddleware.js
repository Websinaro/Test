const admin = require("../config/firebaseAdmin");

/**
 * Verifies the Firebase ID token sent as `Authorization: Bearer <token>`.
 * On success, attaches the decoded token to req.firebaseUser.
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing Authorization bearer token." });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUser = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = { requireAuth };
