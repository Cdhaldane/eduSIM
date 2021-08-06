const GameRole = require("../models/GameRoles");

exports.getGameRoles = async (req, res) => {
  const gameinstanceid = req.query.gameinstanceid;
  try {
    let gamerole = await GameRole.findOne({
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
