const GameRole = require("../models/GameRoles");

exports.getGameRoles = async (req, res) => {
  const gameinstanceid = req.query.gameinstanceid;
  try {
    let gamerole = await GameRole.findAll({
      where: {
        gameinstanceid: gameinstanceid
      },
    });
      return res.send(gamerole);
    } catch (err) {
      return res.status(400).send({
        message: `No game roles found with the id ${gameid}`,
      });
    }
  };

  exports.createRole = async (req, res) => {
    const { gameinstanceid, gamerole } = req.body;
      try {
        let newGameInstance = await GameRole.create({
          gameinstanceid,
          gamerole
        });
        return res.send(newGameInstance);
      } catch (err) {
        return res.status(500).send({
          message: `Error: ${err.message}`,
        });
      }
    };

    exports.deleteRole = async (req, res) => {
      const  id  = req.query.id;

      const gameinstance = await GameRole.findOne({
        where: {
          gameroleid: id,
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
      } catch (err) {
        return res.status(500).send({
          message: `Error: ${err.message}`,
        });
      }
    };