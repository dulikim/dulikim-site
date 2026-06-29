import { createClient } from "@supabase/supabase-js";

// Null-safe: if env vars aren't set yet the client is null, and callers
// check for null before using it. This way the app still works (sends email)
// before the DB is wired up, and won't crash on cold starts with missing keys.
export const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY
    ? createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SECRET_KEY
      )
    : null;
