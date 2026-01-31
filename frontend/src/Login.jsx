import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'

function Login() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [identifier, setIdentifier] = useState('') // email or username
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('https://todo-list-z3l4.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // allow cookie to be set
        body: JSON.stringify({ identifier, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
      } else {
        // use auth context to store token and decoded role/user
        if (data.token) auth.loginWithToken(data.token)
        else {
          // server may set an HttpOnly cookie instead of returning token
          // call /api/auth/me to retrieve user info from cookie
          try {
            const meRes = await fetch('https://todo-list-z3l4.onrender.com/api/auth/me', { credentials: 'include' })
            const meData = await meRes.json()
            if (meRes.ok && meData.user && meData.user.id) {
              // if server returned a token in meData, use it; otherwise we keep auth state minimal
              if (meData.token) auth.loginWithToken(meData.token)
            }
          } catch (e) { /* ignore */ }
        }
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // if already authenticated, redirect away from login
    if (auth && auth.token) navigate('/dashboard', { replace: true })
  }, [auth, navigate])

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', padding: 16 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Email or Username</label>
          <input
            type="text"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
        <div style={{ marginTop: 12 }}>
          <span>Don't have an account? </span>
          <Link to="/">Register</Link>
        </div>
    </div>
  )
}

export default Login