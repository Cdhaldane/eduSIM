import { updateRoomStatus, getSimulationRooms } from './utils';

export default async (server, client, event, args) => {
  const { game } = client.handshake.query;

  switch (event) {
    case "gameStart": {
      const { room } = args || {};

      if (room) {
        // if a room code is defined, start that room
        const newStatus = await updateRoomStatus(room, {
          running: true
        });
        client.emit("roomStatusUpdate", {
          room,
          status: newStatus
        });
        server.to(room).emit("gameStart");
      } else {
        // otherwise, a gameinstance is defined; get rooms associated with it and start those
        const rooms = await getSimulationRooms(game);
        rooms.forEach(async ({ dataValues: room }) => {
          const newStatus = await updateRoomStatus(room.gameroom_url, {
            running: true
          });
          client.emit("roomStatusUpdate", {
            room: room.gameroom_url,
            status: newStatus
          });
          server.to(room.gameroom_url).emit("gameStart");
        });
      }

      break;
    };
    case "gamePause": {
      const { room } = args || {};

      if (room) {
        // if a room code is defined, pause that room
        const newStatus = await updateRoomStatus(room, {
          running: false
        });
        client.emit("roomStatusUpdate", {
          room,
          status: newStatus
        });
        server.to(room).emit("gamePause");
      } else {
        // otherwise, a gameinstance is defined; get rooms associated with it and pause those
        const rooms = await getSimulationRooms(game);
        rooms.forEach(async ({ dataValues: room }) => {
          const newStatus = await updateRoomStatus(room.gameroom_url, {
            running: false
          });
          client.emit("roomStatusUpdate", {
            room: room.gameroom_url,
            status: newStatus
          });
          server.to(room.gameroom_url).emit("gamePause");
        });
      }

      break;
    };
  };
}