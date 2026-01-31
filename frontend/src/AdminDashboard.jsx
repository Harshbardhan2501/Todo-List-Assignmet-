import React, { useEffect, useState } from 'react'
import { useAuth } from './auth/AuthProvider'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function AdminDashboard() {
  const auth = useAuth()
  const [users, setUsers] = useState([])
  const [todos, setTodos] = useState([])

  async function loadUsers() {
    try {
      const res = await auth.fetchWithAuth(`${API_URL}/api/admin/users`)
      if (!res.ok) return
      setUsers(await res.json())
    } catch (e) { console.error(e) }
  }

  async function loadTodos() {
    try {
      const res = await auth.fetchWithAuth(`${API_URL}/api/admin/todos`)
      if (!res.ok) return
      setTodos(await res.json())
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    if (auth.role === 'admin') {
      loadUsers(); loadTodos()
    }
  }, [auth.role])

  async function changeRole(id, role) {
    try {
      const res = await auth.fetchWithAuth(`${API_URL}/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })
      if (res.ok) loadUsers()
      else alert('Update failed')
    } catch (e) { console.error(e) }
  }

  if (auth.role !== 'admin') return <div style={{ padding: 16 }}>You are not authorized to view this page.</div>

  return (
    <div style={{ maxWidth: 900, margin: '1rem auto', padding: 16 }}>
      <h2>Admin Dashboard</h2>
      <section>
        <h3>Users</h3>
        {users.map(u => (
          <div key={u._id} style={{ border:'1px solid #ddd', padding:8, marginBottom:8 }}>
            <div>{u.username} ({u.email}) - role: {u.role}</div>
            <div style={{ marginTop:8 }}>
              <button onClick={()=>changeRole(u._id, u.role === 'admin' ? 'user' : 'admin')}>Toggle Role</button>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h3>All Todos</h3>
        {todos.map(t => (
          <div key={t._id} style={{ border:'1px solid #eee', padding:8, marginBottom:8 }}>
            <div style={{ fontWeight:'bold' }}>{t.title} - {t.category}</div>
            <div>{t.description}</div>
            <div>By: {t.user && (t.user.username || t.user.email)}</div>
          </div>
        ))}
      </section>
    </div>
  )
}

export default AdminDashboard