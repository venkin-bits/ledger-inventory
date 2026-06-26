// components/StockTable.tsx
//
// ONE JOB: render the outer shell of the inventory table
//          (tab filter, headers, container) and map filtered
//          products into StockRow.
//
// Individual rows are rendered by StockRow.tsx — this file only
// decides WHICH rows to show and what the column headers are.

'use client'

import React, { useState } from 'react'
import StockRow from '@/components/StockRow'

type Product = {
  id: string
  name: string
  price: number
  current_stock: number
  low_stock_threshold: number
  categories: {
    main_type: 'register' | 'notepad'
    sub_category_name: string
  } | null
}

type StockTableProps = {
  products: Product[]
  onUpdateStock: (product: Product) => void
}

type TabKey = 'all' | 'register' | 'notepad'

export default function StockTable({ products, onUpdateStock }: StockTableProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  const filteredProducts = products.filter((product) => {
    if (activeTab === 'all') return true
    return product.categories?.main_type === activeTab
  })

  return (
    <div className="panel dashboard ledger-rule">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Items
        </button>
        <button
          className={`tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          Registers
        </button>
        <button
          className={`tab ${activeTab === 'notepad' ? 'active' : ''}`}
          onClick={() => setActiveTab('notepad')}
        >
          Notepads
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th className="table-header">Product Name</th>
            <th className="table-header">Category</th>
            <th className="table-header text-right">Current Stock</th>
            <th className="table-header text-right">Price</th>
            <th className="table-header">Status</th>
            <th className="table-header text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                No products in this category.
              </td>
            </tr>
          ) : (
            filteredProducts.map((product) => (
              <StockRow key={product.id} product={product} onUpdateStock={onUpdateStock} />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}