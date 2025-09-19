const pool = require('../db/db');

const VehiclesController = {
 
  async create(req, res) {
    const { user_id, license_plate, id_brand, model, id_type } = req.body;

    try {
  
      const [user, brand, type] = await Promise.all([
        pool.query('SELECT 1 FROM users WHERE user_id = $1', [user_id]),
        pool.query('SELECT 1 FROM vehicle_brands WHERE id_brand = $1', [id_brand]),
        pool.query('SELECT 1 FROM vehicle_types WHERE id_type = $1', [id_type])
      ]);

      if (!user.rowCount) return res.status(400).json({ error: 'Invalid user_id' });
      if (!brand.rowCount) return res.status(400).json({ error: 'Invalid id_brand' });
      if (!type.rowCount) return res.status(400).json({ error: 'Invalid id_type' });

      const result = await pool.query(
        `INSERT INTO vehicles (user_id, license_plate, id_brand, model, id_type)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [user_id, license_plate, id_brand, model, id_type]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === '23505') {
        res.status(409).json({ error: 'License plate already exists' });
      } else {
        console.error('Create vehicle error:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  },


  async getAll(req, res) {
    try {
      const result = await pool.query('SELECT * FROM vehicles ORDER BY vehicle_id');
      res.json(result.rows);
    } catch (err) {
      console.error('Get vehicles error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

 
  async getById(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM vehicles WHERE vehicle_id = $1', [id]);
      if (!result.rowCount) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Get vehicle by ID error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },


  async update(req, res) {
    const { id } = req.params;
    const { license_plate, model, id_brand, id_type } = req.body;

    try {
      const result = await pool.query(
        `UPDATE vehicles
         SET license_plate = $1, model = $2, id_brand = $3, id_type = $4
         WHERE vehicle_id = $5 RETURNING *`,
        [license_plate, model, id_brand, id_type, id]
      );

      if (!result.rowCount) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Update vehicle error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  async delete(req, res) {
    const { id } = req.params;

    try {
      const result = await pool.query(
        'DELETE FROM vehicles WHERE vehicle_id = $1 RETURNING *',
        [id]
      );

      if (!result.rowCount) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      res.json({ message: 'Vehicle deleted successfully', deleted: result.rows[0] });
    } catch (err) {
      console.error('Delete vehicle error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

    
};

module.exports = VehiclesController;