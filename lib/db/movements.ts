// lib/db/movements.ts
//
// ONE JOB: all Supabase read/write functions for the stock_movements table.
//
// Stock movements are append-only (rows are NEVER edited or deleted —
// that's the audit trail guarantee from the PRD). This file enforces
// that rule: there is no updateMovement() or deleteMovement() function.

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

/** Record a new stock movement and return the created row */
export async function createMovement(movement: {
  product_id: string
  quantity_changed: number
  type: 'restock' | 'sale' | 'correction'
  reason?: string
  performed_by: string
}) {
  const { data, error } = await supabase
    .from('stock_movements')
    .insert(movement)
    .select()
    .single()

  if (error) throw error
  return data
}

/** Fetch all movements for a given product (most recent first) */
export async function getMovementsByProduct(productId: string) {
  const { data, error } = await supabase
    .from('stock_movements')
    .select('*')
    .eq('product_id', productId)
    .order('timestamp', { ascending: false })

  if (error) throw error
  return data
}

// Note: no update or delete functions — audit integrity is a hard rule.
