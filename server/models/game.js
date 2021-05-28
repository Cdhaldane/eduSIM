const db = require('../databaseConnection');

class Game {
  static retrieveAll (callback) {
    db.query('SELECT * from game', (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }

  static insert (game, callback) {
    db.query('INSERT INTO game (name) VALUES ($1)', [game], (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }
}

module.exports = Game;