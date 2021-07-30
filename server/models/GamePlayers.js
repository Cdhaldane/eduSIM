const Sequelize = require('sequelize');
const db = require('../databaseConnection');

const gameplayers = db.define('gameplayers', {
  gameplayerid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  fname: {
    type: Sequelize.STRING(250)
  },
  lname: {
    type: Sequelize.STRING(250)
  },
  gameinstanceid: {
    type: Sequelize.UUID
  },
  game_room: {
    type: Sequelize.STRING(250)
  },
  player_email: {
    type: Sequelize.STRING(250)
  },
  gamerole: {
    type: Sequelize.STRING(250)
  },
});

gameplayers.sync().then(() => {
  console.log('gameplayers table created');
});

module.exports = gameplayers;
