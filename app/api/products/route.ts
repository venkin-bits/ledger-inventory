// app/api/products/route.ts
//
// ONE JOB: handle GET /api/products
//
// Queries all active products using the product helper library
// and returns them as a JSON response. Useful for refreshing
// the dashboard's product list without doing a full page refresh.

import { getAllProducts } from '@/lib/db/products'

export async function GET() {
  try {
    const products = await getAllProducts()
    return Response.json(products)
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Could not fetch products' },
      { status: 500 }
    )
  }
}
