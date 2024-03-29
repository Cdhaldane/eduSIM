const GameInstance = require("../models/GameInstances");
const AdminAccounts = require("../models/AdminAccounts");
const Collaborators = require("../models/Collaborators");
const db = require('../databaseConnection');

// Get all the game instances that a specific admin has created
// Request has an admin id
exports.getGameInstances = async (req, res) => {
  const id = req.query.id;

  try {
    let gameinstance = await GameInstance.findAll({
      where: {
        createdby_adminid: id,
      },
    });
    const [collabed] = await db.query(`
      select g.* from gameinstances g, collaborators c where 
      c.adminid='${id}' and 
      g.gameinstanceid=c.gameinstanceid and
      c.verified=true
    `);
    let Array = [];
    for (i = 0; i < gameinstance.length; i++) {
      if (gameinstance[i].status === 'created' || gameinstance[i].status === 'started' || gameinstance[i].status === 'ended') {
        Array.push(gameinstance[i]);
      }
    }
    for (i = 0; i < collabed.length; i++) {
      if (collabed[i].status === 'created' || collabed[i].status === 'started' || collabed[i].status === 'ended') {
        Array.push(collabed[i]);
      }
    }
    return res.json(Array);
  } catch (err) {
    // Might never get here
    // Since empty array will be sent
    return res.status(400).send({
      message: `No active game instance found with the id ${id}`,
    });
  }
};


exports.getAllGameInstances = async (req, res) => {
  try {
    let gameInstances = await GameInstance.findAll();
    let activeInstances = [];
    for (let i = 0; i < gameInstances.length; i++) {
      if (gameInstances[i].status === 'created' || gameInstances[i].status === 'started' || gameInstances[i].status === 'ended') {
        activeInstances.push(gameInstances[i]);
      }
    }
    return res.json(activeInstances);
  } catch (err) {
    return res.status(400).send({
      message: `Failed to retrieve game instances: ${err}`,
    });
  }
};

// Get a specific game instance that an admin has created
// Request has an admin and a gameinstance id
exports.getGameInstance = async (req, res) => {
  const adminid = req.query.adminid;
  const gameid = req.query.gameid;

  try {
    let gameinstance = await GameInstance.findOne({
      where: {
        createdby_adminid: adminid,
        gameinstanceid: gameid
      },
    });
    return res.send(gameinstance);
  } catch (err) {
    return res.status(400).send({
      message: `No game instance found with the id ${adminid} ${gameid}`,
    });
  }
};

// Create a new game instance
exports.createGameInstance = async (req, res) => {
  const { gameinstance_name, gameinstance_photo_path, game_parameters, createdby_adminid, status } = req.body;

  try {
    let newGameInstance = await GameInstance.create({
      gameinstance_name,
      gameinstance_photo_path,
      game_parameters,
      createdby_adminid,
      status
    });
    return res.send(newGameInstance);
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

// Update a game instance
exports.updateGameInstance = async (req, res) => {
  const { id, gameinstance_name, gameinstance_photo_path, game_parameters, invite_url, downloads, likes } = req.body;
 
  const gameinstance = await GameInstance.findOne({
    where: {
      gameinstanceid: id
    },
  });

  if (!gameinstance) {
    return res.status(400).send({
      message: `No game instance found with the id ${id}`,
    });
  }

  try {
    if (gameinstance_name) {
      gameinstance.gameinstance_name = gameinstance_name;
    }

    if (gameinstance_photo_path) {
      gameinstance.gameinstance_photo_path = gameinstance_photo_path;
    }

    if (game_parameters) {
      gameinstance.game_parameters = game_parameters;
    }

    if (invite_url) {
      gameinstance.invite_url = invite_url;
    }

    if (downloads) {
      gameinstance.downloads = downloads;
    }

    if (likes) {
      gameinstance.likes = likes;
    }

    gameinstance.save();
    return res.send({
      gameinstance: gameinstance,
      message: `Game Instance ${id} has been updated!`,
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

// Delete a game instance
exports.deleteGameInstance = async (req, res) => {
  const { id } = req.body;

  const gameinstance = await GameInstance.findOne({
    where: {
      gameinstanceid: id,
    },
  });

  if (!gameinstance) {
    return res.status(400).send({
      message: `No game instance found with the id ${id}`,
    });
  }

  try {
    // Updating a specific json field
    gameinstance.set(
      {
        'status': 'deleted'
      }
    );
    gameinstance.save();
    return res.send({
      message: `Game ${id} has been deleted!`,
      gameinstance
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

exports.verifyCollaboratorStatus = async (req, res) => {
  const { email, gameinstanceid, name } = req.body;

  let admin = await AdminAccounts.findOne({
    where: {
      email
    },
  });

  if (!admin) {
    return res.status(400).send({
      message: `No admin found with the email ${email}`,
    });
  }

  let collab = await Collaborators.findOne({
    where: {
      gameinstanceid, adminid: admin.adminid
    },
  });

  if (!collab || collab.verified === true) {
    return res.status(400).send({
      message: `No pending collab invites/invite already accepted`,
    });
  } else {
    collab.verified = true;
    collab.save();

    admin.name = name;
    admin.save();

    return res.send({
      message: `Successfully verified ${admin.adminid}`,
    });
  }
};

exports.revokeGameInstanceAccess = async (req, res) => {
  const { gameinstanceid, adminid } = req.body;

  const collab = await Collaborators.findOne({
    where: {
      gameinstanceid,
      adminid
    },
  });

  if (!collab) {
    return res.status(400).send({
      message: `Params do not fit any existing collaborator status`,
    });
  }

  try {
    // Updating a specific json field
    await collab.destroy();
    return res.send({
      message: `Access to ${gameinstanceid} has been revoked for ${adminid}`,
      collab
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};


exports.getCollaborators = async (req, res) => {
  const { gameinstanceid } = req.params;

  try {
    const admins = await db.query(`
      select a.*, c.verified from adminaccounts a, collaborators c where 
      a.adminid=c.adminid and 
      c.gameinstanceid='${gameinstanceid}'
    `);
    return res.json(admins[0]);
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};



/*
exports.deleteGameInstance = async (req, res) => {
  const id = req.query.id;
  const gameinstance = await GameInstance.findOne({
    where: {
      gameinstanceid: id,
    },
  });

  if (!gameinstance) {
    return res.status(400).send({
      message: `No game instance found with the id ${id}`,
    });
  }

  try {
    await gameinstance.destroy();
    return res.send({
      message: `Game ${id} has been deleted!`,
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};
*/
