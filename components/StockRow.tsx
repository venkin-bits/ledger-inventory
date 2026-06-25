'use client'

import React from 'react'

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

type StockRowProps = {
  product: Product
  onUpdateStock: (product: Product) => void
}

export default function StockRow({ product, onUpdateStock }: StockRowProps) {
  const isLowStock = product.current_stock < product.low_stock_threshold

  const formatCategory = () => {
    if (!product.categories) return '-'
    const main = product.categories.main_type
    const sub = product.categories.sub_category_name
    return `${main.charAt(0).toUpperCase() + main.slice(1)} / ${sub}`
  }

  return (
    <tr>
      <td style={{ fontWeight: 500 }}>{product.name}</td>
      <td style={{ color: 'var(--muted)' }}>{formatCategory()}</td>
      <td className="monospace text-right">{product.current_stock}</td>
      <td className="monospace text-right">Rs. {Number(product.price).toFixed(2)}</td>
      <td>
        <div className="status-indicator">
          <span className={`status-dot ${isLowStock ? 'low' : 'ok'}`} />
          <span style={{ fontSize: '13px', color: isLowStock ? 'var(--rust)' : 'var(--olive)' }}>
            {isLowStock ? 'Low Stock' : 'In Stock'}
          </span>
        </div>
      </td>
      <td className="text-right">
        <button
          className="btn-secondary"
          onClick={() => onUpdateStock(product)}
          style={{ padding: '6px 12px', fontSize: '10.5px' }}
        >
          Update Stock
        </button>
      </td>
    </tr>
  )
}

