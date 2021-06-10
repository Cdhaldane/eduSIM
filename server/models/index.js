require('dotenv').config();
import { readdirSync } from 'fs';
import { basename as _basename, join } from 'path';
import Sequelize from 'sequelize';
const basename = _basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config')[env];

let db = {};

const databases = Object.keys(config.databases);


for (let i = 0; i < databases.length; i++) {
  let database = databases[i];
  let dbPath = config.databases[database];
  db[database] = new Sequelize(
    dbPath.database,
    dbPath.username,
    dbPath.password,
    dbPath
  );
}

/**Add the Database Models**/
readdirSync(__dirname + '/simulatordb')
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    var model = require(join(__dirname + '/simulatordb', file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});










export default db;