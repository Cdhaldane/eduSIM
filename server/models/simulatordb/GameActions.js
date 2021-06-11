const Sequelize = require('sequelize');
const db = require('../../databaseConnection');

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
  gameplayerid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false
  },
  gameroles: {
    type: Sequelize.JSON
  },
  createdtimestamp: {
    type: Sequelize.DATE,
    allowNull: false
  }   
});

gameactions.sync().then(() => {
  console.log('table created');
});

module.exports = gameactions;