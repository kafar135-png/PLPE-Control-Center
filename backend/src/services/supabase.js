require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY");
}

const supabase = createClient(url, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: ws,
  },
});

module.exports = {
  supabase,
};