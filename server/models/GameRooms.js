const { createClient } = require('@supabase/supabase-js');
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

const gamerooms = 'gamerooms';

// Define the table schema in Supabase
const gameroomsSchema = {
  gameroomid: 'uuid',
  gameinstanceid: 'uuid',
  gameroom_name: 'text',
  gameroom_url: 'text',
};



// createGameRoomsTable();

module.exports = gamerooms;

