var express = require('express');
var Game = require('../models/game');

var router = express.Router();

router.get('/', (req, res) => {
  Game.retrieveAll((err, games) => {
    if (err)
      return res.json(err);
    return res.json(games);
  });
});

router.post('/', (req, res) => {
  var game = req.body.game;

  Game.insert(game, (err, result) => {
    if (err)
      return res.json(err);
    return res.json(result);
  });
});

module.exports = router;