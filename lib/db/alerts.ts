// lib/db/alerts.ts
//
// ONE JOB: check if a product is below its low-stock threshold
//          and trigger the email alert if so.
//
// This runs synchronously after every stock movement (per FR-16 in the PRD).
// No background job or cron needed at this scale.

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

// TODO: replace with real admin email from profiles table later.
const ADMIN_TEST_EMAIL = 'inventory.4762@gmail.com'

const RESEND_FROM_EMAIL = 'Ledger Inventory <onboarding@resend.dev>'

/**
 * After a stock movement, call this with the product ID.
 * It checks current_stock vs low_stock_threshold.
 * If stock is low, it sends an email through Resend.
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

  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.error('RESEND_API_KEY is missing from .env.local')
    return
  }

  const subject = `Low stock alert: ${product.name}`
  const text = [
    `${product.name} is below its low-stock threshold.`,
    '',
    `Current stock: ${product.current_stock}`,
    `Low-stock threshold: ${product.low_stock_threshold}`,
  ].join('\n')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: ADMIN_TEST_EMAIL,
      subject,
      text,
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    console.error(`Resend email failed: ${message}`)
  }
}
