var express = require('express');
var GameInstances = require('../models/GameInstances');
const db = require('../databaseConnection')

var router = express.Router();

// // API Path to get all the game instances that a specific admin has created
// // Request should have an admin id
// router.get('/getAdminSimulations/:id', (req, res) => {
//   const { id } = req.params;
//   GameInstances.retrieveAll( id, (err, games) => {
//     if (err)
//       return res.json(err);
//     return res.json(games);
//   });
// });

// // API path to get a specific game instance that a specific admin has created
// // Request should have an admin and a gameinstance id
// router.get('/getGameSimulationById/:id/:gid', (req, res) => {
//   const { id, gid } = req.params;
//   GameInstances.retrieve(id, gid, (err, games) => {
//     if (err)
//       return res.json(err);
//     return res.json(games);
//   });
// });

// //API Path to update a specific game instance
// // Success or Failure method required
// router.put('/updateGameSimulation/:id', (req, res) => {
//     const { gid } = req.params;
//     const { gamestate } = req.body;
//     GameInstances.update(gamestate, gid, (err, result) => {
//       if (err)
//         return res.json(err);
//       return res.json(result);
//     });
//   });

// //API Path to create a new game instance
// //Success or Failure message required
// router.post('/NewGameSimulation', (req, res) => {
//   const { createdtimestamp, gamestate, url } =req.body;
//   GameInstances.insert(createdtimestamp, gamestate, url, (err, result) => {
//     if (err)
//       return res.json(err);
//     return res.json(result);
//   });
// });

// const Sequelize = require('sequelize');
// const Op = Sequelize.Op;

// Get gig list
router.get('/', (req, res) => 
  GameInstances.findAll()
    .then(gameinstances => 
      {console.log(gameinstances);
      res.status(200);
      })
    .catch(err => console.log(err)));

module.exports = router;