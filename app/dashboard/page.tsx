'use client'

import React, { useState, useEffect } from 'react'
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

  // Redirect to login if token is missing
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    setUserEmail(localStorage.getItem('user_email'))
    fetchProducts()
  }, [router])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Failed to load products')
      }
      const data = await response.json()
      setProducts(data)
    } catch (err: any) {
      setError(err.message || 'Could not load inventory data.')
    } finally {
      setLoading(false)
    }
  }

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

      {/* Renders the modal overlay when a product is clicked.
          We will implement the modal interior state in Step 3. */}
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
