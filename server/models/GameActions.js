const db = require('../databaseConnection');

class GameActions {
  static retrieveAll (callback) {
    db.query('SELECT * from gameactions', (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }

  static insert (id, name, callback) {
    db.query('INSERT INTO test (id, name) VALUES ($1, $2) RETURNING *', [id, name], (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }
}

module.exports = GameActions;