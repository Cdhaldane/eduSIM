const Sequelize = require('sequelize');
const db = require('../databaseConnection');

const gameactions = db.define('gameactions', {
  gameactionid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  gameinstanceid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false
  },
  gameroomid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false
  },
  gamedata: {
    type: Sequelize.JSON
  }
});

gameactions.sync({ alter: true }).then(() => {
  console.log('GameActions table created');
});

module.exports = gameactions;
