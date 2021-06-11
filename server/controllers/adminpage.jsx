// All logic when the server is involved 
//Call api paths and models 
//instantiate the class, and call all the attributes of the classes
// const db = require('../models/simulatordb/GameInstances').default;
// const db = require('../models/simulatordb/Games').default;
const GameInstance = require("../models/simulatordb/GameInstances");
const Game = require("../models/simulatordb/Games")


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

    exports.getGameParameters = async (req, res) => {
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
  