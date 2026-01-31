import React, { createContext, useContext, useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const AuthContext = createContext(null)

function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [role, setRole] = useState(() => localStorage.getItem('role'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  useEffect(() => {
    if (role) localStorage.setItem('role', role)
    else localStorage.removeItem('role')
  }, [role])

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  function loginWithToken(tkn) {
    setToken(tkn)
    const payload = decodeToken(tkn)
    if (payload) {
      setRole(payload.role)
      setUser({ id: payload.id, username: payload.username, email: payload.email })
    }
  }

  function logout() {
    setToken(null)
    setRole(null)
    setUser(null)
  }

  async function fetchWithAuth(url, opts = {}) {
    const headers = Object.assign({}, opts.headers || {})
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(url, Object.assign({}, opts, { headers, credentials: 'include' }))
    return res
  }

  return (
    <AuthContext.Provider value={{ token, role, user, loginWithToken, logout, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
