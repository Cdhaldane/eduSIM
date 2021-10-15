const Sequelize = require('sequelize');
const db = require('../databaseConnection');

const collaborators = db.define('collaborators', {
  collaboratorid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  adminid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false
  },
  gameinstanceid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false
  },
  verified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

collaborators.sync().then(() => {
  console.log('Collaborators table created');
});

module.exports = collaborators;
