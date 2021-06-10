// All logic when the server is involved 
//Call api paths and models 
//instantiate the class, and call all the attributes of the classes
const db = require('../models/simulatordb/GameInstances').default;
const GameInstance = require("../models/simulatordb/GameInstances");


exports.getGameInstances = async (req, res) => {
  const { id } = req.params;
    try {
      let gameinstance = await GameInstance.findOne({
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
    // if (!username || !password) {
    //   return res.status(400).send({
    //     message: 'Please provide a username and a password to create a user!',
    //   });
    // }
  
    // let usernameExists = await User.findOne({
    //   where: {
    //     username,
    //   },
    // });
  
    // if (usernameExists) {
    //   return res.status(400).send({
    //     message: 'An account with that username already exists!',
    //   });
    // }
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
  