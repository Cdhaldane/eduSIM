require('dotenv').config()
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

exports.getAdminbyEmail = async (req, res) => {
  const email = req.query.email;
  const name = req.query.name;

  const { data, error } = await supabase
    .from('adminaccounts')
    .select('*')
    .eq('email', email);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    // Create new admin
    const { data: newAdmin, error: createError } = await supabase
      .from('adminaccounts')
      .insert([
        { email, name }
      ]);

    if (createError) {
      console.error(createError);
      return res.status(500).json({ error: createError.message });
    }
    return res.json(newAdmin[0]);
  }

  return res.json(data[0]);
};

exports.getProfile = async (req, res) => {
  const idType = req.params.param;
  const id = req.params.value;

  const { data, error } = await supabase
    .from('adminaccounts')
    .select('*')
    .eq(idType, id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).send({
      message: `Admin account with ${idType} '${id}' not found`,
    });
  }

  return res.json(data[0]);
};

exports.getName = async (req, res) => {
  const adminid = req.query.adminid;

  const { data, error } = await supabase
    .from('adminaccounts')
    .select('*')
    .eq('adminid', adminid);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).send({
      message: `Admin account with adminid '${adminid}' not found`,
    });
  }

  return res.json(data[0]);
};

exports.updateProfile = async (req, res) => {
  const { email, followers, picture, bannerpath, likedsims, downloadedsims, following } = req.body;

  const { data, error } = await supabase
    .from('adminaccounts')
    .select('*')
    .eq('email', email);


  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(400).send({
      message: `No user found with the email ${email}`,
    });
  }

  const { data: updatedAdmin, error: updateError } = await supabase
    .from('adminaccounts')
    .update({
      followers,
      picture,
      bannerpath,
      likedsims,
      downloadedsims,
      following
    })
    .eq('email', email);

  if (updateError) {
    console.error(updateError);
    return res.status(500).json({ error: updateError.message });
  }

  return res.json(updatedAdmin);
};
