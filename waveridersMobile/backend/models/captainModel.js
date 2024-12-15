export const Captain = {
  createCaptain: (db, captainData, callback) => {
    const sql = 'INSERT INTO captains (first_name, last_name, experience_years, phone_number, date_of_birth, business_id, registration_papers) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [
      captainData.first_name,
      captainData.last_name,
      captainData.experience_years,
      captainData.phone_number,
      captainData.date_of_birth,
      captainData.business_id || null,
      captainData.registration_papers || null
    ];
    db.query(sql, values, callback);
  },

  updateCaptainLicense: (db, captainId, registrationPapersPath, callback) => {
    const sql = `
      UPDATE captains
      SET registration_papers = ?
      WHERE captain_id = ?
    `;

    const values = [registrationPapersPath, captainId];

    console.log('Updating captain registration papers path:', {
      captain_id: captainId,
      registration_papers: registrationPapersPath
    });

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Database error during registration papers update:", err);
        return callback(err, null);
      }
      callback(null, result);
    });
  },
  getCaptain: (db, business_id, callback) => {
    const sql = 'SELECT * FROM captains WHERE business_id = ?';
    db.query(sql, [business_id], callback);
  }
};
