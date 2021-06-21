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
<<<<<<< HEAD
  },
  gameinstance_photo_path: {
    type: Sequelize.STRING(250)
  },
=======
  },
  gameinstance_photo_path: {
    type: Sequelize.STRING(250)
  },
>>>>>>> b529ada54d18fc84242bf30206391695610ff3af
  game_parameters: {
    type: Sequelize.JSON
  },
  createdby_adminid: {
    type: Sequelize.UUID,
    allowNull: false
  },
  invite_url: {
    type: Sequelize.STRING(250)
  }
});

gameinstances.sync().then(() => {
  console.log('table created');
});

module.exports = gameinstances;