var express = require('express');
var Games = require('../models/Games');

var router = express.Router();

// API Path to get all games of 'active' status
router.get('/getGames', (req, res) => {
  Games.retrieveAll( (err, games) => {
    if (err)
      return res.json(err);
    return res.json(games);
  });
});

// API Path to get a specific game
router.get('/getGameParameters/:id', (req, res) => {
  const { id } = req.params;
  Games.retrieve(id, (err, games) => {
    if (err)
      return res.json(err);
    return res.json(games);
  });
});

//API Path to create a new game
router.post('/createGames', (req, res) => {
    const { name, createdtimestamp, gameroles, status } =req.body;
    Games.insert(name, createdtimestamp, gameroles, status, (err, result) => {
      if (err)
        return res.json(err);
      return res.json(result);
    });
  });

module.exports = router;