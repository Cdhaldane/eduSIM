import {
  getPlayer,
  setPlayer,
  getPlayerByDBID,
  getRoomStatus,
  updateRoomStatus,
  updateChatlog,
  updateNotelog,
  deleteNotelog,
  editNotelog,
  updateRoomTimeout,
  addInteraction
} from './utils';
import moment from "moment";

export default async (server, client, event, args) => {
  const { room } = client.handshake.query;

  switch (event) {
    case "message": {
      // received a message from a simulation player
      // update chatlog and send message to everyone involved (sim or group)
      const { message, group } = args;

      const sender = await getPlayer(client.id);

      updateChatlog(room, {
        sender,
        room,
        message,
        group: group.length > 0 ? group : undefined,
        timeSent: moment().valueOf()
      });

      if (group.length > 0) {
        server.to(client.id).emit("message", {
          sender,
          room,
          message,
          group
        });
        group.forEach(async ({dbid}) => {
          let {id} = await getPlayerByDBID(dbid);
          if (id) {
            server.to(id).emit("message", {
              sender,
              room,
              message,
              group
            });
          }
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

    case "note": {
      // received a message from a simulation player
      // update chatlog and send message to everyone involved (sim or group)
      const { note, group } = args;

      const sender = await getPlayer(client.id);

        updateNotelog(room, {
          sender,
          room,
          note,
          group: group.length > 0 ? group : undefined,
          timeSent: moment().valueOf()
        });
        server.to(room).emit("note", {
          sender,
          room,
          note
        });


        break;
    };
    case "delete": {
      // received a message from a simulation player
      // update chatlog and send message to everyone involved (sim or group)
      const { note, group } = args;

      const sender = await getPlayer(client.id);

        deleteNotelog(room, {
          sender,
          room,
          note,
          group: group.length > 0 ? group : undefined,
          timeSent: moment().valueOf()
        });

        server.to(room).emit("delete", {
          sender,
          room,
          note
        });


      break;
    };
    case "edit": {
      // received a message from a simulation player
      // update chatlog and send message to everyone involved (sim or group)
      const { note, i, group } = args;

      const sender = await getPlayer(client.id);

        editNotelog(room, {
          sender,
          room,
          note,
          i,
          group: group.length > 0 ? group : undefined,
          timeSent: moment().valueOf()
        });

        server.to(room).emit("edit", {
          sender,
          room,
          note,
          i
        });


      break;
    };


    case "playerUpdate": {
      // player chose a name and role
      // but we treat this as a player just joined for everyone else
      const { name, role, dbid, invited } = args;
      if (await getPlayerByDBID(dbid)) {
        client.emit("errorLog", { key: "alert.attemptJoinAsExistingPlayer" });
        return;
      }
      if (Object.keys(getPlayer(client.id)).length === 0) {
        server.to(room).emit("clientJoined", {
          id: client.id,
          dbid,
          name,
          role
        });
      }
      setPlayer(client.id, {
        name,
        role,
        dbid,
        invited
      });

      break;
    };

    case "interaction": {
      // player just did something with a gamepiece
      // add this to list of game interactions and update room status if needed
      // if "sameState" is off, dont update the game state and just log it
      const { gamepieceId, parameters, sameState } = args;


      const { running, gamepieces, level } = await getRoomStatus(room);

      if (!running) {
        // client.emit("errorLog", "Game is paused/stopped!");
        return;
      }

      if (!sameState) {
        const newStatus = await updateRoomStatus(room, {
          gamepieces: {
            ...gamepieces,
            [gamepieceId]: parameters
          }
        });

        server.to(room).emit("roomStatusUpdate", {
          room,
          status: newStatus
        });
      }

      const player = await getPlayer(client.id);
      if (!player.invited) player.dbid = undefined;

      await addInteraction(room, {
        timestamp: moment().valueOf(),
        level,
        gamepieceId,
        parameters,
        player,
        changedState: !sameState
      });

      break;
    };

    case "varChange": {
      // something caused an in-game variable to change
      // eg. someone inputted something into a textbox gamepiece
      // treat it similarly to a regular interaction
      const { name, value, increment = false } = args;

      const { running, variables = {}, level } = await getRoomStatus(room);

      if (!running) {
        // client.emit("errorLog", "Game is paused/stopped!");
        return;
      }

      const newStatus = await updateRoomStatus(room, {
        variables: {
          ...variables,
          [name]: increment ? ((variables[name] || 0) + value) : value
        }
      });

      server.to(room).emit("roomStatusUpdate", {
        room,
        status: newStatus,
        lastSetVar: name
      });

      const player = await getPlayer(client.id);
      if (!player.invited) player.dbid = undefined;

      await addInteraction(room, {
        timestamp: moment().valueOf(),
        level,
        variable: name,
        value,
        player
      });

      break;
    };

    case "goToPage": {
      // player advanced a page in the simulation
      // update room state with new page index
      const { level } = args;
      console.log(5)
   
      server.to(room).emit("userLevelUpdate", {
        level
      });
    }

    case "oneToPageSingle": {
      // player advanced a page in the simulation
      // update room state with new page index
      const { level, id } = args;
      console.log(args)
      const newStatus = await updateRoomStatus(room, {
        level
      });

      server.to(client.id).emit('userLevelUpdate', { userId: client.id, level });
    }

    case "deck-reset": {
      const { cards, id} = args;

      server.to(room).emit("deck-state" + id, {cards});
    }
  
    case "card-dragged": {
      const { cards, index, id } = args;

      server.to(room).emit("deck-state:" + id, {cards, index});
    }
  }

  updateRoomTimeout(room, server);
}
