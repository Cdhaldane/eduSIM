import playerEvents from "./player";
import adminEvents from "./admin";
import { getRoomStatus } from './utils';

export default async (server, client) => {
  
  if (client.handshake.auth.token) {
    // initial connection from admin, fired upon starting the simulation

    client.onAny((event, args) => adminEvents(server, client, event, args));

  } else {
    // initial connection from player; return connection status and announce arrival to other players
    
    const roomid = client.handshake.query.room;
    client.join(roomid);

    const roomStatus = await getRoomStatus(roomid);
    client.emit("connectStatus", roomStatus);
    client.to(roomid).emit("newClient", client.id);

    client.onAny((event, args) => playerEvents(server, client, event, args));
  }
};