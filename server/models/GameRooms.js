const Sequelize = require('sequelize');
const db = require('../databaseConnection');

const gamerooms = db.define('gamerooms', {
  gameroomid: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false
  },
  gameinstanceid: {
    type: Sequelize.UUID,
  },
  gameroom_name: {
    type: Sequelize.STRING(250)
  },
  gameroom_url: {
    type: Sequelize.STRING(250)
  },
});

gamerooms.sync().then(() => {
  console.log('GameRooms table created');
});

module.exports = gamerooms;
