const db = require('../databaseConnection');

class GameActions {
  static retrieveAll (callback) {
    db.query('SELECT * from gameactions', (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }

  static insert (gameaction, createdtimestamp, callback) {
    db.query('INSERT INTO gameactions (gameaction, createdtimestamp) VALUES ($1, $2) RETURNING *', [gameaction, createdtimestamp], (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }
}

module.exports = GameActions;