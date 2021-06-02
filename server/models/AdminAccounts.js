const db = require('../databaseConnection');

class AdminAccounts {
  static retrieveAll (callback) {
    db.query('SELECT * from adminaccounts', (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }

  static insert (email, name, createdtimeStamp, issuperadmin, callback) {
    db.query('INSERT INTO adminaccounts (email, name, createdtimestamp, issuperadmin) VALUES ($1, $2, $3, $4) RETURNING *', [email, name, createdtimeStamp, issuperadmin], (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }
}

module.exports = AdminAccounts;