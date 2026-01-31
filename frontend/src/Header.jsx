import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'

export default function Header() {
  const auth = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    auth.logout()
    navigate('/login', { replace: true })
  }

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #eee' }}>
      <div>
        <Link to="/dashboard" style={{ marginRight: 12 }}>Todos</Link>
        {auth.role === 'admin' && <Link to="/admin-dashboard">Admin</Link>}
      </div>
      <div>
        {auth.user ? (
          <>
            <span style={{ marginRight: 12 }}>Hi, {auth.user.username}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </header>
  )
}
