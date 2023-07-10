import { createClient } from '@supabase/supabase-js';
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

exports.getGameRoles = async (req, res) => {
  const gameinstanceid = req.query.gameinstanceid;

  try {
    let { data: gamerole, error } = await supabase
      .from('GameRoles')
      .select('*')
      .eq('gameinstanceid', gameinstanceid);

    if (error) {
      throw new Error(error.message);
    }

    return res.send(gamerole);
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      message: `No game roles found with the id ${gameinstanceid}`,
    });
  }
};

exports.createRole = async (req, res) => {
  const gameinstanceid = req.body.gameinstanceid;
  const gamerole = req.body.gamerole;
  const numspots = req.body.numspots;
  const roleDesc = req.body.roleDesc;

  try {
    let { data: newGameInstance, error } = await supabase
      .from('GameRoles')
      .insert([{ gameinstanceid, gamerole, numspots, roleDesc }]);

    if (error) {
      throw new Error(error.message);
    }

    return res.send(newGameInstance[0]);
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

exports.deleteRole = async (req, res) => {
  const id = req.query.id;

  try {
    let { data: gameinstance, error } = await supabase
      .from('GameRoles')
      .delete()
      .eq('gameroleid', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!gameinstance) {
      return res.status(400).send({
        message: `No game instance found with the id ${id}`,
      });
    }

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

  try {
    let { data: gamerole, error } = await supabase
      .from('GameRoles')
      .select('*')
      .eq('gameroleid', gameroleid)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!gamerole) {
      return res.status(400).send({
        message: `No game role found with the id ${gameroleid}`,
      });
    }

    const { gamerole: roleName, numspots, gameinstanceid, roleDesc } = gamerole;

    let { data: newGameRole, error: createError } = await supabase
      .from('GameRoles')
      .insert([{ gameinstanceid, gamerole: roleName + ' (Copy)', roleDesc, numspots: numspots === -1 ? 1 : numspots }]);

    if (createError) {
      throw new Error(createError.message);
    }

    const { data: instance, error: instanceError } = await supabase
      .from('GameInstances')
      .select('game_parameters')
      .eq('gameinstanceid', gameinstanceid)
      .single();

    if (instanceError) {
      throw new Error(instanceError.message);
    }

    const params = JSON.parse(instance.game_parameters);
    const newIds = [];

    for (const key in params) {
      if (Array.isArray(params[key])) {
        let newParam = [];
        let i = 1;

        for (let item of params[key]) {
          if (typeof item === 'object' && item.rolelevel === roleName) {
            const newId = key + (params[key].length + params[`${key}DeleteCount`] + i);
            i++;
            newIds.push(newId);
            const newItem = {
              ...item,
              id: newId,
              name: newId,
              ref: newId,
              rolelevel: roleName + ' (Copy)',
            };
            newParam.push(newItem);
          }
          newParam.push(item);
        }

        params[key] = newParam;
      }
    }

    instance.game_parameters = JSON.stringify(params);

    let { error: saveError } = await supabase
      .from('GameInstances')
      .update({ game_parameters: instance.game_parameters })
      .eq('gameinstanceid', gameinstanceid);

    if (saveError) {
      throw new Error(saveError.message);
    }

    return res.send({
      gamerole: newGameRole[0],
      gameinstance: instance,
      newIds: newIds,
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

exports.updateRole = async (req, res) => {
  const { id, name, numspots, roleDesc } = req.body;

  try {
    let { data: gamerole, error } = await supabase
      .from('GameRoles')
      .select('*')
      .eq('gameroleid', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!gamerole) {
      return res.status(400).send({
        message: `No role found with the id ${id}`,
      });
    }

    let instance = {};

    if (name) {
      // update players with this role
      let { error: updateError } = await supabase
        .from('gameplayers')
        .update({ gamerole: name })
        .eq('gamerole', gamerole.gamerole)
        .eq('gameinstanceid', gamerole.gameinstanceid);

      if (updateError) {
        throw new Error(updateError.message);
      }

      let { data: gameInstance, error: instanceError } = await supabase
        .from('GameInstances')
        .select('*')
        .eq('gameinstanceid', gamerole.gameinstanceid)
        .single();

      if (instanceError) {
        throw new Error(instanceError.message);
      }

      const params = JSON.parse(gameInstance.game_parameters);

      for (const key in params) {
        if (Array.isArray(params[key])) {
          let newParam = [];

          for (let item of params[key]) {
            if (typeof item === 'object' && item.rolelevel === gamerole.gamerole) {
              item = { ...item, rolelevel: name };
            }
            newParam.push(item);
          }

          params[key] = newParam;
        }
      }

      gameInstance.game_parameters= JSON.stringify(params);

      let { error: saveError } = await supabase
        .from('GameInstances')
        .update({ game_parameters: gameInstance.game_parameters })
        .eq('gameinstanceid', gamerole.gameinstanceid);

      if (saveError) {
        throw new Error(saveError.message);
      }

      gamerole.gamerole = name;
      instance = gameInstance;
    }

    if (numspots) {
      gamerole.numspots = numspots;
    }

    if (roleDesc) {
      gamerole.roleDesc = roleDesc;
    }

    let { error: saveRoleError } = await supabase
      .from('GameRoles')
      .update(gamerole)
      .eq('gameroleid', id);

    if (saveRoleError) {
      throw new Error(saveRoleError.message);
    }

    return res.send({
      gameinstance: instance,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};