const Sequelize = require('sequelize');
const db = require('../../databaseConnection');

const gameinstances = db.define('gameinstances', {
  gameinstanceid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  createdtimestamp: {
    type: Sequelize.DATE,
    allowNull: false
  },
  gamestate: {
    type: Sequelize.JSON
  },
  createdbyadminid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false
  },
  url: {
    type: Sequelize.STRING
  }
});

gameinstances.sync().then(() => {
  console.log('table created');
});

db.query(`
  SELECT row_to_json(gameinstancejson) FROM (
    SELECT
      *
    FROM gameinstances
  ) gameinstancejson`
, (err, res) => {
  if (err.error)
    return callback(err);
  callback(res);
});



module.exports = gameinstances;
