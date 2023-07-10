const { createClient } = require('@supabase/supabase-js');
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

const collaborators = 'collaborators';

// Define the table schema in Supabase
const collaboratorsSchema = {
  collaboratorid: 'uuid',
  adminid: 'uuid',
  gameinstanceid: 'uuid',
  verified: 'boolean',
};



// createCollaboratorsTable();

module.exports = collaborators;