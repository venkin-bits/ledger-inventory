// lib/db/alerts.ts
//
// ONE JOB: check if a product is below its low-stock threshold
//          and trigger the email alert if so.
//
// This runs synchronously after every stock movement (per FR-16 in the PRD).
// No background job or cron needed at this scale.

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

/**
 * After a stock movement, call this with the product ID.
 * It checks current_stock vs low_stock_threshold.
 * If stock is low, it calls the Resend email function (Phase 3).
 */
export async function checkAndAlertIfLowStock(productId: string) {
  const { data: product, error } = await supabase
    .from('products')
    .select('name, current_stock, low_stock_threshold')
    .eq('id', productId)
    .single()

  if (error || !product) return

  const isLow = product.current_stock < product.low_stock_threshold
  if (!isLow) return

  // TODO (Phase 3): call Resend to email the admin
  console.log(`LOW STOCK ALERT: ${product.name} is at ${product.current_stock} units`)
}
