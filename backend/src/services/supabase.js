require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY");
}

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: ws,
  },
};

// Permanent backend client. Never call signInWithPassword() on this instance.
// It must always keep the service-role credentials for database operations.
const supabase = createClient(url, secretKey, clientOptions);

// Password verification gets its own short-lived client. Supabase Auth replaces
// the client's authorization header with the signed-in user's JWT; using a
// separate instance prevents that user session from leaking into the service
// client and tripping RLS on game_* tables.
function createSupabaseAuthClient() {
  return createClient(url, secretKey, clientOptions);
}

module.exports = {
  supabase,
  createSupabaseAuthClient,
};