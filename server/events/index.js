import playerEvents from "./player";
import adminEvents from "./admin";
import {
  getRoomStatus,
  getSimulationRooms,
  getPlayersInRoom,
  getChatlog,
  getNotelog,
  removePlayer
} from './utils';

export default async (server, client) => {

  if (client.handshake.auth.token) {
    // initial connection from admin; return game status for all rooms in game

    const { game } = client.handshake.query;

    const rooms = await getSimulationRooms(game);
    rooms.forEach(async ({ dataValues: room }) => {
      const status = await getRoomStatus(room.gameroom_url);
      const chatlog = await getChatlog(room.gameroom_url);
      const notelog = await getNotelog(room.gameroom_url);
      const players = await getPlayersInRoom(room.gameroom_url, server);
      client.join(room.gameroom_url);
      client.emit("roomStatusUpdate", {
        room: room.gameroom_url,
        status,
        chatlog,
        notelog,
        players
      });
    });

    client.onAny((event, args) => adminEvents(server, client, event, args));

  } else {
    // initial connection from player; return connection/game status and announce arrival to other players

    const roomid = client.handshake.query.room;
    client.join(roomid);

    const players = await getPlayersInRoom(roomid, server);
    const roomStatus = await getRoomStatus(roomid);
    const chatlog = await getChatlog(roomid);
    const notelog = await getNotelog(roomid);
    client.emit("connectStatus", {
      ...roomStatus, players, chatlog, notelog
    });
  
    client.on("disconnect", () => {
      server.in(roomid).emit("clientLeft", client.id);
      removePlayer(client.id);
    });

    client.onAny((event, args) => playerEvents(server, client, event, args));
  }
};
