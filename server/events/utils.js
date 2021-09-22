const GameRoom = require("../models/GameRooms");

// room status map. this will preferably be a sql table in the future
let rooms = new Map();

// helper functions
export const getRoomStatus = async (id) => ({status: rooms.get(id) || false});
export const setRoomStatus = async (id, val) => rooms.set(id, val);

export const getSimulationRooms = async (id) => {
  const res = await GameRoom.findAll({
    where: {
      gameinstanceid: id
    },
  });
  return res;
};