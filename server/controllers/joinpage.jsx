//Logic when the server is involved
var uuid = require('uuid');
const GameRoom = require("../models/GameRoom");
const GameRole = require("../models/GameRoles");
const GamePlayer = require("../models/GamePlayers");
// const socket = require('../utils/socket')

//Create Players using csv
exports.createGamePlayers = async (req, res) => {
    try {
      const lookuproom = [];
      const gameinstanceid = req.query.id;
      //Destroys previously existing csv file
      GamePlayer.destroy({
        where: {
         gameinstanceid: gameinstanceid
       }
      })
      for(var i=0; i<req.body.data.length; i++){
        const fname = req.body.data[i].First_Name ;
        const lname = req.body.data[i].Last_Name;
        const game_room = req.body.data[i].Room.toLowerCase();
        const player_email = req.body.data[i].Email;
        const gamerole =req.body.data[i].Role.toLowerCase();
        // const gameinstanceid = req.body.data[i].gameinstanceid;
        //Game role validation
        //Check it against game instance id 
        const gameroles = await GameRole.findOne({
          where: {
            gameinstanceid: gameinstanceid,
            gamerole: gamerole,
          },
        });
        if (!gameroles) {
          return res.status(400).send({
            message: `No game role found: ${gamerole} found for this game`,
          });
        }
        let newGamePlayer = await GamePlayer.create({
          fname,
          lname,
          gameinstanceid,
          game_room,
          player_email,
          gamerole
        });
        if(lookuproom.indexOf(game_room) === -1) {
          lookuproom.push(game_room);
          const gameroom_name = game_room
          const gameroomid = uuid.v4();
          const gameroom_url = "http://localhost:3000/gamepage?"+gameroomid+"&"+gameroom_name+"&"+fname;
          let newGameRoom =  await GameRoom.create({
            gameroomid,
            gameinstanceid,
            gameroom_name,
            gameroom_url
          });
          //How to emit states on websockets
          //Add professor
      }
      }
      return res.send("Success");
    } catch (err) {
      return res.status(500).send({
        message: `Error: ${err.message}`,
      });
    }
  };

  //Get all players for a single game instance to populate the table
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

  //Get all rooms for a gameinstance id
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
    //Get players for a particular tab or room
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
    var gameroom_url = "hello"
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

    //Delete a player
    exports.deletePlayers = async (req, res) => {
      const  id  = req.query.id;

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

  //Delete a room
  exports.deleteRoom = async (req, res) => {
    const  id  = req.query.id;

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
    const { gameplayerid, fname, lname,  player_email, gamerole } = req.body;

  exports.updatePlayer = async (req, res) => {
    const { gameplayerid, fname, lname,  player_email, gamerole } = req.body;

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
