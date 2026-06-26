'use client'

import React, { useState } from 'react'

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
  const [quantity, setQuantity] = useState<number>(0)
  const [type, setType] = useState<'restock' | 'sale' | 'correction'>('restock')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('You must be logged in to update stock')
      }

      const response = await fetch('/api/stock/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity_changed: type === 'sale' ? -quantity : quantity,
          type,
          reason: reason || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update stock')
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content panel">
        <div className="modal-header">
          <h3>Update Stock</h3>
          <p className="muted">{product.name}</p>
        </div>
        
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="type">Movement Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'restock' | 'sale' | 'correction')}
              disabled={loading}
              className="form-input"
            >
              <option value="restock">Restock (+)</option>
              <option value="sale">Sale (-)</option>
              <option value="correction">Correction (+/-)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">
              Quantity {type === 'sale' ? '(to subtract)' : '(to add)'}
            </label>
            <input
              id="quantity"
              type="number"
              min="0"
              required
              className="form-input monospace"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason (optional)</label>
            <input
              id="reason"
              type="text"
              className="form-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              placeholder="e.g., New shipment, Damaged goods, etc."
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || quantity === 0}>
              {loading ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

