import { getPlayer, setPlayer } from './utils';

export default async (server, client, event, args) => {
  const { room } = client.handshake.query;
  
  switch (event) {
    case "message": {
      const { message, group } = args;

      const sender = await getPlayer(client.id);

      if (group.length > 0) {
        server.to(client.id).emit("message", {
          sender,
          room,
          message,
          group
        });
        group.forEach(({id}) => {
          server.to(id).emit("message", {
            sender,
            room,
            message,
            group
          });
        })
      } else {
        server.to(room).emit("message", {
          sender,
          room,
          message
        });
      }

      break;
    };
    case "playerUpdate": {
      const { name, role } = args;
      
      if (Object.keys(getPlayer(client.id)).length === 0) {
        client.to(room).emit("clientJoined", {
          id: client.id,
          name,
          role
        });
      }
      setPlayer(client.id, {
        name,
        role
      });

      break;
    };
  }
}