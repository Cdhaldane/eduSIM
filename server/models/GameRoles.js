const { createClient } = require('@supabase/supabase-js');
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

const gameroles = 'gameroles';

// // Define the table schema in Supabase
// const gamerolesSchema = {
//   gameroleid: 'uuid',
//   gameinstanceid: 'uuid',
//   gamerole: 'text',
//   numspots: 'integer',
//   roleDesc: 'text',
// };



// createGameRolesTable();

module.exports = gameroles;
