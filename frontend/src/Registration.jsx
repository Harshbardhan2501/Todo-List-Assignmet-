import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Registration() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  function validate() {
    if (!email || !username || !password) {
      setError('All fields are required')
      return false
    }
    if (!emailRegex.test(email)) {
      setError('Invalid email format')
      return false
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    setError(null)
    return true
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSuccess(null)
    if (!validate()) return

    setLoading(true)
    fetch('https://todo-list-z3l4.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    })
      .then(async res => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.error || 'Registration failed')
        } else {
          setSuccess('Registered successfully. Redirecting to login...')
          setEmail('')
          setUsername('')
          setPassword('')
          // navigate to login after short delay so user can see message
          setTimeout(() => navigate('/login', { replace: true }), 900)
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', padding: 16 }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
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
        {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}

        <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
          {loading ? 'Registering...' : 'Register'}
        </button>

        <div style={{ marginTop: 12 }}>
          <span>Already have an account? </span>
          <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  )
}

export default Registration