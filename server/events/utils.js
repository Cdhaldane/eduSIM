const GameRoom = require("../models/GameRooms");
import moment from "moment";

// if nothing happens for 3 hours pause the sim
const TIMEOUT_MINUTES = 180;

// we store real-time simulation stuff in a js map
// using the simulation ID as keys
// in hindsight, might be better to use something like redis

// room status map
// contains timestamps, flags for when game is running/paused,
// information about gamepieces
let rooms = new Map();

// client info (name, role, etc)
let players = new Map();
// we also keep data for player IDs so we can map a user's
// Socket.IO id (which changes everytime a user reconnects) to their
// database id (persists, used to identify players)
let playerIDs = new Map();

// simulation actions, would probably be too large/unnecessary to include in room status
// DOES NOT STORE *CURRENT* STATUS
// mostly just used for logging/stats
let interactions = new Map();

// message lists
let chatlogs = new Map();

let notelogs = new Map();

// stores the setTimeout objects for simulation rooms
// so we can destroy them if needed
let timeouts = new Map();

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
export const clearRoomStatus = async (id, keepSettings=true, wipeLogs=true) => {
  if (wipeLogs) {
    chatlogs.delete(id);
    notelogs.delete(id)
    interactions.delete(id);
  }
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
export const getPlayerByDBID = async (dbid) => {
  const id = await playerIDs.get(dbid);
  const player = await players.get(id);
  if (!player) return null;
  return {
    ...player,
    id
  }
};
export const setPlayer = async (id, val) => {
  const player = await getPlayer(id);
  if (val.dbid) {
    playerIDs.set(val.dbid, id);
  }
  players.set(id, {
    ...player,
    ...val
  });
  return {
    ...player,
    ...val
  };
}
export const removePlayer = async (id) => {
  const player = await getPlayer(id);
  if (player.dbid) {
    playerIDs.delete(player.dbid);
  }
  players.delete(id);
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

export const addInteraction = async (roomid, interaction) => {
  const old = interactions.get(roomid) || [];
  old.push(interaction);
  interactions.set(roomid, old);
  return true;
};
export const getInteractionBreakdown = async (roomid) => { // not really used
  const list = interactions.get(roomid) || [];
  let counts = {};
  list.forEach(({level}) => {
    counts[level] = (counts[level] || 0) + 1;
  });
  return counts;
};
export const getInteractions = async (roomid) => {
  return interactions.get(roomid) || [];
};

export const updateChatlog = async (roomid, message) => {
  const old = chatlogs.get(roomid) || [];
  old.push(message);
  chatlogs.set(roomid, old);
  return true;
};
export const getChatlog = async (roomid) => {
  return chatlogs.get(roomid) || [];
};
export const updateNotelog = async (roomid, note) => {
  const old = notelogs.get(roomid) || [];
  old.push(note);
  notelogs.set(roomid, old);
  return true;
};
export const deleteNotelog = async (roomid, note) => {
  const old = notelogs.get(roomid) || [];
  old.splice(note, 1);
  notelogs.set(roomid, old);
  return true;
};
export const editNotelog = async (roomid, note, i) => {
  const old = notelogs.get(roomid) || [];
  old[note.i] = note;
  notelogs.set(roomid, old);
  return true;
};
export const getNotelog = async (roomid) => {
  return notelogs.get(roomid) || [];
};

export const updateRoomTimeout = async (id, server) => {
  if (timeouts.get(id)) {
    clearInterval(timeouts.get(id));
  }
  timeouts.set(id, setTimeout(async () => {
    const { startTime, timeElapsed } = await getRoomStatus(id);
    const newStatus = await updateRoomStatus(id, {
      running: false,
      timeElapsed: moment().valueOf() - startTime + (timeElapsed || 0)
    });
    if (server) {
      server.to(id).emit("errorLog", { key: "alert.inactivityTimeoutPause" });
      server.to(id).emit("roomStatusUpdate", {
        room: id,
        status: newStatus,
        refresh: true
      });
    }
  }, TIMEOUT_MINUTES*60000));
};
export const clearRoomTimeout = async (id) => {
  if (timeouts.get(id)) {
    clearInterval(timeouts.get(id));
  }
};
