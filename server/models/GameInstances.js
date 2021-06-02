const db = require('../databaseConnection');

class GameInstances {
  static retrieveAll (callback) {
    db.query('SELECT * from gameinstances', (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }

  static insert (createdtimestamp, gamestate, url, callback) {
    db.query('INSERT INTO gameinstances (createdtimestamp, gamestate, url) VALUES ($1, $2, $3) RETURNING *', [createdtimestamp, gamestate, url], (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }
}

module.exports = GameInstances;