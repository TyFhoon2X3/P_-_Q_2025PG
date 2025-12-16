const pool = require("../db/db");

const RepairItemsController = {
  // ✅ ดึงรายการอุปกรณ์ในแต่ละการจอง
  async getByBooking(req, res) {
    const { booking_id } = req.params;
    try {
      const result = await pool.query(
        `SELECT ri.part_id, p.name AS partname, p.marque, 
                ri.quantity, ri.unit_price,
                (ri.quantity * ri.unit_price) AS subtotal
         FROM repair_items ri
         JOIN parts p ON ri.part_id = p.part_id
         WHERE ri.booking_id = $1`,
        [booking_id]
      );
      res.json({ success: true, items: result.rows });
    } catch (err) {
      console.error("Get repair items error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ✅ เพิ่มอุปกรณ์ซ่อม + อัปเดตสต็อก
  async addItem(req, res) {
    try {
      const { booking_id, part_id, quantity, unit_price } = req.body;
      const partRes = await pool.query("SELECT quantity FROM parts WHERE part_id=$1", [part_id]);
      if (!partRes.rowCount) {
        return res.status(404).json({ success: false, message: "ไม่พบอะไหล่ในคลัง" });
      }
      const currentQty = Number(partRes.rows[0].quantity);
      if (currentQty < quantity) {
        return res.status(400).json({ success: false, message: "สต็อกไม่เพียงพอ" });
      }

      await pool.query(
        `INSERT INTO repair_items (booking_id, part_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (booking_id, part_id)
         DO UPDATE SET quantity = repair_items.quantity + EXCLUDED.quantity`,
        [booking_id, part_id, quantity, unit_price]
      );

      await pool.query(`UPDATE parts SET quantity = quantity - $1 WHERE part_id = $2`, [
        quantity,
        part_id,
      ]);

      res.json({ success: true, message: "เพิ่มอุปกรณ์และอัปเดตสต็อกแล้ว ✅" });
    } catch (err) {
      console.error("Add repair item error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ✅ ลบอุปกรณ์ซ่อม + คืนสต็อก
  async deleteItem(req, res) {
    try {
      const { booking_id, part_id } = req.params;
      const itemRes = await pool.query(
        `SELECT quantity FROM repair_items WHERE booking_id=$1 AND part_id=$2`,
        [booking_id, part_id]
      );
      if (!itemRes.rowCount) {
        return res.status(404).json({ success: false, message: "ไม่พบรายการนี้" });
      }

      const usedQty = Number(itemRes.rows[0].quantity);

      await pool.query(`DELETE FROM repair_items WHERE booking_id=$1 AND part_id=$2`, [
        booking_id,
        part_id,
      ]);

      await pool.query(`UPDATE parts SET quantity = quantity + $1 WHERE part_id = $2`, [
        usedQty,
        part_id,
      ]);

      res.json({ success: true, message: "ลบรายการและคืนสต็อกเรียบร้อย ✅" });
    } catch (err) {
      console.error("Delete repair item error:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};

module.exports = RepairItemsController;
