import { connectDB } from '../config/db.js';
const db = connectDB();

export const getUnavailableDates = async (req, res) => {
  const { boat_id } = req.query; 

  if (!boat_id) {
    return res.status(400).json({ message: 'Boat ID is required' });
  }

  try {
    const sql = `
      SELECT start_date, end_date
      FROM rentals
      WHERE boat_id = ? AND (
        status = 'completed' OR status = 'ongoing'
      )
    `;

    db.query(sql, [boat_id], (err, results) => {
      if (err) {
        console.error('Error fetching unavailable dates:', err);
        return res.status(500).json({ message: 'Error fetching unavailable dates' });
      }

      const unavailableDates = results.map((rental) => ({
        start_date: rental.start_date,
        end_date: rental.end_date,
      }));

      res.status(200).json({ unavailableDates });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const createRental = async (req, res) => {
  const { boat_id, start_date, end_date, rental_price, start_time, end_time } = req.body;
  const customer_id = req.user.id; 

  if (!boat_id || !start_date || !rental_price) {
    return res.status(400).json({ message: 'Boat ID, start date, and rental price are required.' });
  }

  try {
    // Status default "completed"
    const status = 'completed';

    const calculated_end_date = end_date || new Date(new Date(start_date).getTime() + 24 * 60 * 60 * 1000);

    const sql = `
      INSERT INTO rentals (customer_id, boat_id, start_date, end_date, rental_price, status, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [customer_id, boat_id, start_date, calculated_end_date, rental_price, status, start_time, end_time],
      (err, result) => {
        if (err) {
          console.error('Error inserting rental:', err);
          return res.status(500).json({ message: 'Error creating rental.' });
        }
        res.status(201).json({ message: 'Rental created successfully!', rental_id: result.insertId });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
