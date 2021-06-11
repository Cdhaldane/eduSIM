const Sequelize = require('sequelize');
const db = require('../../databaseConnection');

const games = db.define('games', {
  gameid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  createdbyadminid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING(50)
  },
  createdtimestamp: {
    type: Sequelize.DATE,
    allowNull: false
  },
  gameroles: {
    type: Sequelize.JSON
  },
  status: {
    type: Sequelize.STRING(250)
  }
});

games.sync().then(() => {
  console.log('table created');
});

module.exports = games;