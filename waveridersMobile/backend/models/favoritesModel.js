export const Favorites = {
    createFavorite: (db, favoriteData, callback) => {
      const sql = `
        INSERT INTO favorites (user_id, boat_id)
        VALUES (?, ?)
      `;
      const values = [favoriteData.user_id, favoriteData.boat_id];
  
      db.query(sql, values, (err, result) => {
        if (err) {
          console.error('Error inserting favorite:', err);
          return callback(err);
        }
        callback(null, result);
      });
    },
  
    getFavoritesByUser: (db, userId, callback) => {
      const sql = `
        SELECT f.favorite_id, f.user_id, f.boat_id, f.created_at, b.boat_name, b.description, b.price_per_hour, b.price_per_day, b.capacity, b.boat_type, b.location, b.photos
        FROM favorites AS f
        JOIN boats AS b ON f.boat_id = b.boat_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
      `;
  
      db.query(sql, [userId], (err, results) => {
        if (err) {
          console.error('Error fetching favorites by user:', err);
          return callback(err);
        }
        callback(null, results);
      });
    },

    getFavoriteById: (db, favoriteId, callback) => {
      const sql = 'SELECT * FROM favorites WHERE favorite_id = ?';
      db.query(sql, [favoriteId], (err, results) => {
        if (err) {
          return callback(err, null);
        }
        if (results.length === 0) {
          return callback(null, null);
        }
        callback(null, results[0]);
      });
    },
  
    // (Optional) If you want a function to remove a favorite:
    deleteFavorite: (db, favoriteId, callback) => {
      const sql = 'DELETE FROM favorites WHERE favorite_id = ?';
      db.query(sql, [favoriteId], (err, result) => {
        if (err) {
          console.error('Error deleting favorite:', err);
          return callback(err);
        }
        callback(null, result);
      });
    },
  };
  
