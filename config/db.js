const { Pool } = require("pg");
require("dotenv").config();

const isInternal = process.env.DATABASE_URL && process.env.DATABASE_URL.includes(".internal");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: (process.env.NODE_ENV === "production" && !isInternal) ? { rejectUnauthorized: false } : false
});

pool
  .connect()
  .then((client) => {
    console.log("PostgreSQL connected successfully");
    client.release();
  })
  .catch((err) => {
    console.error("FATAL: Database connection failed:", err.message);
    process.exit(1); // FIX: crash immediately instead of running broken
  });

module.exports = pool;
