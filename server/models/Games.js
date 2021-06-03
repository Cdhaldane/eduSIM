const db = require('../databaseConnection');

class Games {
  //Postgres query to get all games with 'active' status
  static retrieveAll (callback) {
    db.query(`SELECT * from games WHERE status = 'active'`, (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }
 
  //Postgres query to get a game with a specific id
  static retrieve (id, callback) {
    db.query('SELECT * from games WHERE gameid = $1', [id], (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }

  //Postgres query to create a new game
  static insert (name, createdtimestamp, gameroles, status, callback) {
    db.query('INSERT INTO games (name, createdtimestamp, gameroles, status) VALUES ($1, $2, $3, $4) RETURNING *', [name, createdtimestamp, gameroles, status], (err, res) => {
      if (err.error)
        return callback(err);
      callback(res);
    });
  }
}

module.exports = Games;