//Logic when the server is involved
const GameInstance = require("../models/GameInstances");

//Get all the game instances that a specific admin has created
// Request has an admin id
exports.getGameInstances = async (req, res) => {
<<<<<<< HEAD:server/controllers/gamepage.jsx
  const id = req.query.id;
=======
  const { id } = req.params;
  const { Op } = require("sequelize");
>>>>>>> b529ada54d18fc84242bf30206391695610ff3af:server/controllers/adminpage.jsx
    try {
      let gameinstance = await GameInstance.findAll({
      where: {
        createdby_adminid: id,
<<<<<<< HEAD:server/controllers/gamepage.jsx
=======
        game_parameters : {
          [Op.or] : [{"status":"created"} , {"status":"started"} , {"status":"ended"}]
        }
>>>>>>> b529ada54d18fc84242bf30206391695610ff3af:server/controllers/adminpage.jsx
      },
    });
      return res.send(gameinstance);
    } catch (err) {
      return res.status(400).send({
        message: `No game instance found with the id ${id}`,
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
<<<<<<< HEAD:server/controllers/gamepage.jsx
  const { gameinstance_name, gameinstance_photo_path,  game_parameters, createdby_adminid, invite_url } = req.body;
=======
  const {  gameinstance_name, gameinstance_photo_path,  game_parameters, createdby_adminid, invite_url } = req.body;
>>>>>>> b529ada54d18fc84242bf30206391695610ff3af:server/controllers/adminpage.jsx
    try {
      let newGameInstance = await GameInstance.create({
        gameinstance_name,
        gameinstance_photo_path,
        game_parameters,
        createdby_adminid,
        invite_url
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
<<<<<<< HEAD:server/controllers/gamepage.jsx
=======
    }
    if (game_parameters) {
      gameinstance.game_parameters = game_parameters;
    }
    if (invite_url) {
      gameinstance.invite_url = invite_url;
>>>>>>> b529ada54d18fc84242bf30206391695610ff3af:server/controllers/adminpage.jsx
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

<<<<<<< HEAD:server/controllers/gamepage.jsx
//Delete a game instance
exports.deleteGameInstance = async (req, res) => {
  const  id  = req.query.id;

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
    await gameinstance.destroy();
    return res.send({
      message: `Game ${id} has been deleted!`,
    });
=======
// Delete a game instance
// change the status to deleted instead of actually deleting it
exports.deleteGameInstance = async (req, res) => {
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
    // await gameinstance.destroy();
    // gameinstance.game_parameters.status = "deleted";
    // gameinstance.save();
    gameinstance.update(
      {
        game_parameters: {"status" :"deleted"}
      }
      
    )
    return res.send({
      message: `Game ${id} has been deleted!`,
      gameinstance
    });
>>>>>>> b529ada54d18fc84242bf30206391695610ff3af:server/controllers/adminpage.jsx
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
<<<<<<< HEAD:server/controllers/gamepage.jsx
};
=======
};
>>>>>>> b529ada54d18fc84242bf30206391695610ff3af:server/controllers/adminpage.jsx
