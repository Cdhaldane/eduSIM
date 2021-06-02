var express = require('express');
var Game = require('../models/Game');

var router = express.Router();

// API path to get all the game instances that a specific admin has created
// request should have an admin id
router.get('/getGameInstances', (req, res) => {
  Game.retrieveAll((err, games) => {
    if (err)
      return res.json(err);
    return res.json(games);
  });
});

// API path to get a specific game instance that a specific admin has created
// request should have an admin id, gameInstanceObject(to get id)
// router.get('/getGameInstances', (req, res) => {
//   Game.retrieveAll((err, games) => {
//     if (err)
//       return res.json(err);
//     return res.json(games);
//   });
// });

router.post('/createGameInstances', (req, res) => {
  // var id = req.body.id;
  // var name = req.body.name;
  const {id,name} =req.body;
  // var timeStamp = req.body.timeStamp;
  // var role = req.body.role;

  Game.insert(id,name,(err, result) => {
    if (err)
      return res.json(err);
    return res.json(result);
  });
});

module.exports = router;