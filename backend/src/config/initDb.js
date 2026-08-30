const fs = require("fs");
const path = require("path");
const pool = require("./db");

async function init() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  try {
    console.log("Running schema.sql against DATABASE_URL...");
    await pool.query(sql);
    console.log("✅ Database schema created & demo products seeded.");
  } catch (err) {
    console.error("❌ Failed to initialize database:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

init();
