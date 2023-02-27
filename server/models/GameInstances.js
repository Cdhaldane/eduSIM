const Sequelize = require('sequelize');
const db = require('../databaseConnection');

const gameinstances = db.define('gameinstances', {
  gameinstanceid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  isdefaultgame: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  gameinstance_name: {
    type: Sequelize.STRING(250)
  },
  gameinstance_photo_path: {
    type: Sequelize.STRING(250)
  },
  game_parameters: {
    type: Sequelize.JSON
  },
  downloads: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  likes: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  createdby_adminid: {
    type: Sequelize.UUID,
    allowNull: false
  },
  status: {
    type: Sequelize.STRING(250)
  }
});

gameinstances.sync({ alter: true }).then(() => {
  console.log('GameInstances table created');
});

module.exports = gameinstances;
