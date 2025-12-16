const pool = require('./db/db');

const createTable = async () => {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        message_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("✅ Table 'contact_messages' created successfully.");
    } catch (err) {
        console.error("❌ Error creating table:", err);
    } finally {
        pool.end();
    }
};

createTable();
