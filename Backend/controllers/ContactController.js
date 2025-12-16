const pool = require("../db/db");

exports.sendMessage = async (req, res) => {
    const { name, phone, subject, message } = req.body;

    if (!name || !phone || !message) {
        return res.status(400).json({ success: false, message: "Please fill all required fields." });
    }

    try {
        const query = `
      INSERT INTO contact_messages (name, phone, subject, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
        const values = [name, phone, subject, message];
        const result = await pool.query(query, values);

        res.status(201).json({
            success: true,
            message: "Message sent successfully!",
            data: result.rows[0],
        });
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM contact_messages ORDER BY created_at DESC");
        res.status(200).json({ success: true, messages: result.rows });
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
