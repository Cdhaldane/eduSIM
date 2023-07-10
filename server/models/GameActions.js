const { createClient } = require('@supabase/supabase-js');
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the 'gameactions' table in Supabase
const gameactions = 'gameactions';

// Define the table schema in Supabase
const gameactionsSchema = {
  gameactionid: 'uuid',
  gameinstanceid: 'uuid',
  gameroomid: 'uuid',
  gamedata: 'json',
};



// createGameActionsTable();

module.exports = gameactions;
