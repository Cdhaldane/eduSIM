const GameRoom = require("../models/GameRooms");

// room status map. this will preferably be a sql table in the future
let rooms = new Map();

// client info (name, role, etc)
let players = new Map();

// helper functions
export const getRoomStatus = async (id) => rooms.get(id) || {};
export const updateRoomStatus = async (id, val) => {
  const room = getRoomStatus(id);
  rooms.set(id, {
    ...room,
    ...val
  });
  return {
    ...room,
    ...val
  };
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
  const player = players.get(id);
  if (!player) return {};
  return {
    ...player,
    id
  }
};
export const setPlayer = async (id, val) => {
  const player = getPlayer(id);
  players.set(id, {
    ...player,
    ...val
  });
  return {
    ...player,
    ...val
  };
}