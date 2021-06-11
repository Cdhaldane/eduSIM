//Logic when the server is involved
const GameInstance = require("../models/GameInstances");
const Game = require("../models/Games")

//Get all the game instances that a specific admin has created
// Request has an admin id
exports.getGameInstances = async (req, res) => {
  const { id } = req.params;
    try {
      let gameinstance = await GameInstance.findAll({
      where: {
        createdbyadminid: id,
      },
    });
      return res.send(gameinstance);
    } catch (err) {
      return res.status(400).send({
        message: `No game instance found with the id ${id}`,
      });
    } 
  };

//Get a specific game instance that an admin has created
// Request has an admin and a gameinstance id
exports.getGameInstance = async (req, res) => {
  const { adminid, gameid } = req.params;
    try {
      let gameinstance = await GameInstance.findOne({
        where: {
          createdbyadminid: adminid,
          gameinstanceid: gameid
        },
      });
        return res.send(gameinstance);
      } catch (err) {
        return res.status(400).send({
          message: `No game instance found with the id ${adminid} ${gameid}`,
        });
      } 
  };

//Create a new game instance
exports.createGameInstance = async (req, res) => {
  const {  createdtimestamp, gamestate,  url } = req.body;
    try {
      let newGameInstance = await GameInstance.create({
        createdtimestamp,
        gamestate,
        url
      });
      return res.send(newGameInstance);
    } catch (err) {
      return res.status(500).send({
        message: `Error: ${err.message}`,
      });
    }
  };

//Update a game instance
exports.updateGameInstance = async (req, res) => {
  const { gamestate, url } = req.body;
  const { id } = req.params;
  
  const gameinstance = await GameInstance.findOne({
    where: {
      gameinstanceid: id,
    },
  });
    
  if (!gameinstance) {
    return res.status(400).send({
      message: `No game instance found with the id ${id}`,
    });
  }
  
  try {
    if (gamestate) {
      gameinstance.gamestate = gamestate;
    }
    if (url) {
      gameinstance.url = url;
    }
  
    gameinstance.save();
    return res.send({
      message: `Game Instance ${id} has been updated!`,
    });
    } catch (err) {
      return res.status(500).send({
        message: `Error: ${err.message}`,
      });
    }
  };

//Get all games with 'active' status
exports.getGames = async (req, res) => {
  try {
    let game = await Game.findAll({
      where: {
        status: 'active',
      },
    });
    console.log(game);
    return res.send(game);
    } catch (err) {
      return res.status(400).send({
        message: `No game found `,
      });
    } 
  };

//Get a specific game
//Request should have a game id
exports.getGamebyId = async (req, res) => {
  const { id } = req.params;
  try {
    let game = await Game.findOne({
      where: {
          gameid: id,
        },
      });
    return res.send(game);
    } catch (err) {
        return res.status(400).send({
        message: `No game found with the id ${id}`,
      });
    } 
  };

//Create a new game
exports.createGame = async (req, res) => {
  const {  name, createdtimestamp, gameroles,  status } = req.body;
  try {
    let newGame = await Game.create({
      name,
      createdtimestamp,
      gameroles,
      status
    });
    return res.send(newGame);
    } catch (err) {
      return res.status(500).send({
        message: `Error: ${err.message}`,
        });
      }
  };
  