// Replace the require statement for Sequelize with the Supabase client import
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the 'adminaccounts' table in Supabase
const adminaccounts = 'adminaccounts';

// Define the table schema in Supabase
const adminaccountsSchema = {
  adminid: 'uuid',
  email: 'text',
  name: 'text',
  picture: 'text',
  issuperadmin: 'boolean',
  followers: 'integer',
  following: 'text[]',
  bannerPath: 'text',
  likedSims: 'text[]',
  downloadedSims: 'text[]',
};

// Create the 'adminaccounts' table in Supabase
// const createAdminAccountsTable = async () => {
//   const { error } = await supabase.rpc('create_table', {
//     schema: 'public',
//     name: adminaccounts,
//     definition: adminaccountsSchema,
//   });

//   if (error) {
//     throw new Error(error.message);
//   }

//   console.log('AdminAccounts table created');
// };

// createAdminAccountsTable();

module.exports = adminaccounts;
