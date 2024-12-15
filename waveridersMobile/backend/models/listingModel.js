export const Listing = {
  createListing: (db, listingData, callback) => {
    const sql = `
      INSERT INTO boats 
      (boat_name, boat_type, capacity, price_per_hour, description, location, business_id, created_at, updated_at, images) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
    `;
    const values = [
      listingData.boatName,
      listingData.boatType,
      listingData.capacity,
      listingData.pricePerHour,
      listingData.description,
      listingData.businessId,
      listingData.location,
      JSON.stringify(listingData.imagePaths) // Saving images as JSON string
    ];
    db.query(sql, values, callback);
  },

  findAllListings: (db, callback) => {
    const sql = 'SELECT * FROM boats';
    db.query(sql, callback);
  },

  findListingById: (db, listingId, callback) => {
    const sql = 'SELECT * FROM boats WHERE id = ?';
    const values = [listingId];
    db.query(sql, values, callback);
  },

  updateListingById: (db, listingId, updatedData, callback) => {
    const sql = `
      UPDATE boats
      SET boat_name = ?, boat_type = ?, capacity = ?, price_per_hour = ?, description = ?, images = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const values = [
      updatedData.boatName,
      updatedData.boatType,
      updatedData.capacity,
      updatedData.pricePerHour,
      updatedData.description,
      updatedData.location,
      JSON.stringify(updatedData.imagePaths), // Saving images as JSON string
      listingId
    ];
    db.query(sql, values, callback);
  },

  deleteListingById: (db, listingId, callback) => {
    const sql = 'DELETE FROM boats WHERE id = ?';
    const values = [listingId];
    db.query(sql, values, callback);
  }
};
