const { Pool } = require("pg");
require("dotenv").config();

// Render/Aiven managed Postgres require SSL outside of local development.
// Trust NODE_ENV in production rather than string-matching the URL, since
// Render's internal DATABASE_URL doesn't always include `sslmode=require`.
const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || "");
const useSSL = process.env.NODE_ENV === "production" || !isLocal;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
});

module.exports = pool;
