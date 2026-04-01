require("dotenv").config();
const pool = require("./config/db");
const bcrypt = require("bcrypt");

async function createAdmin() {
  try {
    console.log("Connecting securely to PostgreSQL database...");
    const passwordHash = await bcrypt.hash("admin123", 10);
    
    // Insert new admin or forcibly override existing user into admin
    const query = `
      INSERT INTO users (email, name, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE 
      SET role = 'admin', password_hash = $3, name = $2
      RETURNING id, email, name, role;
    `;
    
    const res = await pool.query(query, ["admin@apiforge.com", "System Admin", passwordHash, "admin"]);
    
    console.log("\n✅ SUCCESS! Admin account is ready to use:");
    console.log("=====================================");
    console.log(`📧 Email:    ${res.rows[0].email}`);
    console.log(`🔑 Password: admin123`);
    console.log(`🛡️  Role:    ${res.rows[0].role}`);
    console.log("=====================================\n");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to physically create admin account inside Postgres:", err.message);
    process.exit(1);
  }
}

createAdmin();
