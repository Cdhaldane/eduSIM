const Sequelize = require('sequelize');
const db = require('../databaseConnection');

const gameplayers = db.define('gameplayers', {
  gameplayerid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  player_id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false
  },
  gameinstanceid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false
  },
  gamestarttimestamp: {
    type: Sequelize.DATE,
    allowNull: false
  },
  roleid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false
  }, 
});

games.sync().then(() => {
  console.log('table created');
});

module.exports = gameplayers;