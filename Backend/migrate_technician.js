const pool = require("./db/db");

async function migrate() {
    try {
        console.log("🚀 Starting migration: adding technician_id to bookings...");
        await pool.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS technician_id INTEGER REFERENCES users(user_id);
    `);
        console.log("✅ Migration successful: technician_id column added.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        process.exit(1);
    }
}

migrate();
