const Sequelize = require('sequelize');
const db = require('../databaseConnection')

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

module.exports = gameinstances;
