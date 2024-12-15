export const Business = {
  createBusiness: (db, businessData, callback) => {
    const { user_id, business_name } = businessData;
    
    const query = `INSERT INTO businesses (user_id, business_name) VALUES (?, ?)`;
    db.query(query, [user_id, business_name], callback);
  },
  
  searchBusiness: (db, user_id, callback) => {
    const query = 'SELECT * FROM businesses WHERE user_id = ?';
    db.query(query, [user_id], callback);
  },

  getAllBusinesses: (db, callback) => {
    const query = 'SELECT * FROM businesses';
    db.query(query, callback);
  },
  findBusinessByUserId: (db, id, callback) => {
    const query = 'SELECT * FROM businesses WHERE user_id = ?';
    db.query(query, [id], callback);
  }
};
