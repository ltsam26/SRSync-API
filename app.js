const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

dotenv.config();

// Validate required env variables before anything starts
const REQUIRED_ENV = ["JWT_SECRET", "DATABASE_URL"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error("FATAL: Missing environment variables:", missing.join(", "));
  process.exit(1);
}

const app = express();

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ─── Logging ─────────────────────────────────────────────────────────────────
app.use(morgan("dev"));

// ─── Payment webhook MUST be registered before express.json() ───────────────
// (stripe needs raw body for signature verification)
const paymentRoutes = require("./routes/payment.routes");
app.use("/api/payments", paymentRoutes);

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Route Imports ───────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const projectRoutes = require("./routes/project.routes");
const apiKeyRoutes = require("./routes/apikey.routes");
const publicRoutes = require("./routes/public.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const adminRoutes = require("./routes/admin.routes");

// ─── Health Check & Cloud Setup ────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "SaaS API Platform Backend Running" });
});

app.get("/setup-cloud-db", async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const pool = require('./config/db');
    const bcrypt = require('bcrypt');
    const schemaData = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    
    // Ignore trigger/table existing errors by wrapping in try/catch
    try {
      await pool.query(schemaData);
    } catch (schemaErr) {
      console.log("Schema sync note:", schemaErr.message);
    }

    const passwordHash = await bcrypt.hash("admin123", 10);
    const query = `
      INSERT INTO users (email, name, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE 
      SET role = 'admin', password_hash = $3, name = $2
      RETURNING id, email, name, role;
    `;
    await pool.query(query, ["admin@srsyncapi.com", "System Admin", passwordHash, "admin"]);

    res.status(200).send("<h1>✅ SUCCESS! Tables & Admin Generated!</h1><p>You can now log in at /login</p>");
  } catch (err) {
    res.status(500).send("<h1>❌ ERROR:</h1><p>" + err.message + "</p>");
  }
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/keys", apiKeyRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin", adminRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;
