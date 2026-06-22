// app/api/auth/login/route.ts
//
// ONE JOB: handle POST /api/auth/login
//
// Receives { email, password } -> calls Supabase Auth ->
// returns a session token containing the user's role.
//
// Why a server-side API route instead of calling Supabase from the browser?
// Supabase Auth's signInWithPassword CAN be called from the browser,
// but routing it through here lets us add role checks, logging,
// and active-user checks (FR-6) in one controlled place.

import { supabase } from '@/lib/supabaseClient'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    // Step 1: ask Supabase Auth to verify the email/password pair.
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password })

    if (authError || !authData.user || !authData.session) {
      return Response.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    // Step 2: read our app-specific user data from profiles.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, is_active')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      return Response.json(
        { error: 'No active app profile was found for this user.' },
        { status: 403 }
      )
    }

    if (!profile.is_active) {
      return Response.json(
        { error: 'This user account is inactive.' },
        { status: 403 }
      )
    }

    return Response.json({
      session: authData.session,
      role: profile.role,
    })
  } catch {
    return Response.json(
      { error: 'Login request must be valid JSON.' },
      { status: 400 }
    )
  }
}
