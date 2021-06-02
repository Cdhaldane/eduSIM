const db = require('../databaseConnection');

class Games {
  static retrieveAll (callback) {
    db.query('SELECT * from games', (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }

  static insert (name, createdtimestamp, gameroles, status, callback) {
    db.query('INSERT INTO games (name, createdtimestamp, gameroles, status) VALUES ($1, $2, $3, $4) RETURNING *', [name, createdtimestamp, gameroles, status], (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }
}

module.exports = Games;