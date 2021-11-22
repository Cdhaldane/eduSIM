const uuid = require('uuid');
const GameRoom = require("../models/GameRooms");
const GameRole = require("../models/GameRoles");
const GamePlayer = require("../models/GamePlayers");
const GameInstance = require("../models/GameInstances");
const GameActions = require("../models/GameActions");
import cryptoRandomString from 'crypto-random-string';
import { 
  getInteractionBreakdown,
  getInteractions,
  getChatlog,
  getRoomStatus
} from '../events/utils';

// Create Players using csv
exports.createGamePlayers = async (req, res) => {
  try {
    const lookuproom = [];
    const gameinstanceid = req.query.id;
    let replacedroles = [];

    for (let i = 0; i < req.body.data.length; i++) {
      const fname = req.body.data[i].First_Name;
      const lname = req.body.data[i].Last_Name;
      const game_room = req.body.data[i].Room.toLowerCase();
      const player_email = req.body.data[i].Email;
      let gamerole = req.body.data[i].Role;

      if (gamerole) {
        const gameroles = await GameRole.findOne({
          where: {
            gameinstanceid: gameinstanceid,
            gamerole: gamerole,
          },
        });

        if (!gameroles) {
          replacedroles.push(gamerole);
          gamerole = "";
        }
      }

      let newGamePlayer = await GamePlayer.create({
        fname,
        lname,
        gameinstanceid,
        game_room,
        player_email,
        gamerole
      });

      if (lookuproom.indexOf(game_room) === -1) {
        const realGameRoom = await GameRoom.findOne({
          where: {
            gameinstanceid: gameinstanceid,
            gameroom_name: game_room,
          },
        });
        if (realGameRoom) {
          lookuproom.push(realGameRoom);
        } else {
          const gameroom_name = game_room
          const gameroomid = uuid.v4();
          const gameroom_url = cryptoRandomString(10);
          let newGameRoom = await GameRoom.create({
            gameroomid,
            gameinstanceid,
            gameroom_name,
            gameroom_url
          });
        }
      }
    }

    return res.send({ success: true, replacedroles });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

// Get all players for a single game instance to populate the table
exports.getGamePlayers = async (req, res) => {
  const gameinstanceid = req.params.id;

  try {
    let gameplayer = await GamePlayer.findAll({
      where: {
        gameinstanceid: gameinstanceid
      },
    });
    return res.send(gameplayer);
  } catch (err) {
    return res.status(400).send({
      message: `No game instance found with the id ${id}`,
    });
  }
};

// Get all rooms for a gameinstance id
exports.getRooms = async (req, res) => {
  const gameinstanceid = req.query.gameinstanceid;
  try {
    let gameroom = await GameRoom.findAll({
      where: {
        gameinstanceid: gameinstanceid
      },
    });
    return res.send(gameroom);
  } catch (err) {
    return res.status(400).send({
      message: `No game rooms found with the id ${gameinstanceid}`,
    });
  }
};

exports.getRoomInteractionBreakdown = async (req, res) => {
  const gameroomid = req.query.gameroomid;
  try {
    let { dataValues } = await GameRoom.findOne({
      where: {
        gameroomid
      },
      attributes: ["gameroom_url"]
    });
    const breakdown = await getInteractionBreakdown(dataValues.gameroom_url);
    return res.send(breakdown);
  } catch (err) {
    return res.status(400).send({
      message: `No game rooms found with the id ${gameroomid}`,
    });
  }
};

// these next two endpoints return the CURRENT STATUS of the room
exports.getRunningGameLog = async (req, res) => {
  const gameroomid = req.params.gameroomid;
  try {
    let { dataValues } = await GameRoom.findOne({
      where: {
        gameroomid
      }
    });
    const messages = await getChatlog(dataValues.gameroom_url);
    const interactions = await getInteractions(dataValues.gameroom_url);
    return res.send({
      ...dataValues,
      messages,
      interactions
    });
  } catch (err) {
    return res.status(400).send({
      message: `No game rooms found with the id ${gameroomid}`,
    });
  }
}

exports.getRunningSimulationLogs = async (req, res) => {
  const gameinstanceid = req.params.gameinstanceid;
  try {
    let rooms = await GameRoom.findAll({
      where: {
        gameinstanceid
      }
    });
    const roomData = [];
    for (let i=0; i<rooms.length; i++) {
      const { dataValues } = rooms[i];
      const roomStatus = await getRoomStatus(dataValues.gameroom_url);
      const messages = await getChatlog(dataValues.gameroom_url);
      const interactions = await getInteractions(dataValues.gameroom_url);
      roomData.push({
        ...dataValues,
        messages,
        interactions,
        roomStatus
      });
    }
    return res.send(roomData);
  } catch (err) {
    return res.status(400).send({
      message: `Error: ${err.message}`,
    });
  }
}

// this returns all SAVED DATA of PAST simuilation runs stored in GameActions
exports.getGameLogs = async (req, res) => {
  const gameroomid = req.query.gameroomid;
  try {
    const gameactions = await GameActions.findAll({
      where: {
        gameroomid
      }
    });
    return res.send(gameactions);
  } catch (err) {
    return res.status(400).send({
      message: `No game logs found with the id ${gameroomid}`,
    });
  }
}

exports.deleteGameLog = async (req, res) => {
  const gameactionid = req.body.gameactionid;

  const gameaction = await GameActions.findOne({
    where: {
      gameactionid
    },
  });

  if (!gameaction) {
    return res.status(400).send({
      message: `No game log found with the id ${id}`,
    });
  }

  try {
    await gameaction.destroy();
    return res.send({
      message: `Log ${gameaction} has been deleted!`,
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
}

exports.getPlayer = async (req, res) => {
  const gameplayerid = req.query.id;
  try {
    let gameplayer = await GamePlayer.findOne({
      where: {
        gameplayerid
      },
    });
    return res.send(gameplayer);
  } catch (err) {
    return res.status(400).send({
      message: `No players found with the id ${gameplayerid}`,
    });
  }
};

// Get players for a particular tab or room
exports.getPlayers = async (req, res) => {
  const game_room = req.query.game_room;
  try {
    let gameplayer = await GamePlayer.findAll({
      where: {
        game_room: game_room
      },
    });
    return res.send(gameplayer);
  } catch (err) {
    return res.status(400).send({
      message: `No players found with the game room ${game_room}`,
    });
  }
};

exports.getAllPlayers = async (req, res) => {
  const gameinstanceid = req.query.id;
  try {
    let gameplayer = await GamePlayer.findAll({
      where: {
        gameinstanceid: gameinstanceid
      },
    });
    return res.send(gameplayer);
  } catch (err) {
    return res.status(400).send({
      message: `No players found with the gameid ${gameinstanceid}`,
    });
  }
};

exports.createRoom = async (req, res) => {
  const { gameinstanceid, gameroom_name } = req.body;
  const gameroom_url = cryptoRandomString(10);
  const gameroomid = uuid.v4();

  try {
    let gameroom = await GameRoom.create({
      gameinstanceid,
      gameroom_name,
      gameroomid,
      gameroom_url
    });
    return res.send(gameroom);
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

exports.updateRoomName = async (req, res) => {
  const { gameroomid, gameroom_name } = req.body;

  const gameroom = await GameRoom.findOne({
    where: {
      gameroomid,
    },
  });

  if (!gameroom) {
    return res.status(400).send({
      message: `No game room found with the id ${id}`,
    });
  }

  try {
    gameroom.gameroom_name = gameroom_name;
    gameroom.save();
    return res.send({
      message: `Game room has been updated!`,
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

GameRoom.belongsTo(GameInstance, { foreignKey: 'gameinstanceid' });

exports.getRoomByURL = async (req, res) => {
  const roomid = req.query.id;

  try {
    let gameroom = await GameRoom.findOne({
      where: {
        gameroom_url: roomid
      },
      include: [{
        model: GameInstance,
        required: true
      }]
    });
    return res.send(gameroom);
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      message: `No game room found with the id ${roomid}`,
    });
  }
};

exports.createPlayer = async (req, res) => {
  const { game_room, gameinstanceid, fname, lname, gamerole, player_email } = req.body;
  try {
    let gameplayer = await GamePlayer.create({
      gameinstanceid,
      fname,
      lname,
      game_room,
      player_email,
      gamerole
    });
    return res.send(gameplayer);
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

// Delete a player
exports.deletePlayers = async (req, res) => {
  const id = req.query.id;

  const gameplayers = await GamePlayer.findOne({
    where: {
      gameplayerid: id,
    },
  });

  if (!gameplayers) {
    return res.status(400).send({
      message: `No game player found with the id ${id}`,
    });
  }

  try {
    await gameplayers.destroy();
    return res.send({
      message: `Player ${id} has been deleted!`,
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

// Delete a room
exports.deleteRoom = async (req, res) => {
  const id = req.query.id;

  const gameroom = await GameRoom.findOne({
    where: {
      gameroomid: id,
    },
  });

  if (!gameroom) {
    return res.status(400).send({
      message: `No game instance found with the id ${id}`,
    });
  }

  try {
    await gameroom.destroy();
    return res.send({
      message: `Room ${id} has been deleted!`,
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

exports.updatePlayer = async (req, res) => {
  const { gameplayerid, fname, lname, player_email, gamerole } = req.body;

  exports.updatePlayer = async (req, res) => {
    const { gameplayerid, fname, lname, player_email, gamerole } = req.body;

    const gameplayers = await GamePlayer.findOne({
      where: {
        gameplayerid: gameplayerid,
      },
    });

    if (!gameplayers) {
      return res.status(400).send({
        message: `No game instance found with the id ${id}`,
      });
    }

    try {
      if (fname) {
        gameplayers.fname = fname;
      }
      if (lname) {
        gameplayers.lname = lname;
      }
      if (player_email) {
        gameplayers.player_email = player_email;
      }
      if (gamerole) {
        gameplayers.gamerole = gamerole;
      }

      gameplayers.save();
      return res.send({
        message: `Game Player has been updated!`,
      });
    } catch (err) {
      return res.status(500).send({
        message: `Error: ${err.message}`,
      });
    }
  };

  if (!gameplayers) {
    return res.status(400).send({
      message: `No game instance found with the id ${id}`,
    });
  }

  try {
    if (fname) {
      gameplayers.fname = fname;
    }

    if (lname) {
      gameplayers.lname = lname;
    }

    if (player_email) {
      gameplayers.player_email = player_email;
    }

    if (gamerole) {
      gameplayers.gamerole = gamerole;
    }

    gameplayers.save();
    return res.send({
      message: `Game Player has been updated!`,
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};
