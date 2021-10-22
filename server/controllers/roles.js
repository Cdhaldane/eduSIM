const GameRole = require("../models/GameRoles");
const GameInstance = require("../models/GameInstances");
const db = require('../databaseConnection');

exports.getGameRoles = async (req, res) => {
  const gameinstanceid = req.query.gameinstanceid;

  try {
    let gamerole = await GameRole.findAll({
      where: {
        gameinstanceid: gameinstanceid
      },
    });
    return res.send(gamerole);
  } catch (err) {
    return res.status(400).send({
      message: `No game roles found with the id ${gameinstanceid}`,
    });
  }
};

exports.createRole = async (req, res) => {
  const gameinstanceid = req.body.gameinstanceid;
  const gamerole = req.body.gamerole;
  const numspots = req.body.numspots;
  
  try {
    let newGameInstance = await GameRole.create({
      gameinstanceid,
      gamerole,
      numspots
    });
    return res.send(newGameInstance);
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

exports.deleteRole = async (req, res) => {
  const id = req.query.id;

  const gameinstance = await GameRole.findOne({
    where: {
      gameroleid: id,
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

exports.copyRole = async (req, res) => {
  const gameroleid = req.body.gameroleid;
  
  const {
    gamerole,
    numspots,
    gameinstanceid
  } = await GameRole.findOne({
    where: {
      gameroleid,
    },
  });

  if (!gamerole) {
    return res.status(400).send({
      message: `No game role found with the id ${id}`,
    });
  }

  try {
    let newGameRole = await GameRole.create({
      gameinstanceid,
      gamerole: gamerole+" (Copy)",
      numspots
    });
    const instance = await GameInstance.findOne({
      where: {
        gameinstanceid,
      },
    });
    const params = JSON.parse(instance.game_parameters);
    for (const key in params) {
      if (Array.isArray(params[key])) {
        let newParam = [];
        for (let item of params[key]) {
          if (item?.rolelevel === gamerole) {
            let newItem = {...item, rolelevel: gamerole+" (Copy)"};
            newParam.push(newItem);
          }
          newParam.push(item);
        }
        params[key] = newParam;
      }
    }
    instance.game_parameters = JSON.stringify(params);
    instance.save();
    return res.send({
      gamerole: newGameRole,
      gameinstance: instance
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

exports.updateRole = async (req, res) => {
  const { id, name, numspots } = req.body;

  const gamerole = await GameRole.findOne({
    where: {
      gameroleid: id,
    },
  });

  if (!gamerole) {
    return res.status(400).send({
      message: `No role found with the id ${id}`,
    });
  }

  try {
    let instance={};
    if (name) {
      // update players with this role
      await db.query(`
        update gameplayers set gamerole = '${name}' where 
        gamerole='${gamerole.gamerole}' and
        gameinstanceid='${gamerole.gameinstanceid}'
      `);
      instance = await GameInstance.findOne({
        where: {
          gameinstanceid: gamerole.gameinstanceid,
        },
      });
      const params = JSON.parse(instance.game_parameters);
      for (const key in params) {
        if (Array.isArray(params[key])) {
          let newParam = [];
          for (let item of params[key]) {
            if (item?.rolelevel === gamerole.gamerole) {
              item = {...item, rolelevel: name};
            }
            newParam.push(item);
          }
          params[key] = newParam;
        }
      }
      instance.game_parameters = JSON.stringify(params);
      instance.save();

      gamerole.gamerole = name;
    }

    if (numspots) gamerole.numspots = numspots;

    gamerole.save();

    return res.send({
      gameinstance: instance
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};
