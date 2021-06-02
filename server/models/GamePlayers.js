const db = require('../databaseConnection');

class GamePlayers {
  static retrieveAll (callback) {
    db.query('SELECT * from gameplayers', (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }

  static insert (gamestarttimestamp, callback) {
    db.query('INSERT INTO gameplayers (gamestarttimestamp) VALUES ($1) RETURNING *', [gamestarttimestamp], (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }
}

module.exports = GamePlayers;