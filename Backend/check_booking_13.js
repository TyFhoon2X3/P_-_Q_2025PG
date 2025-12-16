
const pool = require('./db/db');
pool.query('SELECT booking_id, service, freight, cost FROM bookings WHERE booking_id=13').then(r => { console.log('Booking 13:', r.rows); pool.end(); });
