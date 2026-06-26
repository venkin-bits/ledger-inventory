'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import StockTable from '@/components/StockTable'
import UpdateStockModal from '@/components/UpdateStockModal'

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

export default function DashboardPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('access_token') : null

    if (!token) {
      setError('Missing bearer token. Please log in first.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load products')
      }

      const data = await response.json()
      setProducts(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not load inventory data.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Redirect to login if token is missing
  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('access_token') : null

    if (!token) {
      router.push('/login')
      return
    }

    setUserEmail(window.localStorage.getItem('user_email'))

    const timer = window.setTimeout(() => {
      void fetchProducts()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [fetchProducts, router])

  const handleSignOut = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('role')
    localStorage.removeItem('user_email')
    router.push('/login')
  }

  const handleUpdateStockClick = (product: Product) => {
    setSelectedProduct(product)
  }

  const handleStockUpdated = () => {
    setSelectedProduct(null)
    fetchProducts() // Refresh table without full page reload
  }

  return (
    <main className="dashboard-container">
      {/* Dashboard Top Header */}
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">STOCK OVERVIEW</span>
          <h1>Current Inventory</h1>
          {userEmail && (
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
              Logged in as: <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{userEmail}</span>
            </p>
          )}
        </div>
        <div className="dashboard-actions">
          {/* PDF button will be integrated here in Step 4 */}
          <button onClick={handleSignOut} className="btn-secondary">
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)', fontFamily: 'var(--font-inter)' }}>
          Loading inventory ledger...
        </div>
      ) : (
        <StockTable products={products} onUpdateStock={handleUpdateStockClick} />
      )}

      <a href="/api/reports/download" className="btn-secondary" style={{ textDecoration: 'none' }}>
  Download PDF
</a>

      {selectedProduct && (
        <UpdateStockModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={handleStockUpdated}
        />
      )}
    </main>
  )
}
