const { createClient } = require('@supabase/supabase-js');
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the 'gameplayers' table in Supabase
const gameplayers = 'gameplayers';

// Define the table schema in Supabase
const gameplayersSchema = {
  gameplayerid: 'uuid',
  fname: 'text',
  lname: 'text',
  gameinstanceid: 'uuid',
  game_room: 'text',
  player_email: 'text',
  gamerole: 'text',
};


// createGamePlayersTable();

module.exports = gameplayers;