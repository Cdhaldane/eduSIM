const Sequelize = require('sequelize');
const db = require('../../databaseConnection');

const adminaccounts = db.define('adminaccounts', {
  adminid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING(50)
  },
  name: {
    type: Sequelize.STRING(50)
  },
  createdtimestamp: {
    type: Sequelize.DATE,
    allowNull: false
  },
  issuperadmin: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
});

adminaccounts.sync().then(() => {
  console.log('table created');
});

module.exports = adminaccounts;