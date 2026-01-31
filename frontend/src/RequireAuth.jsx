import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'

// RequireAuth wraps routes that need authentication and optional role checks.
export default function RequireAuth({ children, allowedRoles }) {
  const location = useLocation()
  const auth = useAuth()

  if (!auth || !auth.token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
