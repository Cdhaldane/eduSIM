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
    type: Sequelize.STRING(250)
  },
  issuperadmin: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  followers: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  bannerPath: {
    type: Sequelize.STRING(250),
    defaultValue: 'v1677271353/images/yavagre0lvkt8vtegdvv.jpg'
  },
  likedSims: {
    type: Sequelize.ARRAY( Sequelize.STRING ),
    defaultValue: []

  },
  downloadedSims: {
    type: Sequelize.ARRAY( Sequelize.STRING ),
    defaultValue: []
  },
});

adminaccounts.sync({ alter: true }).then(() => {
  console.log('AdminAccounts table created');
});

module.exports = adminaccounts;
