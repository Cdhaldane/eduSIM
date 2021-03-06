const Sequelize = require('sequelize');
const db = require('../databaseConnection');

const gameroles = db.define('gameroles', {
  gameroleid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  gameinstanceid: {
    type: Sequelize.UUID,
    allowNull: false
  },
  gamerole: {
    type: Sequelize.STRING(250)
  },
  numspots: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  roleDesc: {
    type: Sequelize.STRING(250)
  }
});

gameroles.sync({ alter: true }).then(() => {
  console.log('GameRoles table created');
});

module.exports = gameroles;
