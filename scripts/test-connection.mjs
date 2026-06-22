// A one-time script to test the Supabase connection.
// Run with: node scripts/test-connection.mjs
// Delete this file after confirming the connection works.

import { createClient } from '@supabase/supabase-js'

const url = 'https://gnajqqrhlpppobkdcbbr.supabase.co'
const key = 'sb_publishable__fPMK1Do3sveVJnxwiS2sA_5fVGzu-g'

const supabase = createClient(url, key)

console.log('🔌 Testing connection to Supabase...')

// Try to read from categories table (will fail gracefully if it doesn't exist yet)
const { data, error } = await supabase.from('categories').select('*').limit(1)

if (error) {
  const tableNotFound =
    error.code === '42P01' ||
    error.message?.includes('schema cache')

  if (tableNotFound) {
    console.log('✅ CONNECTION SUCCESSFUL!')
    console.log('ℹ️  Tables do not exist yet — run the SQL in the Supabase dashboard next.')
  } else {
    console.log('❌ Connection error:', error.message)
    console.log('   Check your URL and anon key in .env.local')
  }
} else {
  console.log('✅ CONNECTION SUCCESSFUL!')
  console.log(`✅ categories table found — ${data.length} row(s) visible`)
  console.log(data)
}
