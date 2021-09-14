const Sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

module.exports = new Sequelize(`${process.env.POSTGRES_DB}`, `${process.env.POSTGRES_USER}`, `${process.env.POSTGRES_PASS}`, {
  host: `${process.env.POSTGRES_HOST}`,
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});
