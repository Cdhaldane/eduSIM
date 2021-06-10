// const db = require('../databaseConnection');

// class GameInstances {
//   //   list of attributes and some methods
//   // create game instance object which controller passes to the api
//   // generate models using script (open api framework) - update and run scripts - update models accordingly 
//   // Postgres query to get all game instances for a particular admin
//   static retrieveAll (id, callback) {
//     db.query('SELECT * from gameinstances WHERE createdbyadminid = $1', [id], (err, res) => {
//       if (err.error)
//         return callback(err);
//       callback(res);
//     });
//   }

//   //Postgres query to get a specific game instance for a particular admin
//   static retrieve (id, gid, callback) {
//     db.query('SELECT * from gameinstances WHERE createdbyadminid = $1 AND gameinstanceid = $2', [id, gid], (err, res) => {
//       if (err.error)
//         return callback(err);
//       callback(res);
//     });
//   }

//   //Postgres query to update a specific game instance for a particular admin
//   static update (gamestate, gid, callback) {
//     db.query('UPDATE gameinstances SET gamestate = $1 where gameinstanceid = $2', [gamestate, gid], (err, res) => {
//       if (err.error)
//         return callback(err);
//       callback(res);
//     });
//   }

//   //Postgres query to create a new game instance
//   static insert (createdtimestamp, gamestate, url, callback) {
//     db.query('INSERT INTO gameinstances (createdtimestamp, gamestate, url) VALUES ($1, $2, $3) RETURNING *', [createdtimestamp, gamestate, url], (err, res) => {
//       if (err.error)
//         return callback(err);
//       callback(res);
//     });
//   }
  
// }
// const Sequelize = require('sequelize');
// const db = require('../index');

// const gameinstances = db.define('gameinstances', {
//   gameinstanceid: {
//     type: Sequelize.UUIDV4,
//     primaryKey: true,
//     allowNull: false
//   },
//   createdtimestamp: {
//     type: Sequelize.DATE,
//     allowNull: false
//   },
//   gamestate: {
//     type: Sequelize.JSON
//   },
//   createdbyadminid: {
//     type: Sequelize.UUIDV4,
//     allowNull: false
//   },
//   url: {
//     type: Sequelize.STRING
//   }
// });

// gameinstances.sync().then(() => {
//   console.log('table created');
// });


//  module.exports = GameInstances;



 const gameinstances = (sequelize, DataTypes) => {
  
  const GameInstances = sequelize.define(
    'gameinstances',
    {
      gameinstanceid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      gamestate: {
        type: DataTypes.JSON
      },
      createdbyadminid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      url: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  
  GameInstances.sync().then(() => {
       console.log('table created');
     });
  
  return GameInstances;
  
};

export default gameinstances;