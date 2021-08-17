//Logic when the server is involved
var uuid = require('uuid');
const GameRoom = require("../models/GameRoom");
const GameRole = require("../models/GameRoles");
const GamePlayer = require("../models/GamePlayers");
// const socket = require('../utils/socket')

//Create a new game player
//Player created
//create a socket room and url for it
//Have to look up the issue for the roles

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
            message: `No plaers found with the game room ${game_room}`,
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

    exports.deletePlayers = async (req, res) => {
      const  id  = req.query.id;

      const gameplayers = await GamePlayer.findOne({
        where: {
          gameroleid: id,
        },
      });

      if (!gameplayers) {
        return res.status(400).send({
          message: `No game instance found with the id ${id}`,
        });
      }

      try {
        await gameplayers.destroy();
        return res.send({
          message: `Game ${id} has been deleted!`,
        });
      } catch (err) {
        return res.status(500).send({
          message: `Error: ${err.message}`,
        });
      }
    };

  exports.deleteRoom = async (req, res) => {
    const  id  = req.query.id;

    const gameroom = await GameRoom.findOne({
      where: {
        gameroleid: id,
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
        message: `Game ${id} has been deleted!`,
      });
    } catch (err) {
      return res.status(500).send({
        message: `Error: ${err.message}`,
      });
    }
  };



// exports.createGamePlayer = async (req, res) => {
//     const { fname, lname,  gameinstanceid, game_room, player_email, gamerole} = req.body;

//       try {
//         var items_room = JSON.stringify(req.body);
//         console.log(items_room)
//         let game_role = await GameRole.findOne({
//             where: {
//               game_role: gamerole
//             },
//           });
//         for (var i=0; i< items_room.length; i++) {
//           let newGamePlayer = await GamePlayer.create({
//             fname,
//             lname,
//             gameinstanceid,
//             game_room,
//             player_email,
//             gamerole
//           });
//         }

//         for (var item, i = 0; item = items_room[i++];) {
//             var gameroom_name = item.game_room;

//         if (!(gameroom_name in lookuproom)) {
//         lookuproom[gameroom_name] = 1;
//         console.log(lookuproom)
//         gameroomarray.push(gameroom_name);
//         var gameroomid = uuidv4()
//         // var gameroom_url = socket.io()
//         let newGameRoom =  await GameRoom.create({
//             gameroomid,
//             gameinstanceid,
//             gameroom_name
//           });
//         }
//         }

//         //The CSV file of the players must comply with the roles set through the game edit page
//         //The csv should only accept roles that are already in the database for that gameinstance.

//         return res.send(newGamePlayer);
//       } catch (err) {
//         return res.status(500).send({
//           message: `Error: ${err.message}`,
//         });
//       }
//     };
// };

// exports.createGamePlayer = async (req, res) => {
//     try {
//       const lookuproom = [];
//       for(var i=0; i< 1; i++){
//         const {fname, lname, gameinstanceid, game_room, player_email, gamerole} = req.body;
//         let newGamePlayer = await GamePlayer.create({
//           fname,
//           lname,
//           gameinstanceid,
//           game_room,
//           player_email,
//           gamerole
//         });
//         return res.send(newGamePlayer);
//         if(lookuproom.indexOf(game_room) === -1) {
//           lookuproom.push(game_room);
//           var gameroom_name = game_room
//           var gameroom_url = "hello"
//           const gameroomid = uuid.v4();
//           let newGameRoom =  await GameRoom.create({
//             gameroomid,
//             gameinstanceid,
//             gameroom_name,
//             gameroom_url
//           });
//       }
//       }
//       return res.send("Success");
//     } catch (err) {
//       return res.status(500).send({
//         message: `Error: ${err.message}`,
//       });
//     }
