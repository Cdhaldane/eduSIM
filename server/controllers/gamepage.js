import { createClient } from '@supabase/supabase-js';
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get all the game instances that a specific admin has created
exports.getGameInstances = async (req, res) => {
  const adminid = req.query.id;

  const { data: gameinstances, error } = await supabase
    .from('gameinstances')
    .select('*')
    .eq('createdby_adminid', adminid);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  return res.json(gameinstances);
};

// Get all game instances
exports.getAllGameInstances = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { data: gameinstances, error } = await supabase
    .from('gameinstances')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  const activeInstances = gameinstances.filter(game => ['created', 'started', 'ended'].includes(game.status));

  return res.json(activeInstances), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
  };
};

// Get a specific game instance that an admin has created
exports.getGameInstance = async (req, res) => {
  const adminid = req.query.adminid;
  const gameid = req.query.gameid;

  const { data: gameinstance, error } = await supabase
    .from('gameinstances')
    .select('*')
    .eq('createdby_adminid', adminid)
    .eq('gameinstanceid', gameid)
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  return res.json(gameinstance);
};

// Create a new game instance
exports.createGameInstance = async (req, res) => {
  const { gameinstance_name, gameinstance_photo_path, game_parameters, createdby_adminid, status } = req.body;

  const { data: newGameInstance2, error3 } = await supabase
    .from('gameinstances')
    .insert([
      { gameinstance_name, gameinstance_photo_path, game_parameters, createdby_adminid, status }
    ]);

    const { data: newGameInstance, error } = await supabase
    .from('gameinstances')
    .select('*').eq('createdby_adminid', createdby_adminid);
  
  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  return res.json(newGameInstance);
};

// Update a game instance
exports.updateGameInstance = async (req, res) => {
  const { id, gameinstance_name, gameinstance_photo_path, game_parameters, invite_url, downloads, likes } = req.body;

  const updates = { gameinstance_name, gameinstance_photo_path, game_parameters, invite_url, downloads, likes };

  const { data: updatedGameInstance, error } = await supabase
    .from('gameinstances')
    .update(updates)
    .eq('gameinstanceid', id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  return res.json(updatedGameInstance);
};

// Delete a game instance
exports.deleteGameInstance = async (req, res) => {
  const { id } = req.body;

  const { error: deleteError } = await supabase
    .from('gameinstances')
    .delete()
    .eq('gameinstanceid', id);

  if (deleteError) {
    return res.status(500).json({ error: deleteError.message });
  }

  const { data: gameInstances, error: selectError } = await supabase
    .from('gameinstances')
    .select('*');

  if (selectError) {
    return res.status(500).json({ error: selectError.message });
  }

  return res.json(gameInstances);
}

// Collaborators related methods ...

exports.getCollaborators = async (req, res) => {
  const gameinstanceid = req.params.gameinstanceid;

  const { data: admins, error } = await supabase
    .rpc('get_collaborators', { game_instance_id: gameinstanceid });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  return res.json(admins);
};
