const Sequelize = require('sequelize');
const db = require('../databaseConnection');

const adminaccounts = db.define('adminaccounts', {
  adminid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  name: {
    type: Sequelize.STRING(50)
  },
  picture: {
    type: Sequelize.JSON
  },
  issuperadmin: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
});

adminaccounts.sync().then(() => {
  console.log('table created');
});

module.exports = adminaccounts;
