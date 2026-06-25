'use client'

import React from 'react'

type Product = {
  id: string
  name: string
  price: number
  current_stock: number
  low_stock_threshold: number
}

type UpdateStockModalProps = {
  product: Product
  onClose: () => void
  onSuccess: () => void
}

export default function UpdateStockModal({ product, onClose, onSuccess }: UpdateStockModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Update Stock Placeholder</h3>
        </div>
        <div className="modal-body">
          <p>Product: {product.name}</p>
          <p>We will implement the fields and submission logic in Step 3.</p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

