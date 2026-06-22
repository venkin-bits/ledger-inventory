// lib/supabaseClient.ts
//
// ONE JOB: create and export a single Supabase client instance.
//
// Every other file in the project imports { supabase } from here.
// That means there's only ONE place to update if credentials change.
//
// Why environment variables instead of hardcoding the values?
// - .env.local is in .gitignore — it never goes to GitHub
// - Anyone who clones your repo needs to supply their own keys
// - NEXT_PUBLIC_ prefix means Next.js will include these in browser
//   bundles (safe for the anon key, which is designed to be public)

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
