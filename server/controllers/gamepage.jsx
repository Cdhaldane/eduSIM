//Logic when the server is involved
const GameInstance = require("../models/GameInstances");

//Get all the game instances that a specific admin has created
// Request has an admin id
exports.getGameInstances = async (req, res) => {
  const id = req.query.id;
    try {
      let gameinstance = await GameInstance.findAll({
        where: {
          createdby_adminid: id,
        },
      });
      var Array = [];
      for(i=0; i< gameinstance.length; i++) {
        if(gameinstance[i].status==='created' || gameinstance[i].status==='started' || gameinstance[i].status==='ended'){
          Array.push(gameinstance[i])
        }
      }
      return res.json(Array)
    } catch (err) {
  //Might never get here
  //Since empty array will be sent
    return res.status(400).send({
      message: `No active game instance found with the id ${id}`,
    });
    }
  };

///Get a specific game instance that an admin has created
// Request has an admin and a gameinstance id
exports.getGameInstance = async (req, res) => {
  const { adminid, gameid } = req.params;
    try {
      let gameinstance = await GameInstance.findOne({
        where: {
          createdby_adminid: adminid,
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
  const { gameinstance_name, gameinstance_photo_path,  game_parameters, createdby_adminid, status } = req.body;
    try {
      let newGameInstance = await GameInstance.create({
        gameinstance_name,
        gameinstance_photo_path,
        game_parameters,
        createdby_adminid,
        status
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
  const { gameinstance_name, gameinstance_photo_path,  game_parameters, invite_url } = req.body;
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
    if (gameinstance_name) {
      gameinstance.gameinstance_name = gameinstance_name;
    }
    if (gameinstance_photo_path) {
      gameinstance.gameinstance_photo_path = gameinstance_photo_path;
    }
    if (game_parameters) {
      gameinstance.game_parameters = game_parameters;
    }
    if (invite_url) {
      gameinstance.invite_url = invite_url;
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
// Delete a game instance
exports.deleteGameInstance = async (req, res) => {
 const { id } = req.body;

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
 //Updating a specific json field
  gameinstance.set(
    {
      'status': 'deleted'
    }
  )
  gameinstance.save();
  return res.send({
    message: `Game ${id} has been deleted!`,
    gameinstance
  });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};
