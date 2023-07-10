const { createClient } = require('@supabase/supabase-js');
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the 'gameinstances' table in Supabase
const gameinstances = 'gameinstances';

// Define the table schema in Supabase
const gameinstancesSchema = {
  gameinstanceid: 'uuid',
  isdefaultgame: 'boolean',
  gameinstance_name: 'text',
  gameinstance_photo_path: 'text',
  game_parameters: 'json',
  downloads: 'integer',
  likes: 'integer',
  createdby_adminid: 'uuid',
  status: 'text',
};


// createGameInstancesTable();

module.exports = gameinstances;