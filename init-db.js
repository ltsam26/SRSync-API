const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function initializeCloudDatabase() {
  try {
    console.log("📡 Connecting securely to Render Cloud PostgreSQL...");
    
    // Read the local SQL template
    const schemaFile = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaFile)) {
      throw new Error("schema.sql completely missing from root folder!");
    }
    
    const schemaData = fs.readFileSync(schemaFile, 'utf-8');
    console.log("✨ Synchronizing architecture blueprints into the Cloud...");

    // Execute raw SQL inside Postgres
    await pool.query(schemaData);

    console.log("\n==============================================");
    console.log("✅ SUCCESS! ALL DATABASES MIGRATED TO CLOUD! ✅");
    console.log("==============================================\n");
    console.log("You can safely close this Render terminal now and test your Signup page!");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ FATAL CLOUD CALIBRATION ERROR:", err);
    process.exit(1);
  }
}

initializeCloudDatabase();
