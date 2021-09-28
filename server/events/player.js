export default async (server, client, event, args) => {
  const { room } = client.handshake.query;
  
  switch (event) {
    case "message": {
      const { message, group } = args;

      if (group.length > 0) {
        server.to(client.id).emit("message", {
          id: client.id,
          room,
          message,
          group
        });
        group.forEach((id) => {
          server.to(id).emit("message", {
            id: client.id,
            room,
            message,
            group
          });
        })
      } else {
        server.to(room).emit("message", {
          id: client.id,
          room,
          message
        });
      }

      break;
    };
  }
}