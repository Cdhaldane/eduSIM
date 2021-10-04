const GameRoom = require("../models/GameRooms");

// room status map. this will preferably be a sql table in the future
let rooms = new Map();

// client info (name, role, etc)
let players = new Map();

// helper functions
export const getRoomStatus = async (id) => rooms.get(id) || {};
export const updateRoomStatus = async (id, val) => {
  const room = await getRoomStatus(id);
  rooms.set(id, {
    ...room,
    ...val
  });
  return {
    ...room,
    ...val
  };
}
export const clearRoomStatus = async (id, keepSettings) => {
  if (keepSettings) {
    const { settings } = await getRoomStatus(id);
    rooms.set(id, {
      settings
    });
    return { settings };
  } else {
    rooms.delete(id);
    return {};
  }
}

export const getSimulationRooms = async (id) => {
  const res = await GameRoom.findAll({
    where: {
      gameinstanceid: id
    },
  });
  return res;
};

export const getPlayer = async (id) => {
  const player = await players.get(id);
  if (!player) return {};
  return {
    ...player,
    id
  }
};
export const setPlayer = async (id, val) => {
  const player = await getPlayer(id);
  players.set(id, {
    ...player,
    ...val
  });
  return {
    ...player,
    ...val
  };
}

export const getPlayersInRoom = async (roomid, server) => {
  const sockets = await server.in(roomid).fetchSockets();
  let players = {};
  for (const { id } of sockets) {
    const player = await getPlayer(id);
    if (player.id) players[id] = player;
  }
  return players;
};