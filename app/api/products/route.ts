// app/api/products/route.ts
//
// ONE JOB: handle GET /api/products
//
// Queries all active products using the product helper library
// and returns them as a JSON response. Useful for refreshing
// the dashboard's product list without doing a full page refresh.

import { getAllProducts } from '@/lib/db/products'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return Response.json(
        { error: 'Missing bearer token. Please log in first.' },
        { status: 401 }
      )
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      return Response.json(
        { error: 'Invalid or expired session. Please log in again.' },
        { status: 401 }
      )
    }

    const products = await getAllProducts()
    return Response.json(products)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Could not fetch products'

    return Response.json(
      { error: message },
      { status: 500 }
    )
  }
}
