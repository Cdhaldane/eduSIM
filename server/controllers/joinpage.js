const uuid = require('uuid');

import cryptoRandomString from 'crypto-random-string';
import {
  getInteractionBreakdown,
  getInteractions,
  getChatlog,
  getRoomStatus
} from '../events/utils';

import { createClient } from '@supabase/supabase-js';
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

// Create Players using csv
exports.createGamePlayers = async (req, res) => {
  try {
    const lookuproom = [];
    const gameinstanceid = req.query.id;
    let replacedroles = [];

    for (let i = 0; i < req.body.data.length; i++) {
      const fname = req.body.data[i].First_Name;
      const lname = req.body.data[i].Last_Name;
      const game_room = req.body.data[i].Room.toLowerCase();
      const player_email = req.body.data[i].Email;
      let gamerole = req.body.data[i].Role;


      const { data: newGamePlayer, error } = await supabase
        .from('gameplayers')
        .insert([
          { fname, lname, gameinstanceid, game_room, player_email, gamerole }
        ]);

      if (error) throw error;

      if (lookuproom.indexOf(game_room) === -1) {
        const { data: realGameRoom, error } = await supabase
          .from('gamerooms')
          .select('*')
          .eq('gameinstanceid', gameinstanceid)
          .eq('gameroom_name', game_room)
          .single();

        if (error) throw error;

        if (realGameRoom) {
          lookuproom.push(realGameRoom);
        } else {
          const gameroom_name = game_room;
          const gameroomid = uuid.v4();
          const gameroom_url = cryptoRandomString(10);

          const { data: newGameRoom, error } = await supabase
            .from('gamerooms')
            .insert([
              { gameroomid, gameinstanceid, gameroom_name, gameroom_url }
            ]);

          if (error) throw error;
        }
      }
    }

    return res.send({ success: true, replacedroles });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

// Get all players for a single game instance to populate the table
exports.getGamePlayers = async (req, res) => {
  const gameinstanceid = req.params.id;

  try {
    const { data: gameplayer, error } = await supabase
      .from('gameplayers')
      .select('*')
      .eq('gameinstanceid', gameinstanceid);

    if (error) throw error;
    return res.send(gameplayer);
  } catch (err) {
    return res.status(400).send({
      message: `No game instance found with the id ${gameinstanceid}`,
    });
  }
};

exports.getRooms = async (req, res) => {
  const gameinstanceid = req.query.gameinstanceid;
  try {
    let { data, error } = await supabase
      .from('gamerooms')
      .select('*')
      .eq('gameinstanceid', gameinstanceid);

    if (error) throw error;

    return res.send(data);
  } catch (err) {
    return res.status(400).send({
      message: `No game rooms found with the id ${gameinstanceid}`,
    });
  }
};

exports.getRoomInteractionBreakdown = async (req, res) => {
  const { gameroomid } = req.query;
  try {
    const { data: gamerooms, error } = await supabase
      .from('gamerooms')
      .select('gameroom_url')
      .eq('gameroomid', gameroomid);

    if (error || !gamerooms.length) {
      throw new Error(`No game rooms found with the id ${gameroomid}`);
    }

    const breakdown = await getInteractionBreakdown(gamerooms[0].gameroom_url);
    return res.send(breakdown);
  } catch (err) {
    return res.status(400).send({
      message: err.message,
    });
  }
};

// these next two endpoints return the CURRENT STATUS of the room
exports.getRunningGameLog = async (req, res) => {
  const gameroomid = req.params.gameroomid;
  try {
    let { dataValues } = await GameRoom.findOne({
      where: {
        gameroomid
      }
    });
    const messages = await getChatlog(dataValues.gameroom_url);
    const interactions = await getInteractions(dataValues.gameroom_url);
    return res.send({
      ...dataValues,
      messages,
      interactions
    });
  } catch (err) {
    return res.status(400).send({
      message: `No game rooms found with the id ${gameroomid}`,
    });
  }
}

exports.getRunningSimulationLogs = async (req, res) => {
  const gameinstanceid = req.params.gameinstanceid;
  try {
    let rooms = await GameRoom.findAll({
      where: {
        gameinstanceid
      }
    });
    const roomData = [];
    for (let i = 0; i < rooms.length; i++) {
      const { dataValues } = rooms[i];
      const roomStatus = await getRoomStatus(dataValues.gameroom_url);
      const messages = await getChatlog(dataValues.gameroom_url);
      const interactions = await getInteractions(dataValues.gameroom_url);
      roomData.push({
        ...dataValues,
        messages,
        interactions,
        roomStatus
      });
    }
    return res.send(roomData);
  } catch (err) {
    return res.status(400).send({
      message: `Error: ${err.message}`,
    });
  }
}

exports.getGameLogs = async (req, res) => {
  const gameroomid = req.query.gameroomid;
  try {
    const { data, error } = await supabase
      .from('gameactions')
      .select('*')
      .eq('gameroomid', gameroomid).select();

    if (error) throw error;

    return res.send(data);
  } catch (err) {
    return [];
  }
};

// Delete a game log
exports.deleteGameLog = async (req, res) => {
  const gameactionid = req.body.gameactionid;

  try {
    const { data, error } = await supabase
      .from('gameactions')
      .delete()
      .eq('gameactionid', gameactionid);

    if (error) throw error;
    if (!data.length) {
      return res.status(400).send({
        message: `No game log found with the id ${gameactionid}`,
      });
    }

    return res.send({
      message: `Log ${gameactionid} has been deleted!`,
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};


exports.getPlayer = async (req, res) => {
  const gameplayerid = req.query.id;

  try {
    const { data: gameplayer, error } = await supabase
      .from('gameplayers')
      .select()
      .eq('gameplayerid', gameplayerid)
      .single();

    if (error) {
      console.log(error)
      return res.status(400).send({
        message: `No players found with the id ${gameplayerid}`,
      });
    }

    return res.send(gameplayer);
  } catch (err) {
    return res.status(400).send({
      message: `No players found with the id ${gameplayerid}`,
    });
  }
};

exports.getPlayers = async (req, res) => {
  const game_room = req.query.game_room;
  const gameinstanceid = req.query.gameinstanceid;

  try {
    const { data: gameplayers, error } = await supabase
      .from('gameplayers')
      .select()
      .eq('game_room', game_room)
      .eq('gameinstanceid', gameinstanceid);

    if (error) {
      console.log(error)
      return res.status(400).send({
        message: `No players found with the game room ${game_room}`,
      });
    }

    return res.send(gameplayers);
  } catch (err) {
    return res.status(400).send({
      message: `No players found with the game room ${game_room}`,
    });
  }
};

exports.getAllPlayers = async (req, res) => {
  const gameinstanceid = req.query.id;
  try {
    const { data: gameplayer, error } = await supabase
      .from('gameplayers')
      .select()
      .eq('gameinstanceid', gameinstanceid);

    if (error) {
      console.log(error)
      return res.status(400).send({
        message: `No players found with the gameid ${gameinstanceid}`,
      });
    }

    return res.send(gameplayer);
  } catch (err) {
    return res.status(400).send({
      message: `No players found with the gameid ${gameinstanceid}`,
    });
  }
};

exports.createRoom = async (req, res) => {
  const { gameinstanceid, gameroom_name } = req.body;
  const gameroom_url = cryptoRandomString(10);
  try {
    const { data: gameroom, error } = await supabase
      .from('gamerooms')
      .insert([{ gameinstanceid, gameroom_name, gameroom_url }])
      .select();

    if (error) {
      console.log('Error creating room', error)
      return res.status(500).send({
        message: `Error: ${error.message}`,
      });
    }
    console.log('Created room', gameroom)
    return res.send(gameroom[0]);
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

exports.deleteRoom = async (req, res) => {
  const id = req.query.id;
  try {
    const { data: gameroom, error } = await supabase
      .from('gamerooms')
      .delete()
      .eq('gameroomid', id);

    if (error) {
      console.log('Error deleting room', error)
      return res.status(500).send({
        message: `Error: ${error.message}`,
      });
    }

    return res.send(gameroom);
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

exports.updateRoomName = async (req, res) => {
  const { gameroomid, gameroom_name } = req.body;

  try {
    const { data: gameroom, error } = await supabase
      .from('gamerooms')
      .update({ gameroom_name })
      .eq('gameroomid', gameroomid);

    if (error) {
      console.log(error)
      return res.status(500).send({
        message: `Error: ${error.message}`,
      });
    }

    return res.send({
      message: `Game room has been updated!`,
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

exports.getRoomByURL = async (req, res) => {
  const roomurl = req.query.url;
  console.log(req.query, req.body)
  try {
    const { data: gameroom, error } = await supabase
      .from('gamerooms')
      .select('*')
      .eq('gameroom_url', roomurl)
      .single();

    console.log(roomurl, gameroom)
    if (!gameroom) return res.send({ message: 'No room found', success: false });

    const { data: gameinfo } = await supabase
      .from('gameinstances')
      .select('*')
      .eq('gameinstanceid', gameroom.gameinstanceid)
      .single();

    gameroom.gameinstance = gameinfo;

    if (error) {
      console.log(error)
      return res.status(400).send({
        message: `No game room found with the url ${roomurl}`,
      });
    }

    return res.send(gameroom);
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      message: `No game room found ${roomurl}`,
    });
  }
};

exports.createPlayer = async (req, res) => {
  const { game_room, gameinstanceid, fname, lname, gamerole, player_email } = req.body;

  try {
    let { data, error } = await supabase
      .from('gameplayers')
      .insert([
        { gameinstanceid, fname, lname, game_room, player_email, gamerole }
      ]);

    if (error) throw error;

    return res.send(data);
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

// Get all players for a single game instance
exports.getGamePlayers = async (req, res) => {
  const gameinstanceid = req.params.id;

  try {
    let { data, error } = await supabase
      .from('gameplayers')
      .select('*')
      .eq('gameinstanceid', gameinstanceid);

    if (error) throw error;

    return res.send(data);
  } catch (err) {
    return res.status(400).send({
      message: `No game instance found with the id ${id}`,
    });
  }
};

// Delete a player
exports.deletePlayers = async (req, res) => {
  const id = req.query.id;

  try {
    let { data, error } = await supabase
      .from('gameplayers')
      .delete()
      .eq('gameplayerid', id);

    if (error) throw error;
    if (!data.length) {
      return res.status(400).send({
        message: `No game player found with the id ${id}`,
      });
    }

    return res.send({
      message: `Player ${id} has been deleted!`,
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

// Update a player
exports.updatePlayer = async (req, res) => {
  const { gameplayerid, fname, lname, player_email, gamerole, game_room } = req.body;

  try {
    let { data, error } = await supabase
      .from('gameplayers')
      .update({ fname, lname, player_email, gamerole, game_room })
      .eq('gameplayerid', gameplayerid);

    if (error) throw error;
    if (!data.length) {
      return res.status(400).send({
        message: `No game instance found with the id ${gameplayerid}`,
      });
    }

    return res.send({
      message: `Game Player has been updated!`,
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};