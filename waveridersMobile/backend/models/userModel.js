export const User = {
  createUser: (db, userData, callback) => {
    const sql = `
      INSERT INTO users (first_name, last_name, email, password, phone_number, date_of_birth, account_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      userData.first_name,
      userData.last_name,
      userData.email,
      userData.password,
      userData.phone_number,
      userData.date_of_birth,
      userData.account_type,
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return callback(err);
      }
      callback(null, result);
    });
  },


  findUserByEmail: (db, email, callback) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
      if (err) {
        console.error('Error finding user by email:', err);
        return callback(err);
      }
      callback(null, results);
    });
  },


  findUserById: (db, userId, callback) => {
    const sql = 'SELECT * FROM users WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Error finding user by ID:', err);
        return callback(err);
      }
      callback(null, results);
    });
  },

 
  updateUser: (db, userId, userData, callback) => {
    const sql = `
      UPDATE users
      SET first_name = ?, last_name = ?, phone_number = ?, date_of_birth = ?
      WHERE user_id = ?
    `;
    const values = [
      userData.first_name,
      userData.last_name,
      userData.phone_number,
      userData.date_of_birth,
      userId,
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error updating user:', err);
        return callback(err);
      }
      callback(null, result);
    });
  },


  getUsersByType: (db, userType, callback) => {
    const sql = 'SELECT * FROM users WHERE account_type = ?';
    db.query(sql, [userType], (err, results) => {
      if (err) {
        console.error('Error fetching users by type:', err);
        return callback(err);
      }
      callback(null, results);
    });
  },


  getAllUsers: (db, callback) => {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching all users:', err);
        return callback(err);
      }
      callback(null, results);
    });
  },
};
