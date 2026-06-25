'use client'

import React, { useState } from 'react'

type LoginFormProps = {
  onSubmit: (email: string, password: string) => Promise<void>
  error: string | null
  loading: boolean
}

export default function LoginForm({ onSubmit, error, loading }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    onSubmit(email, password)
  }

  return (
    <form className="login-card" onSubmit={handleSubmit}>
      <span className="eyebrow">ACCESS</span>
      <h2>Sign in to Ledger</h2>

      {error && <div className="error-banner">{error}</div>}

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          required
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          autoComplete="current-password"
        />
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>

      <p className="helper-text">
        Admin and Employee roles share this secure login page. permissions are determined on authentication.
      </p>
    </form>
  )
}

