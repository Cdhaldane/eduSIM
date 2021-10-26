import { 
  updateRoomStatus, 
  getSimulationRooms, 
  getRoomStatus, 
  clearRoomStatus,
  getChatlog,
  getInteractions
} from './utils';
import moment from "moment";
const GameActions = require("../models/GameActions");
const GameRoom = require("../models/GameRooms");

export default async (server, client, event, args) => {
  const { game } = client.handshake.query;

  switch (event) {
    case "gameStart": {
      const { room } = args || {};

      if (room) {
        // if a room code is defined, start that room
        const newStatus = await updateRoomStatus(room, {
          running: true,
          startTime: moment().valueOf()
        });
        server.to(room).emit("roomStatusUpdate", {
          room,
          status: newStatus
        });
      } else {
        // otherwise, a gameinstance is defined; get rooms associated with it and start those
        const rooms = await getSimulationRooms(game);
        const startTime = moment().valueOf();
        rooms.forEach(async ({ dataValues: room }) => {
          const newStatus = await updateRoomStatus(room.gameroom_url, {
            running: true,
            startTime
          });
          server.to(room.gameroom_url).emit("roomStatusUpdate", {
            room: room.gameroom_url,
            status: newStatus
          });
        });
      }

      break;
    };
    case "gamePause": {
      const { room } = args || {};

      if (room) {
        const { startTime, timeElapsed } = await getRoomStatus(room);

        const newStatus = await updateRoomStatus(room, {
          running: false,
          timeElapsed: moment().valueOf() - startTime + (timeElapsed || 0)
        });
        server.to(room).emit("roomStatusUpdate", {
          room,
          status: newStatus
        });
      } else {
        const rooms = await getSimulationRooms(game);
        rooms.forEach(async ({ dataValues: room }) => {
          const { startTime, timeElapsed } = await getRoomStatus(room.gameroom_url);
          const currentTime = moment().valueOf();

          const newStatus = await updateRoomStatus(room.gameroom_url, {
            running: false,
            timeElapsed: currentTime - startTime + (timeElapsed || 0)
          });
          server.to(room.gameroom_url).emit("roomStatusUpdate", {
            room: room.gameroom_url,
            status: newStatus
          });
        });
      }

      break;
    };
    case "gameReset": {
      const { room } = args || {};

      if (room) {
        const roomStatus = await getRoomStatus(room);
        const messages = await getChatlog(room);
        const interactions = await getInteractions(room);
        let { dataValues } = await GameRoom.findOne({
          where: {
            gameroom_url: room
          }
        });
        await GameActions.create({
          gamedata: {
            roomStatus,
            messages,
            interactions
          },
          gameroomid: dataValues.gameroomid,
          gameinstanceid: dataValues.gameinstanceid
        });
        const newStatus = await clearRoomStatus(room);
        server.to(room).emit("roomStatusUpdate", {
          room,
          status: newStatus,
          refresh: true
        });
      } else {
        const rooms = await getSimulationRooms(game);
        for (let i=0; i<rooms.length; i++) {
          const { dataValues } = rooms[i];
          const roomStatus = await getRoomStatus(dataValues.gameroom_url);
          const messages = await getChatlog(dataValues.gameroom_url);
          const interactions = await getInteractions(dataValues.gameroom_url);
          await GameActions.create({
            gamedata: {
              roomStatus,
              messages,
              interactions
            },
            gameroomid: dataValues.gameroomid,
            gameinstanceid: dataValues.gameinstanceid
          });
        }
        rooms.forEach(async ({ dataValues: room }) => {
          const newStatus = await clearRoomStatus(room.gameroom_url);
          server.to(room.gameroom_url).emit("roomStatusUpdate", {
            room: room.gameroom_url,
            status: newStatus,
            refresh: true
          });
        });
      }

      break;
    };
    case "updateGameSettings": {
      const { room, settings: newSettings } = args || {};

      if (room) {
        const { running, timeElapsed, settings } = await getRoomStatus(room);

        if (running || timeElapsed) {
          client.emit("errorLog", "Warning: settings will not update while game is in progress. Please reset the game before making changes.");
          return;
        }

        const newStatus = await updateRoomStatus(room, {
          settings: {...settings, ...newSettings}
        });
        server.to(room).emit("roomStatusUpdate", {
          room,
          status: newStatus
        });
      } else {
        const rooms = await getSimulationRooms(game);
        let good = true;
        for (const { dataValues: room } of rooms) {
          const { running, timeElapsed } = await getRoomStatus(room.gameroom_url);
          if (running || timeElapsed) {
            client.emit("errorLog", `Warning: settings will not update while game "${room.gameroom_name}" is in progress. Please reset the game before making changes.`);
            good = false;
          }
        };
        if (!good) return;
        rooms.forEach(async ({ dataValues: room }) => {
          const { settings } = await getRoomStatus(room.gameroom_url);

          const newStatus = await updateRoomStatus(room.gameroom_url, {
            settings: {...settings, ...newSettings}
          });
          server.to(room.gameroom_url).emit("roomStatusUpdate", {
            room: room.gameroom_url,
            status: newStatus
          });
        });
      }

      break;
    };
    case "joinRoom": {
      client.join(args);

      break;
    }
    case "goToNextPage": {
      const { room } = args || {};

      if (room) {
        const { level = 1 } = await getRoomStatus(room);

        const newStatus = await updateRoomStatus(room, {
          level: level+1
        });

        server.to(room).emit("roomStatusUpdate", {
          room,
          status: newStatus
        });
      } else {
        const rooms = await getSimulationRooms(game);
        rooms.forEach(async ({ dataValues: room }) => {
          const { running, timeElapsed, level = 1 } = await getRoomStatus(room.gameroom_url);

          if (running || timeElapsed) {
            const newStatus = await updateRoomStatus(room.gameroom_url, {
              level: level+1
            });
            server.to(room.gameroom_url).emit("roomStatusUpdate", {
              room: room.gameroom_url,
              status: newStatus
            });
          }
        });
      }

      break;
    }
  };
}