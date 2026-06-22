// lib/supabaseAdmin.ts
//
// ONE JOB: a server-only Supabase client using the service role key.
//
// This key bypasses Row Level Security entirely. It must NEVER be sent
// to the browser. Only import this inside API routes, and only AFTER
// you've already verified the request belongs to a real logged-in user.
//
// Why bypass RLS instead of writing a policy for every action? At this
// scale, the API route itself is the security boundary. It checks identity
// and permission in code, then uses this trusted client to do the actual
// database work. lib/supabaseClient.ts (anon key) stays in charge of
// verifying WHO someone is; this file is only used once that's confirmed.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})
