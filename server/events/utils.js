const GameRoom = require("../models/GameRooms");

// room status map. this will preferably be a sql table in the future
let rooms = new Map();

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