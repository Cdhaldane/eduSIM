import { setRoomStatus, getSimulationRooms } from './utils';

export default async (server, client, event, args) => {
  switch (event) {
    case "gameStart": {
      const { room, game } = args;

      if (room) {
        // if a room code is defined, start that room
        await setRoomStatus(room, true);
        server.to(room).emit("gameStart");
      } else if (game) {
        // otherwise, a gameinstance is defined; get rooms associated with it and start those
        const rooms = await getSimulationRooms(game);
        rooms.forEach(async ({ dataValues: room }) => {
          await setRoomStatus(room.gameroom_url, true);
          server.to(room.gameroom_url).emit("gameStart");
        });
      }

      break;
    };
    case "gamePause": {
      const { room, game } = args;

      if (room) {
        // if a room code is defined, pause that room
        await setRoomStatus(room, false);
        server.to(room).emit("gamePause");
      } else if (game) {
        // otherwise, a gameinstance is defined; get rooms associated with it and pause those
        const rooms = await getSimulationRooms(game);
        rooms.forEach(async ({ dataValues: room }) => {
          await setRoomStatus(room.gameroom_url, false);
          server.to(room.gameroom_url).emit("gamePause");
        });
      }

      break;
    };
  };
}