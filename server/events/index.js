export default (server, client) => {
  console.log('new client connected: ', client.id);

  const roomid = client.handshake.query.room;

  client.join(roomid);

  if (client.handshake.query.admin) {
    client.broadcast.emit("start");
  } else {
    client.to(roomid).emit("newClient", client.id);
  }

  client.on("message", (message) => {
    server.to(roomid).emit("message", {
      id: client.id,
      message
    });
  });
};