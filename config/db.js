const { Pool } = require("pg");
require("dotenv").config();

const isInternal = process.env.DATABASE_URL && process.env.DATABASE_URL.includes(".internal");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool
  .connect()
  .then((client) => {
    console.log("PostgreSQL connected successfully");
    client.release();
  })
  .catch((err) => {
    console.error("FATAL: Database connection failed. Full Error Context:", err);
    process.exit(1);
  });

module.exports = pool;
