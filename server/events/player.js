export default async (server, client, event, args) => {
  const { room } = client.handshake.query;
  
  switch (event) {
    case "message": {
      const { message } = args;

      server.to(room).emit("message", {
        id: client.id,
        message
      });

      break;
    };
  }
}