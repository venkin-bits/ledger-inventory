// lib/db/products.ts
//
// ONE JOB: all Supabase read/write functions for the products table.
//
// This file is the ONLY place in the codebase that talks to products.
// Components and API routes import functions from here — they never
// call supabase.from('products') directly. That way, if the table
// name or schema changes, you fix it in ONE place.

import { supabase } from '@/lib/supabaseClient'

/** Fetch all active products, joined with their category name */
export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(main_type, sub_category_name)')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data
}

/** Fetch a single product by its UUID */
export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(main_type, sub_category_name)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// More functions (createProduct, updateProduct, etc.) go here in Phase 2
