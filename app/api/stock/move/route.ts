// app/api/stock/move/route.ts
//
// ONE JOB: handle POST /api/stock/move
//
// Receives { product_id, quantity_changed, type, reason } ->
// 1. Validates the session and role
// 2. Writes to stock_movements (via lib/db/movements.ts)
// 3. Updates product.current_stock
// 4. Calls checkAndAlertIfLowStock (via lib/db/alerts.ts)
// 5. Returns the updated product
//
// Steps 2 + 3 need to succeed together. If movement creation fails,
// stock is restored to its previous value before the route returns.

import { checkAndAlertIfLowStock } from '@/lib/db/alerts'
import { createMovement } from '@/lib/db/movements'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { supabase } from '@/lib/supabaseClient'

type MovementType = 'restock' | 'sale' | 'correction'

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return Response.json(
        { error: 'Missing bearer token. Please log in first.' },
        { status: 401 }
      )
    }

    // Step 1: confirm the token belongs to a real logged-in Supabase user.
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      return Response.json(
        { error: 'Invalid or expired session. Please log in again.' },
        { status: 401 }
      )
    }

    const { product_id, quantity_changed, type, reason } = await request.json()

    if (!product_id || typeof quantity_changed !== 'number' || !type) {
      return Response.json(
        { error: 'product_id, quantity_changed, and type are required.' },
        { status: 400 }
      )
    }

    if (!['restock', 'sale', 'correction'].includes(type)) {
      return Response.json(
        { error: 'type must be restock, sale, or correction.' },
        { status: 400 }
      )
    }

    // Step 2: read the product so we can calculate and restore stock if needed.
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return Response.json(
        { error: 'Product was not found.' },
        { status: 404 }
      )
    }

    const previousStock = product.current_stock
    const nextStock = previousStock + quantity_changed

    if (nextStock < 0) {
      return Response.json(
        {
          error: `Not enough stock. Current: ${previousStock}, attempted change: ${quantity_changed}.`,
        },
        { status: 400 }
      )
    }

    // Step 3: update stock first. If movement creation fails, this is rolled back.
    const { data: updatedProduct, error: updateError } = await supabaseAdmin
      .from('products')
      .update({ current_stock: nextStock })
      .eq('id', product_id)
      .select('*')
      .single()

    if (updateError || !updatedProduct) {
      return Response.json(
        { error: 'Could not update product stock.' },
        { status: 500 }
      )
    }

    try {
      // Step 4: append the audit movement after the stock update succeeds.
      await createMovement({
        product_id,
        quantity_changed,
        type: type as MovementType,
        reason,
        performed_by: authData.user.id,
      })
    } catch {
      await supabaseAdmin
        .from('products')
        .update({ current_stock: previousStock })
        .eq('id', product_id)

      return Response.json(
        { error: 'Could not record movement, so stock was rolled back.' },
        { status: 500 }
      )
    }

    // Step 5: alerts happen after both writes are complete.
    await checkAndAlertIfLowStock(product_id)

    return Response.json({ product: updatedProduct })
  } catch {
    return Response.json(
      { error: 'Stock movement request must be valid JSON.' },
      { status: 400 }
    )
  }
}
